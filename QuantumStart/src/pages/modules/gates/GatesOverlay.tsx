import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './GatesOverlay.module.css'
import type { GatePhase } from './GatesModule'
import { applyGate1Q, INITIAL_STATE, formatStateString } from './gateLogic'
import { GATES } from '../../../config/gates'
import type { State1Q } from './gateLogic'
import { ModuleHeader } from '../../../components/ModuleHeader'

interface GatesOverlayProps {
    panelsVisible: boolean
    phase: GatePhase
    onPhaseComplete: (p: GatePhase) => void
    unlockedGates: string[]
    unlockGate: (id: string) => void
    selectedGate: string | null
    setSelectedGate: (v: string | null) => void
    animState: State1Q
    setAnimState: (v: State1Q) => void
    challengeIdx: number
    setChallengeIdx: (v: number) => void
    wireState1: State1Q
    setWireState1: (v: State1Q) => void
    wireState2: State1Q
    setWireState2: (v: State1Q) => void
    isEntangled: boolean
    setIsEntangled: (v: boolean) => void
}

const GATE_DATA: Record<string, any> = {
    'H': {
        name: 'Hadamard', symbol: 'H',
        matrix: [['1/√2', '1/√2'], ['1/√2', '-1/√2']],
        desc: 'Creates an equal superposition. It maps |0⟩ to |+⟩.',
        analogy: 'A coin being tossed into the air — it is neither heads nor tails until it lands.',
        q1: { text: "What does this gate do to |0⟩?", options: ["Leaves it as |0⟩", "Flips to |1⟩", "Creates superposition |+⟩", "Destroys the qubit"], ans: 2 },
        q2: { text: "Which entry causes the negative phase in |1⟩ → |−⟩?", options: ["Top left", "Top right", "Bottom left", "Bottom right"], ans: 3 },
        next: 'X'
    },
    'X': {
        name: 'Pauli-X', symbol: 'X',
        matrix: [['0', '1'], ['1', '0']],
        desc: 'Flips |0⟩ to |1⟩ and vice versa — it is a quantum NOT gate.',
        analogy: 'A light switch flipping from OFF to ON.',
        q1: { text: "What does this gate do to |0⟩?", options: ["Leaves it as |0⟩", "Flips to |1⟩", "Creates superposition |+⟩", "Adds a phase"], ans: 1 },
        q2: { text: "What is the result of applying X twice?", options: ["|0⟩", "|1⟩", "Original state", "Destroyed"], ans: 2 },
        next: 'Y'
    },
    'Y': {
        name: 'Pauli-Y', symbol: 'Y',
        matrix: [['0', '-i'], ['i', '0']],
        desc: 'Flips the state and adds a complex phase factor (i).',
        analogy: 'A rotation that twists the coin while flipping it.',
        q1: { text: "What does Y do to |0⟩?", options: ["Creates |+⟩", "Flips to i|1⟩", "Leaves it as |0⟩", "Flips to |1⟩"], ans: 1 },
        q2: { text: "Does Y introduce imaginary numbers?", options: ["Yes", "No", "Sometimes", "Only on Tuesday"], ans: 0 },
        next: 'Z'
    },
    'Z': {
        name: 'Pauli-Z', symbol: 'Z',
        matrix: [['1', '0'], ['0', '-1']],
        desc: 'Flips the phase of |1⟩ to -|1⟩, leaving |0⟩ unchanged.',
        analogy: 'A mirror that only reflects and flips the bottom half of the room.',
        q1: { text: "What does Z do to |0⟩?", options: ["Nothing", "Flips to |1⟩", "Creates |+⟩", "Adds negative phase"], ans: 0 },
        q2: { text: "What does Z do to |+⟩?", options: ["Becomes |−⟩", "Becomes |0⟩", "Becomes |1⟩", "Nothing"], ans: 0 },
        next: 'CNOT'
    },
    'CNOT': {
        name: 'Controlled-NOT', symbol: 'CNOT',
        matrix: [['1', '0', '0', '0'], ['0', '1', '0', '0'], ['0', '0', '0', '1'], ['0', '0', '1', '0']],
        desc: 'Flips the target qubit ONLY if the control qubit is |1⟩.',
        analogy: 'A doorbell that only rings if the porch light is ON.',
        q1: { text: "If control is |0⟩ and target is |1⟩, what is the output?", options: ["|00⟩", "|01⟩", "|10⟩", "|11⟩"], ans: 1 },
        q2: { text: "What is required to entangle two qubits?", options: ["Two X gates", "H on control, then CNOT", "Z on target", "Measurement"], ans: 1 },
        next: null
    }
}

