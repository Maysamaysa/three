import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function BlochSphere({ position, scale = 1, theta, phi, isMeasured, outcome }: any) {
    const arrowRef = useRef<THREE.Group>(null)
    const timeRef = useRef(0)
    
    // Outcome 0 => North Pole (Rotation X = 0). Outcome 1 => South Pole (Rotation X = PI).
    const targetTheta = isMeasured ? (outcome === 0 ? 0 : Math.PI) : theta

    useFrame((_s, delta) => {
        if (!arrowRef.current) return
        timeRef.current += delta
        
        if (!isMeasured) {
            const bob = Math.sin(timeRef.current * 3) * 0.1
            arrowRef.current.rotation.x = THREE.MathUtils.lerp(arrowRef.current.rotation.x, targetTheta + bob, 0.1)
            arrowRef.current.rotation.y = THREE.MathUtils.lerp(arrowRef.current.rotation.y, phi, 0.1)
        } else {
            // SNAP quickly
            arrowRef.current.rotation.x = THREE.MathUtils.lerp(arrowRef.current.rotation.x, targetTheta, 0.4)
        }
    })

    return (
        <group position={position} scale={scale}>
            <mesh>
                <sphereGeometry args={[1.5, 24, 24]} />
                <meshStandardMaterial color={isMeasured ? "#444" : "#7effdd"} wireframe transparent opacity={isMeasured ? 0.2 : 0.4} />
            </mesh>
            {/* Z axis */}
            <mesh position={[0, 0, 0]}>
                <cylinderGeometry args={[0.015, 0.015, 3]} />
                <meshBasicMaterial color="#5DA7DB" />
            </mesh>
            
            <group ref={arrowRef}>
                <mesh position={[0, 0.75, 0]}>
                    <cylinderGeometry args={[0.04, 0.04, 1.5]} />
                    <meshStandardMaterial color="#ffffff" />
                </mesh>
                <mesh position={[0, 1.5, 0]}>
                    <sphereGeometry args={[0.1]} />
                    <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2} />
                </mesh>
            </group>
        </group>
    )
}

export default function MeasurementScene({ phase, step, theta, phi, isMeasured, measuredValue }: any) {
    if (phase === 'concept') {
        if (step === 1) {
            return <BlochSphere position={[0, 1, 0]} scale={1.2} theta={Math.PI/2} phi={0} />
        } else {
            return (
                <group position={[0, 1, 0]}>
                    <BlochSphere position={[-2.5, 0, 0]} scale={0.9} theta={Math.PI/2} phi={0} />
                    <BlochSphere position={[2.5, 0, 0]} scale={0.9} theta={0} phi={0} isMeasured={true} outcome={0} />
                </group>
            )
        }
    }
    return <BlochSphere position={[-2, 1, 0]} scale={1.4} theta={theta} phi={phi} isMeasured={isMeasured} outcome={measuredValue} />
}
