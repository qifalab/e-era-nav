import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  CameraControls,
  CameraControlsImpl,
  Grid,
  Html,
} from '@react-three/drei'
import * as THREE from 'three'
import { categories, categoryBySlug, overviewCamera, serviceBySlug, services } from '../data/services'
import {
  getServiceIconConfig,
  ICON_DEFINITIONS,
} from '../icons/originalIconRegistry'
import ExtrudedServiceIcon from './ExtrudedServiceIcon'
import { disposeExtrudedIconGeometryCache } from './extrudedIconGeometry'

const shadowGeometry = new THREE.CircleGeometry(0.58, 20)

function FrameBudgetMonitor({ quality, onDegrade, onFallback }) {
  const sample = useRef({ frames: 0, elapsed: 0, slowWindows: 0 })

  useFrame((_, delta) => {
    const frameDelta = Math.min(delta, 0.2)
    sample.current.frames += 1
    sample.current.elapsed += frameDelta
    if (sample.current.frames < 24) return

    const average = sample.current.elapsed / sample.current.frames
    const threshold = quality === 'high' ? 0.028 : quality === 'medium' ? 0.038 : 0.052
    if (average > threshold) {
      if (quality === 'low') {
        sample.current.slowWindows += 1
        if (sample.current.slowWindows >= 2) onFallback()
      } else {
        onDegrade()
      }
    } else {
      sample.current.slowWindows = 0
    }
    sample.current.frames = 0
    sample.current.elapsed = 0
  })

  return null
}

function GeometryAudit({ revision }) {
  const scene = useThree((state) => state.scene)
  const camera = useThree((state) => state.camera)
  const size = useThree((state) => state.size)

  useEffect(() => {
    const readAudit = () => {
      const icons = []
      scene.updateMatrixWorld(true)
      scene.traverse((object) => {
        if (!object.userData?.isServiceIcon) return
        object.geometry.computeBoundingBox()
        const bounds = object.geometry.boundingBox
        const projected = [
          [bounds.min.x, bounds.min.y, bounds.min.z],
          [bounds.min.x, bounds.min.y, bounds.max.z],
          [bounds.min.x, bounds.max.y, bounds.min.z],
          [bounds.min.x, bounds.max.y, bounds.max.z],
          [bounds.max.x, bounds.min.y, bounds.min.z],
          [bounds.max.x, bounds.min.y, bounds.max.z],
          [bounds.max.x, bounds.max.y, bounds.min.z],
          [bounds.max.x, bounds.max.y, bounds.max.z],
        ].map(([x, y, z]) =>
          new THREE.Vector3(x, y, z)
            .applyMatrix4(object.matrixWorld)
            .project(camera),
        )
        const screenX = projected.map((point) => ((point.x + 1) / 2) * size.width)
        const screenY = projected.map((point) => ((1 - point.y) / 2) * size.height)
        icons.push({
          iconId: object.userData.iconId,
          isMesh: object.isMesh === true,
          hasPosition: Boolean(object.geometry.attributes.position),
          hasNormal: Boolean(object.geometry.attributes.normal),
          hasIndex: Boolean(object.geometry.index),
          depth:
            object.geometry.boundingBox.max.z -
            object.geometry.boundingBox.min.z,
          poseY: object.parent.rotation.y,
          screenBounds: {
            left: Math.min(...screenX),
            top: Math.min(...screenY),
            right: Math.max(...screenX),
            bottom: Math.max(...screenY),
          },
          hasTexture: Boolean(
            object.material.map ||
              object.material.normalMap ||
              object.material.alphaMap ||
              object.material.emissiveMap,
          ),
        })
      })
      return icons
    }
    window.__eEraReadGeometryAudit = readAudit
    window.__eEraGeometryAudit = readAudit()
    return () => {
      delete window.__eEraGeometryAudit
      delete window.__eEraReadGeometryAudit
    }
  }, [camera, revision, scene, size.height, size.width])

  return null
}

