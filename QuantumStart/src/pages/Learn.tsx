import { useNavigate } from 'react-router-dom'
import { Canvas, useFrame } from '@react-three/fiber'
import React, { Suspense, useRef, useState, useLayoutEffect, useMemo } from 'react'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import styles from './Learn.module.css'
import { useCat } from '../context/CatContext'
import { useProgress } from '../context/ProgressContext'
import { useTypewriter } from '../hooks/useTypewriter'


// ─── MODULE DATA ──────────────────────────────────────────────────────────────
export type Track = 'blue' | 'amber'

interface Module {
    id: string
    name: string
    emoji: string
    blueLabel: string
    amberLabel: string
    // Position angle on the orbit ring (radians)
    angle: number
    radius: number
    qubitBlue: string
    qubitAmber: string
    route: string
}

const MODULE_DATA: Module[] = [
    {
        id: 'qubit',
        name: 'What is a Qubit?',
        emoji: '⚛️',
        angle: 0,
        radius: 1,
        blueLabel: 'Intuition',
        amberLabel: 'Technical',
        qubitBlue: "Imagine a coin spinning in the air — it's neither heads nor tails until it lands. That's your qubit. The universe's way of saying 'why choose?'",
        qubitAmber: "A qubit is a two-level quantum system represented as |ψ⟩ = α|0⟩ + β|1⟩, where α and β are complex amplitudes satisfying |α|² + |β|² = 1.",
        route: '/learn/qubit',
    },
    {
        id: 'superposition',
        name: 'Superposition',
        emoji: '🌊',
        angle: (Math.PI * 2) / 7,
        radius: 1,
        blueLabel: 'Intuition',
        amberLabel: 'Technical',
        qubitBlue: "Being in two places at once isn't magic — it's superposition. A qubit holds all possible answers simultaneously... until you dare to look.",
        qubitAmber: "Superposition is a linear combination of basis states. The Hadamard gate H maps |0⟩ → (|0⟩+|1⟩)/√2, placing the qubit in equal superposition.",
        route: '/learn/superposition',
    },
    {
        id: 'measurement',
        name: 'Measurement',
        emoji: '👁️',
        angle: (Math.PI * 2 * 2) / 7,
        radius: 1,
        blueLabel: 'Intuition',
        amberLabel: 'Technical',
        qubitBlue: "The moment you look at a qubit, the universe makes a decision. Superposition collapses into a single reality. You are the Observer. Choose carefully.",
        qubitAmber: "Measurement projects the state onto a basis. For |ψ⟩ = α|0⟩ + β|1⟩, P(0) = |α|², P(1) = |β|². Post-measurement state collapses irreversibly.",
        route: '/learn/measurement',
    },
    {
        id: 'bloch',
        name: 'Bloch Sphere',
        emoji: '🔮',
        angle: (Math.PI * 2 * 3) / 7,
        radius: 1,
        blueLabel: 'Intuition',
        amberLabel: 'Technical',
        qubitBlue: "Picture a snow globe — every point on its surface is a valid quantum state. The north pole is |0⟩, the south is |1⟩, and everywhere else? Pure magic.",
        qubitAmber: "The Bloch sphere maps qubit states to unit vectors: |ψ⟩ = cos(θ/2)|0⟩ + e^(iφ)sin(θ/2)|1⟩. Rotations on this sphere correspond to quantum gate operations.",
        route: '/learn/bloch',
    },
    {
        id: 'entanglement',
        name: 'Entanglement',
        emoji: '🔗',
        angle: (Math.PI * 2 * 4) / 7,
        radius: 1,
        blueLabel: 'Intuition',
        amberLabel: 'Technical',
        qubitBlue: "Two qubits, separated by galaxies, yet one knows what the other felt the instant you measured it. Einstein called it spooky. I call it my favourite trick.",
        qubitAmber: "Bell states are maximally entangled: |Φ⁺⟩ = (|00⟩+|11⟩)/√2. CNOT + Hadamard creates entanglement. Measuring one qubit instantly determines its partner.",
        route: '/learn/entanglement',
    },
    {
        id: 'gates',
        name: 'Quantum Gates',
        emoji: '🎛️',
        angle: (Math.PI * 2 * 5) / 7,
        radius: 1,
        blueLabel: 'Intuition',
        amberLabel: 'Technical',
        qubitBlue: "Quantum gates are like dance moves for qubits — they flip, rotate, and entangle. The Hadamard gate is the moonwalk of the quantum world.",
        qubitAmber: "Quantum gates are unitary matrices. X = [[0,1],[1,0]], H = [[1,1],[1,-1]]/√2. Their unitarity ensures reversibility: UU† = I.",
        route: '/learn/gates',
    },
    {
        id: 'algorithms',
        name: 'Quantum Algorithms',
        emoji: '⚡',
        angle: (Math.PI * 2 * 6) / 7,
        radius: 1,
        blueLabel: 'Intuition',
        amberLabel: 'Technical',
        qubitBlue: "A quantum computer doesn't try every answer — it makes all wrong answers cancel out, leaving only the right one standing. It's interference, not magic.",
        qubitAmber: "Grover's algorithm achieves O(√N) search via amplitude amplification. Shor's factors N in O((log N)³) using QFT-based period finding. Classical: O(e^N^(1/3)).",
        route: '/learn/algorithms',
    },
]

