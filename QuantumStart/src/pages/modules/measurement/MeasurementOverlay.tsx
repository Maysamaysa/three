import { useNavigate } from 'react-router-dom'
import styles from './MeasurementOverlay.module.css'
import type { Basis, Phase } from './MeasurementModule'

interface Props {
    phase: Phase
    step: number
    theta: number
    setTheta: (t: number) => void
    phi: number
    setPhi: (p: number) => void
    isMeasured: boolean
    measuredValue: 0 | 1 | null
    basis: Basis
    setBasis: (b: Basis) => void
    histogram: { 0: number, 1: number }
    shotsTaken: number
    quizQuestion: number
    onMeasure: () => void
    onReset: () => void
    onRun50: () => void
    onClearHistogram: () => void
    onNext: () => void
    onBack: () => void
    onQuizAnswer: (correct: boolean) => void
}

export function MeasurementOverlay({
    phase, step, theta, setTheta, isMeasured, measuredValue, basis, setBasis,
    histogram, shotsTaken, quizQuestion, onMeasure, onReset, onRun50, onClearHistogram, onNext, onBack, onQuizAnswer
}: Props) {
    const navigate = useNavigate()

    const renderConcept = () => {
        const specs = [
            {
                title: "The core idea",
                desc: "This qubit is in superposition. It has no definite value. The moment we look — we force it to decide.",
                hint: "Think of it like a spinning coin. While it's spinning, it's neither heads nor tails. The moment it lands, that's measurement."
            },
            {
                title: "Before vs After",
                desc: "Any point on the sphere collapses to one of exactly two poles when measured along the Z-axis.",
                hint: "Left: Superposition. Right: Collapsed to |0⟩."
            },
            {
                title: "The one-way door",
                desc: "You cannot un-measure. The superposition is gone forever. To get it back, you must prepare a new qubit.",
                hint: "Observation is irreversible."
            }
        ][step - 1]

        return (
            <div className={styles.instructionPanel}>
                <span className={styles.stepText}>Phase 1 — Concept {step}/3</span>
                <h2 className={styles.title}>{specs.title}</h2>
                <p className={styles.description}>{specs.desc}</p>
                <div className={styles.hintBox}>💡 <span>{specs.hint}</span></div>
                <div className={styles.btnRow}>
                    <button className={`${styles.navBtn} ${styles.backStepBtn}`} onClick={onBack} disabled={step === 1}>← Back</button>
                    <button className={`${styles.navBtn} ${styles.nextStepBtn}`} onClick={onNext}>Next →</button>
                </div>
            </div>
        )
    }

    const renderCollapse = () => {
        const total = histogram[0] + histogram[1]
        return (
            <div className={styles.instructionPanel}>
                <span className={styles.stepText}>Phase 2 — Feel the collapse</span>
                <h2 className={styles.title}>The Act of Measurement</h2>
                <p className={styles.description}>
                    {isMeasured 
                        ? `The wave function collapsed to |${measuredValue}⟩! Notice how the state arrow snapped to the pole.` 
                        : "The qubit is in equal superposition |+⟩. What will it be when you measure it?"}
                </p>

                {!isMeasured ? (
                    <button className={styles.measureBtn} onClick={onMeasure}>MEASURE</button>
                ) : (
                    <div className={styles.btnRow} style={{ marginBottom: 12 }}>
                        <button className={styles.optionBtn} onClick={onReset}>Reset & measure again</button>
                        <button className={styles.optionBtn} onClick={onRun50}>Run 50 times</button>
                    </div>
                )}

                {total > 0 && (
                    <>
                        <div className={styles.histogram}>
                            <div className={styles.barCol}>
                                <div className={styles.barContainer}>
                                    <div className={styles.barFill0} style={{ height: `${Math.max(5, (histogram[0]/total)*100)}%` }} />
                                    <div className={styles.barCount}>{histogram[0]}</div>
                                </div>
                                <div className={styles.barLabel}>|0⟩</div>
                            </div>
                            <div className={styles.barCol}>
                                <div className={styles.barContainer}>
                                    <div className={styles.barFill1} style={{ height: `${Math.max(5, (histogram[1]/total)*100)}%` }} />
                                    <div className={styles.barCount}>{histogram[1]}</div>
                                </div>
                                <div className={styles.barLabel}>|1⟩</div>
                            </div>
                        </div>
                        {total >= 50 && (
                            <p style={{ fontSize: '0.8rem', color: '#ffb7c5', margin: '16px 0' }}>
                                Even though the qubit started in the same state every time, each measurement is truly random. This isn't ignorance — it's fundamental.
                            </p>
                        )}
                    </>
                )}

                <div className={styles.btnRow} style={{ marginTop: 24 }}>
                    <button className={`${styles.navBtn} ${styles.backStepBtn}`} onClick={onBack}>← Back</button>
                    <button className={`${styles.navBtn} ${styles.nextStepBtn}`} onClick={onNext} disabled={total === 0}>Next Phase →</button>
                </div>
            </div>
        )
    }

    const renderSandbox = () => {
        const p0 = Math.pow(Math.cos(theta/2), 2) * 100
        const alpha = Math.cos(theta/2).toFixed(2)
        const beta = Math.sin(theta/2).toFixed(2)
        const total = histogram[0] + histogram[1]

        return (
            <div className={styles.instructionPanel}>
                <span className={styles.stepText}>Phase 3 — Born Rule & Basis</span>
                <h2 className={styles.title}>Probability Sandbox</h2>
                
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: 12, borderRadius: 12, marginBottom: 16 }}>
                    <div style={{ fontFamily: 'Space Mono', color: '#5DA7DB', marginBottom: 8 }}>|ψ⟩ = {alpha}|0⟩ + {beta}|1⟩</div>
                    <div style={{ fontSize: '0.85rem', color: '#ccc', marginBottom: 8 }}>P(0) = |α|² = {p0.toFixed(1)}%</div>
                    
                    <input 
                        type="range" 
                        min="0" max="100" 
                        value={100 - (theta / Math.PI) * 100} 
                        onChange={(e) => {
                            setTheta(Math.PI * (1 - parseInt(e.target.value)/100))
                            onClearHistogram()
                            onReset()
                        }}
                        style={{ width: '100%' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: 4, color: '#888' }}>
                        <span>100% |1⟩</span>
                        <span>100% |0⟩</span>
                    </div>
                </div>

                <div className={styles.btnRow} style={{ marginBottom: 16, background: 'rgba(0,0,0,0.2)', padding: 4, borderRadius: 12 }}>
                    {(['Z', 'X', 'Y'] as Basis[]).map(b => (
                        <button 
                            key={b}
                            className={`${styles.optionBtn} ${basis === b ? styles.active : ''}`}
                            style={{ background: basis === b ? 'rgba(255,255,255,0.2)' : 'transparent', border: 'none' }}
                            onClick={() => { setBasis(b); onClearHistogram(); onReset(); }}
                        >
                            {b}-Basis
                        </button>
                    ))}
                </div>

                {!isMeasured ? (
                    <button className={styles.measureBtn} onClick={onMeasure} style={{ padding: '12px 0', fontSize: '1rem', letterSpacing: 0 }}>MEASURE (x1)</button>
                ) : (
                    <button className={styles.optionBtn} onClick={onReset} style={{ width: '100%', marginBottom: 12 }}>Reset Component</button>
                )}
                
                <button className={styles.optionBtn} onClick={onRun50} style={{ width: '100%', marginBottom: 12 }}>Run 50 shots</button>

                {total > 0 && (
                    <div className={styles.histogram} style={{ height: 80 }}>
                        <div className={styles.barCol}>
                            <div className={styles.barContainer}>
                                <div className={styles.barFill0} style={{ height: `${Math.max(5, (histogram[0]/total)*100)}%` }} />
                                <div className={styles.barCount}>{histogram[0]}</div>
                            </div>
                            <div className={styles.barLabel}>{basis === 'Z' ? '|0⟩' : basis === 'X' ? '|+⟩' : '|i+⟩'}</div>
                        </div>
                        <div className={styles.barCol}>
                            <div className={styles.barContainer}>
                                <div className={styles.barFill1} style={{ height: `${Math.max(5, (histogram[1]/total)*100)}%` }} />
                                <div className={styles.barCount}>{histogram[1]}</div>
                            </div>
                            <div className={styles.barLabel}>{basis === 'Z' ? '|1⟩' : basis === 'X' ? '|-⟩' : '|i-⟩'}</div>
                        </div>
                    </div>
                )}

                <div className={styles.btnRow} style={{ marginTop: 24 }}>
                    <button className={`${styles.navBtn} ${styles.backStepBtn}`} onClick={onBack}>← Back</button>
                    <button className={`${styles.navBtn} ${styles.nextStepBtn}`} onClick={onNext}>Start Quiz →</button>
                </div>
            </div>
        )
    }

    const renderQuiz = () => {
        const Q = [
            {
                q: "If the state vector is exactly halfway between the North and South pole (|+⟩), what is P(0)?",
                opts: [{l: "100%", c: false}, {l: "50%", c: true}, {l: "0%", c: false}, {l: "Depends on phase φ", c: false}]
            },
            {
                q: "A histogram shows 75 shots for |0⟩ and 25 shots for |1⟩. Where does the state vector likely point?",
                opts: [{l: "Closer to North Pole", c: true}, {l: "Closer to South Pole", c: false}, {l: "Exactly on Equator", c: false}, {l: "It points at the cat", c: false}]
            },
            {
                q: "If you prepare |0⟩ and measure in the X-basis, what do you get?",
                opts: [{l: "Always |+⟩", c: false}, {l: "Always |0⟩", c: false}, {l: "50% |+⟩ and 50% |-⟩", c: true}, {l: "Measurement fails", c: false}]
            }
        ][quizQuestion - 1]

        if (!Q) return null;

        return (
            <div className={styles.instructionPanel}>
                <span className={styles.stepText}>Phase 4 — Final Challenge {quizQuestion}/3</span>
                <h2 className={styles.title}>Knowledge Check</h2>
                <p className={styles.description}>{Q.q}</p>
                <div style={{ display: 'grid', gap: '10px' }}>
                    {Q.opts.map((opt, i) => (
                        <button key={i} className={styles.quizOption} onClick={() => onQuizAnswer(opt.c)}>
                            {opt.l}
                        </button>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className={styles.container}>
            <div className={styles.phasePill}>MODULE 4 — Measurement</div>
            <div className={styles.shotsCounter}>SHOTS: {shotsTaken}</div>
            <button className={styles.backBtn} onClick={() => navigate('/learn')}>← Hub</button>

            <div className={styles.sidebar}>
                {phase === 'concept' && renderConcept()}
                {phase === 'collapse' && renderCollapse()}
                {phase === 'sandbox' && renderSandbox()}
                {phase === 'quiz' && renderQuiz()}
                {phase === 'complete' && (
                    <div className={styles.instructionPanel}>
                         <div style={{fontSize: 40, textAlign: 'center', marginBottom: 16}}>👁️</div>
                         <h2 className={styles.title} style={{textAlign: 'center'}}>Wave Collapser</h2>
                         <p className={styles.description} style={{textAlign: 'center'}}>You have mastered the irreversible act of quantum measurement.</p>
                         <button className={styles.measureBtn} onClick={() => navigate('/learn')}>Return to Hub</button>
                    </div>
                )}
            </div>
        </div>
    )
}