// ─── Phase 1 Intro ───
interface Phase1IntroProps {
    unlockedGates: string[]
    unlockGate: (id: string) => void
    selectedGate: string | null
    setSelectedGate: (v: string | null) => void
    setAnimState: (v: State1Q) => void
    onComplete: (p: GatePhase) => void
}

function Phase1Intro({ unlockedGates, unlockGate, selectedGate, setSelectedGate, setAnimState, onComplete }: Phase1IntroProps) {
    const [qStep, setQStep] = useState(0)
    const [msg, setMsg] = useState('Click a glowing gate to examine it!')
    const data = selectedGate ? GATE_DATA[selectedGate] : null
    const currentStateRef = useRef<State1Q>([1, 0, 0, 0])

    useEffect(() => {
        if (!selectedGate) {
            const initial: State1Q = [1, 0, 0, 0]
            currentStateRef.current = initial
            setAnimState(initial)
            setQStep(0)
            setMsg('Click a glowing gate to examine it!')
        } else {
            setMsg(`Ah, the ${data.name} gate. What does it do?`)
            const timer = setInterval(() => {
                const next = applyGate1Q(GATES[selectedGate as keyof typeof GATES] || GATES.H, currentStateRef.current)
                currentStateRef.current = next
                setAnimState(next)
            }, 3000)
            return () => clearInterval(timer)
        }
    }, [selectedGate])

    const handleAnswer = (idx: number) => {
        const q = qStep === 0 ? data.q1 : data.q2
        if (idx === q.ans) {
            if (qStep === 0) {
                setQStep(1)
                setMsg("Correct! Now for the second question...")
            } else {
                setMsg("Perfect! Gate unlocked.")
                if (data.next && !unlockedGates.includes(data.next)) unlockGate(data.next)
                
                setTimeout(() => {
                    setSelectedGate(null)
                    if (data.next === null) { // All unlocked
                        onComplete('phase1_intro')
                    }
                }, 2000)
            }
        } else {
            setMsg("Ooh, a glitch in the matrix! Try another timeline.")
        }
    }

    return (
        <div style={{ pointerEvents: 'none', width: '100%', height: '100%', position: 'relative' }}>
            {selectedGate && data && (
                <>
                    <div className={`${styles.glassPanel} ${styles.gatePanel}`}>
                        <h2 className={styles.title}>{data.name} Gate</h2>
                        <div className={styles.matrixBox}>
                            {data.matrix.map((row: any[], i: number) => (
                                <div key={i} className={styles.matrixRow}>
                                    {row.map((val: string, j: number) => <span key={j}>{val}</span>)}
                                </div>
                            ))}
                        </div>
                        <p style={{ marginBottom: '1rem' }}>{data.desc}</p>
                        <div className={styles.analogyCard}>
                            "{data.analogy}"
                        </div>
                    </div>

                    <div className={`${styles.glassPanel} ${styles.quizPanel}`}>
                        <h3 className={styles.subtitle}>Micro-Quiz {qStep + 1}/2</h3>
                        <p style={{ marginBottom: '1.5rem', fontWeight: 600 }}>
                            {qStep === 0 ? data.q1.text : data.q2.text}
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            {(qStep === 0 ? data.q1.options : data.q2.options).map((opt: string, i: number) => (
                                <button key={i} className={styles.btn} onClick={() => handleAnswer(i)}>
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}

            <div className={styles.bottomPanel}>
                <div className={styles.speechBubble}>
                    🐱 {msg}
                </div>
                {selectedGate && (
                    <button className={styles.btn} onClick={() => setSelectedGate(null)} style={{ pointerEvents: 'auto', width: 'auto' }}>
                        ← Back to Palette
                    </button>
                )}
            </div>
        </div>
    )
}

// ─── Phase 2 Challenges ───
const CHALLENGES = [
    { text: "Challenge 1: Create Superposition", target: "|+⟩", hint: "Which gate creates a 50/50 chance of 0 or 1?" },
    { text: "Challenge 2: Flip then Superpose", target: "|−⟩", hint: "Try flipping it to |1⟩ first, then create superposition." },
    { text: "Challenge 3: Entangle two qubits", target: "Entangled", hint: "Put the first qubit in superposition, then use CNOT." }
]

interface Phase2ChallengesProps {
    challengeIdx: number
    setChallengeIdx: (v: number) => void
    wireState1: State1Q
    setWireState1: (v: State1Q) => void
    wireState2: State1Q
    setWireState2: (v: State1Q) => void
    isEntangled: boolean
    setIsEntangled: (v: boolean) => void
    onComplete: (p: GatePhase) => void
}

function Phase2Challenges({ challengeIdx, setChallengeIdx, wireState1, setWireState1, wireState2, setWireState2, isEntangled, setIsEntangled, onComplete }: Phase2ChallengesProps) {
    const [msg, setMsg] = useState(CHALLENGES[challengeIdx].hint)
    
    // reset states when challenge changes
    useEffect(() => {
        setWireState1(INITIAL_STATE)
        setWireState2(INITIAL_STATE)
        setIsEntangled(false)
        setMsg(CHALLENGES[challengeIdx].hint)
    }, [challengeIdx])

    const handleApplyGate = (gate: string, targetQuBit: 1 | 2 = 1) => {
        if (gate === 'CNOT' && challengeIdx === 2) {
            // Check entanglement
            const stateH = formatStateString(wireState1)
            if (stateH === '|+⟩' || stateH === '|−⟩') {
                setIsEntangled(true)
                setMsg("These two qubits are now entangled — measuring one instantly determines the other!")
                setTimeout(() => {
                    onComplete('phase2_challenges')
                }, 4000)
            } else {
                setMsg("Try putting the first qubit in superposition before using CNOT.")
            }
            return
        }

        const newState = applyGate1Q(GATES[gate as keyof typeof GATES], targetQuBit === 1 ? wireState1 : wireState2)
        if (targetQuBit === 1) setWireState1(newState)
        else setWireState2(newState)

        // Validation logic
        if (challengeIdx === 0) {
            if (formatStateString(newState) === '|+⟩') {
                setMsg("The universe and I agree: you're a natural! Challenge 1 Complete.")
                setTimeout(() => setChallengeIdx(1), 2000)
            } else {
                setMsg("Not quite |+⟩. Hint: The gate we need is named after Jacques Hadamard.")
            }
        } else if (challengeIdx === 1) {
            if (formatStateString(newState) === '|−⟩') {
                setMsg("Notice: X first, then H gives |−⟩. This is why gates don't commute! Challenge 2 Complete.")
                setTimeout(() => setChallengeIdx(2), 4000)
            } else if (formatStateString(newState) === '|1⟩') {
                 setMsg("Good step! Now what gate gives superposition?")
            } else {
                 setMsg("We need it to face the opposite phase. Try X then H.")
            }
        }
    }

    return (
        <div style={{ pointerEvents: 'none', width: '100%', height: '100%', position: 'relative' }}>
            <div className={styles.challengeOverlay}>
                <div className={styles.glassPanel} style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <h2 className={styles.title}>{CHALLENGES[challengeIdx].text}</h2>
                    <p>Current Target: <span className={styles.greenText}>{CHALLENGES[challengeIdx].target}</span></p>
                    
                    <div className={styles.palette} style={{ marginTop: '1.5rem', justifyContent: 'center' }}>
                         {['H', 'X', 'Y', 'Z', 'CNOT'].map(g => (
                             <div key={g} className={styles.paletteGate} onClick={() => handleApplyGate(g)}>
                                 {g}
                             </div>
                         ))}
                    </div>
                    <p style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '0.5rem' }}>Click a gate to apply to Qubit 1 (Top)</p>
                </div>
            </div>

            <div className={styles.stateLabel}>
                {challengeIdx < 2 ? formatStateString(wireState1) : (isEntangled ? '|Φ+⟩' : formatStateString(wireState1) + ' ⊗ ' + formatStateString(wireState2))}
            </div>

            <div className={styles.bottomPanel}>
                <div className={styles.speechBubble}>
                    🐱 {msg}
                </div>
            </div>
        </div>
    )
}

// ─── Phase 3 Quiz ───
const FINAL_QUIZ = [
    { q: "Which gate flips a qubit from |0⟩ to |1⟩?", opts: ["H", "Z", "X", "Y"], ans: 2 },
    { q: "What does the Hadamard (H) gate do?", opts: ["Flips phase", "Creates equal superposition", "Entangles", "Measures"], ans: 1 },
    { q: "To entangle two qubits, what sequence do we typically use?", opts: ["X then Z", "Two H gates", "H then CNOT", "Measured then X"], ans: 2 }
]

interface Phase3QuizProps {
    onComplete: (p: GatePhase) => void
}

function Phase3Quiz({ onComplete }: Phase3QuizProps) {
    const [idx, setIdx] = useState(0)
    const [msg, setMsg] = useState("Final verification. Let's see if you've mastered the building blocks.")

    const handleAnswer = (i: number) => {
        if (i === FINAL_QUIZ[idx].ans) {
            if (idx === FINAL_QUIZ.length - 1) {
                setMsg("Perfect score! You've mastered Quantum Gates.")
                setTimeout(() => onComplete('phase3_quiz'), 2000)
            } else {
                setMsg("Correct! Next question.")
                setIdx(prev => prev + 1)
            }
        } else {
            setMsg("Ooh, a glitch in the matrix! Let's try another timeline.")
        }
    }

    return (
        <div style={{ pointerEvents: 'none', width: '100%', height: '100%', position: 'relative' }}>
            <div className={styles.challengeOverlay}>
                <div className={styles.glassPanel} style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <h2 className={styles.title}>Final Quiz {idx + 1}/3</h2>
                    <p style={{ fontSize: '1.2rem', margin: '1.5rem 0' }}>{FINAL_QUIZ[idx].q}</p>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                         {FINAL_QUIZ[idx].opts.map((opt, i) => (
                             <button key={i} className={styles.btn} onClick={() => handleAnswer(i)}>
                                 {opt}
                             </button>
                         ))}
                    </div>
                </div>
            </div>
            
            <div className={styles.bottomPanel}>
                <div className={styles.speechBubble}>
                    🐱 {msg}
                </div>
            </div>
        </div>
    )
}

// ─── Complete Summary ───
function GatesSummary() {
    const navigate = useNavigate()
    return (
        <div style={{ pointerEvents: 'none', width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className={styles.glassPanel} style={{ maxWidth: '600px', textAlign: 'center' }}>
                <h1 className={styles.title} style={{ fontSize: '3rem' }}>Module 4 Complete!</h1>
                <p className={styles.subtitle}>You've mastered the Quantum Gates.</p>
                
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', margin: '2rem 0' }}>
                     {['H', 'X', 'Y', 'Z', 'CNOT'].map(g => (
                         <div key={g} style={{ background: '#C1E1C1', color: '#1A1B26', padding: '0.5rem 1rem', borderRadius: '12px', fontWeight: 'bold' }}>
                             {g} Mastered ✓
                         </div>
                     ))}
                </div>

                <button
                    className={`${styles.btn} ${styles.btnPrimary}`}
                    onClick={() => navigate('/learn')}
                    style={{ width: 'auto', padding: '1rem 2rem', pointerEvents: 'auto' }}
                >
                    Return to Hub
                </button>
            </div>
        </div>
    )
}


export function GatesOverlay(props: GatesOverlayProps) {
    const { phase } = props
    const phaseIndex = phase === 'phase1_intro' ? 0 : phase === 'phase2_challenges' ? 1 : phase === 'phase3_quiz' ? 2 : 2

    return (
        <div className={styles.overlayContainer} style={{ opacity: props.panelsVisible ? 1 : 0, transition: 'opacity 0.5s' }}>
            <ModuleHeader
                moduleNumber={6}
                moduleName="Quantum Gates"
                phases={['Explore', 'Challenges', 'Quiz']}
                currentPhase={phaseIndex}
            />
            {phase === 'phase1_intro' && <Phase1Intro {...props} onComplete={props.onPhaseComplete} />}
            {phase === 'phase2_challenges' && <Phase2Challenges {...props} onComplete={props.onPhaseComplete} />}
            {phase === 'phase3_quiz' && <Phase3Quiz {...props} onComplete={props.onPhaseComplete} />}
            {phase === 'complete' && <GatesSummary />}
        </div>
    )
}
