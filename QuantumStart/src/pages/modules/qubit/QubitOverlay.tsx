/**
 * QubitOverlay.tsx — all HTML panels for "What is a Qubit?"
 * (Moved to src/pages/qubit/)
 */

import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTypewriter } from '../../hooks/useTypewriter'
import styles from './QubitOverlay.module.css'
import type { Track, Phase } from './QubitScene'

// ─── LESSON CONTENT ───────────────────────────────────────────────────────────
const BLUE_PANELS = [
    { text: "A classical bit is like a coin — heads (1) or tails (0). Always one or the other.", hint: "Click the coin on the left to flip it." },
    { text: "A qubit lives in between. Before you look, it's both 0 and 1 simultaneously.", hint: "Click the glowing sphere to witness superposition." },
    { text: "This isn't a trick — it's how the universe works at the quantum scale.", hint: null },
    { text: "The moment you measure a qubit, the universe makes a choice. Until then — infinite possibility.", hint: "Try clicking the sphere again and watch the chaos." },
]

const AMBER_PANELS = [
    { text: "A classical bit: x ∈ {0,1}. Deterministic and binary.", math: null, hint: "Click the coin repeatedly — always 0 or 1." },
    { text: "A qubit state is described by the following superposition:", math: "|ψ⟩ = α|0⟩ + β|1⟩   where α, β ∈ ℂ and |α|² + |β|² = 1", hint: null },
    { text: "α and β are probability amplitudes. |α|² is the probability of measuring |0⟩, and |β|² for |1⟩.", math: "P(0) = |α|²     P(1) = |β|²", hint: null },
    { text: "The bra-ket labels |0⟩ and |1⟩ appear on the sphere. Explore the state space directly.", math: null, hint: "Click the sphere to evolve its state." },
]

// ─── QUIZ CONTENT ─────────────────────────────────────────────────────────────
type QuizAnswer = { label: string; correct: boolean }
interface QuizQuestion {
    question: string
    answers?: QuizAnswer[]
    isObserver?: boolean
    explanation: string
    tracks: ('blue' | 'amber')[]
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
    {
        question: "What makes a qubit different from a classical bit?",
        answers: [
            { label: "A) It can only be 0", correct: false },
            { label: "B) It can be 0 and 1 at the same time", correct: true },
            { label: "C) It stores more memory", correct: false },
            { label: "D) It is faster", correct: false },
        ],
        explanation: "A qubit can exist in a superposition of 0 and 1 simultaneously — this is the core quantum property that makes quantum computing powerful.",
        tracks: ['blue', 'amber'],
    },
    {
        question: "In |ψ⟩ = α|0⟩ + β|1⟩, what constraint must hold?",
        answers: [
            { label: "A) α + β = 1", correct: false },
            { label: "B) |α|² + |β|² = 1", correct: true },
            { label: "C) α = β", correct: false },
            { label: "D) α and β must be real", correct: false },
        ],
        explanation: "The normalization constraint |α|² + |β|² = 1 ensures the total probability of measuring any outcome sums to 1.",
        tracks: ['amber'],
    },
    {
        question: "Click the object in superposition.",
        isObserver: true,
        explanation: "The glowing sphere is your qubit — it holds a superposition of |0⟩ and |1⟩ until measured. The coin is always classical: either 0 or 1.",
        tracks: ['blue', 'amber'],
    },
]

// ─── TRACK SELECTOR ───────────────────────────────────────────────────────────
function TrackSelector({ panelsVisible, onTrackSelect }: { panelsVisible: boolean; onTrackSelect: (t: 'blue' | 'amber') => void }) {
    return (
        <div className= {`${styles.panel} ${styles.trackSelector} ${panelsVisible ? styles.panelVisible : ''}`
}>
    <p className={ styles.trackTitle }> What is a Qubit ? </p>
        < h2 className = { styles.trackHeadline } > Choose your learning path </h2>
            < div className = { styles.trackBtnRow } >
                <button className={`${styles.trackBtn} ${styles.trackBtnBlue}`} onClick={() => onTrackSelect('blue')} id="track-blue-btn">
                    <div className={styles.pathSphere} /> Intuition
                </button>
                <button className={`${styles.trackBtn} ${styles.trackBtnAmber}`} onClick={() => onTrackSelect('amber')} id="track-amber-btn">
                    <div className={styles.pathSphere} /> Technical
                </button>
                                </div>
                                </div>
    )
}

// ─── CAT DIALOGUE BUBBLE ─────────────────────────────────────────────────────
const TRACK_DIALOGUE: Record<'blue' | 'amber', string> = {
    blue: "Let's collapse this wave function together.",
    amber: "Good. You want the equations. The cat approves.",
}

