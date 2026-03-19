import { useState, useEffect, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { useCat } from '../../../context/CatContext'
import { useProgress } from '../../../context/ProgressContext'
import { useCatNPCTransition } from '../../../hooks/useCatNPCTransition'
import GatesScene from './GatesScene'
import { GatesOverlay } from './GatesOverlay'
import type { State1Q } from './gateLogic'

export type GatePhase = 'phase1_intro' | 'phase2_challenges' | 'phase3_quiz' | 'complete'

export function GatesModule() {
    const { setMode, setCatPosition, setQubitState } = useCat()
    const { completeModule } = useProgress()

    const [phase, setPhase] = useState<GatePhase>('phase1_intro')
    const [catSettled, setCatSettled] = useState(false)
    const { panelsVisible } = useCatNPCTransition(catSettled)

    // Shared state for 3D and UI
    const [selectedGate, setSelectedGate] = useState<string | null>(null)
    const [animState, setAnimState] = useState<State1Q>([1, 0, 0, 0])
    const [challengeIdx, setChallengeIdx] = useState(0)
    const [wireState1, setWireState1] = useState<State1Q>([1, 0, 0, 0])
    const [wireState2, setWireState2] = useState<State1Q>([1, 0, 0, 0])
    const [isEntangled, setIsEntangled] = useState(false)

    // Using local storage for un-locked gates
    const [unlockedGates, setUnlockedGates] = useState<string[]>(() => {
        const stored = localStorage.getItem('quantum_lotus_unlocked_gates')
        return stored ? JSON.parse(stored) : ['H']
    })

    const unlockGate = useCallback((gateId: string) => {
        setUnlockedGates(prev => {
            if (prev.includes(gateId)) return prev
            const next = [...prev, gateId]
            localStorage.setItem('quantum_lotus_unlocked_gates', JSON.stringify(next))
            return next
        })
    }, [])

    useEffect(() => {
        setMode('npc')
        setCatPosition('corner')
        setQubitState('idle')
    }, [setMode, setCatPosition, setQubitState])

    const handleCatSettled = useCallback(() => setCatSettled(true), [])

    const handlePhaseComplete = useCallback((completedPhase: GatePhase) => {
        if (completedPhase === 'phase1_intro') setPhase('phase2_challenges')
        else if (completedPhase === 'phase2_challenges') setPhase('phase3_quiz')
        else if (completedPhase === 'phase3_quiz') {
            setPhase('complete')
            completeModule('gates', 'blue') // Assuming default track 'blue' for completion
        }
    }, [completeModule])

    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', pointerEvents: 'auto' }}>
            {/* R3F scene (lesson-specific objects) */}
            <Canvas
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
                camera={{ position: [0, 0, 11], fov: 55 }}
                gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
                dpr={[1, 2]}
            >
                <Suspense fallback={null}>
                    <GatesScene
                        phase={phase}
                        onCatSettled={handleCatSettled}
                        unlockedGates={unlockedGates}
                        selectedGate={selectedGate}
                        onSelectGate={setSelectedGate}
                        animState={animState}
                        challengeIdx={challengeIdx}
                        wireState1={wireState1}
                        wireState2={wireState2}
                        isEntangled={isEntangled}
                    />
                </Suspense>
            </Canvas>

            {/* HTML overlay */}
            <GatesOverlay
                panelsVisible={panelsVisible}
                phase={phase}
                onPhaseComplete={handlePhaseComplete}
                unlockedGates={unlockedGates}
                unlockGate={unlockGate}
                selectedGate={selectedGate}
                setSelectedGate={setSelectedGate}
                animState={animState}
                setAnimState={setAnimState}
                challengeIdx={challengeIdx}
                setChallengeIdx={setChallengeIdx}
                wireState1={wireState1}
                setWireState1={setWireState1}
                wireState2={wireState2}
                setWireState2={setWireState2}
                isEntangled={isEntangled}
                setIsEntangled={setIsEntangled}
            />
        </div>
    )
}