// ─── PROCEDURAL 3D MODELS ─────────────────────────────────────────────────────

// Spinning qubit particle (Module 1)
function QubitModel({ hovered }: { hovered: boolean }) {
    const ref = useRef<THREE.Mesh>(null)
    const ring1 = useRef<THREE.Mesh>(null)
    const ring2 = useRef<THREE.Mesh>(null)
    useFrame((_s, d) => {
        if (!ref.current) return
        ref.current.rotation.y += d * 1.2
        ref.current.rotation.x += d * 0.4
        if (ring1.current) ring1.current.rotation.z += d * 0.8
        if (ring2.current) ring2.current.rotation.x += d * 1.1
    })
    const col = hovered ? '#7ed6ff' : '#5DA7DB'
    return (
        <group scale= { hovered? 1.15: 1 } >
        <mesh ref={ ref }>
            <octahedronGeometry args={ [0.28, 0] } />
                < meshStandardMaterial color = { col } emissive = { col } emissiveIntensity = { 1.2} metalness = { 0.7} roughness = { 0.1} />
                    </mesh>
                    < mesh ref = { ring1 } rotation = { [Math.PI / 2, 0, 0]} >
                        <torusGeometry args={ [0.46, 0.022, 8, 48] } />
                            < meshStandardMaterial color = "#5DA7DB" emissive = "#5DA7DB" emissiveIntensity = { 1.0} transparent opacity = { 0.9} />
                                </mesh>
                                < mesh ref = { ring2 } >
                                    <torusGeometry args={ [0.46, 0.022, 8, 48] } />
                                        < meshStandardMaterial color = "#C4955A" emissive = "#C4955A" emissiveIntensity = { 1.0} transparent opacity = { 0.9} />
                                            </mesh>
                                            </group>
    )
}

// Wave coin (Superposition)
function SuperpositionModel({ hovered }: { hovered: boolean }) {
    const ref = useRef<THREE.Group>(null)
    const coinRef = useRef<THREE.Mesh>(null)
    useFrame((_s) => {
        if (!ref.current || !coinRef.current) return
        const t = _s.clock.getElapsedTime()
        coinRef.current.rotation.y = t * 2.5
        coinRef.current.position.y = Math.sin(t * 1.8) * 0.1
        ref.current.rotation.y = t * 0.3
    })
    const col = hovered ? '#ffcfe0' : '#FFB7C5'
    return (
        <group ref= { ref } scale = { hovered? 1.15: 1 } >
            <mesh ref={ coinRef }>
                <cylinderGeometry args={ [0.34, 0.34, 0.06, 32] } />
                    < meshStandardMaterial color = { col } emissive = { col } emissiveIntensity = { 1.1} metalness = { 0.8} roughness = { 0.05} />
                        </mesh>
    {
        [-0.22, 0, 0.22].map((x, i) => (
            <mesh key= { i } position = { [x, -0.32, 0]} rotation = { [Math.PI / 2, 0, 0]} >
            <torusGeometry args={ [0.1, 0.018, 6, 20]} />
        <meshStandardMaterial color="#5DA7DB" emissive = "#5DA7DB" emissiveIntensity = { 1.2} transparent opacity = { 0.6 + i * 0.15 } />
        </mesh>
        ))
    }
    </group>
    )
}

