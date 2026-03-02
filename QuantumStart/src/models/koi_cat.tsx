import { useEffect, useRef, useState } from 'react'
import { useGLTF, useAnimations, Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import Koi_cat from '../assets/koi_cat.glb'

// Floating Glass "Z" Bubbles Component
function ZBubbles() {
    return (
        <group position={[0, 1.5, 0]}>
            {[1, 2, 3].map((i) => (
                <ZBubble key={i} index={i} />
            ))}
        </group>
    )
}

function ZBubble({ index }: { index: number }) {
    const ref = useRef<THREE.Group>(null)

    useFrame((state) => {
        if (!ref.current) return
        const time = state.clock.getElapsedTime()
        ref.current.position.y = Math.sin(time + index) * 0.2 + (index * 0.5)
        ref.current.position.x = Math.cos(time * 0.5 + index) * 0.1
        ref.current.scale.setScalar(0.8 + Math.sin(time * 2 + index) * 0.1)
    })

    return (
        <group ref={ref}>
            <Html center>
                <div style={{
                    color: '#5DA7DB',
                    fontSize: `${1.5 + index * 0.5}rem`,
                    fontWeight: 900,
                    opacity: 0.6,
                    filter: 'blur(1px)',
                    textShadow: '0 0 10px rgba(93, 167, 219, 0.4)',
                    fontFamily: 'Outfit, sans-serif',
                    pointerEvents: 'none',
                    userSelect: 'none'
                }}>
                    Z
                </div>
            </Html>
        </group>
    )
}

function LotusPetals() {
    const petals = useRef<THREE.Group>(null)
    const petalData = useRef(new Array(15).fill(0).map(() => ({
        speed: 1 + Math.random() * 2,
        velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 4,
            Math.random() * 4,
            (Math.random() - 0.5) * 4
        ),
        rotation: Math.random() * Math.PI,
        size: 0.1 + Math.random() * 0.2
    })))

    useFrame((_state, delta) => {
        if (!petals.current) return
        petals.current.children.forEach((child, i) => {
            const data = petalData.current[i]
            child.position.add(data.velocity.clone().multiplyScalar(delta))
            child.rotation.x += delta * data.speed
            child.rotation.y += delta * data.speed
            data.velocity.y -= delta * 5 // Gravity
            child.scale.multiplyScalar(0.98) // Fade out
        })
    })

    return (
        <group ref={petals}>
            {petalData.current.map((data, i) => (
                <mesh key={i} rotation={[data.rotation, data.rotation, 0]}>
                    <planeGeometry args={[data.size, data.size]} />
                    <meshStandardMaterial color="#FFB7C5" side={THREE.DoubleSide} transparent opacity={0.8} />
                </mesh>
            ))}
        </group>
    )
}

interface KoiCatProps {
    onAnimationComplete?: () => void
}

