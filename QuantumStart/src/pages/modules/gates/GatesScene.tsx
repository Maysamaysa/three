/**
 * GatesScene.tsx — R3F scene for "Quantum Gates" Module 4
 */

import { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sphere, Line, Text, Html } from '@react-three/drei'
import * as THREE from 'three'
import type { GatePhase } from './GatesModule'
import { stateToBloch } from './gateLogic'
import type { State1Q } from './gateLogic'

// --- REUSABLE MINI BLOCH SPHERE ---
interface MiniBlochSphereProps {
    position: [number, number, number]
    state: State1Q
    scale?: number
}

export function MiniBlochSphere({ position, state, scale = 1 }: MiniBlochSphereProps) {
    const { theta, phi } = stateToBloch(state)
    const radius = 1.5 * scale

    const vectorPos = useMemo(() => {
        const x = radius * Math.sin(theta) * Math.cos(phi)
        const z = radius * Math.sin(theta) * Math.sin(phi)
        const y = radius * Math.cos(theta)
        return new THREE.Vector3(x, y, z)
    }, [theta, phi, radius])

    // Slerp animation
    const currentPos = useRef(new THREE.Vector3(0, radius, 0))
    useFrame((_s, delta) => {
        currentPos.current.lerp(vectorPos, delta * 5)
    })

    return (
        <group position={position}>
            {/* Sphere shell */}
            <Sphere args={[radius, 24, 24]}>
                <meshBasicMaterial transparent opacity={0.05} color="#ffffff" depthWrite={false} />
            </Sphere>

            {/* Axes */}
            <Line points={[[0, -radius*1.1, 0], [0, radius*1.1, 0]]} color="#ffffff" transparent opacity={0.3} />
            <Line points={[[-radius*1.1, 0, 0], [radius*1.1, 0, 0]]} color="#ff4444" transparent opacity={0.3} />
            <Line points={[[0, 0, -radius*1.1], [0, 0, radius*1.1]]} color="#44ff44" transparent opacity={0.3} />

            {/* Labels */}
            <Text position={[0, radius*1.2, 0]} fontSize={0.25*scale} color="#ffffff">|0⟩</Text>
            <Text position={[0, -radius*1.2, 0]} fontSize={0.25*scale} color="#ffffff">|1⟩</Text>

            {/* State Vector */}
            <Line points={[[0, 0, 0], currentPos.current]} color="#A67B5B" lineWidth={5} />
            <mesh position={currentPos.current}>
                <sphereGeometry args={[0.08 * scale]} />
                <meshBasicMaterial color="#A67B5B" />
            </mesh>
        </group>
    )
}

// --- GATE TILES (Phase 1) ---
const GATES_INFO = [
    { id: 'H', x: -4 },
    { id: 'X', x: -2 },
    { id: 'Y', x: 0 },
    { id: 'Z', x: 2 },
    { id: 'CNOT', x: 4 }
]

interface Phase1SceneProps {
    unlockedGates: string[]
    selectedGate: string | null
    onSelectGate: (id: string) => void
    animState: State1Q // The live state being animated
}

function Phase1Scene({ unlockedGates, selectedGate, onSelectGate, animState }: Phase1SceneProps) {
    const groupRef = useRef<THREE.Group>(null)

    useFrame((s) => {
        if (!groupRef.current) return
        const t = s.clock.getElapsedTime()
        if (!selectedGate) {
            groupRef.current.rotation.y = Math.sin(t * 0.2) * 0.1
        } else {
            // Smoothly move out of the way to the top left when a gate is focused
            groupRef.current.position.lerp(new THREE.Vector3(-3, 2.5, -3), 0.05)
            groupRef.current.quaternion.slerp(new THREE.Quaternion().identity(), 0.05)
        }
    })

    return (
        <group ref={groupRef}>
            {GATES_INFO.map((gate) => {
                const isUnlocked = unlockedGates.includes(gate.id)
                const isSelected = selectedGate === gate.id
                const isDimmed = selectedGate !== null && !isSelected

                return (
                    <GateTile
                        key={gate.id}
                        id={gate.id}
                        position={[gate.x, isSelected ? -0.5 : 0, isSelected ? 2 : 0]} // pop out if selected
                        isUnlocked={isUnlocked}
                        isSelected={isSelected}
                        isDimmed={isDimmed}
                        onClick={() => {
                            if (isUnlocked && !selectedGate) onSelectGate(gate.id)
                        }}
                    />
                )
            })}
            
            {selectedGate && (
                <group position={[0, -0.5, 0]}>
                    <MiniBlochSphere position={[2, 0, 0]} state={animState} scale={1.2} />
                </group>
            )}
        </group>
    )
}

