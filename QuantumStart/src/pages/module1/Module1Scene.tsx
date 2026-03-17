/**
 * Module1Scene.tsx — R3F scene for Module 1 "What is a Qubit?"
 *
 * ─── MODEL SIZE CONFIG ────────────────────────────────────────────
 *  Cat NPC:    <group scale={CAT_SCALE}>  (outer group)
 *              <primitive scale={CAT_GLB_SCALE}> (koi_cat.glb inner)
 *  Coin:       CylinderGeometry args={[COIN_RADIUS, COIN_RADIUS, COIN_HEIGHT, 36]}
 *  Qubit:      SphereGeometry args={[QUBIT_RADIUS, 32, 32]}
 *  Orbit rings:TorusGeometry args={[ORBIT_RADIUS, 0.018, 8, 64]}
 *  Lotus pad:  CylinderGeometry args={[PAD_RADIUS, PAD_RADIUS, 0.06, 32]}
 * ──────────────────────────────────────────────────────────────────
 */

import { useRef, useState, useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF, useAnimations, Html, Text } from '@react-three/drei'
import * as THREE from 'three'
import Koi_cat from '../../assets/koi_cat.glb'
import { color } from 'three/tsl'

export type Phase = 'hook' | 'lesson' | 'quiz' | 'complete'
export type Track = 'blue' | 'amber' | null

// ─── SIZE CONSTANTS (edit here to resize scene objects) ───────────────────────
const CAT_SCALE = 2.5    // overall cat NPC group scale
const CAT_GLB_SCALE = 0.5    // koi_cat.glb primitive scale
const COIN_RADIUS = 1.42   // classical bit coin radius
const COIN_HEIGHT = 0.15   // coin thickness
const QUBIT_RADIUS = 1.25   // qubit sphere radius
const ORBIT_RADIUS = 1.7    // qubit orbit ring radius

// ─── MODEL POSITIONS (edit here for X,Y) ───────────────────────
const CAT_X = 5.5    // Cat horizontal position
const CAT_Y = 1.8    // Cat vertical position
const COIN_X = -5.5   // Coin horizontal position (left side)
const COIN_Y = 0.2    // Coin vertical position
const QUBIT_X = -0.5   // Qubit horizontal position (center)
const QUBIT_Y = 0.2   // Qubit vertical position

// Cat mouse-look tuning
const CAT_LOOK_X = 0.65   // horizontal range radians (higher = wider pan)
const CAT_LOOK_Y = 0.60   // vertical range radians
const CAT_LOOK_SPEED = 0.07   // follow speed: 0.03=lazy, 0.07=default, 0.15=snappy

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface Module1SceneProps {
    track: Track
    phase: Phase
    onCatSettled: () => void
    onCoinClick: () => void
    onSphereClick: () => void
    quizCorrect?: boolean | null
    showParticles?: boolean
    catRetreat?: boolean
}

// ─── SCENE DIMMER ─────────────────────────────────────────────────────────────
function SceneDimmer({ active }: { active: boolean }) {
    const meshRef = useRef<THREE.Mesh>(null)
    useFrame((_s, delta) => {
        if (!meshRef.current) return
        const mat = meshRef.current.material as THREE.MeshBasicMaterial
        const target = active ? 0.55 : 0
        mat.opacity += (target - mat.opacity) * delta * 3
    })
    return (
        <mesh ref= { meshRef } position = { [0, 0, 1]} renderOrder = { 10} >
            <planeGeometry args={ [100, 100] } />
                < meshBasicMaterial color = "#080912" transparent opacity = { 0} depthTest = { false} />
                    </mesh>
    )
}



