import { useEffect, useRef, useState, useMemo } from 'react'
import { useGLTF, useAnimations, Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import Koi_cat from '../assets/koi_cat.glb'

// ─── TYPES ────────────────────────────────────────────────────────────────────
export type QubitState = 'idle' | 'blue' | 'amber'

interface KoiCatProps {
    onAnimationComplete?: () => void
    qubitState?: QubitState   // passed from Landing page on track select
    startAwake?: boolean      // skip sleep state entirely (used on Learn page)
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const COLOR = {
    idle: new THREE.Color('#ffffff'),
    blue: new THREE.Color('#5DA7DB'),
    amber: new THREE.Color('#C4955A'),
    pink: new THREE.Color('#FFB7C5'),
    green: new THREE.Color('#C1E1C1'),
}

const BUBBLE_LINES: Record<QubitState, string[]> = {
    idle: [
        "psst… the universe has a secret.",
        "I'm in superposition. Don't observe me.",
        "Three clicks and I'll tell you everything.",
    ],
    blue: [
        "Let's collapse this wave function together.",
        "Intuition is just math you haven't met yet.",
        "The universe and I are watching.",
    ],
    amber: [
        "Good. You want the equations. The cat approves.",
        "Dirac notation awaits. Don't blink.",
        "Every qubit has two stories. You chose the real one.",
    ],
}

// ─── SPARKLE RING ─────────────────────────────────────────────────────────────
// Ambient instanced particles that orbit the model in a loose cloud.
// `color` and `intensity` are driven by qubitState from the parent.
interface SparkleRingProps {
    color: THREE.Color
    intensity: number   // 0 = dim idle,  1 = full glow on track select
    count?: number
}

function SparkleRing({ color, intensity, count = 40 }: SparkleRingProps) {
    const meshRef = useRef<THREE.InstancedMesh>(null)

    // Pre-compute per-particle orbit data once (stable across renders)
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

    useFrame((state) => {
        if (!meshRef.current) return
        const t = state.clock.getElapsedTime()

        particles.forEach((p, i) => {
            const angle = p.angle + t * p.speed
            const bob = Math.sin(t * p.bobFreq + p.phase) * p.bobAmp
            const pulse = 1 + Math.sin(t * 1.4 + p.phase) * 0.15

            dummy.position.set(
                Math.cos(angle) * p.radius,
                p.yOffset + bob,
                Math.sin(angle) * p.radius,
            )
            dummy.scale.setScalar(p.size * pulse * (0.5 + intensity * 0.5))
            dummy.updateMatrix()
            meshRef.current!.setMatrixAt(i, dummy.matrix)

            // Lerp each particle colour toward target
            meshRef.current!.getColorAt(i, baseCol)
            baseCol.lerp(color, 0.04)
            meshRef.current!.setColorAt(i, baseCol)
        })

        meshRef.current.instanceMatrix.needsUpdate = true
        if (meshRef.current.instanceColor) {
            meshRef.current.instanceColor.needsUpdate = true
        }
    })

    // Initialise all colours to white on mount
    useEffect(() => {
        if (!meshRef.current) return
        for (let i = 0; i < count; i++) {
            meshRef.current.setColorAt(i, COLOR.idle)
        }
        if (meshRef.current.instanceColor) {
            meshRef.current.instanceColor.needsUpdate = true
        }
    }, [count])

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
            <octahedronGeometry args={[1, 0]} />
            <meshStandardMaterial
                emissive={color}
                emissiveIntensity={0.6 + intensity * 1.4}
                transparent
                opacity={0.55 + intensity * 0.35}
                roughness={0.3}
                metalness={0.6}
            />
        </instancedMesh>
    )
}

// ─── BURST EMITTER ────────────────────────────────────────────────────────────
// One-shot particle explosion. Mount it once → it animates → disappears.
// `active` flips to true when cat wakes up.
interface BurstEmitterProps {
    active: boolean
    color: THREE.Color
}

function BurstEmitter({ active, color }: BurstEmitterProps) {
    const meshRef = useRef<THREE.InstancedMesh>(null)
    const started = useRef(false)
    const progress = useRef(0)

    const COUNT = 32
    const particles = useMemo(() => Array.from({ length: COUNT }, () => {
        const theta = Math.random() * Math.PI * 2
        const phi = Math.random() * Math.PI
        return {
            dir: new THREE.Vector3(
                Math.sin(phi) * Math.cos(theta),
                Math.sin(phi) * Math.sin(theta),
                Math.cos(phi),
            ).multiplyScalar(2.5 + Math.random() * 2),
            size: 0.04 + Math.random() * 0.06,
            phase: Math.random() * Math.PI * 2,
        }
    }), [])

    const dummy = useMemo(() => new THREE.Object3D(), [])

    useEffect(() => {
        if (active) {
            started.current = true
            progress.current = 0
        }
    }, [active])

    useFrame((_state, delta) => {
        if (!meshRef.current || !started.current) return

        progress.current = Math.min(progress.current + delta * 0.9, 1)
        const ease = 1 - Math.pow(1 - progress.current, 3)  // cubic ease-out

        particles.forEach((p, i) => {
            const pos = p.dir.clone().multiplyScalar(ease)
            dummy.position.copy(pos)
            // shrink and spin as they fly out
            const scale = p.size * (1 - ease * 0.85) * (1 + Math.sin(progress.current * Math.PI) * 0.4)
            dummy.scale.setScalar(Math.max(scale, 0))
            dummy.rotation.set(ease * 4 + p.phase, ease * 3 + p.phase, 0)
            dummy.updateMatrix()
            meshRef.current!.setMatrixAt(i, dummy.matrix)
            meshRef.current!.setColorAt(
                i,
                // mix pink → supplied color as they spread
                new THREE.Color().lerpColors(COLOR.pink, color, ease),
            )
        })

        meshRef.current.instanceMatrix.needsUpdate = true
        if (meshRef.current.instanceColor) {
            meshRef.current.instanceColor.needsUpdate = true
        }

        // Stop updating once complete
        if (progress.current >= 1) started.current = false
    })

    if (!active && !started.current) return null

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]}>
            <icosahedronGeometry args={[1, 0]} />
            <meshStandardMaterial
                emissive={color}
                emissiveIntensity={2}
                transparent
                opacity={0.9}
            />
        </instancedMesh>
    )
}

