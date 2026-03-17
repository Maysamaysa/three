import { useEffect, useRef, useState, useMemo } from 'react'
import { useGLTF, useAnimations, Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import Koi_cat from '../assets/koi_cat.glb'

// ─── TYPES ────────────────────────────────────────────────────────────────────
export type QubitState = 'idle' | 'blue' | 'amber'

interface NpcCatProps {
    qubitState?: QubitState
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const COLOR = {
    idle: new THREE.Color('#ffffff'),
    blue: new THREE.Color('#5DA7DB'),
    amber: new THREE.Color('#C4955A'),
}

const BUBBLE_LINES: Record<QubitState, string[]> = {
    idle: [
        "Select a module to begin our journey.",
        "The quantum world is full of surprises.",
        "Ready to learn something spooky?",
    ],
    blue: [
        "Intuition is the first step to mastery.",
        "Let's look at it from a different perspective.",
        "Simple, yet profound, isn't it?",
    ],
    amber: [
        "The math tells the real story.",
        "Precision is key in quantum mechanics.",
        "Dirac notation is a powerful language.",
    ],
}

// ─── SPARKLE RING ─────────────────────────────────────────────────────────────
function SparkleRing({ color, intensity, count = 40 }: { color: THREE.Color, intensity: number, count?: number }) {
    const meshRef = useRef<THREE.InstancedMesh>(null)
    const particles = useMemo(() => Array.from({ length: count }, (_, i) => ({
        angle: (i / count) * Math.PI * 2,
        radius: 1.4 + Math.random() * 0.9,
        yOffset: (Math.random() - 0.5) * 2.5,
        speed: 0.18 + Math.random() * 0.22,
        phase: Math.random() * Math.PI * 2,
        size: 0.015 + Math.random() * 0.025,
        bobAmp: 0.12 + Math.random() * 0.18,
        bobFreq: 0.6 + Math.random() * 0.8,
    })), [count])

    const dummy = useMemo(() => new THREE.Object3D(), [])
    const baseCol = useMemo(() => new THREE.Color(), [])

    useEffect(() => {
        if (!meshRef.current) return
        for (let i = 0; i < count; i++) {
            meshRef.current.setColorAt(i, COLOR.idle)
        }
        if (meshRef.current.instanceColor) {
            meshRef.current.instanceColor.needsUpdate = true
        }
    }, [count])

    useFrame((state) => {
        if (!meshRef.current || !meshRef.current.instanceColor) return
        const t = state.clock.getElapsedTime()
        particles.forEach((p, i) => {
            const angle = p.angle + t * p.speed
            const bob = Math.sin(t * p.bobFreq + p.phase) * p.bobAmp
            const pulse = 1 + Math.sin(t * 1.4 + p.phase) * 0.15
            dummy.position.set(Math.cos(angle) * p.radius, p.yOffset + bob, Math.sin(angle) * p.radius)
            dummy.scale.setScalar(p.size * pulse * (0.5 + intensity * 0.5))
            dummy.updateMatrix()
            meshRef.current!.setMatrixAt(i, dummy.matrix)
            meshRef.current!.getColorAt(i, baseCol)
            baseCol.lerp(color, 0.04)
            meshRef.current!.setColorAt(i, baseCol)
        })
        meshRef.current.instanceMatrix.needsUpdate = true
        meshRef.current.instanceColor.needsUpdate = true
    })

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
            <octahedronGeometry args={[1, 0]} />
            <meshStandardMaterial emissive={color} emissiveIntensity={0.6 + intensity * 1.4} transparent opacity={0.55 + intensity * 0.35} />
        </instancedMesh>
    )
}

// ─── SPEECH BUBBLE ────────────────────────────────────────────────────────────
function SpeechBubble({ message, drift = 'center' }: { message: string | null, drift?: 'left' | 'right' | 'center' }) {
    const [visible, setVisible] = useState(false)
    const [text, setText] = useState('')
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        if (!message) return
        if (timerRef.current) clearTimeout(timerRef.current)
        setText(message)
        setVisible(false)
        requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
        timerRef.current = setTimeout(() => setVisible(false), 4200)
    }, [message])

    const driftX = drift === 'left' ? '-70px' : drift === 'right' ? '70px' : '0px'

    return (
        <Html position={[0, 2.2, 0]} center style={{ pointerEvents: 'none', userSelect: 'none' }}>
            <div style={{
                position: 'relative',
                transform: visible
                    ? `translateX(${driftX}) translateY(-12px) scale(1)`
                    : `translateX(${driftX}) translateY(8px) scale(0.88)`,
                opacity: visible ? 1 : 0,
                transition: 'opacity 0.45s ease, transform 0.55s cubic-bezier(0.34,1.56,0.64,1)',
                background: 'rgba(248, 249, 255, 0.12)',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                border: '1px solid rgba(248,249,255,0.22)',
                borderRadius: '999px',
                padding: '10px 20px',
                color: '#F8F9FF',
                fontSize: '13px',
                fontFamily: 'DM Sans, sans-serif',
                whiteSpace: 'nowrap',
                boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
            }}>
                {text}
                <span style={{
                    position: 'absolute', bottom: '-10px', left: '50%',
                    transform: 'translateX(-50%)',
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: 'rgba(248,249,255,0.18)',
                    border: '1px solid rgba(248,249,255,0.25)',
                    display: 'block',
                }} />
            </div>
        </Html>
    )
}

