/**
 * SuperpositionOverlay.tsx — HTML panels for "Superposition"
 */

import { useState } from 'react'
import { useGLTF, useAnimations, Html } from '@react-three/drei'
import { useNavigate } from 'react-router-dom'
import { useTypewriter } from '../../../hooks/useTypewriter'
import styles from './SuperpositionOverlay.module.css'
import type { Track, Phase } from './SuperpositionScene'

const BLUE_PANELS = [
    { text: "Superposition is like a wave in a pool. It’s not in one spot; it’s spread across possibilities.", hint: "Watch the Hadamard machine pulsate." },
    { text: "A qubit can be |0⟩ and |1⟩ at once. It’s like a coin mid-flip, holding both potentials.", hint: null },
    { text: "Think of it as 'And' instead of 'Or'. Quantum computers use this to explore many paths simultaneously.", hint: null },
]

const AMBER_PANELS = [
    { text: "A Hadamard gate (H) creates superposition by mapping basis states to equal linear combinations.", math: "H|0⟩ = 1/√2 (|0⟩ + |1⟩)", hint: null },
    { text: "The state is a vector. Superposition means the vector points between the axes of our 'basis'.", math: "|ψ⟩ = α|0⟩ + β|1⟩", hint: null },
    { text: "Interference allows us to manipulate these amplitudes so that wrong answers cancel out.", math: null, hint: "The wave field represents the state's complex phase." },
]

const QUIZ_QUESTIONS = [
    {
        question: "What does the Hadamard gate do to a qubit in state |0⟩?",
        answers: [
            { label: "A) Flips it to |1⟩", correct: false },
            { label: "B) Places it in superposition", correct: true },
            { label: "C) Measures it", correct: false },
            { label: "D) Erases it", correct: false },
        ],
        explanation: "The Hadamard gate is the primary tool for creating superposition, turning a definite state into an equal mixture of |0⟩ and |1⟩.",
        tracks: ['blue', 'amber'],
    }
]

function TrackSelector({ onTrackSelect }: { onTrackSelect: (t: 'blue' | 'amber') => void }) {
    return (
        <div className={`${styles.panel} ${styles.trackSelector} ${styles.panelVisible}`}>
            <p className={styles.trackTitle}>Superposition</p>
            <h2 className={styles.trackHeadline}>Choose your learning path</h2>
            <div className={styles.trackBtnRow}>
                <button className={`${styles.trackBtn} ${styles.trackBtnBlue}`} onClick={() => onTrackSelect('blue')}>
                    <div className={styles.pathSphere} /> Intuition
                </button>
                <button className={`${styles.trackBtn} ${styles.trackBtnAmber}`} onClick={() => onTrackSelect('amber')}>
                    <div className={styles.pathSphere} /> Technical
                </button>
            </div>
        </div>
    )
}

function CatDialogueBubble({ track, panelsVisible }: { track: Track; panelsVisible: boolean }) {
    if (!track) return null
    const text = track === 'blue' ? "Multiple states at once. It's crowded, but efficient." : "Linear algebra is the language of the universe. Ready?"
    const { displayed, finished, skip } = useTypewriter(text, 36, panelsVisible)
    return (
        <div 
            className={`${styles.panel} ${styles.catDialogue} ${styles.panelVisible}`}
            onClick={() => !finished && skip()}
            style={{ cursor: finished ? 'default' : 'pointer' }}
        >
            <div className={styles.catLabel}>Qubit Cat:</div>
            <div className={styles.catText}>
                {displayed}
                {!finished && <span className={styles.cursor}>▊</span>}
            </div>
        </div>
    )
}

function LessonPanels({ track, panelsVisible, hasTransformed, onComplete, phase }: { track: Track; panelsVisible: boolean; hasTransformed: boolean; onComplete: () => void; phase: Phase }) {
    const [index, setIndex] = useState(0)
    const panels = track === 'amber' ? AMBER_PANELS : BLUE_PANELS
    const current = panels[index]
    const isLast = index >= panels.length - 1
    const { displayed, finished, skip } = useTypewriter(current?.text ?? '', 32, panelsVisible && phase === 'lesson')
    const handleNext = () => isLast ? onComplete() : setIndex(i => i + 1)

    if (!track) return null
    return (
        <div className={`${styles.panel} ${styles.lessonPanel} ${panelsVisible ? styles.panelVisible : ''}`}>
            <div className={styles.lessonHeader}>
                <span className={styles.lessonStep}>LESSON {index + 1} / {panels.length}</span>
                <span className={`${styles.lessonTrackBadge} ${track === 'amber' ? styles.amberBadge : styles.blueBadge}`}>
                    {track === 'blue' ? '🔵 Intuition' : '🟡 Technical'}
                </span>
            </div>

            {index === 0 && !hasTransformed ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <p className={styles.lessonText} style={{ color: '#FFB7C5', fontWeight: 700 }}>
                        Drag the |1⟩ silver qubit through the H-Gate frame to witness superposition!
                    </p>
                </div>
            ) : (
                <>
                    <div 
                        onClick={() => !finished && skip()}
                        style={{ cursor: finished ? 'default' : 'pointer' }}
                    >
                        <p className={styles.lessonText}>
                            {displayed}
                            {!finished && <span className={styles.cursor}>▊</span>}
                        </p>
                    </div>
                    {track === 'amber' && 'math' in current && current.math && <code className={styles.lessonMath}>{current.math}</code>}
                    <button className={styles.nextBtn} onClick={handleNext}>{isLast ? 'Quiz →' : 'Next →'}</button>
                </>
            )}
        </div>
    )
}

