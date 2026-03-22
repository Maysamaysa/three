/**
 * BlochSphereOverlay.tsx — HTML panels for Module 3 "Bloch Sphere"
 */

import { useNavigate } from 'react-router-dom'
import styles from './BlochSphereOverlay.module.css'
import { ModuleHeader } from '../../../components/ModuleHeader'

const STEPS = [
    {
        title: "Welcome to the Bloch Sphere",
        description: "The Bloch Sphere is a geometrical representation of a single qubit's state. Every point on the surface represents a valid quantum state.",
        hint: "Rotate the sphere by clicking and dragging the background."
    },
    {
        title: "The Z-Axis: |0⟩ and |1⟩",
        description: "The North Pole is state |0⟩ (Blue eye). The South Pole is state |1⟩ (Amber eye). These are our computational basis states.",
        hint: "Notice how θ = 0 at the top and θ = π at the bottom."
    },
    {
        title: "The Equator: Superposition",
        description: "Points on the equator represent equal parts |0⟩ and |1⟩. This is where quantum 'weirdness' lives!",
        hint: "Try to move the vector to the middle horizontal ring."
    },
    {
        title: "Phase (φ)",
        description: "As you move around the equator, you change the 'Phase'. This doesn't change the probability of 0 or 1, but it changes how the state interferes.",
        hint: "Watch the φ (Phi) value change as you move horizontally."
    },
    {
        title: "The X and Y Axes",
        description: "The X axis represents the |+⟩ and |-⟩ states. The Y axis represents |i+⟩ and |i-⟩. These are key for quantum operations.",
        hint: "Explore the red (X) and green (Y) lines."
    }
]

const QUIZ = {
    question: "What state is represented by the South Pole (θ = π)?",
    answers: [
        { label: "A) |0⟩", correct: false },
        { label: "B) |1⟩", correct: true },
        { label: "C) Superposition", correct: false },
        { label: "D) The Cat", correct: false },
    ]
}