function CatDialogueBubble({ track, panelsVisible }: { track: Track; panelsVisible: boolean }) {
    if (!track) return null
    const { displayed, finished, skip } = useTypewriter(TRACK_DIALOGUE[track], 36, panelsVisible)
    return (
        <div 
            className={`${styles.panel} ${styles.catDialogue} ${track === 'amber' ? styles.amberTrack : ''} ${panelsVisible ? styles.panelVisible : ''}`}
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

// ─── LESSON PANELS ────────────────────────────────────────────────────────────
function LessonPanels({ track, panelsVisible, onComplete }: { track: Track; panelsVisible: boolean; onComplete: () => void }) {
    const [panelIndex, setPanelIndex] = useState(0)
    const panels = track === 'amber' ? AMBER_PANELS : BLUE_PANELS
    const current = panels[panelIndex]
    const isLast = panelIndex >= panels.length - 1
    useEffect(() => { setPanelIndex(0) }, [track])
    const { displayed, finished, skip } = useTypewriter(current?.text ?? '', 32, panelsVisible)
    const handleNext = () => isLast ? onComplete() : setPanelIndex(i => i + 1)

    if (!track) return null
    return (
        <div className= {`${styles.panel} ${styles.lessonPanel} ${panelsVisible ? styles.panelVisible : ''}`
}>
    <div className={ styles.lessonHeader }>
        <span className={ styles.lessonStep }> LESSON { panelIndex + 1 } / {panels.length}</span >
            <span className={ `${styles.lessonTrackBadge} ${track === 'amber' ? styles.amberBadge : styles.blueBadge}` }>
                { track === 'blue' ? '🔵 Intuition' : '🟡 Technical'}
</span>
    </div>
    <div 
        onClick={() => !finished && skip()}
        style={{ cursor: finished ? 'default' : 'pointer' }}
    >
        <p className={styles.lessonText}>
            {displayed}
            {!finished && <span className={styles.cursor}>▊</span>}
        </p>
    </div>
{
    track === 'amber' && 'math' in current && current.math && (
        <code className={ styles.lessonMath }> { current.math } </code>
            )
}
{
    current.hint && (
        <p style={ { fontSize: '12px', color: 'rgba(255,183,197,0.6)', fontFamily: 'DM Sans, sans-serif', marginBottom: '14px', fontStyle: 'italic' } }>
                    💡 { current.hint }
    </p>
            )
}
<div className={ styles.lessonNav }>
    <div className={ styles.navDots }>
        { panels.map((_, i) => <div key={ i } className = {`${styles.navDot} ${i === panelIndex ? styles.navDotActive : ''}`} />)}
</div>
    < button className = { styles.nextBtn } onClick = { handleNext } id = {`lesson-next-${panelIndex}`}>
        { isLast? 'Take the Quiz →': 'Next →' }
        </button>
        </div>
        </div>
    )
}

// ─── QUIZ PANEL ───────────────────────────────────────────────────────────────
function QuizPanel({ track, panelsVisible, onComplete, onAllCorrect, sphereClicked }: {
    track: Track; panelsVisible: boolean; onComplete: (correct: boolean) => void; onAllCorrect: () => void; sphereClicked?: boolean
}) {
    const [qIndex, setQIndex] = useState(0)
    const [selected, setSelected] = useState<number | null>(null)
    const [retries, setRetries] = useState(0)
    const [showExplanation, setShowExplanation] = useState(false)
    const [answered, setAnswered] = useState(false)
    const [observerResult, setObserverResult] = useState<boolean | null>(null)
    const MAX_RETRIES = 2

    const questions = QUIZ_QUESTIONS.filter(q => track ? q.tracks.includes(track) : false)
    const currentQ = questions[qIndex]
    const isLastQ = qIndex >= questions.length - 1

    useEffect(() => {
        if (!sphereClicked || !currentQ?.isObserver || answered) return
        setObserverResult(true); setAnswered(true); onComplete(true)
    }, [sphereClicked, currentQ, answered, onComplete])

    const handleAnswer = (idx: number) => {
        if (answered || !currentQ.answers) return
        const correct = currentQ.answers[idx].correct
        setSelected(idx)
        if (correct) { setAnswered(true); onComplete(true) }
        else {
            const newRetries = retries + 1; setRetries(newRetries)
            if (newRetries >= MAX_RETRIES) { setAnswered(true); setShowExplanation(true); onComplete(false) }
            else setTimeout(() => setSelected(null), 800)
        }
    }

    const handleNext = useCallback(() => {
        if (isLastQ) { onAllCorrect() }
        else { setQIndex(i => i + 1); setSelected(null); setRetries(0); setShowExplanation(false); setAnswered(false); setObserverResult(null) }
    }, [isLastQ, onAllCorrect])

    if (!track || !currentQ) return null
    const isCorrect = selected !== null && currentQ.answers?.[selected]?.correct === true

    return (
        <div className= {`${styles.panel} ${styles.quizPanel} ${panelsVisible ? styles.panelVisible : ''}`
}>
    <div className={ styles.quizLabel }> QUIZ · Q{ qIndex + 1 } of { questions.length } </div>
        < p className = { styles.quizQuestion } > { currentQ.question } </p>
{
    currentQ.answers && (
        <div className={ styles.quizOptions }>
        {
            currentQ.answers.map((opt, i) => {
                let cls = styles.quizOption
                if (selected === i) cls += opt.correct ? ` ${styles.quizOptionCorrect}` : ` ${styles.quizOptionWrong}`
                else if (answered && opt.correct) cls += ` ${styles.quizOptionCorrect}`
                return <button key={ i } className = { cls } onClick = {() => handleAnswer(i)
            } disabled = { answered } id = {`quiz-option-${qIndex}-${i}`} > { opt.label } </button>
})}
</div>
            )}
{ currentQ.isObserver && !answered && <p className={ styles.clickHint }>👁️ Click the correct object in the scene below to answer.</p> }
{
    currentQ.isObserver && observerResult !== null && (
        <div className={ `${styles.quizFeedback} ${observerResult ? styles.feedbackCorrect : styles.feedbackWrong}` }>
            { observerResult? "✓ Correct — the glowing sphere is in superposition!": "✗ That's the classical bit — try the glowing sphere." }
            </div>
            )
}
{
    !currentQ.isObserver && answered && (
        <div className={ `${styles.quizFeedback} ${isCorrect ? styles.feedbackCorrect : styles.feedbackWrong}` }>
            { isCorrect? "✓ The universe agrees: you're a natural.": "✗ Ooh, a glitch in the matrix! Let's try another timeline." }
            </div>
            )
}
{
    !answered && retries > 0 && retries < MAX_RETRIES && (
        <p className={ styles.retriesLeft }> { MAX_RETRIES - retries
} attempt{ MAX_RETRIES - retries > 1 ? 's' : '' } remaining </p>
            )}
{ showExplanation && <div className={ styles.explanationBox }>📖 { currentQ.explanation } </div> }
{ answered && <button className={ styles.nextQuizBtn } onClick = { handleNext } id = {`quiz-next-${qIndex}` }> { isLastQ? 'See Results →': 'Next Question →' } </button>}
</div>
    )
}

// ─── COMPLETION PANEL ──────────────────────────────────────────────────────────
function CompletionPanel({ track, panelsVisible }: { track: Track; panelsVisible: boolean }) {
    const navigate = useNavigate()
    const badge = track === 'amber'
        ? { emoji: '🟡', label: 'State |1⟩ Scholar', color: '#C4955A' }
        : { emoji: '🔵', label: 'State |0⟩ Initiate', color: '#5DA7DB' }
    return (
        <div className= {`${styles.panel} ${styles.completionPanel} ${panelsVisible ? styles.panelVisible : ''}`
}>
    <div className={ styles.badgeGlow }> { badge.emoji } </div>
        < h2 className = { styles.badgeName } > { badge.label } </h2>
            < p className = { styles.badgeSubtitle } style = {{ color: badge.color }}> Module 1 Complete ✦ What is a Qubit ? </p>
                < button className = { styles.continueBtn } onClick = {() => navigate('/learn')} id = "completion-continue-btn" >
                    Continue to Hub →
</button>
    </div>
    )
}

// ─── MODULE 1 OVERLAY (main export) ──────────────────────────────────────────
export interface QubitOverlayProps {
    panelsVisible: boolean; track: Track; phase: Phase
    onTrackSelect: (t: 'blue' | 'amber') => void
    onLessonComplete: () => void; onQuizComplete: () => void
    onQuizResult: (correct: boolean) => void; sphereClicked: boolean
}

export function QubitOverlay({ panelsVisible, track, phase, onTrackSelect, onLessonComplete, onQuizComplete, onQuizResult, sphereClicked }: QubitOverlayProps) {
    const navigate = useNavigate()
    const PHASE_LABELS: Record<Phase, string> = { hook: 'MODULE 1', lesson: 'LESSON', quiz: 'QUIZ', complete: 'COMPLETE' }
    return (
        <>
        <div className= {`${styles.phasePill} ${panelsVisible ? styles.phasePillVisible : ''}`
}>⚛️ { PHASE_LABELS[phase] } </div>
    < button className = { styles.backBtn } onClick = {() => navigate('/learn')}>← Hub </button>
{
    phase === 'hook' && (
        <>
        <TrackSelector panelsVisible={ panelsVisible } onTrackSelect = { onTrackSelect } />
            { track && <CatDialogueBubble track={ track } panelsVisible = { panelsVisible } />}
</>
            )}
{ phase === 'lesson' && <LessonPanels track={ track } panelsVisible = { panelsVisible } onComplete = { onLessonComplete } />}
{ phase === 'quiz' && <QuizPanel track={ track } panelsVisible = { panelsVisible } onComplete = { onQuizResult } onAllCorrect = { onQuizComplete } sphereClicked = { sphereClicked } />}
{ phase === 'complete' && <CompletionPanel track={ track } panelsVisible = { panelsVisible } />}
</>
    )
}