// Bloch sphere
function BlochModel({ hovered }: { hovered: boolean }) {
    const ref = useRef<THREE.Group>(null)
    const arrowRef = useRef<THREE.Mesh>(null)
    useFrame((s) => {
        if (!ref.current || !arrowRef.current) return
        const t = s.clock.getElapsedTime()
        ref.current.rotation.y = t * 0.5
        arrowRef.current.rotation.z = Math.sin(t * 0.8) * 0.4
    })
    const wireCol = hovered ? '#aaffee' : '#7effdd'
    return (
        <group ref= { ref } scale = { hovered? 1.15: 1 } >
            <mesh>
            <sphereGeometry args={ [0.36, 16, 16] } />
                < meshStandardMaterial color = { wireCol } emissive = { wireCol } emissiveIntensity = { 0.5} transparent opacity = { 0.35} wireframe />
                    </mesh>
    {
        [
            { pos: [0, 0.38, 0] as [number, number, number], col: '#5DA7DB' },
            { pos: [0, -0.38, 0] as [number, number, number], col: '#C4955A' },
            { pos: [0.38, 0, 0] as [number, number, number], col: '#FFB7C5' },
        ].map((ax, i) => (
            <mesh key= { i } position = { ax.pos } >
            <sphereGeometry args={ [0.05, 8, 8]} />
        <meshStandardMaterial color={ ax.col } emissive = { ax.col } emissiveIntensity = { 2.0} />
        </mesh>
        ))
    }
    <mesh ref={ arrowRef }>
        <cylinderGeometry args={ [0.018, 0.018, 0.42, 8] } />
            < meshStandardMaterial color = "#ffffff" emissive = "#ffffff" emissiveIntensity = { 1.5} />
                </mesh>
                </group>
    )
}

// Gate tile
function GateModel({ hovered }: { hovered: boolean }) {
    const ref = useRef<THREE.Mesh>(null)
    useFrame((s) => {
        if (!ref.current) return
        const t = s.clock.getElapsedTime()
        ref.current.rotation.y = t * 0.9
        ref.current.rotation.x = Math.sin(t * 0.6) * 0.3
    })
    const col = hovered ? '#ffd580' : '#C4955A'
    return (
        <group scale= { hovered? 1.15: 1 } >
        <mesh ref={ ref }>
            <boxGeometry args={ [0.46, 0.46, 0.08] } />
                < meshStandardMaterial color = { col } emissive = { col } emissiveIntensity = { 1.0} metalness = { 0.6} roughness = { 0.2} />
                    </mesh>
                    < Html center position = { [0, 0, 0.08]} >
                        <div style={ { color: '#fff', fontSize: '0.9rem', fontWeight: 900, fontFamily: 'Space Mono, monospace', pointerEvents: 'none', textShadow: '0 0 12px rgba(255,255,255,1)' } }> H </div>
                            </Html>
                            </group>
    )
}

