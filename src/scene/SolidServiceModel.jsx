import { RoundedBox } from '@react-three/drei'

export default function SolidServiceModel({ serviceId, color, theme, quality }) {
  if (serviceId !== 'era-passport') return null
  const accent = color
  const face = theme === 'dark' ? '#163542' : '#d7f0ef'
  const shadow = quality === 'high'
  return <group position={[0, 0.12, 0.52]} scale={1.35}>
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
}
