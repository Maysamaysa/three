import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface MiniBlochSphereProps {
    isMeasured: boolean
    outcome: 0 | 1 | null
    isEntangled: boolean
    seedOffset: number    
    isLeft?: boolean
}

export function MiniBlochSphere({ 
    isMeasured, 
    outcome, 
    isEntangled, 
    seedOffset, 
    isLeft
}: MiniBlochSphereProps) {
    const groupRef = useRef<THREE.Group>(null)
    const coreRef = useRef<THREE.Mesh>(null)
    const arrowRef = useRef<THREE.Group>(null)
    const ring1Ref = useRef<THREE.Mesh>(null)
    const ring2Ref = useRef<THREE.Mesh>(null)
    const ring3Ref = useRef<THREE.Mesh>(null)
    
    const glassMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.15,
        roughness: 0,
        metalness: 0.1,
        transmission: 1.0, 
        thickness: 0.5,     
        ior: 1.5,
        clearcoat: 1,
        clearcoatRoughness: 0.1
    })

    const innerMatRef = useRef<THREE.MeshStandardMaterial>(null)
    const matGlowRef = useRef<THREE.MeshBasicMaterial>(null)
    const matHaloRef = useRef<THREE.MeshBasicMaterial>(null)

    useFrame((state) => {
        const t = state.clock.elapsedTime

        if (groupRef.current) {
            groupRef.current.position.y = Math.sin(t * 0.8 + seedOffset) * 0.09
        }

        if (coreRef.current) {
            const dir = isLeft ? 1 : -1
            coreRef.current.rotation.y += 0.004 * dir
            coreRef.current.rotation.x += 0.001
        }

        const glowPulse = 0.06 + Math.sin(t * 1.8) * 0.03
        const haloPulse = 0.028 + Math.sin(t * 1.4 + 1) * 0.015
        
        if (matGlowRef.current) matGlowRef.current.opacity = glowPulse
        if (matHaloRef.current) matHaloRef.current.opacity = haloPulse
        if (innerMatRef.current) innerMatRef.current.emissiveIntensity = 0.2 + Math.sin(t * 2.2 + seedOffset) * 0.1

        if (ring1Ref.current && ring2Ref.current && ring3Ref.current) {
            const dir = isLeft ? 1 : -1
            ring1Ref.current.rotation.z += 0.006 * dir
            ring2Ref.current.rotation.x += 0.004 * dir
            ring3Ref.current.rotation.y += 0.008 * dir
        }

        // State vector arrow synchronization
        if (arrowRef.current && !isMeasured) {
            const arrowTheta = t * 1.5 
            const thetaA = Math.PI / 2 + Math.sin(arrowTheta) * 0.65
            const phiA = arrowTheta * 0.7
            
            let myTheta = thetaA
            let myPhi = phiA

            if (!isLeft && !isEntangled) {
                // Not entangled, do the opposite async motion
                myTheta = Math.PI / 2 - Math.sin(arrowTheta) * 0.65
                myPhi = -phiA
            }

            const dir = new THREE.Vector3(
                Math.sin(myTheta) * Math.cos(myPhi),
                Math.cos(myTheta),
                Math.sin(myTheta) * Math.sin(myPhi)
            ).normalize()
            
            const up = new THREE.Vector3(0, 1, 0)
            const q = new THREE.Quaternion()
            q.setFromUnitVectors(up, dir)
            arrowRef.current.quaternion.slerp(q, 0.12)

        } else if (arrowRef.current && isMeasured) {
            const targetTheta = outcome === 0 ? 0 : Math.PI
            const targetPhi = 0
            const dir = new THREE.Vector3(
                Math.sin(targetTheta) * Math.cos(targetPhi),
                Math.cos(targetTheta),
                Math.sin(targetTheta) * Math.sin(targetPhi)
            ).normalize()
            const up = new THREE.Vector3(0, 1, 0)
            const q = new THREE.Quaternion()
            q.setFromUnitVectors(up, dir)
            arrowRef.current.quaternion.slerp(q, 0.15)
        }
    })

    // Pink if entangled, or specific state outcome colors
    const finalColor = isMeasured ? (outcome === 0 ? '#5DA7DB' : '#A67B5B') : (isEntangled ? '#FFB7C5' : '#7effdd')

    return (
        <group ref={groupRef}>
            {/* Outer glass */}
            <mesh material={glassMaterial}>
                <sphereGeometry args={[0.8, 32, 32]} />
            </mesh>

            {/* Inner Core */}
            <mesh ref={coreRef}>
                <sphereGeometry args={[0.2, 16, 16]} />
                <meshStandardMaterial 
                    ref={innerMatRef} 
                    color={finalColor} 
                    emissive={finalColor}
                    emissiveIntensity={0.2}
                />
            </mesh>

            {/* Orbiting Rings */}
            <mesh ref={ring1Ref} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.82, 0.005, 16, 64]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={0.15} />
            </mesh>
            <mesh ref={ring2Ref} rotation={[0, 0, 0]}>
                <torusGeometry args={[0.82, 0.005, 16, 64]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={0.15} />
            </mesh>
            <mesh ref={ring3Ref} rotation={[0, Math.PI / 2, 0]}>
                <torusGeometry args={[0.82, 0.005, 16, 64]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={0.15} />
            </mesh>

            {/* Arrow Group */}
            <group ref={arrowRef}>
                <mesh position={[0, 0.35, 0]}>
                    <cylinderGeometry args={[0.015, 0.015, 0.7]} />
                    <meshBasicMaterial color={finalColor} />
                </mesh>
                <mesh position={[0, 0.75, 0]}>
                    <coneGeometry args={[0.06, 0.15]} />
                    <meshBasicMaterial color={finalColor} />
                </mesh>
            </group>

            {/* Glow and Halo */}
            <mesh>
                <sphereGeometry args={[0.9, 16, 16]} />
                <meshBasicMaterial ref={matGlowRef} color={finalColor} transparent blending={THREE.AdditiveBlending} depthWrite={false} />
            </mesh>
            <mesh>
                <sphereGeometry args={[1.1, 16, 16]} />
                <meshBasicMaterial ref={matHaloRef} color={finalColor} transparent blending={THREE.AdditiveBlending} depthWrite={false} />
            </mesh>
        </group>
    )
}