// ─── COIN (classical bit) ─────────────────────────────────────────────────────
function CoinMesh({ onClick }: { onClick: () => void }) {
    const ref = useRef<THREE.Group>(null)
    const [face, setFace] = useState<0 | 1>(0)
    const [flipping, setFlipping] = useState(false)
    const [hovered, setHovered] = useState(false)
    const flipProgress = useRef(0)
    const startRot = useRef(0)

    const handleClick = () => {
        if (flipping) return
        setFlipping(true)
        flipProgress.current = 0
        startRot.current = ref.current?.rotation.x || 0
        onClick()
    }

    useFrame((_s, delta) => {
        if (!ref.current) return
        // bob in local space 
        ref.current.position.y = Math.sin(_s.clock.getElapsedTime() * 0.9 + 1) * 0.08

        if (flipping) {
            flipProgress.current = Math.min(flipProgress.current + delta * 3.5, 1)
            // Ease out the flip
            const ease = 1 - Math.pow(1 - flipProgress.current, 3)
            ref.current.rotation.x = startRot.current + ease * Math.PI

            if (flipProgress.current >= 1) {
                setFlipping(false)
                setFace(f => f === 0 ? 1 : 0)
                // Normalize rotation to keep it bounded 0..2PI
                ref.current.rotation.x = (startRot.current + Math.PI) % (Math.PI * 2)
            }
        } else {
            ref.current.rotation.z = 0
        }
    })

    const col0 = '#C4955A' // Top/0 - Amber Gold
    const col1 = '#A0A0A0' // Bottom/1 - Silver
    const edgeCol = hovered ? '#ffd580' : '#444'

    return (
        <group position= { [COIN_X, COIN_Y, 0]} >
        <group ref={ ref }>
            {/* The side/edge of the coin */ }
            < mesh
    onClick = { handleClick }
    onPointerEnter = {() => { setHovered(true); document.body.style.cursor = 'pointer' }
}
onPointerLeave = {() => { setHovered(false); document.body.style.cursor = '' }}
rotation = { [Math.PI / 2, 0, 0]}
    >
    <cylinderGeometry args={ [COIN_RADIUS, COIN_RADIUS, COIN_HEIGHT, 48] } />
        < meshStandardMaterial color = { edgeCol } metalness = { 0.9} roughness = { 0.1} />
            </mesh>

{/* Side 0 (Gold) */ }
<mesh position={ [0, 0, COIN_HEIGHT / 2 + 0.005] }>
    <circleGeometry args={ [COIN_RADIUS, 32] } />
        < meshStandardMaterial color = { col0 } emissive = { col0 } emissiveIntensity = { 0.5} roughness = { 0.2} transparent opacity = { 0.95} />
            <Text
                        position={ [0, 0, 0.03] }
fontSize = { COIN_RADIUS * 0.75}
color = "white"
anchorX = "center"
anchorY = "middle"
    >
    0
    </Text>
    </mesh>

{/* Side 1 (Silver) */ }
<mesh position={ [0, 0, -COIN_HEIGHT / 2 - 0.005] } rotation = { [Math.PI, 0, 0]} >
    <circleGeometry args={ [COIN_RADIUS, 32] } />
        < meshStandardMaterial color = { col1 } emissive = { col1 } emissiveIntensity = { 0.5} roughness = { 0.2} transparent opacity = { 0.95} />
            <Text
                        position={ [0, 0, 0.03] }
fontSize = { COIN_RADIUS * 0.75}
color = "#222"
anchorX = "center"
anchorY = "middle"
    >
    1
    </Text>
    </mesh>
    </group>

{/* Helper text sits stationary below the bobbing group */ }
<Html center position = { [0, -COIN_RADIUS - 0.5, 0]} style = {{ pointerEvents: 'none', userSelect: 'none' }}>
    <div style={
    {
        color: 'rgba(255,255,255,0.45)',
            fontSize: '11px',
                fontFamily: 'DM Sans, sans-serif',
                    letterSpacing: '0.05em',
                        whiteSpace: 'nowrap',
                            textAlign: 'center'
    }
}>
    classical bit ↑ click to flip({ face === 0 ? 'head' : 'tail'})
        </div>
        </Html>
        </group>
    )
}

