/**
 * BlochSphereScene.tsx — R3F scene for "Bloch Sphere"
 */

import { useState, useEffect, useMemo } from 'react'
import { useThree } from '@react-three/fiber'
import { Sphere, Line, Text, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

interface BlochSphereSceneProps {
    track: 'blue' | 'amber' | null
    phase: 'hook' | 'lesson' | 'quiz' | 'complete'
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
    track, phase, theta, phi, onStateChange, onCatSettled, showParticles
}: BlochSphereSceneProps) {
    const { camera: _ } = useThree()
    // const vectorRef = useRef<THREE.Group>(null!)
    const [isDragging, setIsDragging] = useState(false)

    // Notify parent once on mount (cat is handled globally mostly, but we trigger settled signal)
    useEffect(() => {
        const timer = setTimeout(onCatSettled, 1000)
        return () => clearTimeout(timer)
    }, [onCatSettled])

    // Convert theta/phi to XYZ for the vector tip
    const vectorPos = useMemo(() => {
        const x = SPHERE_RADIUS * Math.sin(theta) * Math.cos(phi)
        const z = SPHERE_RADIUS * Math.sin(theta) * Math.sin(phi)
        const y = SPHERE_RADIUS * Math.cos(theta)
        return new THREE.Vector3(x, y, z)
    }, [theta, phi])

    // Dragging logic (simple screen-to-sphere mapping)
    const handlePointerMove = (e: any) => {
        if (!isDragging || phase !== 'lesson') return
        e.stopPropagation()
        
        // Raycast to a plane or use point on sphere
        const point = e.point
        if (!point) return
        
        const dir = point.clone().normalize()
        const newTheta = Math.acos(THREE.MathUtils.clamp(dir.y, -1, 1))
        const newPhi = Math.atan2(dir.z, dir.x)
        
        onStateChange(newTheta, newPhi)
    }

    return (
        <group>
            {/* Lights handled by App.tsx shared canvas, but we can add subtle accents */}
            <pointLight position={[0, 5, 0]} intensity={0.5} color="#fff" />

            {/* Orbit controls only available if not dragging the vector */}
            <OrbitControls enablePan={false} enableZoom={false} enabled={!isDragging} />

            {/* THE SPHERE */}
            <group rotation={[0, 0, 0]}>
                {/* Main Glassy Sphere */}
                <Sphere args={[SPHERE_RADIUS, 64, 64]}>
                    <meshPhysicalMaterial 
                        transparent 
                        opacity={0.15} 
                        roughness={0.1} 
                        metalness={0.05} 
                        color="#ffffff" 
                        transmission={0.5}
                        thickness={1}
                    />
                </Sphere>

                {/* Wireframe / Grid Lines */}
                <Sphere args={[SPHERE_RADIUS, 32, 32]}>
                    <meshBasicMaterial wireframe transparent opacity={0.05} color="#5DA7DB" />
                </Sphere>

                {/* AXES */}
                {/* Z Axis (Vertical) */}
                <Line points={[[0, -SPHERE_RADIUS * 1.2, 0], [0, SPHERE_RADIUS * 1.2, 0]]} color="#ffffff" lineWidth={1} transparent opacity={0.3} />
                <Text position={[0, SPHERE_RADIUS * 1.3, 0]} fontSize={0.4} color="white">|0⟩</Text>
                <Text position={[0, -SPHERE_RADIUS * 1.3, 0]} fontSize={0.4} color="white">|1⟩</Text>

                {/* X Axis */}
                <Line points={[[-SPHERE_RADIUS * 1.2, 0, 0], [SPHERE_RADIUS * 1.2, 0, 0]]} color="#ff4444" lineWidth={1} transparent opacity={0.2} />
                <Text position={[SPHERE_RADIUS * 1.3, 0, 0]} fontSize={0.3} color="#ff4444">X</Text>

                {/* Y Axis */}
                <Line points={[[0, 0, -SPHERE_RADIUS * 1.2], [0, 0, SPHERE_RADIUS * 1.2]]} color="#44ff44" lineWidth={1} transparent opacity={0.2} />
                <Text position={[0, 0, SPHERE_RADIUS * 1.3]} fontSize={0.3} color="#44ff44">Y</Text>

                {/* Great Circles (Equator and Prime Meridian) */}
                <Line 
                    points={Array.from({length: 65}).map((_, i) => [
                        SPHERE_RADIUS * Math.cos((i / 64) * Math.PI * 2),
                        0,
                        SPHERE_RADIUS * Math.sin((i / 64) * Math.PI * 2)
                    ])} 
                    color="#ffffff" lineWidth={0.5} transparent opacity={0.1} 
                />
                <Line 
                    points={Array.from({length: 65}).map((_, i) => [
                        0,
                        SPHERE_RADIUS * Math.cos((i / 64) * Math.PI * 2),
                        SPHERE_RADIUS * Math.sin((i / 64) * Math.PI * 2)
                    ])} 
                    color="#ffffff" lineWidth={0.5} transparent opacity={0.1} 
                />

                {/* THE STATE VECTOR (ARROW) */}
                <group 
                    onPointerDown={(e) => { e.stopPropagation(); setIsDragging(true); }}
                    onPointerUp={() => setIsDragging(false)}
                    onPointerMove={handlePointerMove}
                    onPointerOut={() => setIsDragging(false)}
                >
                    {/* The line */}
                    <Line points={[[0, 0, 0], [vectorPos.x, vectorPos.y, vectorPos.z]]} color="#FFB7C5" lineWidth={4} />
                    
                    {/* The Tip (Glowy Sphere) */}
                    <mesh position={vectorPos}>
                        <sphereGeometry args={[0.15, 16, 16]} />
                        <meshBasicMaterial color="#FFB7C5" />
                        {/* Glow effect */}
                        <pointLight intensity={2} distance={2} color="#FFB7C5" />
                    </mesh>

                    {/* Invisible hit area for easier dragging */}
                    <Sphere position={vectorPos} args={[0.5]} visible={false} />
                </group>

                {/* ARC PROJECTIONS (Visualizing theta and phi) */}
                {phase === 'lesson' && track === 'amber' && (
                    <>
                        {/* Theta Arc (Vertical) */}
                        {/* Phi projection dot on equator */}
                        <mesh position={[SPHERE_RADIUS * Math.sin(theta) * Math.cos(phi), 0, SPHERE_RADIUS * Math.sin(theta) * Math.sin(phi)]}>
                            <sphereGeometry args={[0.08, 8, 8]} />
                            <meshBasicMaterial color="white" transparent opacity={0.5} />
                        </mesh>
                    </>
                )}
            </group>

            {/* Particles or Feedback */}
            {showParticles && (
                <group position={vectorPos}>
                    {Array.from({length: 20}).map((_, i) => (
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
