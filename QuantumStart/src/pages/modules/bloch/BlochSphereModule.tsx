/**
 * BlochSphereModule.tsx — Shell for Module 3 "Bloch Sphere"
 */

import { useState, useEffect, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { useCat } from '../../../context/CatContext'
import { useProgress } from '../../../context/ProgressContext'
import { useCatNPCTransition } from '../../../hooks/useCatNPCTransition'
import BlochSphereScene from './BlochSphereScene'
import { BlochSphereOverlay } from './BlochSphereOverlay'

export function BlochSphereModule() {
    const { setMode, setCatPosition, setQubitState } = useCat()
    const { completeModule, unlockBadge } = useProgress()

    // Linear steps: 1 to 5, then 'sandbox', then 'quiz', then 'complete'
    const [step, setStep] = useState<number | 'sandbox' | 'quiz' | 'complete'>(1)
    const [catSettled, setCatSettled] = useState(false)
    const { panelsVisible } = useCatNPCTransition(catSettled)

    // Bloch state: theta (0 to PI), phi (0 to 2PI)
    const [theta, setTheta] = useState(0)
    const [phi, setPhi] = useState(0)

    // Track visited cardinal states for "Bloch Sphere Navigator" badge
    const [, setVisitedStates] = useState<Set<string>>(new Set())
    
    const [quizCorrect, setQuizCorrect] = useState<boolean | null>(null)
    const [showParticles, setShowParticles] = useState(false)
    const [catRetreat, setCatRetreat] = useState(false)

    // Configure global cat for this page
    useEffect(() => {
        setMode('npc')
        setCatPosition('hidden') // Hide cat for Bloch Sphere
        setQubitState('amber') // Default to technical look
    }, [setMode, setCatPosition, setQubitState])

    const handleCatSettled = useCallback(() => setCatSettled(true), [])

    const handleNextStep = useCallback(() => {
        if (typeof step === 'number') {
            if (step < 5) setStep(step + 1)
            else setStep('sandbox')
        } else if (step === 'sandbox') {
            setStep('quiz')
        }
    }, [step])

    const handleBackStep = useCallback(() => {
        if (typeof step === 'number' && step > 1) {
            setStep(step - 1)
        } else if (step === 'sandbox') {
            setStep(5)
        } else if (step === 'quiz') {
            setStep('sandbox')
        }
    }, [step])

    const handleQuizResult = useCallback((correct: boolean) => {
        setQuizCorrect(correct)
        setShowParticles(true)
        setTimeout(() => setShowParticles(false), 1800)
        if (!correct) {
            setCatRetreat(true)
            setTimeout(() => setCatRetreat(false), 2000)
        } else {
            setCatRetreat(false)
            setStep('complete')
            completeModule('bloch', 'amber') // Technical track by default now
        }
    }, [completeModule])

    const handleStateChange = useCallback((t: number, p: number) => {
        setTheta(t)
        setPhi(p)

        // Check for cardinal states
        const EPS = 0.1
        let stateKey = ''
        
        if (Math.abs(t) < EPS) stateKey = '0'
        else if (Math.abs(t - Math.PI) < EPS) stateKey = '1'
        else if (Math.abs(t - Math.PI/2) < EPS) {
            const normPhi = ((p % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
            if (Math.abs(normPhi) < EPS || Math.abs(normPhi - Math.PI * 2) < EPS) stateKey = '+'
            else if (Math.abs(normPhi - Math.PI) < EPS) stateKey = '-'
            else if (Math.abs(normPhi - Math.PI/2) < EPS) stateKey = 'i+'
            else if (Math.abs(normPhi - Math.PI * 1.5) < EPS) stateKey = 'i-'
        }

        if (stateKey) {
            setVisitedStates(prev => {
                if (prev.has(stateKey)) return prev
                const next = new Set(prev).add(stateKey)
                if (next.size === 6) {
                    unlockBadge('bloch_navigator')
                }
                return next
            })
        }
    }, [unlockBadge])

    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', pointerEvents: 'auto' }}>
            <Canvas
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
                camera={{ position: [0, 3, 14], fov: 55 }}
                gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
                dpr={[1, 2]}
            >
                <Suspense fallback={null}>
                    <BlochSphereScene
                        step={step}
                        theta={theta}
                        phi={phi}
                        onStateChange={handleStateChange}
                        onCatSettled={handleCatSettled}
                        quizCorrect={quizCorrect}
                        showParticles={showParticles}
                        catRetreat={catRetreat}
                    />
                </Suspense>
            </Canvas>

            <BlochSphereOverlay
                panelsVisible={panelsVisible}
                step={step}
                theta={theta}
                phi={phi}
                onNext={handleNextStep}
                onBack={handleBackStep}
                onQuizResult={handleQuizResult}
            />
        </div>
    )
}