// Probability cloud (Measurement)
function MeasurementModel({ hovered }: { hovered: boolean }) {
    const points = useMemo(() => {
        const pts: [number, number, number][] = []
        for (let i = 0; i < 80; i++) {
            const theta = Math.random() * Math.PI * 2
            const phi = Math.random() * Math.PI
            const r = 0.22 + Math.random() * 0.2
            pts.push([Math.sin(phi) * Math.cos(theta) * r, Math.sin(phi) * Math.sin(theta) * r, Math.cos(phi) * r])
        }
        return pts
    }, [])
    const groupRef = useRef<THREE.Group>(null)
    useFrame((s) => {
        if (!groupRef.current) return
        groupRef.current.rotation.y = s.clock.getElapsedTime() * 0.4
    })
    const col = hovered ? '#ffcfe0' : '#FFB7C5'
    return (
        <group ref= { groupRef } scale = { hovered? 1.15: 1 } >
        {
            points.map((p, i) => (
                <mesh key= { i } position = { p } >
                <sphereGeometry args={ [0.024, 4, 4]} />
            <meshStandardMaterial color={ col } emissive = { col } emissiveIntensity = { 1.5} transparent opacity = { 0.75} />
            </mesh>
            ))
        }
            </group>
    )
}

// Two entangled orbs
function EntanglementModel({ hovered }: { hovered: boolean }) {
    const ref = useRef<THREE.Group>(null)
    useFrame((s) => {
        if (!ref.current) return
        const t = s.clock.getElapsedTime()
        ref.current.rotation.y = t * 0.7
        ref.current.rotation.z = Math.sin(t * 0.5) * 0.2
    })
    return (
        <group ref= { ref } scale = { hovered? 1.15: 1 } >
            <mesh position={ [-0.28, 0, 0] }>
                <sphereGeometry args={ [0.18, 12, 12] } />
                    < meshStandardMaterial color = "#5DA7DB" emissive = "#5DA7DB" emissiveIntensity = { 1.4} transparent opacity = { 0.95} />
                        </mesh>
                        < mesh position = { [0.28, 0, 0]} >
                            <sphereGeometry args={ [0.18, 12, 12] } />
                                < meshStandardMaterial color = "#C4955A" emissive = "#C4955A" emissiveIntensity = { 1.4} transparent opacity = { 0.95} />
                                    </mesh>
                                    < mesh position = { [0, 0, 0]} rotation = { [0, 0, Math.PI / 2]} >
                                        <cylinderGeometry args={ [0.01, 0.01, 0.56, 6] } />
                                            < meshStandardMaterial color = "#FFB7C5" emissive = "#FFB7C5" emissiveIntensity = { 2.0} transparent opacity = { 0.8} />
                                                </mesh>
                                                </group>
    )
}

// Wave pattern (Algorithms)
function AlgorithmModel({ hovered }: { hovered: boolean }) {
    const ref = useRef<THREE.Group>(null)
    useFrame((s) => {
        if (!ref.current) return
        ref.current.rotation.y = s.clock.getElapsedTime() * 0.5
    })
    const points = useMemo(() => {
        const pts: [number, number, number][] = []
        for (let i = 0; i < 40; i++) {
            const x = (i / 39) * 0.9 - 0.45
            const y = Math.sin(i * 0.75) * 0.18 * (1 + i / 39)
            pts.push([x, y, 0])
        }
        return pts
    }, [])
    const col = hovered ? '#ffd580' : '#C4955A'
    return (
        <group ref= { ref } scale = { hovered? 1.15: 1 } >
        {
            points.map((p, i) => (
                <mesh key= { i } position = { p } >
                <sphereGeometry args={ [0.03, 6, 6]} />
            <meshStandardMaterial color={ col } emissive = { col } emissiveIntensity = { 1.6} transparent opacity = { 0.75 + (i / 39) * 0.25 } />
            </mesh>
            ))
        }
            </group>
    )
}

// NpcCat and KoiCat removed — cat is now global via CatContext

const MODEL_MAP: Record<string, React.ComponentType<{ hovered: boolean }>> = {
    qubit: QubitModel,
    superposition: SuperpositionModel,
    bloch: BlochModel,
    gates: GateModel,
    measurement: MeasurementModel,
    entanglement: EntanglementModel,
    algorithms: AlgorithmModel,
}

