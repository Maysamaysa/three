/**
 * Module2.tsx — Shell for Module 2 "Superposition"
 */

import { useState, useEffect, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { useCat } from '../../context/CatContext'
import { useCatNPCTransition } from '../../hooks/useCatNPCTransition'
import SuperpositionScene from './SuperpositionScene'
import { SuperpositionOverlay } from './SuperpositionOverlay'
import type { Phase, Track } from './SuperpositionScene'

export function SuperpositionModule() {
    const { setMode, setCatPosition, setQubitState } = useCat()

    const [phase, setPhase] = useState<Phase>('hook')
    const [track, setTrack] = useState<Track>(null)
    const [catSettled, setCatSettled] = useState(false)
    const { panelsVisible } = useCatNPCTransition(catSettled)

    const [hasTransformed, setHasTransformed] = useState(false)
    const [gateActive, setGateActive] = useState(false)
    const [quizCorrect, setQuizCorrect] = useState<boolean | null>(null)
    const [showParticles, setShowParticles] = useState(false)
    const [catRetreat, setCatRetreat] = useState(false)

    // Configure global cat for this page
    useEffect(() => {
        setMode('npc')
        setCatPosition('corner')
        setQubitState('idle')
    }, [setMode, setCatPosition, setQubitState])

    const handleTrackSelect = useCallback((t: 'blue' | 'amber') => {
        setTrack(t)
        setQubitState(t)
        const id = setTimeout(() => setPhase('lesson'), 2200)
        return () => clearTimeout(id)
    }, [setQubitState])

    const handleCatSettled = useCallback(() => setCatSettled(true), [])

    const handleLessonComplete = useCallback(() => {
        setPhase('quiz')
        setQuizCorrect(null)
    }, [])

    const handleQuizResult = useCallback((correct: boolean) => {
        setQuizCorrect(correct)
        setShowParticles(true)
        setTimeout(() => setShowParticles(false), 1800)
        if (!correct) { 
            setCatRetreat(true)
            setTimeout(() => setCatRetreat(false), 2000) 
        } else {
            setCatRetreat(false)
        }
    }, [])

    const handleQuizComplete = useCallback(() => setPhase('complete'), [])

    const handleGateTrigger = useCallback(() => {
        setGateActive(true)
        setTimeout(() => setGateActive(false), 2500)
    }, [])

    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', pointerEvents: 'auto' }}>
            <Canvas
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
                camera={{ position: [0, 0, 11], fov: 55 }}
                gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
                dpr={[1, 2]}
            >
                <Suspense fallback={null}>
                    <SuperpositionScene
                        track={track}
                        phase={phase}
                        onCatSettled={handleCatSettled}
                        onGateTrigger={handleGateTrigger}
                        gateActive={gateActive}
                        hasTransformed={hasTransformed}
                        onTransform={() => setHasTransformed(true)}
                        quizCorrect={quizCorrect}
                        showParticles={showParticles}
                        catRetreat={catRetreat}
                    />
                </Suspense>
            </Canvas>

            <SuperpositionOverlay
                panelsVisible={panelsVisible}
                track={track}
                phase={phase}
                hasTransformed={hasTransformed}
                onTrackSelect={handleTrackSelect}
                onLessonComplete={handleLessonComplete}
                onQuizComplete={handleQuizComplete}
                onQuizResult={handleQuizResult}
            />
        </div>
    )
}
