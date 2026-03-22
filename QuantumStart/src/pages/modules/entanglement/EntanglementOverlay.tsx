import { useNavigate } from 'react-router-dom'
import styles from './EntanglementOverlay.module.css'
import { ModuleHeader } from '../../../components/ModuleHeader'

const STEPS = {
    concept: [
        {
            title: "The Magic Tether",
            description: "Some quantum states are completely independent. But two qubits can be combined into a single, unified system. This is called Entanglement.",
            instruction: "Click 'ENTANGLE' to link Qubit A and Qubit B."
        },
        {
            title: "Superposition Shared",
            description: "Now they are entangled! They are both in superposition, but they share a single destiny. Drag them apart to opposite sides of the screen.",
            instruction: "Click and drag the glowing orbs. Notice the tether stretches."
        },
        {
            title: "Distance Means Nothing",
            description: "Imagine a pair of magic coins. No matter how far apart you take them—even across the galaxy—if one lands on heads, the other is guaranteed to land on heads.",
            instruction: "Let's see what happens when we continuously observe them."
        }
    ],
    collapse: [
        {
            title: "Spooky Action",
            description: "Even separated by a vast distance, if we measure Qubit A, the superposition collapses. What happens to Qubit B?",
            instruction: "Click 'MEASURE RECORD' below to observe the system."
        },
        {
            title: "Simultaneous Reality",
            description: "Einstein called this 'spooky action at a distance.' It is crucial to understand that they are NOT sending a really fast hidden signal to each other or communicating at the speed of light. Even if they were light-years apart, the collapse is truly simultaneous and instantaneous because they act as one single mathematical system.",
            instruction: "Notice how they both collapsed to the exact same state instantly without delay or signaling speed."
        }
    ]
}

const QUIZ_QUESTIONS = [
    {
        question: "If two qubits are entangled and you measure the first one, how long does it take for the second one to collapse?",
        options: [
            { label: "It depends how far apart they are.", correct: false },
            { label: "At the speed of light.", correct: false },
            { label: "Instantaneously, simultaneously.", correct: true }
        ]
    },
    {
        question: "When measuring our perfectly entangled qubits, is it possible to get Qubit A as |0⟩ and Qubit B as |1⟩?",
        options: [
            { label: "Yes, 50% of the time.", correct: false },
            { label: "No, they always collapse to the exact same state.", correct: true }
        ]
    }
]