// ─── SPEECH BUBBLE ────────────────────────────────────────────────────────────
// Pure HTML overlay. Queues messages and floats them up from above the model.
interface SpeechBubbleProps {
    message: string | null
    drift?: 'left' | 'right' | 'center'
}

function SpeechBubble({ message, drift = 'center' }: SpeechBubbleProps) {
    const [visible, setVisible] = useState(false)
    const [text, setText] = useState('')
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        if (!message) return

        // Clear any running timer
        if (timerRef.current) clearTimeout(timerRef.current)

        setText(message)
        setVisible(false)

        // Small delay so re-triggering feels fresh
        requestAnimationFrame(() => {
            requestAnimationFrame(() => setVisible(true))
        })

        timerRef.current = setTimeout(() => setVisible(false), 4200)
        return () => { if (timerRef.current) clearTimeout(timerRef.current) }
    }, [message])

    const driftX = drift === 'left' ? '-70px' : drift === 'right' ? '70px' : '0px'

    return (
        <Html position={[0, 3.6, 0]} center style={{ pointerEvents: 'none', userSelect: 'none' }}>
            <div style={{
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
            }}>
                {text}
                {/* Tiny bubble trail dots below */}
                <span style={{
                    position: 'absolute', bottom: '-10px', left: '50%',
                    transform: 'translateX(-50%)',
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: 'rgba(248,249,255,0.18)',
                    border: '1px solid rgba(248,249,255,0.25)',
                    display: 'block',
                }} />
                <span style={{
                    position: 'absolute', bottom: '-18px', left: '50%',
                    transform: 'translateX(-50%)',
                    width: '4px', height: '4px', borderRadius: '50%',
                    background: 'rgba(248,249,255,0.12)',
                    border: '1px solid rgba(248,249,255,0.18)',
                    display: 'block',
                }} />
            </div>
        </Html>
    )
}

