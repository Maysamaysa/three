import { useEffect, useRef, useState, useMemo } from 'react'
import { useGLTF, useAnimations, Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import Koi_cat from '../assets/koi_cat.glb'
import type { CatMode, CatPosition, QubitState } from '../context/CatContext'

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const COLOR = {
    idle: new THREE.Color('#ffffff'),
    blue: new THREE.Color('#5DA7DB'),
    amber: new THREE.Color('#C4955A'),
    pink: new THREE.Color('#FFB7C5'),
}

// World-space positions for each layout slot (camera at z=8, fov=50)
// Frustum at z=0: half-width ≈ 3.73, half-height ≈ 2.1 (16:9)
const SLOT: Record<CatPosition, { pos: THREE.Vector3; scale: number }> = {
    center: { pos: new THREE.Vector3(0, -0.4, 0), scale: 2.5 },
    corner: { pos: new THREE.Vector3(2.6, 1.8, 0), scale: 2 },
}

const TILT_CONFIG = {
    npc: {
        ySensitivity: 0.001,
        xSensitivity: 0.001,
        lerpSpeed: 0.05,
    },
    hero: {
        ySensitivity: -0.0008,
        xSensitivity: 0.0008, // Negative in hero to match user's original logic
        lerpSpeed: 0.05,
    }
}

const BUBBLE_LINES: Record<QubitState, { hero: string[]; npc: string[] }> = {
    idle: {
        hero: [
            "psst… the universe has a secret.",
            "I'm in superposition. Don't observe me.",
            "Three clicks and I'll tell you everything.",
        ],
        npc: [
            "Select a module to begin our journey.",
            "The quantum world is full of surprises.",
            "Ready to learn something spooky?",
        ],
    },
    blue: {
        hero: [
            "Let's collapse this wave function together.",
            "Intuition is just math you haven't met yet.",
        ],
        npc: [
            "Intuition is the first step to mastery.",
            "Simple, yet profound, isn't it?",
        ],
    },
    amber: {
        hero: [
            "Good. You want the equations. The cat approves.",
            "Dirac notation awaits. Don't blink.",
        ],
        npc: [
            "Precision is key in quantum mechanics.",
            "Dirac notation is a powerful language.",
        ],
    },
}

// ─── SPARKLE RING ─────────────────────────────────────────────────────────────
function SparkleRing({ color, intensity, count = 36 }: {
    color: THREE.Color; intensity: number; count?: number
}) {
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
        for (let i = 0; i < count; i++) meshRef.current.setColorAt(i, COLOR.idle)
        if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true
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
        <instancedMesh ref= { meshRef } args = { [undefined, undefined, count]} >
            <octahedronGeometry args={ [1, 0] } />
                < meshStandardMaterial
    emissive = { color }
    emissiveIntensity = { 0.6 + intensity * 1.4 }
                transparent opacity = { 0.55 + intensity * 0.35 }
    roughness = { 0.3} metalness = { 0.6}
        />
        </instancedMesh>
    )
}

// ─── BURST EMITTER ────────────────────────────────────────────────────────────
function BurstEmitter({ active, color }: { active: boolean; color: THREE.Color }) {
    const meshRef = useRef<THREE.InstancedMesh>(null)
    const started = useRef(false)
    const progress = useRef(0)
    const COUNT = 28

    const particles = useMemo(() => Array.from({ length: COUNT }, () => {
        const theta = Math.random() * Math.PI * 2
        const phi = Math.random() * Math.PI
        return {
            dir: new THREE.Vector3(
                Math.sin(phi) * Math.cos(theta),
                Math.sin(phi) * Math.sin(theta),
                Math.cos(phi),
            ).multiplyScalar(2.2 + Math.random() * 2),
            size: 0.04 + Math.random() * 0.06,
            phase: Math.random() * Math.PI * 2,
        }
    }), [])

    const dummy = useMemo(() => new THREE.Object3D(), [])

    useEffect(() => {
        if (active) { started.current = true; progress.current = 0 }
    }, [active])

    useFrame((_s, delta) => {
        if (!meshRef.current || !started.current) return
        progress.current = Math.min(progress.current + delta * 0.9, 1)
        const ease = 1 - Math.pow(1 - progress.current, 3)
        particles.forEach((p, i) => {
            const pos = p.dir.clone().multiplyScalar(ease)
            const scale = p.size * (1 - ease * 0.85) * (1 + Math.sin(progress.current * Math.PI) * 0.4)
            dummy.position.copy(pos)
            dummy.scale.setScalar(Math.max(scale, 0))
            dummy.rotation.set(ease * 4 + p.phase, ease * 3 + p.phase, 0)
            dummy.updateMatrix()
            meshRef.current!.setMatrixAt(i, dummy.matrix)
            meshRef.current!.setColorAt(i, new THREE.Color().lerpColors(COLOR.pink, color, ease))
        })
        meshRef.current.instanceMatrix.needsUpdate = true
        if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true
        if (progress.current >= 1) started.current = false
    })

    if (!active && !started.current) return null
    return (
        <instancedMesh ref= { meshRef } args = { [undefined, undefined, COUNT]} >
            <icosahedronGeometry args={ [1, 0] } />
                < meshStandardMaterial emissive = { color } emissiveIntensity = { 2} transparent opacity = { 0.9} />
                    </instancedMesh>
    )
}