function QuizPanel({ track, panelsVisible, onQuizResult, onQuizComplete }: { track: Track; panelsVisible: boolean; onQuizResult: (correct: boolean) => void; onQuizComplete: () => void }) {
    const questions = QUIZ_QUESTIONS.filter(q => track && q.tracks.includes(track))
    const [selected, setSelected] = useState<number | null>(null)
    const [answered, setAnswered] = useState(false)
    const currentQ = questions[0]

    const handleAnswer = (idx: number) => {
        if (answered) return
        setSelected(idx)
        setAnswered(true)
        onQuizResult(currentQ.answers[idx].correct)
    }

    if (!track || !currentQ) return null
    return (
        <div className={`${styles.panel} ${styles.lessonPanel} ${panelsVisible ? styles.panelVisible : ''}`}>
             <p style={{ fontSize: '11px', color: 'rgba(255,183,197,0.5)', marginBottom: '8px' }}>QUIZ TIME</p>
             <p className={styles.lessonText}>{currentQ.question}</p>
             <div style={{ display: 'grid', gap: '10px' }}>
                {currentQ.answers.map((ans, i) => (
                    <button 
                        key={i} 
                        onClick={() => handleAnswer(i)}
                        style={{
                            background: selected === i ? (ans.correct ? '#2d5a3f' : '#5a2d2d') : 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '10px',
                            color: '#fff',
                            padding: '12px',
                            cursor: 'pointer',
                            textAlign: 'left'
                        }}
                    >
                        {ans.label}
                    </button>
                ))}
             </div>
             {answered && (
                 <button 
                    className={styles.nextBtn} 
                    onClick={() => {
                        onQuizComplete()
                        // if we want to navigate or just finish
                    }} 
                    style={{ marginTop: '20px' }}
                 >
                    Finish →
                 </button>
             )}
        </div>
    )
}

interface SuperpositionOverlayProps {
    panelsVisible: boolean
    track: Track
    phase: Phase
    hasTransformed: boolean
    onTrackSelect: (t: 'blue' | 'amber') => void
    onLessonComplete: () => void
    onQuizComplete: () => void
    onQuizResult: (correct: boolean) => void
}

export function SuperpositionOverlay({ 
    panelsVisible, track, phase, hasTransformed, onTrackSelect, onLessonComplete, onQuizComplete, onQuizResult 
}: SuperpositionOverlayProps) {
    const navigate = useNavigate()
    return (
        <>
            <div className={styles.phasePill}>⚛️ {phase.toUpperCase()}</div>
            <button className={styles.backBtn} onClick={() => navigate('/learn')}>← Hub</button>
            {phase === 'hook' && (
                <>
                    <TrackSelector onTrackSelect={onTrackSelect} />
                    {track && <CatDialogueBubble track={track} panelsVisible={panelsVisible} />}
                </>
            )}
            {phase === 'lesson' && <LessonPanels track={track} panelsVisible={panelsVisible} hasTransformed={hasTransformed} onComplete={onLessonComplete} phase={phase} />}
            {phase === 'quiz' && <QuizPanel track={track} panelsVisible={panelsVisible} onQuizResult={onQuizResult} onQuizComplete={onQuizComplete} />}
            {phase === 'complete' && (
                 <div className={`${styles.panel} ${styles.completionPanel} ${styles.panelVisible}`}>
                    <div className={styles.badgeGlow}>🌊</div>
                    <h2 className={styles.badgeName}>Wave Master</h2>
                    <p style={{ color: 'rgba(255,183,197,0.7)', fontSize: '14px' }}>Module 2 Complete</p>
                    <button className={styles.continueBtn} onClick={() => navigate('/learn')}>Return to Hub</button>
                 </div>
            )}
        </>
    )
}
