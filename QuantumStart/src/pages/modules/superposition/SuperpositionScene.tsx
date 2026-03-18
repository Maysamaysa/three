/**
 * SuperpositionScene.tsx — R3F scene for "Superposition"
 */

import { useRef, useState, useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF, useAnimations, Html } from '@react-three/drei'
import * as THREE from 'three'
import Koi_cat from '../../../assets/koi_cat.glb'

export type Phase = 'hook' | 'lesson' | 'quiz' | 'complete'
export type Track = 'blue' | 'amber' | null

// ─── PARTICLE BURST ───────────────────────────────────────────────────────────
function LotusParticleBurst({ active, color }: { active: boolean; color: string }) {
    const meshRef = useRef<THREE.InstancedMesh>(null)
    const progress = useRef(0)
    const running = useRef(false)
    const COUNT = 32
    const particles = useMemo(() => Array.from({ length: COUNT }, () => {
        const theta = Math.random() * Math.PI * 2
        const phi = Math.random() * Math.PI * 0.8
        return { 
            dir: new THREE.Vector3(Math.sin(phi) * Math.cos(theta), Math.abs(Math.sin(phi) * Math.sin(theta)) + 0.3, Math.cos(phi)).multiplyScalar(2.5 + Math.random() * 2), 
            size: 0.04 + Math.random() * 0.06, 
            phase: Math.random() * Math.PI * 2 
        }
    }), [])
    const dummy = useMemo(() => new THREE.Object3D(), [])
    const threeColor = useMemo(() => new THREE.Color(color), [color])
    useEffect(() => { if (active) { running.current = true; progress.current = 0 } }, [active])
    useFrame((_s, delta) => {
        if (!meshRef.current || !running.current) return
        progress.current = Math.min(progress.current + delta * 1.1, 1)
        const ease = 1 - Math.pow(1 - progress.current, 3)
        particles.forEach((p, i) => {
            const pos = p.dir.clone().multiplyScalar(ease)
            const scale = p.size * (1 - ease * 0.9) * (1 + Math.sin(progress.current * Math.PI) * 0.3)
            dummy.position.copy(pos); dummy.scale.setScalar(Math.max(scale, 0)); dummy.updateMatrix()
            meshRef.current!.setMatrixAt(i, dummy.matrix)
            meshRef.current!.setColorAt(i, new THREE.Color().lerpColors(new THREE.Color('#FFB7C5'), threeColor, ease))
        })
        meshRef.current.instanceMatrix.needsUpdate = true
        if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true
        if (progress.current >= 1) running.current = false
    })
    if (!active && !running.current) return null
    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]}>
            <octahedronGeometry args={[1, 0]} />
            <meshStandardMaterial emissive={threeColor} emissiveIntensity={2.5} transparent opacity={0.9} />
        </instancedMesh>
    )
}

function BlueShimmer({ active }: { active: boolean }) {
    const ref = useRef<THREE.Mesh>(null)
    const progress = useRef(0)
    const running = useRef(false)
    useEffect(() => { if (active) { running.current = true; progress.current = 0 } }, [active])
    useFrame((_s, delta) => {
        if (!ref.current || !running.current) return
        progress.current = Math.min(progress.current + delta * 2, 1)
        const mat = ref.current.material as THREE.MeshBasicMaterial
        mat.opacity = Math.sin(progress.current * Math.PI) * 0.35
        if (progress.current >= 1) { running.current = false; mat.opacity = 0 }
    })
    return (
        <mesh ref={ref} position={[0, 0, 1.5]} renderOrder={11}>
            <planeGeometry args={[100, 100]} />
            <meshBasicMaterial color="#5DA7DB" transparent opacity={0} depthTest={false} />
        </mesh>
    )
}

const CAT_SCALE = 2.5
const CAT_GLB_SCALE = 0.5
const CAT_X = 5.5
const CAT_Y = 1.8

const MACHINE_X = -0.5
const MACHINE_Y = 0.2

const CAT_LOOK_SPEED = 0.07

interface SuperpositionSceneProps {
    track: Track
    phase: Phase
    onCatSettled: () => void
    onGateTrigger: () => void
    gateActive: boolean
    hasTransformed: boolean
    onTransform: () => void
    quizCorrect?: boolean | null
    showParticles?: boolean
    catRetreat?: boolean
}

function SceneDimmer({ active }: { active: boolean }) {
    const meshRef = useRef<THREE.Mesh>(null)
    useFrame((_s, delta) => {
        if (!meshRef.current) return
        const mat = meshRef.current.material as THREE.MeshBasicMaterial
        const target = active ? 0.55 : 0
        mat.opacity += (target - mat.opacity) * delta * 3
    })
    return (
        <mesh ref={meshRef} position={[0, 0, 1]} renderOrder={10}>
            <planeGeometry args={[100, 100]} />
            <meshBasicMaterial color="#080912" transparent opacity={0} depthTest={false} />
        </mesh>
    )
}