// ─── SPEECH BUBBLE ────────────────────────────────────────────────────────────
function SpeechBubble({ message, drift = 'center', yPos = 1.8 }: {
    message: string | null; drift?: 'left' | 'right' | 'center'; yPos?: number
}) {
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
        return () => { if (timerRef.current) clearTimeout(timerRef.current) }
    }, [message])

    const driftX = drift === 'left' ? '-70px' : drift === 'right' ? '70px' : '0px'

    return (
        <Html position= { [0, yPos, 0]} center style = {{ pointerEvents: 'none', userSelect: 'none' }
} zIndexRange = { [200, 0]} >
    <div style={
    {
        position: 'relative',
            transform: visible
                ? `translateX(${driftX}) translateY(-12px) scale(1)`
                : `translateX(${driftX}) translateY(8px)  scale(0.88)`,
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
                                                            fontWeight: 500,
                                                                whiteSpace: 'nowrap',
                                                                    boxShadow: '0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.12)',
                                                                        letterSpacing: '0.01em',
            }
}>
    { text }
    < span style = {{
    position: 'absolute', bottom: '-10px', left: '50%',
        transform: 'translateX(-50%)', width: '6px', height: '6px',
            borderRadius: '50%', background: 'rgba(248,249,255,0.18)',
                border: '1px solid rgba(248,249,255,0.25)', display: 'block',
                }} />
    </div>
    </Html>
    )
}

// ─── Z BUBBLES (sleeping) ─────────────────────────────────────────────────────
function ZBubble({ index }: { index: number }) {
    const ref = useRef<THREE.Group>(null)
    useFrame((state) => {
        if (!ref.current) return
        const t = state.clock.getElapsedTime()
        ref.current.position.y = Math.sin(t + index) * 0.2 + index * 0.5
        ref.current.position.x = Math.cos(t * 0.5 + index) * 0.1
        ref.current.scale.setScalar(0.8 + Math.sin(t * 2 + index) * 0.1)
    })
    return (
        <group ref= { ref } >
        <Html center zIndexRange = { [200, 0]} style = {{ pointerEvents: 'none' }
}>
    <div style={
    {
        color: '#ffffff', fontSize: `${1.5 + index * 0.5}rem`, fontWeight: 900,
            opacity: 0.8, filter: 'blur(1px)', textShadow: '0 0 10px rgba(0,0,0,0.4)',
                fontFamily: 'Outfit, sans-serif', pointerEvents: 'none', userSelect: 'none',
                }
}> Z </div>
    </Html>
    </group>
    )
}

function ZBubbles() {
    return (
        <group position= { [0, 1.5, 0]} >
        { [1, 2, 3].map(i => <ZBubble key={ i } index = { i } />) }
        </group>
    )
}

