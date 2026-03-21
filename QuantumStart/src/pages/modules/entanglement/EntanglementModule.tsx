import { useState, useCallback, useEffect } from 'react'
import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { useProgress } from '../../../context/ProgressContext'
import { useCat } from '../../../context/CatContext'
import EntanglementScene from './EntanglementScene'
import { EntanglementOverlay } from './EntanglementOverlay'

export type Phase = 'concept' | 'collapse' | 'sandbox' | 'quiz' | 'complete'

export function EntanglementModule() {
    const { completeModule } = useProgress()
    const { setMode, setCatPosition } = useCat()
    
    const [phase, setPhase] = useState<Phase>('concept')
    const [step, setStep] = useState(1)

    const [qubitA, setQubitA] = useState<{ x: number }>({ x: -1 })
    const [qubitB, setQubitB] = useState<{ x: number }>({ x: 1 })
    
    const [isEntangled, setIsEntangled] = useState(false)
    const [isMeasured, setIsMeasured] = useState(false)
    const [outcome, setOutcome] = useState<0 | 1 | null>(null)
    
    const [histogram, setHistogram] = useState({ '00': 0, '11': 0, '01': 0, '10': 0 })
    const [shotsTaken, setShotsTaken] = useState(0)
    const [quizQuestion, setQuizQuestion] = useState(1)

    useEffect(() => {
        setMode('npc')
        setCatPosition('hidden') 
    }, [setMode, setCatPosition])

    const handleNext = useCallback(() => {
        if (phase === 'concept') {
            if (step < 3) setStep(step + 1)
            else { setPhase('collapse'); setStep(1); }
        } else if (phase === 'collapse') {
            if (step < 2) setStep(step + 1)
            else { setPhase('sandbox'); setStep(1); }
        } else if (phase === 'sandbox') {
            setPhase('quiz')
            setStep(1)
        }
    }, [phase, step])

    const handleBack = useCallback(() => {
        if (phase === 'concept' && step > 1) {
            setStep(step - 1)
        } else if (phase === 'collapse') {
            if (step > 1) setStep(step - 1)
            else { setPhase('concept'); setStep(3); }
        } else if (phase === 'sandbox') {
            setPhase('collapse')
            setStep(2)
        }
    }, [phase, step])

    const handleEntangle = useCallback(() => setIsEntangled(!isEntangled), [isEntangled])

    const performMeasurement = useCallback(() => {
        if (!isEntangled) return
        const roll = Math.random() < 0.5 ? 0 : 1
        setOutcome(roll)
        setIsMeasured(true)
        
        const key = roll === 0 ? '00' : '11'
        setHistogram(prev => ({ ...prev, [key]: prev[key as keyof typeof prev] + 1 }))
        setShotsTaken(s => s + 1)
        window.dispatchEvent(new CustomEvent('entangle_snap', { detail: { outcome: roll } }))
    }, [isEntangled])

    const handleMeasure = useCallback(() => {
        if (isMeasured) return
        performMeasurement()
    }, [isMeasured, performMeasurement])

    const handleReset = useCallback(() => {
        setIsMeasured(false)
        setOutcome(null)
        window.dispatchEvent(new CustomEvent('entangle_reset'))
    }, [])

    const handleRun50 = useCallback(() => {
        handleReset()
        let shots = 0
        const interval = setInterval(() => {
            if (shots >= 50) {
                clearInterval(interval)
                return
            }
            const roll = Math.random() < 0.5 ? 0 : 1
            const key = roll === 0 ? '00' : '11'
            setHistogram(prev => ({ ...prev, [key]: prev[key as keyof typeof prev] + 1 }))
            setShotsTaken(s => s + 1)
            shots++
        }, 30)
    }, [handleReset])

    const handleQuizAnswer = useCallback((correct: boolean) => {
        if (correct) {
            if (quizQuestion < 2) {
                setQuizQuestion(q => q + 1)
            } else {
                setPhase('complete')
                completeModule('entanglement', 'blue', true)
            }
        }
    }, [quizQuestion, completeModule])

    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', pointerEvents: 'auto', background: '#0a0a14' }}>
            <Canvas
                camera={{ position: [0, 0, 15], fov: 50 }}
                gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
                style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
            >
                <ambientLight intensity={1.2} />
                <directionalLight position={[5, 5, 5]} intensity={1.8} />
                <Suspense fallback={null}>
                    <EntanglementScene 
                        phase={phase} 
                        step={step} 
                        isEntangled={isEntangled}
                        isMeasured={isMeasured}
                        outcome={outcome}
                        qubitA={qubitA}
                        setQubitA={setQubitA}
                        qubitB={qubitB}
                        setQubitB={setQubitB}
                    />
                </Suspense>
            </Canvas>

            <EntanglementOverlay 
                phase={phase}
                step={step}
                isEntangled={isEntangled}
                isMeasured={isMeasured}
                outcome={outcome}
                histogram={histogram}
                shotsTaken={shotsTaken}
                quizQuestion={quizQuestion}
                onEntangle={handleEntangle}
                onMeasure={handleMeasure}
                onReset={handleReset}
                onRun50={handleRun50}
                onNext={handleNext}
                onBack={handleBack}
                onQuizAnswer={handleQuizAnswer}
            />
        </div>
    )
}