function CameraRig({ spatialState, reducedMotion, mobile, cameraRevision, paused }) {
  const controls = useRef(null)

  useEffect(() => {
    const service = serviceBySlug[spatialState.service]
    const category = categoryBySlug[spatialState.category]
    let position = overviewCamera.position
    let target = overviewCamera.target

    if (category) {
      position = category.camera
      target = category.position
    }

    if (service) {
      const [x, y, z] = service.position
      position = [x + 2.8, y + 2.8, z + 4.4]
      target = [x, y + 0.25, z]
    }

    controls.current?.setLookAt(...position, ...target, !reducedMotion && !paused)
  }, [cameraRevision, paused, reducedMotion, spatialState.category, spatialState.service])

  useEffect(() => {
    if (!controls.current) return
    controls.current.touches.one = mobile
      ? CameraControlsImpl.ACTION.NONE
      : CameraControlsImpl.ACTION.TOUCH_ROTATE
    controls.current.touches.two = CameraControlsImpl.ACTION.TOUCH_DOLLY_ROTATE
    controls.current.touches.three = CameraControlsImpl.ACTION.TOUCH_TRUCK
  }, [mobile])

  return (
    <CameraControls
      ref={controls}
      makeDefault
      smoothTime={reducedMotion ? 0.01 : 0.38}
      draggingSmoothTime={0.08}
      minDistance={3}
      maxDistance={25}
      minPolarAngle={0.25}
      maxPolarAngle={Math.PI / 2.08}
      dollySpeed={0.75}
      truckSpeed={1.25}
    />
  )
}

function Region({ category, active, onSelect, theme }) {
  const [hovered, setHovered] = useState(false)

  return (
    <group
      position={category.position}
      scale={active ? 1.045 : hovered ? 1.02 : 1}
    >
      <mesh
        position={[0, -0.32, 0]}
        onClick={(event) => {
          event.stopPropagation()
          onSelect(category.slug)
        }}
        onPointerEnter={(event) => {
          event.stopPropagation()
          setHovered(true)
          document.body.style.cursor = 'pointer'
        }}
        onPointerLeave={() => {
          setHovered(false)
          document.body.style.cursor = ''
        }}
      >
        <cylinderGeometry args={[3.55, 3.85, 0.5, 64, 1]} />
        <meshPhysicalMaterial
          color={theme === 'dark' ? '#111b20' : '#d9e4df'}
          metalness={0.22}
          roughness={0.42}
          clearcoat={0.45}
          clearcoatRoughness={0.55}
          emissive={category.accent}
          emissiveIntensity={active ? 0.14 : 0.035}
        />
      </mesh>
      <mesh position={[0, -0.055, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.12, 3.25, 64]} />
        <meshBasicMaterial color={category.glow} transparent opacity={active ? 0.75 : 0.38} />
      </mesh>
      <Html position={[0, 0.06, -2.42]} center distanceFactor={12} zIndexRange={[5, 0]}>
        <div className={`scene-region-label ${active ? 'is-active' : ''}`} aria-hidden="true">
          <span>{category.shortName}</span>
          <strong>{category.name}</strong>
        </div>
      </Html>
    </group>
  )
}

function ServiceNode({
  service,
  selected,
  hoveredService,
  onSelect,
  reducedMotion,
  paused,
  theme,
  dimmed,
  quality,
}) {
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)
  const [ripple, setRipple] = useState(0)
  const iconConfig = getServiceIconConfig(service.slug)
  const isHovered = hovered || hoveredService === service.slug

  return (
    <group
      position={[service.position[0], service.position[1] + 0.08, service.position[2]]}
      onClick={(event) => {
        event.stopPropagation()
        setRipple((value) => value + 1)
        onSelect(service.slug)
      }}
      onPointerDown={(event) => {
        event.stopPropagation()
        setPressed(true)
      }}
      onPointerUp={(event) => {
        event.stopPropagation()
        setPressed(false)
      }}
      onPointerEnter={(event) => {
        event.stopPropagation()
        setHovered(true)
        document.body.style.cursor = 'pointer'
      }}
      onPointerLeave={() => {
        setHovered(false)
        setPressed(false)
        document.body.style.cursor = ''
      }}
    >
      {!dimmed && (
        <>
          <ExtrudedServiceIcon
            iconId={iconConfig.geometry.source}
            color={iconConfig.geometry.color}
            hovered={isHovered}
            selected={selected}
            pressed={pressed}
            reducedMotion={reducedMotion || (paused && !selected)}
            quality={quality}
            theme={theme}
            ripple={ripple}
          />
          {(hovered || selected) && (
            <Html position={[0, 1.35, 0]} center zIndexRange={[10, 0]}>
              <div
                className={`scene-node-hud ${selected ? 'is-selected' : ''}`}
                data-service={service.slug}
                aria-hidden="true"
              >
                <span>{ICON_DEFINITIONS[service.icon].label} · 3D 实体</span>
                <strong>{service.name}</strong>
              </div>
            </Html>
          )}
        </>
      )}
    </group>
  )
}