export function BlochSphereOverlay({
    step, theta, phi, onNext, onBack, onQuizResult
}: any) {
    const navigate = useNavigate()

    // Derived values for the dashboard
    const x = (Math.sin(theta) * Math.cos(phi)).toFixed(3)
    const y = (Math.sin(theta) * Math.sin(phi)).toFixed(3)
    const z = Math.cos(theta).toFixed(3)
    
    const prob0 = Math.pow(Math.cos(theta/2), 2)
    const prob1 = Math.pow(Math.sin(theta/2), 2)
    
    const alpha = Math.cos(theta/2).toFixed(3)
    const beta = Math.sin(theta/2).toFixed(3)
    const phiDeg = (phi * 180 / Math.PI).toFixed(1)
    const phiPi = (phi / Math.PI).toFixed(2)

    const isStep = typeof step === 'number'
    const currentStep = isStep ? STEPS[step - 1] : null

    return (
        <>
        <ModuleHeader
            moduleNumber={3}
            moduleName="The Bloch Sphere"
            phases={['Step 1', 'Step 2', 'Step 3', 'Step 4', 'Step 5', 'Sandbox', 'Quiz']}
            currentPhase={
                step === 'sandbox' ? 5
                : step === 'quiz' ? 6
                : step === 'complete' ? 6
                : typeof step === 'number' ? step - 1
                : 0
            }
        />

            {/* SIDEBAR CONTAINER */}
            <div className={styles.sidebar}>
                {/* INSTRUCTION PANEL */}
                {(isStep || step === 'sandbox' || step === 'quiz') && (
                    <div className={styles.instructionPanel}>
                        {isStep ? (
                            <>
                                <div className={styles.stepIndicator}>
                                    {STEPS.map((_, i) => (
                                        <div 
                                            key={i} 
                                            className={`${styles.stepDot} ${i + 1 <= step ? styles.stepDotActive : ''}`} 
                                        />
                                    ))}
                                </div>
                                <span className={styles.stepText}>Step {step} of 5</span>
                                <h2 className={styles.title}>{currentStep?.title}</h2>
                                <p className={styles.description}>{currentStep?.description}</p>
                                
                                <div className={styles.hintBox}>
                                    💡 <span>{currentStep?.hint}</span>
                                </div>

                                <div className={styles.btnRow}>
                                    <button 
                                        className={`${styles.navBtn} ${styles.backStepBtn}`} 
                                        onClick={onBack}
                                        style={{ opacity: step === 1 ? 0.3 : 1 }}
                                        disabled={step === 1}
                                    >
                                        ← Back
                                    </button>
                                    <button className={`${styles.navBtn} ${styles.nextStepBtn}`} onClick={onNext}>
                                        Next →
                                    </button>
                                </div>
                            </>
                        ) : step === 'sandbox' ? (
                            <>
                                <span className={styles.stepText}>Sandbox Mode</span>
                                <h2 className={styles.title}>Explore the Sphere</h2>
                                <p className={styles.description}>You can now freely explore the Bloch Sphere. Drag the dot around to see how the state and probabilities change.</p>
                                
                                <div className={styles.btnRow} style={{ marginTop: '20px' }}>
                                    <button className={`${styles.navBtn} ${styles.backStepBtn}`} onClick={onBack}>
                                        ← Back
                                    </button>
                                    <button className={`${styles.navBtn} ${styles.nextStepBtn}`} onClick={onNext}>
                                        Take Final Quiz →
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <span className={styles.stepText}>Final Challenge</span>
                                <h2 className={styles.title}>Knowledge Check</h2>
                                <p className={styles.description}>{QUIZ.question}</p>
                                <div style={{ display: 'grid', gap: '10px', marginTop: '10px' }}>
                                    {QUIZ.answers.map((ans, i) => (
                                        <button 
                                            key={i} 
                                            className={styles.quizOption}
                                            onClick={() => onQuizResult(ans.correct)}
                                        >
                                            {ans.label}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* LIVE COORDINATES DASHBOARD */}
                {(isStep || step === 'sandbox') && (
                    <div className={styles.dashboardPanel}>
                        <h3 className={styles.dashboardTitle}>Live Coordinates</h3>
                        
                        <div className={styles.section}>
                            <p className={styles.label}>Spherical Coordinates</p>
                            <div className={styles.valueRow}>
                                <span className={styles.coord}>θ = {(theta / Math.PI).toFixed(3)}π ({(theta * 180 / Math.PI).toFixed(1)}°)</span>
                                <span className={styles.coord}>φ = {phiPi}π ({phiDeg}°)</span>
                            </div>
                        </div>

                        <div className={styles.section}>
                            <p className={styles.label}>Bloch Vector (<span style={{color: '#ff4444'}}>x</span>, <span style={{color: '#44ff44'}}>y</span>, <span style={{color: '#5DA7DB'}}>z</span>)</p>
                            <div className={styles.valueRow}>
                                <span className={styles.coord}>(<span style={{color: '#ff4444'}}>{x}</span>, <span style={{color: '#44ff44'}}>{y}</span>, <span style={{color: '#5DA7DB'}}>{z}</span>)</span>
                            </div>
                        </div>

                        <div className={styles.section}>
                            <p className={styles.label}>Quantum State |ψ⟩</p>
                            <div className={styles.mathState}>
                                |ψ⟩ = <b style={{color: '#5DA7DB'}}>{alpha}</b>|0⟩ + <i style={{color: '#ff4444'}}>{beta} · e<sup>i{phiPi}π</sup></i>|1⟩
                            </div>
                        </div>

                        <div className={styles.section}>
                            <p className={styles.label}>Probabilities</p>
                            <div className={styles.probContainer}>
                                <div className={styles.probItem}>
                                    <span className={styles.probLabel}>P(|0⟩)</span>
                                    <div className={styles.probBar}>
                                        <div className={styles.probFill} style={{ width: `${prob0 * 100}%`, background: 'var(--state-0)' }} />
                                    </div>
                                    <span className={styles.probVal}>{(prob0 * 100).toFixed(1)}%</span>
                                </div>
                                <div className={styles.probItem}>
                                    <span className={styles.probLabel}>P(|1⟩)</span>
                                    <div className={styles.probBar}>
                                        <div className={styles.probFill} style={{ width: `${prob1 * 100}%`, background: 'var(--state-1)' }} />
                                    </div>
                                    <span className={styles.probVal}>{(prob1 * 100).toFixed(1)}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {step === 'complete' && (
                <div className={styles.completionPanel}>
                    <div className={styles.badgeGlow}>🔮</div>
                    <h2 className={styles.title} style={{ fontSize: '32px' }}>Sphere Surveyor</h2>
                    <p className={styles.description} style={{ marginBottom: '30px' }}>
                        You've mastered the geometry of the qubit!
                    </p>
                    <button 
                        className={`${styles.navBtn} ${styles.nextStepBtn}`} 
                        style={{ width: '200px' }}
                        onClick={() => navigate('/learn')}
                    >
                        Continue to Hub →
                    </button>
                </div>
            )}

            <div className={styles.bottomNav}>
                <span>Drag the amber dot</span>
                <span>•</span>
                <span>Scroll to zoom</span>
                <span>•</span>
                <span>Click + drag to orbit</span>
            </div>
        </>
    )
}
