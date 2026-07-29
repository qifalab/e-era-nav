import { describe, expect, it } from 'vitest'
import { services } from '../data/services'
import { ICON_DEFINITIONS } from '../icons/originalIconRegistry'
import {
  buildExtrudedIconGeometry,
  disposeExtrudedIconGeometryCache,
  getExtrudedIconBudget,
} from './extrudedIconGeometry'

const SIZE = 64
const EXTENT = 0.86

function toPixel(value) {
  return ((value + EXTENT) / (EXTENT * 2)) * (SIZE - 1)
}

function pointInTriangle(px, py, a, b, c) {
  const edge = (p1, p2) =>
    (px - p2[0]) * (p1[1] - p2[1]) - (p1[0] - p2[0]) * (py - p2[1])
  const d1 = edge(a, b)
  const d2 = edge(b, c)
  const d3 = edge(c, a)
  return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0))
}

function rasterGeometry(geometry) {
  const mask = new Uint8Array(SIZE * SIZE)
  const positions = geometry.attributes.position
  const index = geometry.index
  const count = index ? index.count : positions.count
  for (let offset = 0; offset < count; offset += 3) {
    const triangle = [0, 1, 2].map((slot) => {
      const vertex = index ? index.getX(offset + slot) : offset + slot
      return [toPixel(positions.getX(vertex)), toPixel(positions.getY(vertex))]
    })
    const minX = Math.max(0, Math.floor(Math.min(...triangle.map((point) => point[0]))))
    const maxX = Math.min(SIZE - 1, Math.ceil(Math.max(...triangle.map((point) => point[0]))))
    const minY = Math.max(0, Math.floor(Math.min(...triangle.map((point) => point[1]))))
    const maxY = Math.min(SIZE - 1, Math.ceil(Math.max(...triangle.map((point) => point[1]))))
    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        if (pointInTriangle(x + 0.5, y + 0.5, ...triangle)) mask[y * SIZE + x] = 1
      }
    }
  }
  return mask
}

function distanceToSegment(point, start, end) {
  const dx = end[0] - start[0]
  const dy = end[1] - start[1]
  const lengthSquared = dx * dx + dy * dy
  const amount = lengthSquared
    ? Math.max(
        0,
        Math.min(
          1,
          ((point[0] - start[0]) * dx + (point[1] - start[1]) * dy) /
            lengthSquared,
        ),
      )
    : 0
  return Math.hypot(
    point[0] - (start[0] + amount * dx),
    point[1] - (start[1] + amount * dy),
  )
}

function rasterOriginal(geometry) {
  const mask = new Uint8Array(SIZE * SIZE)
  geometry.userData.sourcePolylines.forEach((points) => {
    for (let y = 0; y < SIZE; y += 1) {
      for (let x = 0; x < SIZE; x += 1) {
        const point = [
          (x / (SIZE - 1)) * EXTENT * 2 - EXTENT,
          (y / (SIZE - 1)) * EXTENT * 2 - EXTENT,
        ]
        if (
          points.some(
            (start, index) =>
              index > 0 &&
              distanceToSegment(point, points[index - 1], start) <=
                geometry.userData.strokeRadius,
          )
        ) {
          mask[y * SIZE + x] = 1
        }
      }
    }
  })
  return mask
}

function intersectionOverUnion(left, right) {
  let intersection = 0
  let union = 0
  left.forEach((value, index) => {
    if (value && right[index]) intersection += 1
    if (value || right[index]) union += 1
  })
  return union ? intersection / union : 0
}

function geometrySignature(geometry) {
  const positions = geometry.attributes.position
  let hash = 2166136261
  for (let index = 0; index < positions.count; index += Math.max(1, Math.floor(positions.count / 48))) {
    ;[positions.getX(index), positions.getY(index), positions.getZ(index)].forEach((value) => {
      hash ^= Math.round(value * 10000)
      hash = Math.imul(hash, 16777619)
    })
  }
  return `${positions.count}:${geometry.index.count}:${hash >>> 0}`
}