function GroundShadows({ theme }) {
  const instances = useRef(null)
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: theme === 'dark' ? '#000000' : '#22312f',
        transparent: true,
        opacity: theme === 'dark' ? 0.24 : 0.13,
        depthWrite: false,
      }),
    [theme],
  )

  useLayoutEffect(() => {
    if (!instances.current) return
    const matrix = new THREE.Matrix4()
    const quaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0))
    const scale = new THREE.Vector3(0.84, 0.54, 1)
    services.forEach((service, index) => {
      matrix.compose(
        new THREE.Vector3(service.position[0], -0.045, service.position[2]),
        quaternion,
        scale,
      )
      instances.current.setMatrixAt(index, matrix)
    })
    instances.current.instanceMatrix.needsUpdate = true
    instances.current.computeBoundingSphere()
  }, [])

  useEffect(() => () => material.dispose(), [material])

  return (
    <instancedMesh
      ref={instances}
      args={[shadowGeometry, material, services.length]}
      renderOrder={-1}
      dispose={null}
    />
  )
}

function Bridges({ theme }) {
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: theme === 'dark' ? '#26343b' : '#b7c5c5',
        roughness: 0.7,
        metalness: 0.18,
      }),
    [theme],
  )

  useEffect(() => () => material.dispose(), [material])

  const bridges = categories.map((category, index) => {
    const nextCategory = categories[(index + 1) % categories.length]
    const start = category.position
    const end = nextCategory.position
    const deltaX = end[0] - start[0]
    const deltaZ = end[2] - start[2]
    return {
      key: `${category.slug}-${nextCategory.slug}`,
      position: [(start[0] + end[0]) / 2, -0.42, (start[2] + end[2]) / 2],
      rotation: [0, Math.atan2(deltaX, deltaZ), 0],
      length: Math.hypot(deltaX, deltaZ) - 3.6,
    }
  })

  return (
    <>
      {bridges.map((bridge) => (
        <mesh
          key={bridge.key}
          position={bridge.position}
          rotation={bridge.rotation}
          material={material}
        >
          <boxGeometry args={[0.38, 0.12, bridge.length]} />
        </mesh>
      ))}
    </>
  )
}

function World({
  spatialState,
  onCategory,
  onService,
  hoveredService,
  theme,
  reducedMotion,
  quality,
  mobile,
  cameraRevision,
  paused,
}) {
  return (
    <>
      <color attach="background" args={[theme === 'dark' ? '#071013' : '#edf2ef']} />
      <fog attach="fog" args={[theme === 'dark' ? '#071013' : '#edf2ef', 16, 34]} />
      <hemisphereLight
        intensity={theme === 'dark' ? 0.82 : 1.35}
        color={theme === 'dark' ? '#c8e7e3' : '#ffffff'}
        groundColor={theme === 'dark' ? '#10262b' : '#9b8e79'}
      />
      <directionalLight
        position={[7, 13, 8]}
        intensity={theme === 'dark' ? 2.1 : 2.8}
        color="#fff3dc"
        castShadow={quality === 'high'}
        shadow-mapSize={[quality === 'high' ? 1024 : 512, quality === 'high' ? 1024 : 512]}
      />
      <pointLight position={[-10, 5, -8]} intensity={1.2} color="#6db9ae" distance={20} />
      <pointLight position={[10, 4, 6]} intensity={0.9} color="#c29aaa" distance={18} />

      <Grid
        position={[0, -0.6, 0]}
        args={[36, 36]}
        cellSize={0.6}
        cellThickness={0.35}
        cellColor={theme === 'dark' ? '#294047' : '#aebdb8'}
        sectionSize={3}
        sectionThickness={0.72}
        sectionColor={theme === 'dark' ? '#416069' : '#839992'}
        fadeDistance={27}
        fadeStrength={1.4}
        infiniteGrid
      />

      <Bridges theme={theme} />
      <GroundShadows theme={theme} />
      {categories.map((category) => (
        <Region
          key={category.slug}
          category={category}
          active={spatialState.category === category.slug}
          onSelect={onCategory}
          theme={theme}
        />
      ))}
      {services.map((service) => (
        <ServiceNode
          key={service.slug}
          service={service}
          selected={spatialState.service === service.slug}
          hoveredService={hoveredService}
          onSelect={onService}
          reducedMotion={reducedMotion}
          paused={paused}
          theme={theme}
          quality={quality}
          dimmed={Boolean(
            spatialState.service && spatialState.service !== service.slug,
          )}
        />
      ))}

      <CameraRig
        spatialState={spatialState}
        reducedMotion={reducedMotion}
        mobile={mobile}
        cameraRevision={cameraRevision}
        paused={paused}
      />
    </>
  )
}