function GateTile({ id, position, isUnlocked, isSelected, isDimmed, onClick }: any) {
    const ref = useRef<THREE.Mesh>(null)
    const [hovered, setHovered] = useState(false)

    useFrame((s) => {
        if (!ref.current) return
        if (!isSelected) {
            ref.current.rotation.y += 0.01
            ref.current.rotation.x = Math.sin(s.clock.getElapsedTime() * 2 + position[0]) * 0.1
        } else {
            ref.current.quaternion.slerp(new THREE.Quaternion().identity(), 0.1)
        }
        
        const targetScale = isSelected ? 1.5 : hovered && isUnlocked && !isDimmed ? 1.2 : 1
        ref.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1)
    })

    const color = isUnlocked ? (hovered || isSelected ? '#ffd580' : '#C4955A') : '#555555'

    return (
        <mesh 
            ref={ref} 
            position={position}
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
            onPointerOut={(e) => { e.stopPropagation(); setHovered(false); }}
        >
            <boxGeometry args={[1, 1, 0.2]} />
            <meshStandardMaterial 
                color={color} 
                emissive={color} 
                emissiveIntensity={isUnlocked ? 0.8 : 0.2} 
                transparent opacity={isDimmed ? 0.2 : 1}
            />
            {(!isUnlocked) && (
                <Html center position={[0, 0, 0.11]}>
                    <div style={{ fontSize: '1.5rem', opacity: isDimmed ? 0.2 : 0.8 }}>🔒</div>
                </Html>
            )}
            {isUnlocked && (
                <Html center position={[0, 0, 0.11]}>
                    <div style={{ 
                        color: '#fff', fontSize: '1.5rem', fontWeight: 'bold', 
                        textShadow: '0 0 10px rgba(0,0,0,1)', pointerEvents: 'none',
                        opacity: isDimmed ? 0.2 : 1 
                    }}>
                        {id}
                    </div>
                </Html>
            )}
        </mesh>
    )
}


// --- PHASE 2 SCENE (Challenges) ---
interface Phase2SceneProps {
    challengeIdx: number
    wireState1: State1Q
    wireState2?: State1Q // For challenge 3
    isEntangled?: boolean
}

function Phase2Scene({ challengeIdx, wireState1, wireState2, isEntangled }: Phase2SceneProps) {
    const isDual = challengeIdx === 2
    return (
        <group position={[0, 1, 0]}>
            {/* Wire background */}
            <Line points={[[-6, 0, -2], [6, 0, -2]]} color="#5DA7DB" transparent opacity={0.4} lineWidth={3} />
            {isDual && <Line points={[[-6, -3, -2], [6, -3, -2]]} color="#C4955A" transparent opacity={0.4} lineWidth={3} />}

            <MiniBlochSphere position={isDual ? [-2.5, 0, 0] : [0, 0, 0]} state={wireState1} scale={1.2} />
            {isDual && wireState2 && (
                <MiniBlochSphere position={[2.5, 0, 0]} state={wireState2} scale={1.2} />
            )}

            {isEntangled && isDual && (
                <Line points={[[-2.5, 0, 0], [2.5, 0, 0]]} color="#FFB7C5" transparent opacity={0.8} lineWidth={5} />
            )}
        </group>
    )
}


// --- MAIN SCENE ---
interface GatesSceneProps {
    phase: GatePhase
    unlockedGates: string[]
    // Shared state passed from Overlay
    selectedGate?: string | null
    onSelectGate?: (id: string) => void
    animState?: State1Q
    challengeIdx?: number
    wireState1?: State1Q
    wireState2?: State1Q
    isEntangled?: boolean
}

export default function GatesScene(props: GatesSceneProps) {
    const { phase, unlockedGates, selectedGate, onSelectGate, animState, challengeIdx, wireState1, wireState2, isEntangled } = props

    return (
        <group>
            <ambientLight intensity={0.6} />
            <pointLight position={[5, 10, 5]} intensity={1.2} color="#fff" />
            <pointLight position={[-5, -10, -5]} intensity={0.5} color="#5DA7DB" />

            {phase === 'phase1_intro' && (
                <Phase1Scene 
                    unlockedGates={unlockedGates} 
                    selectedGate={selectedGate || null} 
                    onSelectGate={onSelectGate || (() => {})} 
                    animState={animState || [1,0,0,0]}
                />
            )}

            {phase === 'phase2_challenges' && (
                <Phase2Scene 
                    challengeIdx={challengeIdx || 0}
                    wireState1={wireState1 || [1,0,0,0]}
                    wireState2={wireState2}
                    isEntangled={isEntangled}
                />
            )}
            
            {phase === 'phase3_quiz' && (
                <group position={[0, 0, 0]}>
                   {/* In phase 3, state is managed dynamically by overlay. For simplicity, we drop a placeholder or use the wireState */}
                   <MiniBlochSphere position={[0, 0, 0]} state={wireState1 || [1,0,0,0]} scale={1.5} />
                </group>
            )}
        </group>
    )
}