// ─── QUBIT SPHERE ─────────────────────────────────────────────────────────────
function QubitSphere({ track, onClick, isQuizTarget }: { track: Track; onClick: () => void; isQuizTarget?: boolean }) {
    const ref = useRef<THREE.Mesh>(null)
    const ring1 = useRef<THREE.Mesh>(null)
    const ring2 = useRef<THREE.Mesh>(null)
    const [hovered, setHovered] = useState(false)
    const [superposing, setSuperposing] = useState(false)   // true while in collapse animation
    const [collapsed, setCollapsed] = useState(false)        // true after collapse settles
    const [collapsedVal, setCollapsedVal] = useState<0 | 1>(0)
    const superTime = useRef(0)

    // Flickering display: rapidly alternates 0 / 1 while idle
    const [flickerVal, setFlickerVal] = useState<0 | 1>(0)
    useEffect(() => {
        if (superposing || collapsed) return
        const id = setInterval(() => setFlickerVal(v => v === 0 ? 1 : 0), 160)
        return () => clearInterval(id)
    }, [superposing, collapsed])

    const handleClick = () => {
        if (superposing) return
        if (collapsed) {
            // Second click: restore superposition
            setCollapsed(false)
            setSuperposing(false)
            return
        }
        // Collapse the superposition
        setSuperposing(true)
        superTime.current = 0
        setCollapsedVal(Math.random() > 0.5 ? 1 : 0)
        onClick()
    }

    useFrame((_s, delta) => {
        if (!ref.current) return
        const t = _s.clock.getElapsedTime()
        // bob in local space
        ref.current.position.y = Math.sin(t * 0.8) * 0.12
        ref.current.rotation.y += delta * (superposing ? 6 : 1.2)
        ref.current.rotation.x += delta * 0.4
        if (ring1.current) ring1.current.rotation.z += delta * 1.0
        if (ring2.current) ring2.current.rotation.x += delta * 1.4
        if (superposing) {
            superTime.current += delta
            const mat = ref.current.material as THREE.MeshStandardMaterial
            mat.emissiveIntensity = 2.5 + Math.sin(superTime.current * 20) * 1.5
            if (superTime.current > 1.5) {
                setSuperposing(false)
                setCollapsed(true)
                mat.emissiveIntensity = 1.4
            }
        }
    })

    const baseCol = hovered || superposing ? '#9be7ff' : collapsed ? '#FFB7C5' : '#5DA7DB'
    const ringSelCol = track === 'amber' ? '#C4955A' : '#5DA7DB'

    // What to display on the sphere
    const displayVal = collapsed ? collapsedVal : (superposing ? '?' : flickerVal)
    const displayColor = collapsed ? '#FFB7C5' : superposing ? '#ffffff' : 'rgba(255,255,255,0.7)'

    return (
        <group position= { [QUBIT_X, QUBIT_Y, 0]} >
        { isQuizTarget && (
            <mesh>
            <sphereGeometry args={ [QUBIT_RADIUS + 0.24, 24, 24] } />
                < meshStandardMaterial color = "#FFB7C5" emissive = "#FFB7C5" emissiveIntensity = { 1.8} transparent opacity = { 0.18} wireframe />
                    </mesh>
            )
}
<mesh
                ref={ ref }
onClick = { handleClick }
onPointerEnter = {() => { setHovered(true); document.body.style.cursor = 'pointer' }}
onPointerLeave = {() => { setHovered(false); document.body.style.cursor = '' }}
            >
    <sphereGeometry args={ [QUBIT_RADIUS, 32, 32] } />
        < meshStandardMaterial color = { baseCol } emissive = { baseCol } emissiveIntensity = { superposing? 2.5: 1.4 } metalness = { 0.3} roughness = { 0.05} transparent opacity = { superposing? 0.85: 0.95 } />
            </mesh>
            < mesh ref = { ring1 } rotation = { [Math.PI / 2, 0, 0]} >
                <torusGeometry args={ [ORBIT_RADIUS, 0.018, 8, 64] } />
                    < meshStandardMaterial color = { ringSelCol } emissive = { ringSelCol } emissiveIntensity = { 0.9} transparent opacity = { 0.75} />
                        </mesh>
                        < mesh ref = { ring2 } >
                            <torusGeometry args={ [ORBIT_RADIUS, 0.018, 8, 64] } />
                                < meshStandardMaterial color = "#FFB7C5" emissive = "#FFB7C5" emissiveIntensity = { 0.9} transparent opacity = { 0.6} />
                                    </mesh>

{/* Flickering 0/1 superposition display */ }
<Html center position = { [0, 0, 0]} style = {{ pointerEvents: 'none', userSelect: 'none' }}>
    <div style={
    {
        color: displayColor,
            fontSize: superposing ? '2rem' : '1.8rem',
                fontWeight: 900,
                    fontFamily: 'Space Mono, monospace',
                        textShadow: `0 0 18px ${displayColor}`,
                            transition: superposing ? 'none' : 'color 0.05s',
                                letterSpacing: '-0.02em',
                                    minWidth: '2ch',
                                        textAlign: 'center',
                }
}>
    { displayVal }
    </div>
    </Html>

{/* State label beneath */ }
<Html center position = { [0, -0.88, 0]} style = {{ pointerEvents: 'none', userSelect: 'none' }}>
    <div style={ { color: 'rgba(255,255,255,0.45)', fontSize: '10px', fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.05em', textAlign: 'center' } }>
        { collapsed? `collapsed → |${collapsedVal}⟩  (click to reset)` : 'qubit ↑ click to collapse'}
</div>
    </Html>
    </group>
    )
}

// ─── BRAKKET LABELS (Amber track) ─────────────────────────────────────────────
function BraketLabels() {
    return (
        <>
        {
            [
                { pos: [QUBIT_X, QUBIT_Y + 0.52, 0.44] as [number, number, number], label: '|0⟩', col: '#5DA7DB' },
                { pos: [QUBIT_X, QUBIT_Y - 0.52, -0.44] as [number, number, number], label: '|1⟩', col: '#C4955A' },
            ].map(({ pos, label, col }) => (
                    <Html key= { label } position = { pos } center style = {{ pointerEvents: 'none', userSelect: 'none' }} >
        <div style= {{ color: col, fontSize: '13px', fontWeight: 900, fontFamily: 'Space Mono, monospace', textShadow: `0 0 12px ${col}`, background: 'rgba(14,15,26,0.6)', backdropFilter: 'blur(6px)', padding: '2px 8px', borderRadius: '6px', border: `1px solid ${col}55` }
}>
    { label }
    </div>
    </Html>
            ))}
</>
    )
}

// ─── PARTICLE BURST ───────────────────────────────────────────────────────────
function LotusParticleBurst({ active, color }: { active: boolean; color: string }) {
    const meshRef = useRef<THREE.InstancedMesh>(null)
    const progress = useRef(0)
    const running = useRef(false)
    const COUNT = 32
    const particles = useMemo(() => Array.from({ length: COUNT }, () => {
        const theta = Math.random() * Math.PI * 2
        const phi = Math.random() * Math.PI * 0.8
        return { dir: new THREE.Vector3(Math.sin(phi) * Math.cos(theta), Math.abs(Math.sin(phi) * Math.sin(theta)) + 0.3, Math.cos(phi)).multiplyScalar(2.5 + Math.random() * 2), size: 0.04 + Math.random() * 0.06, phase: Math.random() * Math.PI * 2 }
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
        <instancedMesh ref= { meshRef } args = { [undefined, undefined, COUNT]} >
            <octahedronGeometry args={ [1, 0] } />
                < meshStandardMaterial emissive = { threeColor } emissiveIntensity = { 2.5} transparent opacity = { 0.9} />
                    </instancedMesh>
    )
}

// ─── BLUE SHIMMER (wrong answer) ─────────────────────────────────────────────
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
        <mesh ref= { ref } position = { [0, 0, 1.5]} renderOrder = { 11} >
            <planeGeometry args={ [100, 100] } />
                < meshBasicMaterial color = "#5DA7DB" transparent opacity = { 0} depthTest = { false} />
                    </mesh>
    )
}

// ─── CAT NPC ─────────────────────────────────────────────────────────────────
function CatNPC({ onCatSettled, catRetreat }: { phase: Phase; onCatSettled: () => void; catRetreat?: boolean }) {
    const catGroup = useRef<THREE.Group>(null)
    const { scene, animations } = useGLTF(Koi_cat)
    const { actions, mixer } = useAnimations(animations, catGroup)
    const settled = useRef(false)
    const walkProgress = useRef(0)
    const START_X = -8
    const START_Y = 2.5
    const TARGET_X = CAT_X
    const TARGET_Y = CAT_Y

    // Normalized mouse position (-1..1)
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
        if (!catGroup.current) return
        if (mixer) mixer.update(delta)

        // Walk in from upper-left to top-right
        if (!settled.current) {
            walkProgress.current = Math.min(walkProgress.current + delta * 0.55, 1)
            const ease = 1 - Math.pow(1 - walkProgress.current, 3)
            catGroup.current.position.x = START_X + (TARGET_X - START_X) * ease
            catGroup.current.position.y = START_Y + (TARGET_Y - START_Y) * ease
            if (walkProgress.current >= 1 && !settled.current) { settled.current = true; onCatSettled() }
        } else {
            // Settled: gentle bob at target position
            const t = _s.clock.getElapsedTime()
            catGroup.current.position.x += (TARGET_X - catGroup.current.position.x) * delta * 4
            const bobY = TARGET_Y + Math.sin(t * 0.7) * 0.06 + (catRetreat ? -0.8 : 0)
            catGroup.current.position.y += (bobY - catGroup.current.position.y) * delta * 4
        }

        // Mouse look — lerp rotation toward mouse
        const tRotY = mouseX.current * CAT_LOOK_X
        const tRotX = -mouseY.current * CAT_LOOK_Y
        catGroup.current.rotation.y += (tRotY - catGroup.current.rotation.y) * CAT_LOOK_SPEED
        catGroup.current.rotation.x += (tRotX - catGroup.current.rotation.x) * CAT_LOOK_SPEED
    })

    return (
        <group ref= { catGroup } position = { [START_X, START_Y, 0]} scale = { CAT_SCALE } >
            <primitive object={ scene } scale = { CAT_GLB_SCALE } />
                </group>
    )
}

