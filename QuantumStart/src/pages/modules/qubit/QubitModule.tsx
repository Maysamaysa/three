/**
 * Module1.tsx — Shell for Module 1 "What is a Qubit?"
 * (src/pages/module1/Module1.tsx)
 */

import { useState, useEffect, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { useCat } from '../../context/CatContext'
import { useCatNPCTransition } from '../../hooks/useCatNPCTransition'
import QubitScene from './QubitScene'
import { QubitOverlay } from './QubitOverlay'
import type { Phase, Track } from './QubitScene'

export function QubitModule() {
    const { setMode, setCatPosition, setQubitState } = useCat()

    const [phase, setPhase] = useState<Phase>('hook')
    const [track, setTrack] = useState<Track>(null)
    const [catSettled, setCatSettled] = useState(false)
    const { panelsVisible } = useCatNPCTransition(catSettled)

    const [sphereClicked, setSphereClicked] = useState(false)
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
        setSphereClicked(false)
        setQuizCorrect(null)
    }, [])

    const handleQuizResult = useCallback((correct: boolean) => {
        setQuizCorrect(correct)
        setShowParticles(true)
        setTimeout(() => setShowParticles(false), 1800)
        if (!correct) { setCatRetreat(true); setTimeout(() => setCatRetreat(false), 2000) }
        else setCatRetreat(false)
    }, [])

    const handleQuizComplete = useCallback(() => setPhase('complete'), [])

    const handleSphereClick = useCallback(() => {
        if (phase === 'quiz') setSphereClicked(true)
    }, [phase])

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
                    <QubitScene
                        track={track}
                        phase={phase}
                        onCatSettled={handleCatSettled}
                        onCoinClick={() => { /* coin flip handled inside scene */ }}
                        onSphereClick={handleSphereClick}
                        quizCorrect={quizCorrect}
                        showParticles={showParticles}
                        catRetreat={catRetreat}
                    />
                </Suspense>
            </Canvas>

            {/* HTML overlay */}
            <QubitOverlay
                panelsVisible={panelsVisible}
                track={track}
                phase={phase}
                onTrackSelect={handleTrackSelect}
                onLessonComplete={handleLessonComplete}
                onQuizComplete={handleQuizComplete}
                onQuizResult={handleQuizResult}
                sphereClicked={sphereClicked}
            />
        </div>
    )
}
