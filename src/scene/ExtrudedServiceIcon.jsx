import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { buildExtrudedIconGeometry } from './extrudedIconGeometry'

const pedestalGeometry = new THREE.CylinderGeometry(0.56, 0.66, 0.16, 20)
const rippleGeometry = new THREE.RingGeometry(0.5, 0.62, 36)
const worldPosition = new THREE.Vector3()

function damp(current, target, delta, reducedMotion) {
  return reducedMotion ? target : THREE.MathUtils.damp(current, target, 14, delta)
}

export default function ExtrudedServiceIcon({
  iconId,
  color,
  hovered,
  selected,
  pressed,
  reducedMotion,
  quality,
  theme,
  ripple = 0,
}) {
  const root = useRef(null)
  const faceLayer = useRef(null)
  const iconLayer = useRef(null)
  const iconMaterialRef = useRef(null)
  const rippleRef = useRef(null)
  const rippleMaterialRef = useRef(null)
  const rippleStart = useRef(-1)
  const rippleActive = useRef(false)
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
    }),
    [color, theme],
  )
  const rippleMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    [color],
  )

  useEffect(() => {
    iconMaterialRef.current = materials.icon
    return () => Object.values(materials).forEach((material) => material.dispose())
  }, [materials])

  useEffect(() => {
    rippleMaterialRef.current = rippleMaterial
    return () => {
      rippleMaterialRef.current = null
      rippleMaterial.dispose()
    }
  }, [rippleMaterial])

  useEffect(() => {
    if (!ripple || reducedMotion) return
    rippleStart.current = -1
    rippleActive.current = true
    invalidate()
  }, [invalidate, reducedMotion, ripple])

  useEffect(() => invalidate(), [hovered, invalidate, pressed, selected])

  useFrame((state, delta) => {
    if (!root.current || !faceLayer.current || !iconLayer.current) return
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

    if (iconMaterialRef.current) {
      iconMaterialRef.current.emissiveIntensity = selected
        ? 0.22
        : hovered
          ? 0.11
          : 0.04
    }

    if (rippleActive.current) {
      const elapsed = state.clock.elapsedTime
      if (rippleStart.current < 0) rippleStart.current = elapsed
      const progress = Math.min((elapsed - rippleStart.current) / 0.6, 1)

      if (rippleRef.current && rippleMaterialRef.current) {
        const scale = 0.35 + progress * 3.2
        rippleRef.current.scale.setScalar(scale)
        rippleMaterialRef.current.opacity = (1 - progress) * 0.55
        rippleRef.current.visible = true
      }

      if (progress >= 1) {
        rippleActive.current = false
        if (rippleRef.current) rippleRef.current.visible = false
      } else {
        invalidate()
      }
    }

    if (moving && !reducedMotion) invalidate()
  })

  return (
    <group ref={root} dispose={null}>
      <group ref={faceLayer} position={[0, 0.25, 0]}>
        <group ref={iconLayer} position={[0, 0, 0.1]}>
          <mesh
            name={`service-icon:${iconId}`}
            geometry={geometry}
            material={materials.icon}
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
        ref={rippleRef}
        geometry={rippleGeometry}
        material={rippleMaterial}
        position={[0, -0.58, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        visible={false}
        dispose={null}
      />
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