// ─── NPC CAT ──────────────────────────────────────────────────────────────────
export default function NpcCat({ qubitState = 'idle' }: NpcCatProps) {
    const group = useRef<THREE.Group>(null)
    const { scene, animations } = useGLTF(Koi_cat)
    const { mixer, actions } = useAnimations(animations, group)

    const mouseX = useRef(0)
    const mouseY = useRef(0)

    const [bubbleMessage, setBubbleMessage] = useState<string | null>(null)
    const bubbleDrift = useRef<'left' | 'right' | 'center'>('center')
    const lastQubitState = useRef<QubitState>('idle')

    const ringColor = useMemo(() => (
        qubitState === 'blue' ? COLOR.blue :
            qubitState === 'amber' ? COLOR.amber :
                COLOR.idle
    ), [qubitState])
    const ringIntensity = qubitState === 'idle' ? 0.25 : 0.85

    // Play built-in GLB animations
    useEffect(() => {
        if (actions) Object.values(actions).forEach(a => a?.reset().play())
    }, [actions])

    // Mouse tracking
    useEffect(() => {
        const onMove = (e: MouseEvent) => {
            mouseX.current = e.clientX - window.innerWidth / 2
            mouseY.current = e.clientY - window.innerHeight / 2
        }
        window.addEventListener('mousemove', onMove)
        return () => window.removeEventListener('mousemove', onMove)
    }, [])

    // Bubble on qubitState change
    useEffect(() => {
        if (qubitState === lastQubitState.current) return
        lastQubitState.current = qubitState
        const lines = BUBBLE_LINES[qubitState]
        const line = lines[Math.floor(Math.random() * lines.length)]
        bubbleDrift.current = qubitState === 'blue' ? 'left' : 'right'
        setBubbleMessage(null)
        requestAnimationFrame(() => setBubbleMessage(line))
    }, [qubitState])

    // Idle bubble on mount
    useEffect(() => {
        const t = setTimeout(() => {
            setBubbleMessage(BUBBLE_LINES.idle[Math.floor(Math.random() * BUBBLE_LINES.idle.length)])
        }, 1500)
        return () => clearTimeout(t)
    }, [])

    useFrame((state, delta) => {
        if (mixer) mixer.update(delta)
        if (!group.current) return
        const t = state.clock.getElapsedTime()

        // Very subtle idle bob
        group.current.position.y = Math.sin(t * 0.7) * 0.06

        // Smooth mouse look on the GROUP — no scene mutation
        const targetRotY = mouseX.current * 0.0008
        const targetRotX = mouseY.current * 0.0004
        group.current.rotation.y += (targetRotY - group.current.rotation.y) * 0.05
        group.current.rotation.x += (targetRotX - group.current.rotation.x) * 0.05

        // Tiny sway
        group.current.rotation.z = Math.sin(t * 0.5 + 1) * 0.02
    })

    return (
        <group ref={group}>
            <SparkleRing color={ringColor} intensity={ringIntensity} />
            <SpeechBubble message={bubbleMessage} drift={bubbleDrift.current} />
            {/* scale={0.5} matches KoiCat's internal group scale so bones align correctly */}
            <primitive object={scene} scale={0.5} />
        </group>
    )
}