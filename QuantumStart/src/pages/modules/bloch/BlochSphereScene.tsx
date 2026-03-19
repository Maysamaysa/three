/**
 * BlochSphereScene.tsx — R3F scene for "Bloch Sphere"
 */

import { useState, useEffect, useMemo } from 'react'
import { Sphere, Line, Text, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

interface BlochSphereSceneProps {
    step: number | 'sandbox' | 'quiz' | 'complete'
    theta: number
    phi: number
    onStateChange: (theta: number, phi: number) => void
    onCatSettled: () => void
    quizCorrect: boolean | null
    showParticles: boolean
    catRetreat: boolean
}

const SPHERE_RADIUS = 3.5

export default function BlochSphereScene({
    step, theta, phi, onStateChange, onCatSettled, showParticles
}: BlochSphereSceneProps) {
    const [isDragging, setIsDragging] = useState(false)

    useEffect(() => {
        const timer = setTimeout(onCatSettled, 1000)
        return () => clearTimeout(timer)
    }, [onCatSettled])

    const vectorPos = useMemo(() => {
        const x = SPHERE_RADIUS * Math.sin(theta) * Math.cos(phi)
        const z = SPHERE_RADIUS * Math.sin(theta) * Math.sin(phi)
        const y = SPHERE_RADIUS * Math.cos(theta)
        return new THREE.Vector3(x, y, z)
    }, [theta, phi])

    const handlePointerMove = (e: any) => {
        if (!isDragging || step === 'quiz' || step === 'complete') return
        e.stopPropagation()
        const point = e.point
        if (!point) return
        
        const dir = point.clone().normalize()
        
        // --- SNAPPING LOGIC ---
        // Cardinal vectors for snapping
        const cardinals = [
            { v: new THREE.Vector3(0, 1, 0), label: '0' },
            { v: new THREE.Vector3(0, -1, 0), label: '1' },
            { v: new THREE.Vector3(1, 0, 0), label: '+' },
            { v: new THREE.Vector3(-1, 0, 0), label: '-' },
            { v: new THREE.Vector3(0, 0, 1), label: 'i+' },
            { v: new THREE.Vector3(0, 0, -1), label: 'i-' },
        ]

        let finalDir = dir
        const SNAP_THRESHOLD = 0.15 // ~8.6 degrees

        for (const cardinal of cardinals) {
            if (dir.distanceTo(cardinal.v) < SNAP_THRESHOLD) {
                finalDir = cardinal.v
                break
            }
        }

        const newTheta = Math.acos(THREE.MathUtils.clamp(finalDir.y, -1, 1))
        const newPhi = Math.atan2(finalDir.z, finalDir.x)
        onStateChange(newTheta, newPhi)
    }

    // Dynamic glow intensities based on step
    const zGlow = step === 2 ? 3 : 0.4
    const xGlow = step === 5 ? 3 : 0.4
    const yGlow = step === 5 ? 3 : 0.4
    const equatorGlow = step === 3 || step === 4 ? 0.8 : 0.3

    return (
        <group>
            {/* Lights */}
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1.5} color="#fff" />
            <pointLight position={[-10, -10, -10]} intensity={0.8} color="#5DA7DB" />

            {/* Glowing active intro part */}
            {step === 2 && <pointLight position={[0, SPHERE_RADIUS, 0]} intensity={4} distance={6} color="#ffffff" />}
            {step === 5 && <pointLight position={[SPHERE_RADIUS, 0, 0]} intensity={4} distance={6} color="#ff4444" />}
            {step === 5 && <pointLight position={[0, 0, SPHERE_RADIUS]} intensity={4} distance={6} color="#44ff44" />}

            <OrbitControls 
                enablePan={false} 
                enableZoom={true} 
                minDistance={7} 
                maxDistance={25} 
                enabled={!isDragging} 
            />

            <group>
                {/* 
                 Removing the opaque meshPhysicalMaterial sphere so internal axes are 100% visible 
                 and adding a subtle background sphere that does not block depth.
                */}
                <Sphere args={[SPHERE_RADIUS, 32, 32]}>
                    <meshBasicMaterial 
                        transparent 
                        opacity={0.03} 
                        color="#ffffff" 
                        depthWrite={false}
                    />
                </Sphere>

                {/* THE CAGE 
                    Custom Lat/Lon Wireframe (No Triangles)
                */}
                <group>
                    {/* Longitude Lines (Vertical rings) */}
                    {Array.from({ length: 12 }).map((_, i) => {
                        const angle = (i / 12) * Math.PI
                        return (
                            <Line 
                                key={`lon-${i}`}
                                points={Array.from({length: 65}).map((_, j) => {
                                    const a = (j / 64) * Math.PI * 2
                                    const x = Math.cos(a) * SPHERE_RADIUS
                                    const y = Math.sin(a) * SPHERE_RADIUS
                                    return [
                                        x * Math.cos(angle),
                                        y,
                                        x * Math.sin(angle)
                                    ]
                                })} 
                                color="#666666" 
                                lineWidth={1} 
                                transparent 
                                opacity={0.3} 
                            />
                        )
                    })}
                    
                    {/* Latitude Lines (Horizontal rings) */}
                    {Array.from({ length: 9 }).map((_, i) => {
                        // Skip poles and equator (equator is drawn below)
                        if (i === 0 || i === 8 || i === 4) return null;
                        const phi = (i / 8) * Math.PI;
                        const y = SPHERE_RADIUS * Math.cos(phi);
                        const r = SPHERE_RADIUS * Math.sin(phi);
                        return (
                            <Line 
                                key={`lat-${i}`}
                                points={Array.from({length: 65}).map((_, j) => {
                                    const a = (j / 64) * Math.PI * 2
                                    return [
                                        r * Math.cos(a),
                                        y,
                                        r * Math.sin(a)
                                    ]
                                })} 
                                color="#666666" 
                                lineWidth={1} 
                                transparent 
                                opacity={0.3} 
                            />
                        )
                    })}
                </group>

                <group>
                    {/* Thicker Cardinal Rings */}
                    {/* Equator */}
                    <Line 
                        points={Array.from({length: 65}).map((_, i) => [
                            SPHERE_RADIUS * Math.cos((i / 64) * Math.PI * 2),
                            0,
                            SPHERE_RADIUS * Math.sin((i / 64) * Math.PI * 2)
                        ])} 
                        color="#ffffff" 
                        lineWidth={2} 
                        transparent 
                        opacity={equatorGlow} 
                    />
                </group>

                {/* AXES */}
                
                {/* Z Axis (Vertical) */}
                <group>
                    <Line 
                        points={[[0, -SPHERE_RADIUS * 1.25, 0], [0, SPHERE_RADIUS * 1.25, 0]]} 
                        color="#ffffff" 
                        lineWidth={3} 
                        transparent 
                        opacity={zGlow} 
                    />
                    <Text position={[0, SPHERE_RADIUS * 1.45, 0]} fontSize={0.6} color="#ffffff" fontWeight="bold">|0⟩</Text>
                    <Text position={[0, -SPHERE_RADIUS * 1.45, 0]} fontSize={0.6} color="#ffffff" fontWeight="bold">|1⟩</Text>
                    <Text position={[0.4, SPHERE_RADIUS * 1.3, 0]} fontSize={0.4} color="#ffffff" fillOpacity={zGlow}>Z</Text>
                    
                    <mesh position={[0, SPHERE_RADIUS, 0]}><sphereGeometry args={[0.15]} /><meshBasicMaterial color="#5DA7DB" /></mesh>
                    <mesh position={[0, -SPHERE_RADIUS, 0]}><sphereGeometry args={[0.15]} /><meshBasicMaterial color="#A67B5B" /></mesh>
                </group>

                {/* X Axis (Red) */}
                <group>
                    <Line 
                        points={[[-SPHERE_RADIUS * 1.25, 0, 0], [SPHERE_RADIUS * 1.25, 0, 0]]} 
                        color="#ff4444" 
                        lineWidth={3} 
                        transparent 
                        opacity={xGlow} 
                    />
                    <Text position={[SPHERE_RADIUS * 1.6, 0, 0]} fontSize={0.5} color="#5DA7DB" fontWeight="bold">|+⟩</Text>
                    <Text position={[-SPHERE_RADIUS * 1.6, 0, 0]} fontSize={0.5} color="#5DA7DB" fontWeight="bold">|-⟩</Text>
                    <Text position={[SPHERE_RADIUS * 1.3, 0.5, 0]} fontSize={0.4} color="#ff4444" fillOpacity={xGlow}>X</Text>
                    <mesh position={[SPHERE_RADIUS, 0, 0]}><sphereGeometry args={[0.12]} /><meshBasicMaterial color="#ff4444" /></mesh>
                    <mesh position={[-SPHERE_RADIUS, 0, 0]}><sphereGeometry args={[0.12]} /><meshBasicMaterial color="#ff4444" /></mesh>
                </group>

                {/* Y Axis (Green) */}
                <group>
                    <Line 
                        points={[[0, 0, -SPHERE_RADIUS * 1.25], [0, 0, SPHERE_RADIUS * 1.25]]} 
                        color="#44ff44" 
                        lineWidth={3} 
                        transparent 
                        opacity={yGlow} 
                    />
                    <Text position={[0, 0, SPHERE_RADIUS * 1.6]} fontSize={0.5} color="#5DA7DB" fontWeight="bold">|i⟩</Text>
                    <Text position={[0, 0, -SPHERE_RADIUS * 1.6]} fontSize={0.5} color="#5DA7DB" fontWeight="bold">|-i⟩</Text>
                    <Text position={[0.5, 0.5, SPHERE_RADIUS * 1.3]} fontSize={0.4} color="#44ff44" fillOpacity={yGlow}>Y</Text>
                    <mesh position={[0, 0, SPHERE_RADIUS]}><sphereGeometry args={[0.12]} /><meshBasicMaterial color="#44ff44" /></mesh>
                    <mesh position={[0, 0, -SPHERE_RADIUS]}><sphereGeometry args={[0.12]} /><meshBasicMaterial color="#44ff44" /></mesh>
                </group>

                {/* THE STATE VECTOR (ARROW) */}
                <group 
                    onPointerDown={(e) => { e.stopPropagation(); setIsDragging(true); }}
                    onPointerUp={() => setIsDragging(false)}
                    onPointerMove={handlePointerMove}
                    onPointerOut={() => setIsDragging(false)}
                >
                    <Line points={[[0, 0, 0], [vectorPos.x, vectorPos.y, vectorPos.z]]} color="#A67B5B" lineWidth={7} />
                    
                    <mesh position={vectorPos} scale={isDragging ? 1.2 : 1}>
                        <sphereGeometry args={[0.22, 16, 16]} />
                        <meshBasicMaterial color="#A67B5B" />
                        <pointLight intensity={3} distance={5} color="#A67B5B" />
                    </mesh>

                    {/* Projections */}
                    {step !== 'quiz' && step !== 'complete' && (
                        <group>
                            <Line 
                                points={[[vectorPos.x, 0, vectorPos.z], [vectorPos.x, vectorPos.y, vectorPos.z]]} 
                                color="#ffffff" 
                                lineWidth={1.5} 
                                transparent 
                                opacity={0.4} 
                                dashed 
                            />
                            <mesh position={[vectorPos.x, 0, vectorPos.z]}>
                                <sphereGeometry args={[0.08]} />
                                <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
                            </mesh>
                        </group>
                    )}

                    <Sphere position={vectorPos} args={[1]} visible={false} />
                </group>
            </group>

            {/* Particles */}
            {showParticles && (
                <group position={vectorPos}>
                    {Array.from({length: 40}).map((_, i) => (
                        <mesh key={i} position={[Math.random()-0.5, Math.random()-0.5, Math.random()-0.5]}>
                            <sphereGeometry args={[0.05]} />
                            <meshBasicMaterial color="#FFB7C5" />
                        </mesh>
                    ))}
                </group>
            )}
        </group>
    )
}