// ─── H-GATE TUNNEL ───────────────────────────────────────────────────────────
function HGate({ active: _ }: { active: boolean }) {
    const group = useRef<THREE.Group>(null)
    const field = useRef<THREE.Mesh>(null)

    useFrame((state) => {
        if (!field.current) return
        const t = state.clock.getElapsedTime()
        field.current.scale.setScalar(1 + Math.sin(t * 3) * 0.05)
        const mat = field.current.material as THREE.MeshStandardMaterial
        mat.emissiveIntensity = 0.5 + Math.sin(t * 2) * 0.3
    })

    return (
        <group position={[1.5, 0, 0]} ref={group}>
            {/* Frame */}
            <mesh>
                <torusGeometry args={[1.5, 0.08, 16, 4]} />
                <meshStandardMaterial color="#333" metalness={0.8} roughness={0.2} />
            </mesh>
            {/* Glow field */}
            <mesh ref={field}>
                <cylinderGeometry args={[0.02, 0.02, 3, 32]} />
                <meshStandardMaterial 
                    color="#FFB7C5" 
                    emissive="#FFB7C5" 
                    transparent 
                    opacity={0.15} 
                    emissiveIntensity={0.5} 
                />
            </mesh>
            {/* H label */}
            <Html position={[0, 1.8, 0]} center>
                <div style={{
                    color: '#FFB7C5',
                    fontSize: '32px',
                    fontWeight: 900,
                    fontFamily: 'Space Mono, monospace',
                    textShadow: '0 0 15px rgba(255,183,197,0.8)'
                }}>H</div>
            </Html>
        </group>
    )
}

// ─── DRAGGABLE QUBIT ──────────────────────────────────────────────────────────
function DraggableQubit({ hasTransformed, onTransform, track }: { hasTransformed: boolean; onTransform: () => void; track: Track }) {
    const group = useRef<THREE.Group>(null)
    const [dragging, setDragging] = useState(false)
    // const [pos, setPos] = useState(new THREE.Vector3(-4, 0, 0))
    const { viewport } = useThree()
    const waveRef = useRef<THREE.Mesh>(null)

    useFrame((state) => {
        if (!group.current) return
        const t = state.clock.getElapsedTime()

        if (!hasTransformed) {
            // Idle bobbing if not transformed
            if (!dragging) {
                group.current.position.y += Math.sin(t * 1.5) * 0.002
            }
            
            // Interaction check: check if qubit passed through H-Gate (around X=1.5)
            if (group.current.position.x > 0.8 && group.current.position.x < 2.2) {
                onTransform()
                setDragging(false)
            }
        } else {
            // Post-transformation: float to center and stay there as a wave
            const targetX = -0.5
            group.current.position.x += (targetX - group.current.position.x) * 0.05
            group.current.position.y += (0 - group.current.position.y) * 0.05
            
            if (waveRef.current) {
                const scale = 1.2 + Math.sin(t * 2) * 0.1
                waveRef.current.scale.setScalar(scale)
                const mat = waveRef.current.material as THREE.MeshStandardMaterial
                mat.emissiveIntensity = 1 + Math.sin(t * 3) * 0.5
            }
        }
    })

    const handlePointerDown = (e: any) => {
        if (hasTransformed) return
        e.stopPropagation()
        setDragging(true)
        // Set cursor
        document.body.style.cursor = 'grabbing'
    }

    const handlePointerUp = () => {
        setDragging(false)
        document.body.style.cursor = 'auto'
    }

    const handlePointerMove = (e: any) => {
        if (!dragging || hasTransformed) return
        // Map pointer to world space
        const x = (e.clientX / window.innerWidth) * 2 - 1
        const y = -(e.clientY / window.innerHeight) * 2 + 1
        
        // Use viewport to size the drag correctly
        const newX = (x * viewport.width) / 2
        const newY = (y * viewport.height) / 2
        
        group.current?.position.set(newX, newY, 0)
    }

    const col = track === 'amber' ? '#C4955A' : '#5DA7DB'

    return (
        <group 
            ref={group} 
            position={[-4, 0, 0]}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerUp}
        >
            {!hasTransformed ? (
                <>
                    {/* |1⟩ Silver Qubit */}
                    <mesh onPointerEnter={() => !hasTransformed && (document.body.style.cursor = 'grab')} onPointerLeave={() => (document.body.style.cursor = 'auto')}>
                        <sphereGeometry args={[0.7, 32, 32]} />
                        <meshStandardMaterial color="#A0A0A0" emissive="#A0A0A0" emissiveIntensity={0.5} roughness={0.1} metalness={0.8} />
                    </mesh>
                    <Html center position={[0, -1, 0]}>
                        <div style={{ color: '#fff', fontSize: '10px', whiteSpace: 'nowrap', opacity: 0.6 }}>DRAG ME →</div>
                    </Html>
                </>
            ) : (
                /* Wavy Superposition Field */
                <mesh ref={waveRef}>
                    <icosahedronGeometry args={[1.4, 2]} />
                    <meshStandardMaterial 
                        color={col} 
                        emissive={col} 
                        emissiveIntensity={1} 
                        wireframe 
                        transparent 
                        opacity={0.6} 
                    />
                </mesh>
            )}
        </group>
    )
}

