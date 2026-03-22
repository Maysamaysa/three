import styles from './AlgorithmsOverlay.module.css'
import type { AlgoPhase } from './AlgorithmsModule'
import { applyMatrix, getOracleMatrix, getDiffusionMatrix, type CircuitOp } from './circuitLogic'
import { AlgorithmsBuilder } from './AlgorithmsBuilder'
import { ModuleHeader } from '../../../components/ModuleHeader'

interface AlgorithmsOverlayProps {
    phase: AlgoPhase
    winningBox: number
    guessedBox: number | null
    qState?: number[]
    onApplyState?: (newState: number[]) => void
    showAverage?: boolean
    setShowAverage?: (show: boolean) => void
    onComplete: (nextPhase: AlgoPhase) => void
    panelsVisible: boolean
    builderFeedback?: string | null
    onRunCircuit?: (steps: CircuitOp[]) => void
}

const H_TENSOR_H = [
    [0.5, 0.5, 0.5, 0.5],
    [0.5, -0.5, 0.5, -0.5],
    [0.5, 0.5, -0.5, -0.5],
    [0.5, -0.5, -0.5, 0.5]
]

export function AlgorithmsOverlay({ phase, winningBox, guessedBox, qState = [], onApplyState, showAverage, setShowAverage, onComplete, panelsVisible, builderFeedback, onRunCircuit }: AlgorithmsOverlayProps) {
    const phaseIndex = phase === 'phase1_classical' ? 0 : phase === 'phase2_superposition' ? 1 : phase === 'phase3_oracle' ? 2 : phase === 'phase4_amplification' ? 3 : 4
    return (
        <div style={{ pointerEvents: 'none', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10, display: 'flex', flexDirection: 'column' }}>
            <ModuleHeader
                moduleNumber={7}
                moduleName="Quantum Algorithms"
                phases={['Setup', 'Superposition', 'Oracle', 'Amplify', 'Build']}
                currentPhase={phaseIndex}
            />
            <div className={styles.topPanel} style={{ opacity: panelsVisible ? 1 : 0, transition: 'opacity 0.5s', pointerEvents: 'auto', padding: '2rem', paddingTop: '80px' }}>
                {phase === 'phase1_classical' && (
                    <>
                        <h1>Grover's Search: The Setup</h1>
                        <p>We have 4 boxes. One contains a Golden Treat! (Our target state).</p>
                        <p>In classical computing, you have to guess one by one. Go ahead, click a box.</p>
                        {guessedBox !== null && (
                            <div className={styles.feedback}>
                                {guessedBox === winningBox ? (
                                    <p style={{ color: '#4ade80' }}>Wow, you guessed correctly on the {guessedBox === winningBox ? 'first' : 'next'} try! But normally, it takes an average of 2.25 tries.</p>
                                ) : (
                                    <p style={{ color: '#f87171' }}>Nope, box {guessedBox} is empty.</p>
                                )}
                                <button className={styles.actionBtn} onClick={() => onComplete('phase2_superposition')}>Enter Quantum Mode</button>
                            </div>
                        )}
                    </>
                )}

                {phase === 'phase2_superposition' && (
                    <>
                        <h1>Phase 1: Superposition</h1>
                        <p>In Quantum computing, we don't guess one by one. We look everywhere at once.</p>
                        <p>Click below to apply a Hadamard (H) gate to our 2 qubits, putting them in an equal superposition of all 4 box states.</p>
                        <button className={styles.actionBtn} onClick={() => {
                            if (onApplyState) onApplyState(applyMatrix(H_TENSOR_H, qState))
                            onComplete('phase3_oracle')
                        }}>
                            Apply H⊗H to Start
                        </button>
                    </>
                )}

                {phase === 'phase3_oracle' && (
                    <>
                        <h1>Phase 2: The Oracle</h1>
                        <p>We are now in equal superposition. Measurement right now gives a random 25% chance for each.</p>
                        <p>We use an <b>Oracle</b> gate. It flips the phase (amplitude) of the winning state to negative.</p>
                        
                        {qState[winningBox] > 0 ? (
                            <button className={styles.actionBtn} onClick={() => {
                                if (onApplyState) onApplyState(applyMatrix(getOracleMatrix(winningBox), qState))
                            }}>
                                Apply Oracle
                            </button>
                        ) : (
                            <div className={styles.feedback}>
                                <p style={{ color: '#7effdd' }}>Notice: Box {winningBox}'s amplitude is now -0.5.</p>
                                <p style={{ color: '#f87171', fontSize: '0.9rem', fontStyle: 'italic' }}>
                                    Wait... probability = amplitude². So (-0.5)² is still 0.25 (25%). Measuring now won't help! We need one more step.
                                </p>
                                <button className={styles.actionBtn} onClick={() => onComplete('phase4_amplification')}>
                                    Next: The Amplifier
                                </button>
                            </div>
                        )}
                    </>
                )}

                {phase === 'phase4_amplification' && (
                    <>
                        <h1>Phase 3: Amplitude Amplification</h1>
                        <p>The magic step! The Amplifier (Diffusion operator) reflects all states exactly around their <b>average</b>.</p>
                        
                        {!showAverage ? (
                            <button className={styles.actionBtn} onClick={() => {
                                if (setShowAverage) setShowAverage(true)
                            }}>
                                Show Average Line
                            </button>
                        ) : (
                            <div className={styles.feedback}>
                                <p style={{ color: '#FFD700', fontSize: '0.9rem', marginBottom: '10px' }}>
                                    The average of (+0.5, +0.5, +0.5, -0.5) is +0.25 (Yellow Line).
                                    <br/>The Amplifier will pull everyone down towards that mirror line, shrinking the positive states, and bouncing the negative state way up!
                                </p>
                                {qState[winningBox] < 0 ? (
                                    <button className={styles.actionBtn} style={{ background: '#5DA7DB' }} onClick={() => {
                                        if (onApplyState) onApplyState(applyMatrix(getDiffusionMatrix(), qState))
                                        if (setShowAverage) setShowAverage(false)
                                    }}>
                                        Invert About Average (Diffusion)
                                    </button>
                                ) : (
                                    <>
                                        <p style={{ color: '#4ade80' }}>Probability is now 100%! The target is isolated.</p>
                                        <button className={styles.actionBtn} onClick={() => onComplete('phase5_builder')}>
                                            Try it Yourself
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </>
                )}

                {phase === 'phase5_builder' && (
                    <div style={{ pointerEvents: 'auto' }}>
                        <h1>Phase 4: Build it Yourself</h1>
                        <p>Construct a Grover's Search circuit to guarantee finding the target state.</p>
                        <AlgorithmsBuilder onRunCircuit={(steps) => onRunCircuit && onRunCircuit(steps)} />
                        
                        {builderFeedback && (
                            <div className={styles.feedback} style={{ marginTop: '15px' }}>
                                <p style={{ color: builderFeedback.includes('Perfect') ? '#4ade80' : '#FFB7C5' }}>
                                    {builderFeedback}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