export function EntanglementOverlay({
    phase, step, isEntangled, isMeasured, outcome, histogram, shotsTaken, quizQuestion,
    onEntangle, onMeasure, onReset, onRun50, onNext, onBack, onQuizAnswer
}: any) {
    const navigate = useNavigate()

    // Derived probability values for UI
    const maxShots = Math.max(1, histogram['00'] + histogram['11'] + histogram['01'] + histogram['10'])
    const h00 = (histogram['00'] / maxShots) * 100
    const h11 = (histogram['11'] / maxShots) * 100
    const h01 = (histogram['01'] / maxShots) * 100
    const h10 = (histogram['10'] / maxShots) * 100

    return (
        <div className={styles.container}>
        <ModuleHeader
            moduleNumber={5}
            moduleName="Entanglement"
            phases={['Concept', 'Collapse', 'Sandbox', 'Quiz']}
            currentPhase={
                phase === 'concept' ? 0
                : phase === 'collapse' ? 1
                : phase === 'sandbox' ? 2
                : phase === 'quiz' ? 3
                : 3
            }
        />

            <div className={styles.sidebar}>
                {/* INSTRUCTION PANELS */}
                {phase === 'concept' && (
                    <div className={styles.instructionPanel}>
                        <span className={styles.stepText}>Phase 1: Concept • Step {step}/3</span>
                        <h2 className={styles.title}>{STEPS.concept[step - 1].title}</h2>
                        <p className={styles.description}>{STEPS.concept[step - 1].description}</p>
                        
                        <div style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem', color: '#FFB7C5' }}>
                            💡 {STEPS.concept[step - 1].instruction}
                        </div>

                        {step === 1 && !isEntangled && (
                            <button className={styles.entangleBtn} onClick={onEntangle}>
                                🔗 ENTANGLE
                            </button>
                        )}
                        {step === 1 && isEntangled && (
                            <button className={styles.entangleBtn} style={{ background: '#44ff44', color: '#111' }} disabled>
                                ✓ ENTANGLED
                            </button>
                        )}

                        <div className={styles.btnRow}>
                            <button className={`${styles.navBtn} ${styles.backStepBtn}`} onClick={onBack} disabled={step===1}>← Back</button>
                            <button className={`${styles.navBtn} ${styles.nextStepBtn}`} onClick={onNext} disabled={step===1 && !isEntangled}>Next →</button>
                        </div>
                    </div>
                )}

                {phase === 'collapse' && (
                    <div className={styles.instructionPanel}>
                        <span className={styles.stepText}>Phase 2: The Collapse • Step {step}/2</span>
                        <h2 className={styles.title}>{STEPS.collapse[step - 1].title}</h2>
                        <p className={styles.description}>{STEPS.collapse[step - 1].description}</p>

                        <div style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem', color: '#FFB7C5' }}>
                            💡 {STEPS.collapse[step - 1].instruction}
                        </div>

                        {step === 1 && !isMeasured && (
                            <button className={styles.measureBtn} onClick={onMeasure}>
                                👁️ MEASURE SYSTEM
                            </button>
                        )}
                        {step === 1 && isMeasured && (
                            <div style={{ textAlign: 'center', marginBottom: '12px', color: '#fff', fontSize: '1.2rem', fontWeight: 'bold' }}>
                                Outcome: |{outcome}{outcome}⟩
                            </div>
                        )}

                        <div className={styles.btnRow}>
                            <button className={`${styles.navBtn} ${styles.backStepBtn}`} onClick={onBack}>← Back</button>
                            <button className={`${styles.navBtn} ${styles.nextStepBtn}`} onClick={onNext} disabled={step===1 && !isMeasured}>Next →</button>
                        </div>
                    </div>
                )}

                {phase === 'sandbox' && (
                    <div className={styles.instructionPanel}>
                        <span className={styles.stepText}>Sandbox</span>
                        <h2 className={styles.title}>Probability Log</h2>
                        <p className={styles.description}>
                            Run the system multiple times to build statistical evidence. Notice which states NEVER occur!
                        </p>

                        <div className={styles.histogram}>
                            <div className={styles.barCol}>
                                <div className={styles.barContainer}>
                                    <div className={styles.barFill00} style={{ height: `${h00}%` }}></div>
                                </div>
                                <span className={styles.barLabel}>|00⟩</span>
                                <span style={{fontSize: '10px', color: '#ccc'}}>{histogram['00']}</span>
                            </div>
                            <div className={styles.barCol}>
                                <div className={styles.barContainer}>
                                    <div className={styles.barFillOther} style={{ height: `${h01}%` }}></div>
                                </div>
                                <span className={styles.barLabel}>|01⟩</span>
                                <span style={{fontSize: '10px', color: '#ccc'}}>{histogram['01']}</span>
                            </div>
                            <div className={styles.barCol}>
                                <div className={styles.barContainer}>
                                    <div className={styles.barFillOther} style={{ height: `${h10}%` }}></div>
                                </div>
                                <span className={styles.barLabel}>|10⟩</span>
                                <span style={{fontSize: '10px', color: '#ccc'}}>{histogram['10']}</span>
                            </div>
                            <div className={styles.barCol}>
                                <div className={styles.barContainer}>
                                    <div className={styles.barFill11} style={{ height: `${h11}%` }}></div>
                                </div>
                                <span className={styles.barLabel}>|11⟩</span>
                                <span style={{fontSize: '10px', color: '#ccc'}}>{histogram['11']}</span>
                            </div>
                        </div>

                        {shotsTaken > 0 && (
                            <div style={{ textAlign: 'center', marginBottom: '16px', fontSize: '0.9rem', color: '#FFB7C5' }}>
                                Total Shots: {shotsTaken}
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                            <button className={styles.optionBtn} onClick={onMeasure} disabled={isMeasured}>Add 1 Shot</button>
                            <button className={styles.optionBtn} onClick={onRun50}>Run 50</button>
                            <button className={styles.optionBtn} onClick={onReset} style={{ gridColumn: 'span 2' }}>Reset QuDits</button>
                        </div>

                        <div className={styles.btnRow}>
                            <button className={`${styles.navBtn} ${styles.backStepBtn}`} onClick={onBack}>← Back</button>
                            <button className={`${styles.navBtn} ${styles.nextStepBtn}`} onClick={onNext} disabled={shotsTaken < 10}>Take Quiz →</button>
                        </div>
                    </div>
                )}

                {phase === 'quiz' && (
                    <div className={styles.instructionPanel}>
                        <span className={styles.stepText}>Knowledge Check {quizQuestion}/2</span>
                        <h2 className={styles.title}>Review</h2>
                        <p className={styles.description}>{QUIZ_QUESTIONS[quizQuestion - 1].question}</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {QUIZ_QUESTIONS[quizQuestion - 1].options.map((opt, i) => (
                                <button key={i} className={styles.quizOption} onClick={() => onQuizAnswer(opt.correct)}>
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {phase === 'complete' && (
                    <div className={styles.instructionPanel} style={{ textAlign: 'center', padding: '40px 20px' }}>
                        <div style={{ fontSize: '60px', marginBottom: '20px' }}>🔗</div>
                        <h2 className={styles.title}>Entanglement Unlocked</h2>
                        <p className={styles.description}>You've mastered the spooky action! The universe is truly connected.</p>
                        
                        <button className={styles.measureBtn} style={{ marginTop: '20px' }} onClick={() => navigate('/learn/gates')}>
                            Next Module →
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
