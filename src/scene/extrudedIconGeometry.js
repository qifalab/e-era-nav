import * as THREE from 'three'
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js'
import {
  mergeGeometries,
  mergeVertices,
} from 'three/addons/utils/BufferGeometryUtils.js'
import {
  getIconSvgMarkup,
  ICON_DEFINITIONS,
} from '../icons/originalIconRegistry.js'

const cache = new Map()
const loader = new SVGLoader()

function dedupePoints(points) {
  return points.filter(
    (point, index) =>
      index === 0 || point.distanceToSquared(points[index - 1]) > 0.0001,
  )
}

function buildStrokeGeometry(subPath, quality, radius) {
  const divisions = quality === 'low' ? 10 : 16
  const radialSegments = quality === 'low' ? 4 : 6
  const sourcePoints = dedupePoints(subPath.getPoints(divisions))
  if (sourcePoints.length < 2) return []
  const closed = sourcePoints[0].distanceToSquared(sourcePoints.at(-1)) < 0.01
  const points = closed ? sourcePoints.slice(0, -1) : sourcePoints
  if (points.length < 2) return []

  const curve = new THREE.CurvePath()
  for (let index = 1; index < points.length; index += 1) {
    curve.add(
      new THREE.LineCurve3(
        new THREE.Vector3(points[index - 1].x, -points[index - 1].y, 0),
        new THREE.Vector3(points[index].x, -points[index].y, 0),
      ),
    )
  }
  if (closed) {
    curve.add(
      new THREE.LineCurve3(
        new THREE.Vector3(points.at(-1).x, -points.at(-1).y, 0),
        new THREE.Vector3(points[0].x, -points[0].y, 0),
      ),
    )
  }

  const tubularSegments = Math.min(
    quality === 'low' ? 14 : 22,
    Math.max(4, curve.curves.length * 2),
  )
  const geometries = [
    new THREE.TubeGeometry(
      curve,
      tubularSegments,
      radius,
      radialSegments,
      closed,
    ),
  ]
  if (!closed) {
    const cap = new THREE.SphereGeometry(
      radius,
      radialSegments,
      Math.max(3, radialSegments - 2),
    )
    const startCap = cap.clone()
    startCap.translate(points[0].x, -points[0].y, 0)
    const endCap = cap.clone()
    endCap.translate(points.at(-1).x, -points.at(-1).y, 0)
    geometries.push(startCap, endCap)
    cap.dispose()
  }
  return geometries
}

function buildFillGeometries(path, quality) {
  const fill = path.userData?.style?.fill
  if (!fill || fill === 'none') return []
  return SVGLoader.createShapes(path).map((shape) => {
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: 2,
      steps: 1,
      bevelEnabled: true,
      bevelSegments: quality === 'low' ? 1 : 2,
      bevelSize: 0.2,
      bevelThickness: 0.2,
      curveSegments: quality === 'low' ? 6 : 10,
    })
    geometry.scale(1, -1, 1)
    geometry.translate(0, 0, -1)
    return geometry
  })
}

function normalizeForMerge(source) {
  const normalized = source.index ? source.toNonIndexed() : source.clone()
  Object.keys(normalized.attributes).forEach((attribute) => {
    if (!['position', 'normal'].includes(attribute)) {
      normalized.deleteAttribute(attribute)
    }
  })
  return normalized
}

function createGeometry(iconId, quality) {
  const definition = ICON_DEFINITIONS[iconId]
  if (!definition) throw new Error(`Unknown original icon: ${iconId}`)
  const parsed = loader.parse(getIconSvgMarkup(iconId))
  const divisions = quality === 'low' ? 10 : 16
  const strokeRadius = definition.strokeWidth / 2
  const sourcePolylines = parsed.paths.flatMap((path) =>
    path.subPaths
      .map((subPath) => dedupePoints(subPath.getPoints(divisions)))
      .filter((points) => points.length >= 2),
  )
  const sourceGeometries = parsed.paths.flatMap((path) => {
    const fills = buildFillGeometries(path, quality)
    if (fills.length) return fills
    return path.subPaths.flatMap((subPath) =>
      buildStrokeGeometry(subPath, quality, strokeRadius),
    )
  })
  if (!sourceGeometries.length) {
    throw new Error(`Original icon produced no geometry: ${iconId}`)
  }

  const normalizedGeometries = sourceGeometries.map(normalizeForMerge)
  const merged = mergeGeometries(normalizedGeometries, false)
  sourceGeometries.forEach((source) => source.dispose())
  normalizedGeometries.forEach((source) => source.dispose())
  if (!merged) throw new Error(`Original icon triangulation failed: ${iconId}`)

  const geometry = mergeVertices(merged, 0.0001)
  merged.dispose()
  geometry.computeBoundingBox()
  const size = geometry.boundingBox.getSize(new THREE.Vector3())
  const center = geometry.boundingBox.getCenter(new THREE.Vector3())
  const normalization = 1.42 / Math.max(size.x, size.y)
  geometry.translate(-center.x, -center.y, -center.z)
  geometry.scale(normalization, normalization, normalization)
  geometry.computeVertexNormals()
  geometry.computeBoundingBox()
  geometry.computeBoundingSphere()
  geometry.userData.originalIcon = iconId
  geometry.userData.quality = quality
  geometry.userData.renderKind = 'webgl-mesh'
  geometry.userData.triangles = geometry.index.count / 3
  geometry.userData.sourcePolylines = sourcePolylines.map((points) =>
    points.map((point) => [
      (point.x - center.x) * normalization,
      (-point.y - center.y) * normalization,
    ]),
  )
  geometry.userData.strokeRadius = strokeRadius * normalization
  return geometry
}

export function buildExtrudedIconGeometry(iconId, quality = 'high') {
  if (!['high', 'low'].includes(quality)) {
    throw new Error(`Unsupported icon geometry quality: ${quality}`)
  }
  const cacheKey = `${iconId}:${quality}`
  if (!cache.has(cacheKey)) cache.set(cacheKey, createGeometry(iconId, quality))
  return cache.get(cacheKey)
}

export function getExtrudedIconBudget(iconId, quality = 'high') {
  const geometry = buildExtrudedIconGeometry(iconId, quality)
  return {
    triangles: geometry.userData.triangles,
    drawCalls: 1,
  }
}

export function disposeExtrudedIconGeometryCache() {
  cache.forEach((geometry) => geometry.dispose())
  cache.clear()
}
