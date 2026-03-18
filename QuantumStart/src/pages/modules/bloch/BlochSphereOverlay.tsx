/**
 * BlochSphereOverlay.tsx — HTML panels for Module 3 "Bloch Sphere"
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTypewriter } from '../../../hooks/useTypewriter'
import styles from './BlochSphereOverlay.module.css'

const BLUE_PANELS = [
    { text: "The Bloch Sphere is an map of every possible quantum state. North pole is |0⟩, South pole is |1⟩.", hint: "Drag the pink vector to explore." },
    { text: "The equator represents equal superposition. The X and Y axes are specific states with unique 'phases'.", hint: null },
    { text: "Moving around the sphere is how we perform quantum operations. Every gate is just a rotation!", hint: null },
]

const AMBER_PANELS = [
    { text: "We parameterize the state using two angles: θ (polar) and φ (azimuthal).", math: "|ψ⟩ = cos(θ/2)|0⟩ + e^{iφ}sin(θ/2)|1⟩", hint: "θ controls the blend, φ controls the phase." },
    { text: "θ = 0 is |0⟩. θ = π is |1⟩. θ = π/2 is the equator (superposition).", math: "θ ∈ [0, π], φ ∈ [0, 2π]", hint: null },
    { text: "The global phase doesn't change experimental results, so we only need relative phase e^{iφ}.", math: null, hint: "Watch the math update as you drag." },
]

const QUIZ_QUESTIONS = [
    {
        question: "What state is represented by the South Pole (θ = π)?",
        answers: [
            { label: "A) |0⟩", correct: false },
            { label: "B) |1⟩", correct: true },
            { label: "C) Superposition", correct: false },
            { label: "D) The Cat", correct: false },
        ],
        explanation: "θ = 0 is the North pole (|0⟩) and θ = π is the opposite, the South pole (|1⟩).",
        tracks: ['blue', 'amber'],
    }
]

export function BlochSphereOverlay({
    panelsVisible, track, phase, theta, phi, onTrackSelect, onLessonComplete, onQuizComplete, onQuizResult
}: any) {
    const navigate = useNavigate()
    const [index, setIndex] = useState(0)
    const panels = track === 'amber' ? AMBER_PANELS : BLUE_PANELS
    const current = panels[index]
    const isLast = index >= (panels?.length ?? 0) - 1

    const { displayed, finished, skip } = useTypewriter(current?.text ?? '', 32, panelsVisible && phase === 'lesson')

    const handleNext = () => isLast ? onLessonComplete() : setIndex(i => i + 1)

    // Math Formatting
    const cosVal = Math.cos(theta/2).toFixed(2)
    const sinVal = Math.sin(theta/2).toFixed(2)
    const phiDeg = ((phi * 180) / Math.PI).toFixed(0)

    return (
        <>
            <div className={`${styles.phasePill} ${styles.phasePillVisible}`}>🔮 {phase.toUpperCase()}</div>
            <button className={styles.backBtn} onClick={() => navigate('/learn')}>← Hub</button>

            {phase === 'hook' && (
                <div className={`${styles.panel} ${styles.trackSelector} ${styles.panelVisible}`}>
                    <p className={styles.trackTitle}>Bloch Sphere</p>
                    <h2 className={styles.trackHeadline}>Choose your learning path</h2>
                    <div className={styles.trackBtnRow}>
                        <button className={`${styles.trackBtn} ${styles.trackBtnBlue}`} onClick={() => onTrackSelect('blue')}>
                            <div className={styles.pathSphere} /> 
                            <span>Intuition</span>
                        </button>
                        <button className={`${styles.trackBtn} ${styles.trackBtnAmber}`} onClick={() => onTrackSelect('amber')}>
                            <div className={styles.pathSphere} /> 
                            <span>Technical</span>
                        </button>
                    </div>
                </div>
            )}

            {phase === 'lesson' && current && (
                <div className={`${styles.panel} ${styles.lessonPanel} ${panelsVisible ? styles.panelVisible : ''}`}>
                    <div className={styles.lessonHeader}>
                        <span className={styles.lessonStep}>LESSON {index + 1} / {panels.length}</span>
                        <span className={`${styles.lessonTrackBadge} ${track === 'amber' ? styles.amberBadge : styles.blueBadge}`}>
                            {track === 'blue' ? '🔵 Intuition' : '🟡 Technical'}
                        </span>
                    </div>

                    <div 
                        onClick={() => !finished && skip()}
                        style={{ cursor: finished ? 'default' : 'pointer' }}
                    >
                        <p className={styles.lessonText}>
                            {displayed as string}
                            {!finished && <span className={styles.cursor}>▊</span>}
                        </p>
                    </div>
                    {track === 'amber' && 'math' in current && current.math && <code className={styles.lessonMath}>{current.math}</code>}
                    
                    {/* LIVE MATH HUD */}
                    <div className={styles.mathHud}>
                        <p className={styles.hudTitle}>CURRENT STATE:</p>
                        <div className={styles.hudFormula}>
                            |ψ⟩ = <span className={styles.val}>{cosVal}</span>|0⟩ + <span className={styles.val}>e^{phiDeg}°</span>(<span className={styles.val}>{sinVal}</span>)|1⟩
                        </div>
                        <div className={styles.hudAngles}>
                            θ: {(theta * 180 / Math.PI).toFixed(1)}° | φ: {phiDeg}°
                        </div>
                    </div>

                    <button className={styles.nextBtn} onClick={handleNext}>{isLast ? 'Quiz →' : 'Next →'}</button>
                </div>
            )}

            {phase === 'quiz' && (
                <div className={`${styles.panel} ${styles.lessonPanel} ${panelsVisible ? styles.panelVisible : ''}`}>
                    <p style={{ fontSize: '11px', color: 'rgba(255,183,197,0.5)', marginBottom: '8px' }}>QUIZ TIME</p>
                    <p className={styles.lessonText}>{QUIZ_QUESTIONS[0].question}</p>
                    <div style={{ display: 'grid', gap: '10px' }}>
                        {QUIZ_QUESTIONS[0].answers.map((ans, i) => (
                            <button 
                                key={i} 
                                onClick={() => {
                                    onQuizResult(ans.correct)
                                    if (ans.correct) onQuizComplete()
                                }}
                                className={styles.quizOption}
                            >
                                {ans.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {phase === 'complete' && (
                <div className={`${styles.panel} ${styles.completionPanel} ${styles.panelVisible}`}>
                    <div className={styles.badgeGlow}>🔮</div>
                    <h2 className={styles.badgeName}>Sphere Surveyor</h2>
                    <p style={{ color: 'rgba(255,183,197,0.7)', fontSize: '14px' }}>Bloch Sphere Module Complete</p>
                    <button className={styles.continueBtn} onClick={() => navigate('/learn')}>Return to Hub</button>
                </div>
            )}
        </>
    )
}