// ─── Z BUBBLES (sleeping idle) ────────────────────────────────────────────────
function ZBubbles() {
    return (
        <group position={[0, 1.5, 0]}>
            {[1, 2, 3].map((i) => <ZBubble key={i} index={i} />)}
        </group>
    )
}

function ZBubble({ index }: { index: number }) {
    const ref = useRef<THREE.Group>(null)
    useFrame((state) => {
        if (!ref.current) return
        const t = state.clock.getElapsedTime()
        ref.current.position.y = Math.sin(t + index) * 0.2 + (index * 0.5)
        ref.current.position.x = Math.cos(t * 0.5 + index) * 0.1
        ref.current.scale.setScalar(0.8 + Math.sin(t * 2 + index) * 0.1)
    })
    return (
        <group ref={ref}>
            <Html center>
                <div style={{
                    color: '#ffffff',
                    fontSize: `${1.5 + index * 0.5}rem`,
                    fontWeight: 900,
                    opacity: 0.8,
                    filter: 'blur(1px)',
                    textShadow: '0 0 10px rgba(0,0,0,0.4)',
                    fontFamily: 'Outfit, sans-serif',
                    pointerEvents: 'none',
                    userSelect: 'none',
                }}>Z</div>
            </Html>
        </group>
    )
}

// ─── LOTUS PETALS (wake-up moment) ───────────────────────────────────────────
function LotusPetals() {
    const petals = useRef<THREE.Group>(null)
    const petalData = useRef(new Array(15).fill(0).map(() => ({
        speed: 1 + Math.random() * 2,
        velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 4,
            Math.random() * 4,
            (Math.random() - 0.5) * 4,
        ),
        rotation: Math.random() * Math.PI,
        size: 0.1 + Math.random() * 0.2,
    })))

    useFrame((_state, delta) => {
        if (!petals.current) return
        petals.current.children.forEach((child, i) => {
            const data = petalData.current[i]
            child.position.add(data.velocity.clone().multiplyScalar(delta))
            child.rotation.x += delta * data.speed
            child.rotation.y += delta * data.speed
            data.velocity.y -= delta * 5
            child.scale.multiplyScalar(0.98)
        })
    })

    return (
        <group ref={petals}>
            {petalData.current.map((data, i) => (
                <mesh key={i} rotation={[data.rotation, data.rotation, 0]}>
                    <planeGeometry args={[data.size, data.size]} />
                    <meshStandardMaterial
                        color="#FFB7C5"
                        side={THREE.DoubleSide}
                        transparent
                        opacity={0.8}
                    />
                </mesh>
            ))}
        </group>
    )
}

// ─── EYE POINT LIGHTS ────────────────────────────────────────────────────────
// Two subtle point lights — one per eye. Color + intensity track qubitState.
interface EyeGlowProps {
    qubitState: QubitState
}
function EyeGlow({ qubitState }: EyeGlowProps) {
    const leftRef = useRef<THREE.PointLight>(null)
    const rightRef = useRef<THREE.PointLight>(null)

    useFrame((_state, delta) => {
        if (!leftRef.current || !rightRef.current) return
        const targetIntensity = qubitState === 'idle' ? 0.6 : 2.2
        const lerpSpeed = delta * 3

        leftRef.current.intensity += (targetIntensity - leftRef.current.intensity) * lerpSpeed
        rightRef.current.intensity += (targetIntensity - rightRef.current.intensity) * lerpSpeed

        // Lerp colours
        const leftTarget = qubitState === 'amber' ? COLOR.idle : COLOR.blue
        const rightTarget = qubitState === 'blue' ? COLOR.idle : COLOR.amber
        leftRef.current.color.lerp(leftTarget, lerpSpeed)
        rightRef.current.color.lerp(rightTarget, lerpSpeed)
    })

    return (
        <>
            {/* Approx eye positions relative to cat model — tweak x/y/z to fit yours */}
            <pointLight ref={leftRef} position={[-0.11, 0.08, 0.18]} distance={1.2} decay={2} />
            <pointLight ref={rightRef} position={[0.11, 0.08, 0.18]} distance={1.2} decay={2} />
        </>
    )
}

