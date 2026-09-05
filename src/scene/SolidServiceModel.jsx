import { RoundedBox } from '@react-three/drei'

export default function SolidServiceModel({ serviceId, color, theme, quality }) {
  const accent = color
  const face = theme === 'dark' ? '#163542' : '#d7f0ef'
  const shadow = quality === 'high'
  if (['era-cloud', 'era-lottery', 'era-trust'].includes(serviceId)) {
    const shape = serviceId === 'era-cloud' ? 'cloud' : serviceId === 'era-lottery' ? 'globe' : 'shield'
    return <group position={[0, 0.1, 0.48]} scale={1.12}>
      {shape === 'cloud' && <group>{[-0.28, 0, 0.28].map((x, i) => <mesh key={x} position={[x, i === 1 ? 0.1 : 0, 0]} castShadow={shadow}><sphereGeometry args={[i === 1 ? 0.3 : 0.24, 16, 12]} /><meshPhysicalMaterial color={accent} roughness={0.22} metalness={0.5} clearcoat={0.7} /></mesh>)}<RoundedBox args={[0.9,0.24,0.42]} radius={0.1} smoothness={2} position={[0,-0.16,0]}><meshPhysicalMaterial color={accent} roughness={0.22} metalness={0.5} /></RoundedBox></group>}
      {shape === 'globe' && <group><mesh castShadow={shadow}><sphereGeometry args={[0.42, 20, 14]} /><meshPhysicalMaterial color={accent} roughness={0.2} metalness={0.48} /></mesh><mesh rotation={[0.4,0.2,0]}><torusGeometry args={[0.43,0.025,8,32]} /><meshStandardMaterial color={face} /></mesh><mesh rotation={[-0.4,0.2,0]}><torusGeometry args={[0.43,0.025,8,32]} /><meshStandardMaterial color={face} /></mesh></group>}
      {shape === 'shield' && <mesh rotation={[0,0,Math.PI]} castShadow={shadow}><coneGeometry args={[0.46,0.86,6]} /><meshPhysicalMaterial color={accent} roughness={0.2} metalness={0.55} clearcoat={0.7} /></mesh>}
    </group>
  }
  if (serviceId === 'era-passport') return <group position={[0, 0.12, 0.52]} scale={1.35}>
    <RoundedBox args={[0.94, 0.7, 0.2]} radius={0.12} smoothness={4} castShadow={shadow}>
      <meshPhysicalMaterial color={accent} roughness={0.2} metalness={0.62} clearcoat={0.8} clearcoatRoughness={0.18} emissive={accent} emissiveIntensity={0.1} />
    </RoundedBox>
    <RoundedBox args={[0.72, 0.48, 0.035]} radius={0.07} smoothness={3} position={[0, -0.01, 0.12]}>
      <meshPhysicalMaterial color={face} roughness={0.28} metalness={0.25} clearcoat={0.5} />
    </RoundedBox>
    <mesh position={[0, 0.31, 0.02]} rotation={[Math.PI / 2, 0, 0]} castShadow={shadow}>
      <torusGeometry args={[0.28, 0.075, 16, 32, Math.PI]} />
      <meshPhysicalMaterial color={accent} roughness={0.16} metalness={0.72} clearcoat={0.9} emissive={accent} emissiveIntensity={0.1} />
    </mesh>
    <mesh position={[0, 0.02, 0.17]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.07, 0.07, 0.035, 16]} />
      <meshStandardMaterial color={accent} roughness={0.22} metalness={0.58} />
    </mesh>
    <mesh position={[0, -0.06, 0.19]}>
      <boxGeometry args={[0.035, 0.16, 0.025]} />
      <meshStandardMaterial color={accent} roughness={0.2} metalness={0.6} />
    </mesh>
    <mesh position={[0, -0.15, 0.19]}>
      <boxGeometry args={[0.16, 0.035, 0.025]} />
      <meshStandardMaterial color={accent} roughness={0.2} metalness={0.6} />
    </mesh>
  </group>
  return <group position={[0, 0.08, 0.48]} scale={1.12}>
    <RoundedBox args={[0.86, 0.64, 0.2]} radius={0.11} smoothness={3} castShadow={shadow}>
      <meshPhysicalMaterial color={accent} roughness={0.24} metalness={0.55} clearcoat={0.7} emissive={accent} emissiveIntensity={0.08} />
    </RoundedBox>
    <RoundedBox args={[0.64, 0.42, 0.035]} radius={0.06} smoothness={2} position={[0, 0, 0.13]}>
      <meshStandardMaterial color={face} roughness={0.3} metalness={0.2} />
    </RoundedBox>
    <mesh position={[0, 0.08, 0.16]}>
      <cylinderGeometry args={[0.12, 0.12, 0.035, 16]} />
      <meshStandardMaterial color={accent} roughness={0.2} metalness={0.5} />
    </mesh>
    <mesh position={[0, -0.14, 0.16]}>
      <boxGeometry args={[0.3, 0.045, 0.03]} />
      <meshStandardMaterial color={accent} roughness={0.2} metalness={0.5} />
    </mesh>
  </group>
}