// ─── AMBER TRACK MATH VISUALIZER ───────────────────────────────────────────────
function MathOverlay({ active }: { active: boolean }) {
    if (!active) return null
    return (
        <Html position={[MACHINE_X, MACHINE_Y - 2.5, 0]} center>
            <div style={{
                background: 'rgba(14, 15, 26, 0.8)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(196, 149, 90, 0.4)',
                borderRadius: '12px',
                padding: '16px 24px',
                color: '#e0b87a',
                fontFamily: 'Space Mono, monospace',
                fontSize: '14px',
                textAlign: 'center',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
            }}>
                <div style={{ marginBottom: '8px', opacity: 0.6, fontSize: '11px' }}>HADAMARD TRANSFORMATION</div>
                H |0⟩ = 1/√2 (|0⟩ + |1⟩)
            </div>
        </Html>
    )
}

function CatNPC({ onCatSettled, catRetreat }: { onCatSettled: () => void; catRetreat?: boolean }) {
    const catGroup = useRef<THREE.Group>(null)
    const { scene, animations } = useGLTF(Koi_cat)
    const { actions, mixer } = useAnimations(animations, catGroup)
    const settled = useRef(false)
    const walkProgress = useRef(0)
    
    const mouseX = useRef(0)
    const mouseY = useRef(0)

    useEffect(() => {
        const onMove = (e: MouseEvent) => {
            mouseX.current = (e.clientX / window.innerWidth) * 2 - 1
            mouseY.current = -((e.clientY / window.innerHeight) * 2 - 1)
        }
        window.addEventListener('mousemove', onMove)
        return () => window.removeEventListener('mousemove', onMove)
    }, [])

    const animNames = useMemo(() => Object.keys(actions ?? {}), [actions])
    useEffect(() => {
        if (!actions || animNames.length === 0) return
        const first = actions[animNames[0]]
        if (first) first.reset().play()
    }, [actions, animNames])

    useFrame((_s, delta) => {
        if (!catGroup.current || !mixer) return
        mixer.update(delta)

        if (!settled.current) {
            walkProgress.current = Math.min(walkProgress.current + delta * 0.55, 1)
            const ease = 1 - Math.pow(1 - walkProgress.current, 3)
            catGroup.current.position.x = -8 + (CAT_X + 8) * ease
            catGroup.current.position.y = 2.5 + (CAT_Y - 2.5) * ease
            if (walkProgress.current >= 1) { 
                settled.current = true
                onCatSettled() 
            }
        } else {
            const t = _s.clock.getElapsedTime()
            catGroup.current.position.x += (CAT_X - catGroup.current.position.x) * delta * 4
            const bobY = CAT_Y + Math.sin(t * 0.7) * 0.06 + (catRetreat ? -0.8 : 0)
            catGroup.current.position.y += (bobY - catGroup.current.position.y) * delta * 4
        }

        catGroup.current.rotation.y += (mouseX.current * 0.65 - catGroup.current.rotation.y) * CAT_LOOK_SPEED
        catGroup.current.rotation.x += (-mouseY.current * 0.60 - catGroup.current.rotation.x) * CAT_LOOK_SPEED
    })

    return (
        <group ref={catGroup} position={[-8, 2.5, 0]} scale={CAT_SCALE}>
            <primitive object={scene} scale={CAT_GLB_SCALE} />
        </group>
    )
}

function CameraController({ phase }: { phase: Phase }) {
    const { camera } = useThree()
    const targetZ = useRef(11)
    useEffect(() => {
        targetZ.current = phase === 'quiz' ? 9 : phase === 'complete' ? 10 : 11
    }, [phase])
    useFrame((_s, delta) => { 
        camera.position.z += (targetZ.current - camera.position.z) * delta * 2 
    })
    return null
}

export default function SuperpositionScene({ track, phase, onCatSettled, hasTransformed, onTransform, quizCorrect = null, showParticles = false, catRetreat = false }: SuperpositionSceneProps) {
    const isQuiz = phase === 'quiz'
    return (
        <>
            <CameraController phase={phase} />
            <ambientLight intensity={isQuiz ? 0.5 : 1.1} />
            <directionalLight position={[5, 5, 5]} intensity={isQuiz ? 1.0 : 2.0} />
            <pointLight position={[-4, 2, -4]} intensity={1.2} color="#5DA7DB" />
            <pointLight position={[4, 2, 4]} intensity={1.0} color="#C4955A" />
            
            <SceneDimmer active={isQuiz} />
            
            {!isQuiz && <HGate active={hasTransformed} />}
            <DraggableQubit track={track} hasTransformed={hasTransformed} onTransform={onTransform} />
            
            <MathOverlay active={track === 'amber' && phase === 'lesson' && hasTransformed} />
            
            <CatNPC onCatSettled={onCatSettled} catRetreat={catRetreat} />
            
            <LotusParticleBurst active={showParticles && quizCorrect === true} color="#FFB7C5" />
            <BlueShimmer active={showParticles && quizCorrect === false} />
        </>
    )
}