// ─── KOI CAT (main export) ────────────────────────────────────────────────────
function KoiCat({ onAnimationComplete, qubitState = 'idle', startAwake = false }: KoiCatProps) {
    const group = useRef<THREE.Group>(null)
    const { scene, animations } = useGLTF(Koi_cat)
    const { actions, mixer } = useAnimations(animations, group)

    // ── internal state ──
    const isAnimatingRef = useRef(!startAwake)   // skip rise anim if startAwake
    const animProgressRef = useRef(startAwake ? 1 : 0)
    const [isAwake, setIsAwake] = useState(startAwake)
    const awakeProgressRef = useRef(startAwake ? 1 : 0)
    const [isHovered, setIsHovered] = useState(false)
    const [clickCount, setClickCount] = useState(0)
    const [shakeTime, setShakeTime] = useState(0)

    // ── environmental state ──
    const [burstActive, setBurstActive] = useState(false)
    const [bubbleMessage, setBubbleMessage] = useState<string | null>(null)
    const bubbleDrift = useRef<'left' | 'right' | 'center'>('center')
    const lastQubitState = useRef<QubitState>('idle')

    // ── mouse tracking ──
    const mouseX = useRef(0)
    const mouseY = useRef(0)
    const target = useRef(new THREE.Vector3())

    // Derive sparkle ring color from qubitState
    const ringColor = useMemo(() => {
        if (qubitState === 'blue') return COLOR.blue
        if (qubitState === 'amber') return COLOR.amber
        return COLOR.idle
    }, [qubitState])

    const ringIntensity = qubitState === 'idle' ? 0.25 : 0.85

    // ── play all model animations ──
    useEffect(() => {
        if (actions && Object.keys(actions).length > 0) {
            Object.values(actions).forEach(a => a?.play())
        }
    }, [actions])

    // ── mouse tracking ──
    useEffect(() => {
        const halfX = window.innerWidth / 2
        const halfY = window.innerHeight / 2
        const onMove = (e: MouseEvent) => {
            mouseX.current = e.clientX - halfX
            mouseY.current = e.clientY - halfY
        }
        window.addEventListener('mousemove', onMove)
        return () => window.removeEventListener('mousemove', onMove)
    }, [])

    // ── react to qubitState changes from parent ──
    useEffect(() => {
        if (qubitState === lastQubitState.current) return
        lastQubitState.current = qubitState

        if (qubitState === 'idle') return

        // Pick a random line for this track
        const lines = BUBBLE_LINES[qubitState]
        const line = lines[Math.floor(Math.random() * lines.length)]
        bubbleDrift.current = qubitState === 'blue' ? 'left' : 'right'
        setBubbleMessage(null)                          // reset
        requestAnimationFrame(() => setBubbleMessage(line)) // re-trigger

        // Small sparkle burst on track change (softer than wake burst)
        setBurstActive(false)
        requestAnimationFrame(() => setBurstActive(true))
        setTimeout(() => setBurstActive(false), 100)
    }, [qubitState])

    // ── main animation loop ──
    useFrame((state, delta) => {
        if (mixer) mixer.update(delta)
        if (!group.current) return

        // Rise animation (skipped if startAwake)
        if (isAnimatingRef.current) {
            animProgressRef.current = Math.min(animProgressRef.current + delta * 0.5, 1)
            const ease = 1 - Math.pow(1 - animProgressRef.current, 3)
            group.current.position.y = -5 + ease * 5
            group.current.scale.setScalar(0.5 + ease * 0.5)
            group.current.rotation.y = Math.PI
            if (animProgressRef.current >= 1) {
                isAnimatingRef.current = false
                if (startAwake) setIsAwake(true)
            }
        }

        // Initial setup for startAwake - ensure we're at the base position
        if (startAwake && !isAnimatingRef.current && awakeProgressRef.current < 0.1) {
            group.current.position.y = 0
            group.current.position.x = -1
            group.current.rotation.y = Math.PI * 2
        }

        // Shake on early clicks
        if (shakeTime > 0) {
            group.current.position.x = 0.08 * Math.sin(state.clock.elapsedTime * 45)
            setShakeTime(t => Math.max(0, t - delta))
            if (shakeTime <= delta) group.current.position.x = 0
        }

        // Wake-up rotation (smooth transition to forward facing)
        const isTurning = isAwake && !startAwake
        if (!isAnimatingRef.current && isTurning) {
            awakeProgressRef.current = Math.min(awakeProgressRef.current + delta * 0.6, 1)
            const turnEase = 1 - Math.pow(1 - awakeProgressRef.current, 3)
            group.current.rotation.y = Math.PI + (turnEase * Math.PI)
            group.current.position.x = (turnEase * -2) + 1
        } else if (!isAnimatingRef.current && !startAwake && !isAwake) {
            group.current.rotation.y = Math.PI
        }

        // Mouse look when fully awake OR if started awake
        const canLook = (isAwake && awakeProgressRef.current > 0.8) || (startAwake && !isAnimatingRef.current)
        if (canLook) {
            const lookX = mouseX.current * 0.0012
            const lookY = (-mouseY.current * 0.0012) - 1
            target.current.set(lookX, lookY, 5)
            scene.lookAt(target.current)
        }
    })

    // ── wake-up click ──
    const handleWakeUp = () => {
        if (isAnimatingRef.current || isAwake) return
        const newCount = clickCount + 1
        setClickCount(newCount)

        if (newCount < 3) {
            setShakeTime(0.4)
        } else {
            setIsAwake(true)

            // Fire wake-up burst + bubble
            setBurstActive(true)
            setTimeout(() => setBurstActive(false), 100)

            const wakeLines = BUBBLE_LINES.idle
            setBubbleMessage(wakeLines[Math.floor(Math.random() * wakeLines.length)])

            onAnimationComplete?.()
        }
    }

    return (
        <group
            ref={group}
            position={[0, -5, 0]}
            scale={0.5}
            onClick={handleWakeUp}
            onPointerOver={() => setIsHovered(true)}
            onPointerOut={() => setIsHovered(false)}
        >
            {/* ── Environmental: sparkle ring (always on, intensity varies) ── */}
            <SparkleRing
                color={ringColor}
                intensity={ringIntensity}
            />

            {/* ── Environmental: one-shot burst on wake + track select ── */}
            <BurstEmitter
                active={burstActive}
                color={ringColor}
            />

            {/* ── Environmental: speech bubble ── */}
            <SpeechBubble
                message={bubbleMessage}
                drift={bubbleDrift.current}
            />

            {/* ── Environmental: eye point lights ── */}
            <EyeGlow qubitState={qubitState} />

            {/* ── Sleeping indicators ── */}
            {!isAwake && !isAnimatingRef.current && <ZBubbles />}

            {/* ── Wake-up petals ── */}
            {isAwake && awakeProgressRef.current < 0.9 && <LotusPetals />}

            {/* ── Click-to-wake label ── */}
            {!isAwake && !isAnimatingRef.current && (
                <Html position={[0, 2.5, 0]} center>
                    <div
                        className={shakeTime > 0 ? 'shake-label' : ''}
                        style={{
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
                            textAlign: 'center',
                        }}
                    >
                        Click to wake Qubit 🌸 ({3 - clickCount} left)
                        <style>{`
                            .shake-label {
                                animation: shakeAnim 0.6s cubic-bezier(.36,.07,.19,.97) both;
                            }
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

            <primitive object={scene} />
        </group>
    )
}

export default KoiCat