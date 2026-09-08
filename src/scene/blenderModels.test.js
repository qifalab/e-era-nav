import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { Box3 } from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { services } from '../data/services'

const bytes = readFileSync('public/models/navigation-sculptures-v1.glb')
const modelFile = await new GLTFLoader().parseAsync(
  new Uint8Array(bytes).buffer, '',
)

describe('Blender production asset', () => {
  it('contains a distinct, volumetric model for all 18 service slugs', () => {
    const roots = modelFile.scene.children
    expect(roots.map((node) => node.name).sort()).toEqual(services.map((service) => service.slug).sort())
    for (const root of roots) {
      const box = new Box3().setFromObject(root)
      expect(box.max.z - box.min.z, root.name).toBeGreaterThan(.2)
      expect(box.max.y - box.min.y, root.name).toBeGreaterThan(1)
      root.traverse((node) => {
        if (!node.isMesh) return
        expect(node.geometry.index, root.name).toBeTruthy()
        expect(node.geometry.attributes.normal, root.name).toBeTruthy()
        expect(node.geometry.attributes.color, root.name).toBeTruthy()
        expect(node.material.map, root.name).toBeNull()
        expect([...node.geometry.attributes.position.array].every(Number.isFinite)).toBe(true)
      })
    }
  })

  it('stays within the transfer, triangle and material budgets', () => {
    let triangles = 0
    let primitives = 0
    modelFile.scene.traverse((node) => {
      if (!node.isMesh) return
      primitives += 1
      triangles += node.geometry.index.count / 3
    })
    expect(bytes.length).toBeLessThan(3 * 1024 * 1024)
    expect(triangles).toBeLessThan(50000)
    expect(primitives).toBeLessThanOrEqual(36)
  })
})
