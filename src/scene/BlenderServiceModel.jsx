import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

import MODEL_URL from '../assets/navigation-sculptures.glb?url'
const worldPosition = new THREE.Vector3()
const pedestalGeometry = new THREE.LatheGeometry(
  [[0, -0.08], [0.61, -0.08], [0.67, -0.06], [0.69, -0.02],
    [0.69, 0.015], [0.67, 0.045], [0.61, 0.06], [0, 0.06]]
    .map(([radius, height]) => new THREE.Vector2(radius, height)),
  48,
)
const rippleGeometry = new THREE.RingGeometry(0.65, 0.70, 48)

/** Meshes are authored in Blender, not extruded from the 2D icon registry. */
export default function BlenderServiceModel({
  serviceSlug, iconId, color, hovered, selected, pressed,
  reducedMotion, quality, theme, ripple = 0,
}) {
  const { nodes } = useGLTF(MODEL_URL, false)
  const root = useRef(null)
  const sculpture = useRef(null)
  const rippleRef = useRef(null)
  const rippleStart = useRef(null)
  const camera = useThree((state) => state.camera)
  const invalidate = useThree((state) => state.invalidate)
  const model = useMemo(() => {
    const source = nodes[serviceSlug]
    if (!source) throw new Error(`Missing Blender sculpture: ${serviceSlug}`)
    // Geometry and materials belong to the cached GLTF. Only transforms are cloned.
    const clone = source.clone(true)
    clone.userData = {
      ...clone.userData, isServiceIcon: true, iconId, serviceSlug,
      renderKind: 'blender-gltf',
    }
    return clone
  }, [nodes, serviceSlug, iconId])

  useEffect(() => {
    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = quality === 'high'
        child.receiveShadow = quality === 'high'
      }
    })
    invalidate()
  }, [model, quality, invalidate])

  useEffect(() => {
    if (ripple && !reducedMotion) rippleStart.current = -1
    invalidate()
  }, [ripple, reducedMotion, invalidate])
  useEffect(() => invalidate(), [hovered, selected, pressed, invalidate])

  useFrame((state, delta) => {
    if (!root.current || !sculpture.current) return
    root.current.getWorldPosition(worldPosition)
    const yaw = Math.atan2(camera.position.x - worldPosition.x, camera.position.z - worldPosition.z)
    // Keep the object standing upright: camera orbit reveals its actual thickness.
    const turn = reducedMotion ? 0 : selected ? 0.52 : hovered ? 0.14 : 0
    const scale = pressed ? .95 : selected ? 1.1 : hovered ? 1.045 : 1
    const lift = selected ? .12 : hovered ? .065 : 0
    let moving = false
    const damp = (current, target) => {
      const next = reducedMotion ? target : THREE.MathUtils.damp(current, target, 12, delta)
      moving ||= Math.abs(next - target) > .001
      return next
    }
    root.current.rotation.y = damp(root.current.rotation.y, yaw)
    sculpture.current.rotation.y = damp(sculpture.current.rotation.y, turn)
    sculpture.current.position.y = damp(sculpture.current.position.y, lift)
    sculpture.current.scale.setScalar(damp(sculpture.current.scale.x, scale))
    if (rippleRef.current && rippleStart.current !== null) {
      if (rippleStart.current === -1) rippleStart.current = state.clock.elapsedTime
      const progress = Math.min((state.clock.elapsedTime - rippleStart.current) / .6, 1)
      rippleRef.current.visible = progress < 1 && !reducedMotion
      rippleRef.current.scale.setScalar(1 + progress * .65)
      rippleRef.current.material.opacity = (1 - progress) * .55
      if (progress === 1 || reducedMotion) rippleStart.current = null
      else moving = true
    }
    if (moving) invalidate()
  })

  return (
    <group ref={root}>
      <group ref={sculpture}>
        <primitive object={model} dispose={null} />
      </group>
      <mesh geometry={pedestalGeometry} position={[0, -.73, 0]} receiveShadow>
        <meshStandardMaterial
          color={theme === 'dark' ? '#344d5b' : '#f4f5ee'}
          roughness={.34} metalness={.18}
        />
      </mesh>
      <mesh ref={rippleRef} geometry={rippleGeometry} position={[0, -.66, 0]} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <meshBasicMaterial color={color} transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  )
}