// ─── FLOATING MODULE CARD (3D + HTML) ─────────────────────────────────────────
interface ModuleCardProps {
    module: Module
    index: number
    total: number
    selected: boolean
    dimmed: boolean
    anySelected: boolean
    locked: boolean
    onSelect: (id: string) => void
    orbitRotation: number
}

function ModuleCard({ module, index, total, selected, dimmed, anySelected, locked, onSelect, orbitRotation }: ModuleCardProps) {
    const groupRef = useRef<THREE.Group>(null)
    const globeRef = useRef<THREE.Mesh>(null)
    const [hovered, setHovered] = useState(false)

    // ── CONFIG ─────────────────────────────────────────────────────────────────
    // Orbit radius (world units). Increase to push modules further from center.
    const RADIUS = 5.2
    // ────────────────────────────────────────────────────────────────────────────

    const BASE_ANGLE = ((index / total) * Math.PI * 2) - Math.PI / 2
    const bobOffset = index * 1.1
    const bobAmp = 0.07 + (index % 3) * 0.02

    useFrame((state) => {
        if (!groupRef.current) return
        const t = state.clock.getElapsedTime()

        const angle = BASE_ANGLE + orbitRotation

        const x = Math.cos(angle) * RADIUS
        const y = Math.sin(angle) * RADIUS + (anySelected ? 0 : Math.sin(t * 0.55 + bobOffset) * bobAmp)

        groupRef.current.position.set(x, y, selected ? 0.3 : 0)

        const targetScale = dimmed ? 0.65 : selected ? 1.18 : hovered ? 1.08 : 1.0
        groupRef.current.scale.lerp(
            new THREE.Vector3(targetScale, targetScale, targetScale), 0.12
        )

        if (globeRef.current) {
            const mat = globeRef.current.material as THREE.MeshStandardMaterial
            const targetEmissive = selected ? 0.55 : hovered ? 0.22 : 0.06
            mat.emissiveIntensity += (targetEmissive - mat.emissiveIntensity) * 0.1
            const targetOpacity = selected ? 0.32 : hovered ? 0.22 : 0.14
            mat.opacity += (targetOpacity - mat.opacity) * 0.1
        }
    })

    const ModelComponent = MODEL_MAP[module.id]
    const initPos: [number, number, number] = [Math.cos(BASE_ANGLE) * RADIUS, Math.sin(BASE_ANGLE) * RADIUS, 0]

    return (
        <group ref= { groupRef } position = { initPos } >

            {/* ── Selection glow ring ── */ }
    {
        selected && (
            <mesh rotation={ [Math.PI / 2, 0, 0] }>
                <torusGeometry args={ [0.72, 0.025, 8, 64] } />
                    < meshStandardMaterial color = "#FFB7C5" emissive = "#FFB7C5" emissiveIntensity = { 2.5} transparent opacity = { 0.9} />
                        </mesh>
            )
    }

    {/* ── Glass globe ── */ }
    <mesh ref={ globeRef }>
        <sphereGeometry args={ [0.58, 28, 28] } />
            < meshStandardMaterial
    color = "#C1E1C1"
    emissive = "#C1E1C1"
    emissiveIntensity = { 0.05}
    transparent
    opacity = { 0.14}
    roughness = { 0.05}
    metalness = { 0.2}
    side = { THREE.FrontSide }
        />
        </mesh>
    {/* Globe highlight rim */ }
    <mesh rotation={ [0.3, 0, 0] }>
        <torusGeometry args={ [0.49, 0.008, 8, 48] } />
            < meshStandardMaterial
    color = "#ffffff"
    emissive = "#ffffff"
    emissiveIntensity = { 0.35}
    transparent
    opacity = { 0.28}
        />
        </mesh>

    {/* ── 3D model inside the globe ── */ }
    <group position={ [0, 0.05, 0] } scale = { 1.8} >
        <ModelComponent hovered={ hovered || selected } />
            </group>

    {/* ── HTML card below the globe ── */ }
    <Html
 center
 position = { [0, -0.78, 0]}
 style = {{ pointerEvents: dimmed ? 'none' : 'auto' }
}
zIndexRange = { [10, 0]}
    >
    <div
 onPointerEnter={ () => setHovered(true) }
 onPointerLeave = {() => setHovered(false)}
 onClick = {() => !locked && onSelect(module.id)}
 style = {{
    width: '148px',
        background: selected
            ? 'rgba(20,21,35,0.90)'
            : hovered
                ? 'rgba(20,21,35,0.78)'
                : 'rgba(20,21,35,0.62)',
            backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                    border: selected
                        ? '1px solid rgba(255,183,197,0.75)'
                        : hovered
                            ? '1px solid rgba(248,249,255,0.38)'
                            : '1px solid rgba(248,249,255,0.15)',
                        borderRadius: '18px',
                            padding: '11px 13px 12px',
                                cursor: locked ? 'not-allowed' : 'pointer',
                                    opacity: dimmed ? 0.35 : 1,
                                        transition: 'all 0.25s ease',
                                            boxShadow: selected
                                                ? '0 0 32px rgba(255,183,197,0.4), 0 4px 20px rgba(0,0,0,0.6)'
                                                : '0 4px 16px rgba(0,0,0,0.5)',
                                                userSelect: 'none',
                                                    transform: hovered && !dimmed ? 'translateY(-3px)' : 'translateY(0)',
                                                        position: 'relative',
                    }}
                >
    {/* Lock overlay */ }
{
    locked && (
        <div style={
            {
                position: 'absolute', inset: 0, borderRadius: '18px',
                    background: 'rgba(10,10,20,0.65)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.2rem', zIndex: 2,
                        }
    }>🔒</div>
                    )
}

{/* Name */ }
<div style={
    {
        color: '#F8F9FF',
            fontSize: '12.5px',
                fontWeight: 700,
                    fontFamily: 'DM Sans, sans-serif',
                        textAlign: 'center',
                            lineHeight: 1.35,
                                marginBottom: '9px',
                                    textShadow: '0 1px 8px rgba(0,0,0,0.9)',
                    }
}>
    { module.emoji } { module.name }
</div>

    </div>
    </Html>
    </group>
    )
}

