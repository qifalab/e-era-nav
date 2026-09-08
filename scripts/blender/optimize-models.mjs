import { NodeIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS } from '@gltf-transform/extensions'
import { meshopt } from '@gltf-transform/functions'
import { MeshoptEncoder } from 'meshoptimizer'
import { stat, mkdir } from 'node:fs/promises'

const input = new URL('../../design/blender/navigation-sculptures.raw.glb', import.meta.url)
const output = new URL('../../src/assets/navigation-sculptures.glb', import.meta.url)
await MeshoptEncoder.ready
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'meshopt.encoder': MeshoptEncoder,
})
const document = await io.read(input.pathname)
// Preserve every named node and triangle; quantize and compress vertex buffers.
await document.transform(meshopt({
  encoder: MeshoptEncoder, level: 'high',
  quantizePosition: 14, quantizeNormal: 10, quantizeColor: 8,
}))
await mkdir(new URL('../../src/assets/', import.meta.url), { recursive: true })
await io.write(output.pathname, document)
const before = (await stat(input)).size
const after = (await stat(output)).size
console.log(`Models: ${before} → ${after} bytes (${((1 - after / before) * 100).toFixed(1)}% smaller)`)