function KoiCat({ onAnimationComplete }: KoiCatProps) {
    const group = useRef<THREE.Group>(null)
    const { scene, animations } = useGLTF(Koi_cat)
    const { actions, mixer } = useAnimations(animations, group)

    // Animation states
    const isAnimatingRef = useRef(true) // Rising animation
    const animProgressRef = useRef(0)
    const [isAwake, setIsAwake] = useState(false)
    const awakeProgressRef = useRef(0)
    const [isHovered, setIsHovered] = useState(false)
    const [clickCount, setClickCount] = useState(0)
    const [shakeTime, setShakeTime] = useState(0)

    // Use refs to store mouse position (persists across renders)
    const mouseX = useRef(0)
    const mouseY = useRef(0)
    const target = useRef(new THREE.Vector3())

    // Play all animations when component mounts
    useEffect(() => {
        if (actions && Object.keys(actions).length > 0) {
            Object.values(actions).forEach((action) => {
                action?.play()
            })
        }
    }, [actions])

    // Set up mouse tracking event listener
    useEffect(() => {
        const windowHalfX = window.innerWidth / 2
        const windowHalfY = window.innerHeight / 2

        const handleMouseMove = (event: MouseEvent) => {
            mouseX.current = event.clientX - windowHalfX
            mouseY.current = event.clientY - windowHalfY
        }

        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [])

    // Update animation mixer and look at mouse
    useFrame((state, delta) => {
        if (mixer) {
            mixer.update(delta)
        }

        if (group.current) {
            // Rise and Enlarge Animation
            if (isAnimatingRef.current) {
                animProgressRef.current = Math.min(animProgressRef.current + delta * 0.5, 1)
                const ease = 1 - Math.pow(1 - animProgressRef.current, 3)
                group.current.position.y = -5 + ease * 5
                group.current.scale.setScalar(0.5 + ease * 0.5)

                // Face AWAY during float-in
                group.current.rotation.y = Math.PI

                if (animProgressRef.current >= 1) {
                    isAnimatingRef.current = false
                }
            }

            // Shaking logic for early clicks
            if (shakeTime > 0) {
                const shakeAmount = 0.08 * Math.sin(state.clock.elapsedTime * 45)
                group.current.position.x = shakeAmount
                setShakeTime((t) => Math.max(0, t - delta))
                if (shakeTime <= delta) group.current.position.x = 0
            }

            // Waking up animation (Rotation)
            if (!isAnimatingRef.current) {
                if (isAwake) {
                    // SLOWER waking rotation (0.5 speed)
                    awakeProgressRef.current = Math.min(awakeProgressRef.current + delta * 0.5, 1)
                    const turnEase = 1 - Math.pow(1 - awakeProgressRef.current, 3)

                    // Rotate from back (PI) to front (0 or 2PI)
                    // We'll go from PI to 2PI for a clockwise turn
                    group.current.rotation.y = Math.PI + (turnEase * Math.PI)

                    // Call completion only once
                    if (awakeProgressRef.current >= 1 && onAnimationComplete) {
                        onAnimationComplete()
                        // Nullify to prevent repeat calls
                        onAnimationComplete = undefined
                    }

                    // Look at mouse ONLY when awake and turned
                    if (awakeProgressRef.current >= 0.8) {
                        target.current.x = (mouseX.current * 0.001)
                        target.current.y = (-mouseY.current * 0.001) - 1
                        target.current.z = 5
                        scene.lookAt(target.current)
                    }
                } else {
                    // Initial sleeping position (stay facing away)
                    group.current.rotation.y = Math.PI
                }
            }
        }
    })

    const handleWakeUp = (e: THREE.Event) => {
        // e.stopPropagation()
        if (isAnimatingRef.current || isAwake) return

        const newCount = clickCount + 1
        setClickCount(newCount)

        if (newCount < 3) {
            // Nudge: Shake but stay asleep
            setShakeTime(0.4)
        } else {
            // 3rd click: Wake up!
            setIsAwake(true)
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
            {!isAwake && !isAnimatingRef.current && <ZBubbles />}
            {isAwake && awakeProgressRef.current < 0.9 && <LotusPetals />}
            {!isAwake && !isAnimatingRef.current && (
                <Html position={[0, 2.5, 0]} center>
                    <div className={shakeTime > 0 ? 'shake-label' : ''} style={{
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
                        textAlign: 'center'
                    }}>
                        Click to wake Qubit 🌸 ({3 - clickCount} left)
                        <style>{`
                            .shake-label {
                                animation: shakeAnim 0.6s cubic-bezier(.36,.07,.19,.97) both;
                            }
                            @keyframes shakeAnim {
                                10%, 90% { transform: translate3d(-2px, 0, 0); }
                                20%, 80% { transform: translate3d(3px, 0, 0); }
                                30%, 50%, 70% { transform: translate3d(-5px, 0, 0); }
                                40%, 60% { transform: translate3d(5px, 0, 0); }
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
