/**
 * BlochSphereModule.tsx — Shell for Module 3 "Bloch Sphere"
 */

import { useState, useEffect, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { useCat } from '../../context/CatContext'
import { useCatNPCTransition } from '../../hooks/useCatNPCTransition'
import BlochSphereScene from './BlochSphereScene'
import { BlochSphereOverlay } from './BlochSphereOverlay'

export function BlochSphereModule() {
    const { setMode, setCatPosition, setQubitState } = useCat()

    const [phase, setPhase] = useState<'hook' | 'lesson' | 'quiz' | 'complete'>('hook')
    const [track, setTrack] = useState<'blue' | 'amber' | null>(null)
    const [catSettled, setCatSettled] = useState(false)
    const { panelsVisible } = useCatNPCTransition(catSettled)

    // Bloch state: theta (0 to PI), phi (0 to 2PI)
    const [theta, setTheta] = useState(0)
    const [phi, setPhi] = useState(0)

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

    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', pointerEvents: 'auto' }}>
            <Canvas
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
                camera={{ position: [0, 0, 11], fov: 55 }}
                gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
                dpr={[1, 2]}
            >
                <Suspense fallback={null}>
                    <BlochSphereScene
                        track={track}
                        phase={phase}
                        theta={theta}
                        phi={phi}
                        onStateChange={(t, p) => { setTheta(t); setPhi(p); }}
                        onCatSettled={handleCatSettled}
                        quizCorrect={quizCorrect}
                        showParticles={showParticles}
                        catRetreat={catRetreat}
                    />
                </Suspense>
            </Canvas>

            <BlochSphereOverlay
                panelsVisible={panelsVisible}
                track={track}
                phase={phase}
                theta={theta}
                phi={phi}
                onTrackSelect={handleTrackSelect}
                onLessonComplete={handleLessonComplete}
                onQuizComplete={handleQuizComplete}
                onQuizResult={handleQuizResult}
            />
        </div>
    )
}
