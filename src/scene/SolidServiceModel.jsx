import { RoundedBox } from '@react-three/drei'

const palette = { light: '#e8f1f1', dark: '#172a39' }

function Mat({ color, emissive = 0.08 }) {
  return <meshStandardMaterial color={color} roughness={0.22} metalness={0.5} emissive={color} emissiveIntensity={emissive} />
}

export default function SolidServiceModel({ serviceId, color, theme, quality }) {
  const pale = palette[theme] || palette.light
  const shadow = quality === 'high'
  const common = { castShadow: shadow, receiveShadow: shadow }
  switch (serviceId) {
    case 'era-passport':
      return <group>{<RoundedBox args={[0.9, 0.66, 0.22]} radius={0.1} smoothness={3} {...common}><Mat color={color} emissive={0.14} /></RoundedBox>}<mesh position={[0,0.32,0]} rotation={[Math.PI/2,0,0]} {...common}><torusGeometry args={[0.28,0.075,12,28,Math.PI]} /><Mat color={color} emissive={0.14} /></mesh><mesh position={[0,0.02,0.14]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[0.06,0.06,0.04,12]} /><Mat color={pale} emissive={0} /></mesh></group>
    case 'era-cloud': return <group>{[-0.28,0,0.28].map((x,i)=><mesh key={x} position={[x, i===1?0.12:0,0]} {...common}><sphereGeometry args={[0.28+(i===1?0.1:0),16,12]} /><Mat color={color} /></mesh>)}<RoundedBox args={[0.9,0.25,0.42]} radius={0.1} smoothness={2} position={[0,-0.16,0]} {...common}><Mat color={color} /></RoundedBox></group>
    case 'era-trust': return <group rotation={[0,0,Math.PI]}><mesh {...common}><coneGeometry args={[0.48,0.9,6]} /><Mat color={color} emissive={0.12} /></mesh><mesh position={[0,0.05,0.38]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[0.18,0.035,8,16]} /><Mat color={pale} emissive={0} /></mesh></group>
    case 'era-lottery': return <group><mesh {...common}><sphereGeometry args={[0.45,20,14]} /><Mat color={color} /></mesh><mesh rotation={[0.4,0.2,0]}><torusGeometry args={[0.45,0.025,8,32]} /><Mat color={pale} emissive={0} /></mesh><mesh rotation={[-0.4,0.2,0]}><torusGeometry args={[0.45,0.025,8,32]} /><Mat color={pale} emissive={0} /></mesh></group>
    case 'era-id': return <group><RoundedBox args={[0.95,0.62,0.16]} radius={0.08} smoothness={3} {...common}><Mat color={color} /></RoundedBox><mesh position={[-0.26,0.05,0.1]}><cylinderGeometry args={[0.12,0.12,0.04,16]} /><Mat color={pale} emissive={0} /></mesh><mesh position={[0.15,-0.08,0.1]}><boxGeometry args={[0.38,0.05,0.04]} /><Mat color={pale} emissive={0} /></mesh></group>
    default: return <group><RoundedBox args={[0.76,0.58,0.2]} radius={0.12} smoothness={3} {...common}><Mat color={color} /></RoundedBox><mesh position={[0,0,0.13]}><boxGeometry args={[0.42,0.08,0.04]} /><Mat color={pale} emissive={0} /></mesh><mesh position={[0,-0.16,0.13]}><boxGeometry args={[0.28,0.06,0.04]} /><Mat color={pale} emissive={0} /></mesh></group>
  }
}