// ─── LOTUS PETALS (wake-up) ───────────────────────────────────────────────────
function LotusPetals() {
    const groupRef = useRef<THREE.Group>(null)
    const petalData = useRef(Array.from({ length: 15 }, () => ({
        speed: 1 + Math.random() * 2,
        velocity: new THREE.Vector3((Math.random() - 0.5) * 4, Math.random() * 4, (Math.random() - 0.5) * 4),
        rotation: Math.random() * Math.PI,
        size: 0.1 + Math.random() * 0.2,
    })))

    useFrame((_s, delta) => {
        if (!groupRef.current) return
        groupRef.current.children.forEach((child, i) => {
            const d = petalData.current[i]
            child.position.add(d.velocity.clone().multiplyScalar(delta))
            child.rotation.x += delta * d.speed
            child.rotation.y += delta * d.speed
            d.velocity.y -= delta * 5
            child.scale.multiplyScalar(0.98)
        })
    })

    return (
        <group ref= { groupRef } >
        {
            petalData.current.map((d, i) => (
                <mesh key= { i } rotation = { [d.rotation, d.rotation, 0]} >
                <planeGeometry args={ [d.size, d.size]} />
            <meshStandardMaterial color="#FFB7C5" side = { THREE.DoubleSide } transparent opacity = { 0.8} />
            </mesh>
            ))
        }
        </group>
    )
}

// ─── EYE GLOW ─────────────────────────────────────────────────────────────────
function EyeGlow({ qubitState }: { qubitState: QubitState }) {
    const leftRef = useRef<THREE.PointLight>(null)
    const rightRef = useRef<THREE.PointLight>(null)
    useFrame((_s, delta) => {
        if (!leftRef.current || !rightRef.current) return
        const target = qubitState === 'idle' ? 0.6 : 2.2
        const lerp = delta * 3
        leftRef.current.intensity += (target - leftRef.current.intensity) * lerp
        rightRef.current.intensity += (target - rightRef.current.intensity) * lerp
        leftRef.current.color.lerp(qubitState === 'amber' ? COLOR.idle : COLOR.blue, lerp)
        rightRef.current.color.lerp(qubitState === 'blue' ? COLOR.idle : COLOR.amber, lerp)
    })
    return (
        <>
        <pointLight ref= { leftRef } position = { [-0.11, 0.08, 0.18]} distance = { 1.2} decay = { 2} />
            <pointLight ref={ rightRef } position = { [0.11, 0.08, 0.18]} distance = { 1.2} decay = { 2} />
                </>
    )
}

// ─── QUANTUM CAT (main export) ────────────────────────────────────────────────
export interface QuantumCatProps {
    mode: CatMode
    qubitState?: QubitState
    catPosition?: CatPosition
    onWakeUp?: () => void
}