// ─── CAMERA CONTROLLER ────────────────────────────────────────────────────────
function CameraController({ phase }: { phase: Phase }) {
    const { camera } = useThree()
    const targetZ = useRef(11)
    useEffect(() => {
        targetZ.current = phase === 'quiz' ? 9 : phase === 'complete' ? 10 : 11
    }, [phase])
    useFrame((_s, delta) => { camera.position.z += (targetZ.current - camera.position.z) * delta * 2 })
    return null
}

// ─── MODULE 1 SCENE (main export) ─────────────────────────────────────────────
export default function Module1Scene({ track, phase, onCatSettled, onCoinClick, onSphereClick, quizCorrect = null, showParticles = false, catRetreat = false }: Module1SceneProps) {
    const isQuiz = phase === 'quiz'
    const showBraket = track === 'amber' && phase === 'lesson'
    return (
        <>
        <CameraController phase= { phase } />
        <ambientLight intensity={ isQuiz ? 0.5 : 1.1 } />
            < directionalLight position = { [5, 5, 5]} intensity = { isQuiz? 1.0: 2.0 } />
                <pointLight position={ [-4, 2, -4] } intensity = { 1.2} color = "#5DA7DB" />
                    <pointLight position={ [4, 2, 4] } intensity = { 1.0} color = "#C4955A" />
                        <SceneDimmer active={ isQuiz } />
                            < CoinMesh onClick = { onCoinClick } />
                                <QubitSphere track={ track } onClick = { onSphereClick } isQuizTarget = { isQuiz } />
                                    { showBraket && <BraketLabels />
}
<CatNPC phase={ phase } onCatSettled = { onCatSettled } catRetreat = { catRetreat } />
    <LotusParticleBurst active={ showParticles && quizCorrect === true } color = "#FFB7C5" />
        <BlueShimmer active={ showParticles && quizCorrect === false } />
            </>
    )
}