describe('extruded original icon geometry', () => {
  it('creates indexed, lit, genuinely thick BufferGeometry for every original icon', () => {
    Object.keys(ICON_DEFINITIONS).forEach((iconId) => {
      const geometry = buildExtrudedIconGeometry(iconId, 'high')
      const depth = geometry.boundingBox.max.z - geometry.boundingBox.min.z
      expect(geometry.attributes.position.count).toBeGreaterThan(0)
      expect(geometry.attributes.normal.count).toBe(geometry.attributes.position.count)
      expect(geometry.index?.count).toBeGreaterThan(0)
      expect(depth, iconId).toBeGreaterThan(0.05)
      expect(geometry.userData.renderKind).toBe('webgl-mesh')
    })
  })

  it('memoizes one geometry per icon and quality while preserving all 18 mappings', () => {
    const signatures = new Map()
    Object.keys(ICON_DEFINITIONS).forEach((iconId) => {
      const first = buildExtrudedIconGeometry(iconId, 'high')
      const second = buildExtrudedIconGeometry(iconId, 'high')
      expect(second).toBe(first)
      signatures.set(iconId, geometrySignature(first))
    })
    expect(signatures.size).toBe(17)
    expect(new Set(signatures.values()).size).toBeGreaterThanOrEqual(15)
    expect(services).toHaveLength(18)
    services.forEach((service) => {
      expect(signatures.has(service.icon)).toBe(true)
    })
  })

  it('keeps all meshes inside the shared desktop/mobile geometry budget', () => {
    const high = services.map((service) => getExtrudedIconBudget(service.icon, 'high'))
    const low = services.map((service) => getExtrudedIconBudget(service.icon, 'low'))
    expect(high.reduce((total, budget) => total + budget.triangles, 0)).toBeLessThan(12000)
    expect(low.reduce((total, budget) => total + budget.triangles, 0)).toBeLessThan(
      high.reduce((total, budget) => total + budget.triangles, 0),
    )
    expect(low.every((budget) => budget.drawCalls === 1)).toBe(true)
  })

  it('keeps front-view silhouettes close to the original SVG strokes in both tiers', () => {
    ;['high', 'low'].forEach((quality) => {
      const similarities = Object.keys(ICON_DEFINITIONS).map((iconId) => {
        const geometry = buildExtrudedIconGeometry(iconId, quality)
        return {
          iconId,
          similarity: intersectionOverUnion(
            rasterGeometry(geometry),
            rasterOriginal(geometry),
          ),
        }
      })
      const lowest = similarities.toSorted((a, b) => a.similarity - b.similarity)[0]
      const average =
        similarities.reduce((total, result) => total + result.similarity, 0) /
        similarities.length
      expect(lowest.similarity, `${quality}:${lowest.iconId}`).toBeGreaterThan(0.6)
      expect(average, quality).toBeGreaterThan(0.7)
    })
  })

  it('preserves central negative space instead of filling closed outlines', () => {
    ;['code', 'cloud', 'shield'].forEach((iconId) => {
      const mask = rasterGeometry(buildExtrudedIconGeometry(iconId, 'high'))
      expect(mask[Math.floor(SIZE / 2) * SIZE + Math.floor(SIZE / 2)], iconId).toBe(0)
    })
  })

  it('preserves substantial holes in lock, globe, ID-card, image, and terminal outlines', () => {
    ;['lock', 'globe', 'id-card', 'image', 'terminal'].forEach((iconId) => {
      const mask = rasterGeometry(buildExtrudedIconGeometry(iconId, 'high'))
      const occupied = []
      mask.forEach((value, index) => {
        if (value) occupied.push([index % SIZE, Math.floor(index / SIZE)])
      })
      const minX = Math.min(...occupied.map(([x]) => x))
      const maxX = Math.max(...occupied.map(([x]) => x))
      const minY = Math.min(...occupied.map(([, y]) => y))
      const maxY = Math.max(...occupied.map(([, y]) => y))
      let empty = 0
      let area = 0
      for (let y = minY; y <= maxY; y += 1) {
        for (let x = minX; x <= maxX; x += 1) {
          area += 1
          if (!mask[y * SIZE + x]) empty += 1
        }
      }
      expect(empty / area, iconId).toBeGreaterThan(0.28)
    })
  })

  it('covers open stroke endpoints with round caps', () => {
    ;['code', 'message', 'monitor'].forEach((iconId) => {
      const geometry = buildExtrudedIconGeometry(iconId, 'high')
      const mask = rasterGeometry(geometry)
      geometry.userData.sourcePolylines.forEach((points) => {
        ;[points[0], points.at(-1)].forEach(([x, y]) => {
          const pixelX = Math.round(toPixel(x))
          const pixelY = Math.round(toPixel(y))
          const covered = [-1, 0, 1].some((offsetY) =>
            [-1, 0, 1].some(
              (offsetX) =>
                mask[(pixelY + offsetY) * SIZE + pixelX + offsetX] === 1,
            ),
          )
          expect(covered, `${iconId}:${pixelX},${pixelY}`).toBe(true)
        })
      })
    })
  })

  it('disposes cached GPU geometries and rebuilds them on demand', () => {
    const first = buildExtrudedIconGeometry('lock', 'high')
    let disposed = false
    first.addEventListener('dispose', () => {
      disposed = true
    })
    disposeExtrudedIconGeometryCache()
    expect(disposed).toBe(true)
    expect(buildExtrudedIconGeometry('lock', 'high')).not.toBe(first)
  })
})