export default function QuantumCat({
    mode,
    qubitState = 'idle',
    catPosition = 'center',
    onWakeUp,
}: QuantumCatProps) {
    // posGroup → outer: position lerp ONLY — Html overlays here so scale can't push them off-screen
    // catGroup → inner: scale lerp + rotation + animations
    const posGroup = useRef<THREE.Group>(null)
    const catGroup = useRef<THREE.Group>(null)

    // QuantumCat is a global singleton — safe to use rawScene directly (no clone needed)
    const { scene, animations } = useGLTF(Koi_cat)
    const { actions, mixer } = useAnimations(animations, catGroup)

    // ── hero-mode state ──
    const [isAwake, setIsAwake] = useState(mode !== 'hero')
    const [clickCount, setClickCount] = useState(0)
    const [shakeTime, setShakeTime] = useState(0)
    const wakeProgressRef = useRef(mode !== 'hero' ? 1 : 0)

    // ── shared state ──
    const [burstActive, setBurstActive] = useState(false)
    const [bubbleMessage, setBubbleMessage] = useState<string | null>(null)
    const bubbleDrift = useRef<'left' | 'right' | 'center'>('center')
    const lastQubitRef = useRef<QubitState>('idle')
    const lastModeRef = useRef<CatMode>(mode)

    // ── lerp targets ──
    const posTarget = useRef(new THREE.Vector3())
    const scaleTarget = useRef(SLOT[catPosition].scale)

    // ── mouse tracking ──
    const mouseX = useRef(0)
    const mouseY = useRef(0)

    // ── derived ring colours ──
    const ringColor = useMemo(() => {
        if (qubitState === 'blue') return COLOR.blue
        if (qubitState === 'amber') return COLOR.amber
        return COLOR.idle
    }, [qubitState])
    const ringIntensity = qubitState === 'idle' ? 0.25 : 0.85

    // Speech bubble y in posGroup space (world units, not scaled)
    const bubbleY = catPosition === 'corner' ? 1.0 : 1.8

    // ── play GLB animations ──
    useEffect(() => {
        if (actions && Object.keys(actions).length > 0)
            Object.values(actions).forEach(a => a?.reset().play())
    }, [actions])

    // ── mouse tracking ──
    useEffect(() => {
        const onMove = (e: MouseEvent) => {
            mouseX.current = e.clientX - window.innerWidth / 2
            mouseY.current = e.clientY - window.innerHeight / 2
        }
        window.addEventListener('mousemove', onMove)
        return () => window.removeEventListener('mousemove', onMove)
    }, [])

    // ── react to qubitState changes ──
    useEffect(() => {
        if (qubitState === lastQubitRef.current) return
        lastQubitRef.current = qubitState
        if (qubitState === 'idle') return
        const lines = BUBBLE_LINES[qubitState][mode]
        const line = lines[Math.floor(Math.random() * lines.length)]
        bubbleDrift.current = qubitState === 'blue' ? 'left' : 'right'
        setBubbleMessage(null)
        requestAnimationFrame(() => setBubbleMessage(line))
        setBurstActive(false)
        requestAnimationFrame(() => setBurstActive(true))
        setTimeout(() => setBurstActive(false), 100)
    }, [qubitState, mode])

    // ── react to mode changes ──
    useEffect(() => {
        if (mode === lastModeRef.current) return
        lastModeRef.current = mode
        if (mode === 'npc') {
            setIsAwake(true)
            wakeProgressRef.current = 1
            const delay = setTimeout(() => {
                const lines = BUBBLE_LINES.idle.npc
                setBubbleMessage(lines[Math.floor(Math.random() * lines.length)])
            }, 800)
            return () => clearTimeout(delay)
        } else {
            setIsAwake(false)
            setClickCount(0)
            wakeProgressRef.current = 0
        }
    }, [mode])

    // ── hero: 3-click wake — driven by 'cat:click' CustomEvent from App.tsx canvas div ──
    useEffect(() => {
        const handleClick = () => {
            if (mode !== 'hero' || isAwake) return
            setClickCount(prev => {
                const next = prev + 1
                if (next >= 3) {
                    setIsAwake(true)
                    setBurstActive(true)
                    setTimeout(() => setBurstActive(false), 100)
                    setBubbleMessage(BUBBLE_LINES.idle.hero[Math.floor(Math.random() * BUBBLE_LINES.idle.hero.length)])
                    onWakeUp?.()
                } else {
                    setShakeTime(0.4)
                }
                return next
            })
        }
        window.addEventListener('cat:click', handleClick)
        return () => window.removeEventListener('cat:click', handleClick)
    }, [mode, isAwake, onWakeUp])

    // ── main frame loop ──
    useFrame((state, delta) => {
        if (mixer) mixer.update(delta)
        if (!posGroup.current || !catGroup.current) return
        const t = state.clock.getElapsedTime()

        // Position lerp on outer posGroup (no scale applied here)
        posTarget.current.copy(SLOT[catPosition].pos)
        posGroup.current.position.lerp(posTarget.current, delta * 3.5)

        // Scale lerp on inner catGroup
        scaleTarget.current = SLOT[catPosition].scale
        const curScale = catGroup.current.scale.x
        catGroup.current.scale.setScalar(curScale + (scaleTarget.current - curScale) * delta * 3.5)

        // ── NPC: idle bob + mouse look ──
        if (mode === 'npc') {
            posGroup.current.position.y += Math.sin(t * 0.7) * 0.006
            const tRotY = mouseX.current * TILT_CONFIG.npc.ySensitivity
            const tRotX = mouseY.current * TILT_CONFIG.npc.xSensitivity
            catGroup.current.rotation.y += (tRotY - catGroup.current.rotation.y) * TILT_CONFIG.npc.lerpSpeed
            catGroup.current.rotation.x += (tRotX - catGroup.current.rotation.x) * TILT_CONFIG.npc.lerpSpeed
            catGroup.current.rotation.z = Math.sin(t * 0.5 + 1) * 0.02
            return
        }

        // ── Hero: shake on early clicks ──
        if (shakeTime > 0) {
            posGroup.current.position.x = SLOT.center.pos.x + 0.08 * Math.sin(state.clock.elapsedTime * 45)
            setShakeTime(p => Math.max(0, p - delta))
            if (shakeTime <= delta) posGroup.current.position.x = SLOT.center.pos.x
        }

        // ── Hero: wake-up spin ──
        if (isAwake) {
            wakeProgressRef.current = Math.min(wakeProgressRef.current + delta * 0.6, 1)
            const ease = 1 - Math.pow(1 - wakeProgressRef.current, 3)
            catGroup.current.rotation.y = Math.PI + ease * Math.PI
        } else {
            catGroup.current.rotation.y = Math.PI
        }

        // ── Hero: mouse look when fully awake ──
        if (isAwake && wakeProgressRef.current > 0.8) {
            const tRotY = mouseX.current * TILT_CONFIG.hero.ySensitivity
            const tRotX = mouseY.current * TILT_CONFIG.hero.xSensitivity
            catGroup.current.rotation.y += (Math.PI * 2 + tRotY - catGroup.current.rotation.y) * TILT_CONFIG.hero.lerpSpeed
            catGroup.current.rotation.x += (tRotX - catGroup.current.rotation.x) * TILT_CONFIG.hero.lerpSpeed
        }
    })

    const inCorner = catPosition === 'corner'

    return (
        // ─ posGroup: position lerp only — Html lives here, safe from scale distortion ─
        <group ref= { posGroup } position = { SLOT[catPosition].pos.toArray() } >

            {/* Speech bubble */ }
            < SpeechBubble message = { bubbleMessage } drift = { bubbleDrift.current } yPos = { bubbleY } />

                {/* Sleeping Z bubbles */ }
    { mode === 'hero' && !isAwake && <ZBubbles /> }

    {/* Click-to-wake label (in posGroup — unscaled, always visible) */ }
    {
        mode === 'hero' && !isAwake && (
            <Html position={ [0, 1.6, 0] } center zIndexRange = { [200, 0]} style = {{ pointerEvents: 'none' }
    }>
        <div
                        className={ shakeTime > 0 ? 'shake-label' : '' }
    style = {{
        background: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(5px)',
                padding: '0.6rem 1.2rem',
                    borderRadius: '24px',
                        color: 'white',
                            fontSize: '1rem',
                                fontWeight: 700,
                                    whiteSpace: 'nowrap',
                                        border: '1px solid rgba(255,255,255,0.3)',
                                            boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                                                pointerEvents: 'none',
                                                    userSelect: 'none',
                        }
}
                    >
    Click to wake Qubit 🌸 ({ 3 - clickCount } left)
<style>{`
                            .shake-label { animation: shakeAnim 0.6s cubic-bezier(.36,.07,.19,.97) both; }
                            @keyframes shakeAnim {
                                10%, 90% { transform: translate3d(-2px,0,0); }
                                20%, 80% { transform: translate3d( 3px,0,0); }
                                30%, 50%, 70% { transform: translate3d(-5px,0,0); }
                                40%, 60% { transform: translate3d( 5px,0,0); }
                            }
                        `}</style>
    </div>
    </Html>
            )}

{/* Wake-up lotus petals */ }
{ mode === 'hero' && isAwake && wakeProgressRef.current < 0.9 && <LotusPetals /> }

{/* ─ catGroup: scale + rotation + 3D content ─ */ }
<group
                ref={ catGroup }
scale = { SLOT[catPosition].scale }
onPointerOver = {() => { if (mode === 'hero') document.body.style.cursor = 'pointer' }}
onPointerOut = {() => { document.body.style.cursor = '' }}
            >
    <SparkleRing color={ ringColor } intensity = { ringIntensity } count = { inCorner? 20: 36 } />
        <BurstEmitter active={ burstActive } color = { ringColor } />
            <EyeGlow qubitState={ qubitState } />
                < primitive object = { scene } scale = { 0.5} />
                    </group>
                    </group>
    )
}