export default function SpatialScene({
  spatialState,
  onCategory,
  onService,
  hoveredService,
  onFallback,
  theme,
  reducedMotion,
  cameraRevision = 0,
  paused = false,
  performanceProfile = {},
}) {
  const [visible, setVisible] = useState(!document.hidden)
  const [inViewport, setInViewport] = useState(true)
  const [webglReady, setWebglReady] = useState(false)
  const sceneRef = useRef(null)
  const mobile = window.matchMedia('(max-width: 720px)').matches
  const lowPower =
    mobile ||
    performanceProfile.saveData ||
    performanceProfile.hardwareConcurrency <= 4 ||
    performanceProfile.deviceMemory <= 4
  const mediumPower =
    !lowPower &&
    (performanceProfile.hardwareConcurrency <= 6 || performanceProfile.deviceMemory <= 6)
  const initialQuality = lowPower ? 'low' : mediumPower ? 'medium' : 'high'
  const [quality, setQuality] = useState(initialQuality)
  const dpr = quality === 'low' ? 1 : quality === 'medium' ? [1, 1.25] : [1, 1.5]
  const degradeQuality = useCallback(() => {
    setQuality((current) => (current === 'high' ? 'medium' : 'low'))
  }, [])
  const fallbackForPerformance = useCallback(() => {
    onFallback('设备持续掉帧，已切换到 2D 服务列表。')
  }, [onFallback])

  useEffect(() => {
    const handleVisibility = () => setVisible(!document.hidden)
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  useEffect(() => {
    const scene = sceneRef.current
    if (!scene || typeof IntersectionObserver === 'undefined') return undefined
    const observer = new IntersectionObserver(
      ([entry]) => setInViewport(entry.isIntersecting && entry.intersectionRatio >= 0.15),
      { threshold: [0, 0.15] },
    )
    observer.observe(scene)
    return () => observer.disconnect()
  }, [])

  useEffect(
    () => () => {
      document.body.style.cursor = ''
      disposeExtrudedIconGeometryCache()
    },
    [],
  )

  return (
    <div
      ref={sceneRef}
      className="scene-canvas"
      aria-hidden="true"
      data-testid="spatial-scene"
      data-render-active={visible && inViewport && !paused}
      data-reduced-motion={reducedMotion}
      data-webgl-ready={webglReady}
      data-quality-tier={quality}
    >
      <Canvas
        camera={{ position: overviewCamera.position, fov: mobile ? 52 : 43, near: 0.1, far: 80 }}
        dpr={dpr}
        frameloop={visible && inViewport ? 'demand' : 'never'}
        shadows={quality === 'high'}
        gl={{
          antialias: quality === 'high',
          alpha: false,
          powerPreference: quality === 'low' ? 'low-power' : 'high-performance',
        }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener(
            'webglcontextlost',
            (event) => {
              event.preventDefault()
              onFallback('WebGL 上下文丢失，已切换到 2D 服务列表。')
            },
            { once: true },
          )
          setWebglReady(true)
        }}
        onPointerMissed={() => onCategory(null)}
      >
        <FrameBudgetMonitor
          quality={quality}
          onDegrade={degradeQuality}
          onFallback={fallbackForPerformance}
        />
        <World
          spatialState={spatialState}
          onCategory={onCategory}
          onService={onService}
          hoveredService={hoveredService}
          theme={theme}
          reducedMotion={reducedMotion}
          quality={quality}
          mobile={mobile}
          cameraRevision={cameraRevision}
          paused={paused}
        />
        <GeometryAudit revision={`${spatialState.service || 'overview'}:${quality}`} />
      </Canvas>
      <div className="scene-quality" aria-hidden="true">
        {quality === 'high' ? 'HQ' : 'ECO'}
      </div>
    </div>
  )
}