// ─── ORBIT RING — slowly rotates all module cards around the cat ─────────────
interface OrbitRingProps {
    selectedId: string | null
    onSelect: (id: string) => void
}

function OrbitRing({ selectedId, onSelect }: OrbitRingProps) {
    const { isModuleLocked } = useProgress()
    const anySelected = selectedId !== null
    const [rotation, setRotation] = useState(0)
    const persistentRotationRef = useRef(0)
    const ORBIT_SPEED = 0.06

    useFrame((_state, delta) => {
        if (!anySelected) {
            persistentRotationRef.current += delta * ORBIT_SPEED
            setRotation(persistentRotationRef.current)
        }
    })

    return (
        <group>
        {
            MODULE_DATA.map((mod, i) => (
                <ModuleCard
 key= { mod.id }
 module = { mod }
 index = { i }
 total = { MODULE_DATA.length }
 selected = { selectedId === mod.id}
 dimmed = { anySelected && selectedId !== mod.id
}
 anySelected = { anySelected }
 locked = { isModuleLocked(mod.id) }
 onSelect = {(id) => onSelect(id)}
 orbitRotation = { rotation }
    />
            ))}
</group>
    )
}

// ─── LEARN PAGE ───────────────────────────────────────────────────────────────
export function Learn() {
    const navigate = useNavigate()
    const { setMode, setCatPosition, setQubitState: setCatQubit } = useCat()
    const { isModuleLocked } = useProgress()
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [dialogueText, setDialogueText] = useState('')
    const [confirming, setConfirming] = useState(false)

    // useLayoutEffect fires synchronously before paint, ensuring the cat
    // is always restored to 'center' when navigating back from any module —
    // even if that module's cleanup fires afterwards (which it won't in strict mode,
    // but this guards against any race with PageTransition unmount timing).
    useLayoutEffect(() => {
        setMode('npc')
        setCatPosition('center')
        setCatQubit('idle')
    }, [setMode, setCatPosition, setCatQubit])

    const selectedModule = MODULE_DATA.find(m => m.id === selectedId) ?? null

    const { displayed, finished, skip } = useTypewriter(
        dialogueText, 35, !!dialogueText
    )

    // When a card is selected
    const handleSelect = (id: string) => {
        const mod = MODULE_DATA.find(m => m.id === id)
        if (!mod || isModuleLocked(id)) return

        setSelectedId(id)
        setConfirming(false)
        setCatQubit('idle')

        setDialogueText('')
        requestAnimationFrame(() => setDialogueText(mod.qubitBlue))
    }

    // No extra step needed anymore

    const handleConfirm = () => {
        if (!selectedModule) return
        setConfirming(true)
        navigate(selectedModule.route)
    }

    const handleDismiss = () => {
        setSelectedId(null)
        setDialogueText('')
        setCatQubit('idle')
    }

    return (
        <div className= { styles.container } style = {{ pointerEvents: 'auto' }
}>
    {/* ── 3D Canvas (orbit ring only — cat is global at center) ── */ }
    < Canvas
 className = { styles.canvas }
 camera = {{ position: [0, 0, 13], fov: 58 }}
 gl = {{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
 dpr = { [1, 2]}
 style = {{ background: 'transparent' }}
            >
    <Suspense fallback={ null }>
        <ambientLight intensity={ 1.2 } />
            < directionalLight position = { [5, 5, 5]} intensity = { 1.8} />
                <pointLight position={ [-4, 3, -4] } intensity = { 1.2} color = "#5DA7DB" />
                    <pointLight position={ [4, 3, 4] } intensity = { 1.0} color = "#C4955A" />

                        {/* Orbit ring of module cards rotating around the centered cat */ }
                        < OrbitRing
 selectedId = { selectedId }
 onSelect = { handleSelect }
    />
    </Suspense>
    </Canvas>

    {/* ── Global Nav ── */}
    <div className={ styles.globalNav }>
        <button className={ styles.navBtn } onClick = {() => navigate('/')} > ← Landing </button>
        <button className={ styles.navBtn } onClick = {() => navigate('/profile')} > Observer Profile 👤 </button>
    </div>

{/* ── Module Intro Overlay ── */ }
{
    selectedId && (
        <div className={ styles.dialoguePanel } style = {{ opacity: confirming ? 0 : 1, transition: 'opacity 0.5s ease' }
}>
    <button className={ styles.dismissBtn } style = {{ position: 'absolute', top: 20, right: 20 }} onClick = { handleDismiss } >✕</button>

        < div className = { styles.dialogueHeader } >
            <div className={ styles.moduleSubtitle }>
                MODULE { MODULE_DATA.findIndex(m => m.id === selectedId) + 1 }
</div>
    < h2 className = { styles.moduleTitle } > { selectedModule?.name } </h2>
        </div>

        < div
 className = { styles.dialogueBubble }
 onClick = {() => !finished && skip()}
 style = {{ cursor: finished ? 'default' : 'pointer' }}
                    >
                        <p className={styles.dialogueText}>
                            {displayed as string}
                            {!finished && <span className={styles.cursor}>▊</span>}
                        </p>
    </div>

{
    finished && (
        <div className={ styles.confirmRow }>
            <button className={ styles.confirmBtn } onClick = { handleConfirm } >
                Begin Lesson →
    </button>
        </div>
                    )
}
</div>
            )}

{/* ── Hint when nothing selected ── */ }
{
    !selectedId && (
        <div className={ styles.hintPill }>
                    ✦ select a module to begin
        </div>
            )
}
</div>
    )
}