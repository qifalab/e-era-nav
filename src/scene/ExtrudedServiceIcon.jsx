import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { buildExtrudedIconGeometry } from './extrudedIconGeometry'
import SolidServiceModel from './SolidServiceModel'

const pedestalGeometry = new THREE.CylinderGeometry(0.56, 0.66, 0.16, 20)
const badgeGeometry = new THREE.CylinderGeometry(0.74, 0.82, 0.1, 6)
const haloGeometry = new THREE.TorusGeometry(0.72, 0.018, 6, 32)
const worldPosition = new THREE.Vector3()

function damp(current, target, delta, reducedMotion) {
  return reducedMotion ? target : THREE.MathUtils.damp(current, target, 14, delta)
}

export default function ExtrudedServiceIcon({
  serviceId,
  iconId,
  color,
  hovered,
  selected,
  pressed,
  reducedMotion,
  quality,
  theme,
}) {
  const root = useRef(null)
  const faceLayer = useRef(null)
  const iconLayer = useRef(null)
  const halo = useRef(null)
  const iconMaterialRef = useRef(null)
  const haloMaterialRef = useRef(null)
  const camera = useThree((state) => state.camera)
  const invalidate = useThree((state) => state.invalidate)
  const geometry = useMemo(
    () => buildExtrudedIconGeometry(iconId, quality === 'low' ? 'low' : 'high'),
    [iconId, quality],
  )
  const materials = useMemo(
    () => ({
      icon: new THREE.MeshStandardMaterial({
        color,
        roughness: 0.24,
        metalness: 0.38,
        emissive: color,
        emissiveIntensity: 0.04,
      }),
      pedestal: new THREE.MeshStandardMaterial({
        color: theme === 'dark' ? '#445250' : '#7d8d88',
        roughness: 0.62,
        metalness: 0.3,
      }),
      badge: new THREE.MeshStandardMaterial({
        color: theme === 'dark' ? '#172a39' : '#e8f1f1',
        roughness: 0.34,
        metalness: 0.52,
        emissive: color,
        emissiveIntensity: 0.035,
      }),
      halo: new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    }),
    [color, theme],
  )

  useEffect(() => {
    iconMaterialRef.current = materials.icon
    haloMaterialRef.current = materials.halo
    return () => Object.values(materials).forEach((material) => material.dispose())
  }, [materials])

  useEffect(() => invalidate(), [hovered, invalidate, pressed, selected])

  useFrame((_, delta) => {
    if (!root.current || !faceLayer.current || !iconLayer.current || !halo.current) return
    root.current.getWorldPosition(worldPosition)
    const dx = camera.position.x - worldPosition.x
    const dy = camera.position.y - worldPosition.y
    const dz = camera.position.z - worldPosition.z
    const targetYaw = Math.atan2(dx, dz)
    const cameraPitch = -Math.atan2(dy, Math.hypot(dx, dz))
    const targetScale = pressed ? 0.94 : selected ? 1.12 : hovered ? 1.05 : 1
    const targetLift = selected ? 0.15 : hovered ? 0.07 : 0
    const targetPitch =
      reducedMotion || selected
        ? cameraPitch
        : hovered
          ? cameraPitch + 0.02
          : cameraPitch + 0.05
    const targetDepth = selected ? 0.2 : hovered ? 0.15 : 0.1
    const targetIconRotation =
      reducedMotion ? 0 : selected ? 0.62 : hovered ? 0.14 : 0
    let moving = false

    const nextYaw = damp(root.current.rotation.y, targetYaw, delta, reducedMotion)
    moving ||= Math.abs(nextYaw - targetYaw) > 0.001
    root.current.rotation.y = nextYaw
    const nextLift = damp(root.current.position.y, targetLift, delta, reducedMotion)
    moving ||= Math.abs(nextLift - targetLift) > 0.001
    root.current.position.y = nextLift
    ;['x', 'y', 'z'].forEach((axis) => {
      const nextScale = damp(root.current.scale[axis], targetScale, delta, reducedMotion)
      moving ||= Math.abs(nextScale - targetScale) > 0.001
      root.current.scale[axis] = nextScale
    })
    const nextPitch = damp(
      faceLayer.current.rotation.x,
      targetPitch,
      delta,
      reducedMotion,
    )
    moving ||= Math.abs(nextPitch - targetPitch) > 0.001
    faceLayer.current.rotation.x = nextPitch
    const nextDepth = damp(iconLayer.current.position.z, targetDepth, delta, reducedMotion)
    moving ||= Math.abs(nextDepth - targetDepth) > 0.001
    iconLayer.current.position.z = nextDepth
    const nextRotation = damp(
      iconLayer.current.rotation.y,
      targetIconRotation,
      delta,
      reducedMotion,
    )
    moving ||= Math.abs(nextRotation - targetIconRotation) > 0.001
    iconLayer.current.rotation.y = nextRotation
    const targetHaloOpacity = selected ? 0.72 : hovered ? 0.42 : 0
    if (haloMaterialRef.current) {
      haloMaterialRef.current.opacity = damp(haloMaterialRef.current.opacity, targetHaloOpacity, delta, reducedMotion)
    }
    halo.current.rotation.z += (reducedMotion ? 0 : 0.28) * delta
    halo.current.rotation.x = cameraPitch * 0.55

    if (iconMaterialRef.current) {
      iconMaterialRef.current.emissiveIntensity = selected
        ? 0.22
        : hovered
          ? 0.11
          : 0.04
    }
    if (moving && !reducedMotion) invalidate()
  })

  return (
    <group ref={root} dispose={null}>
      <group ref={faceLayer} position={[0, 0.25, 0]}>
        <mesh
          geometry={badgeGeometry}
          material={materials.badge}
          position={[0, -0.02, -0.12]}
          rotation={[0, 0, Math.PI / 6]}
          castShadow={quality === 'high'}
          receiveShadow={quality === 'high'}
          dispose={null}
        />
        <mesh ref={halo} geometry={haloGeometry} material={materials.halo} rotation={[Math.PI / 2, 0, 0]} dispose={null} />
        <group ref={iconLayer} position={[0, 0, 0.1]}>
          <SolidServiceModel serviceId={serviceId} color={color} theme={theme} quality={quality} />
          <mesh
            name={`service-icon:${iconId}`}
            geometry={geometry}
            material={materials.icon}
            visible={false}
            castShadow={quality === 'high'}
            userData={{
              isServiceIcon: true,
              iconId,
              renderKind: 'webgl-mesh',
            }}
            dispose={null}
          />
        </group>
      </group>
      <mesh
        geometry={pedestalGeometry}
        material={materials.pedestal}
        position={[0, -0.66, 0]}
        receiveShadow={quality === 'high'}
        dispose={null}
      />
    </group>
  )
}
