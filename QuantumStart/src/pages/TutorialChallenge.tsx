import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCircuit } from '../hooks/useCircuit';
import { useSimulator } from '../hooks/useSimulator';
import { CircuitBuilder } from '../components/CircuitBuilder';
import { StepControls } from '../components/StepControls';
import { BlochSphere } from '../components/BlochSphere';
import { StateDisplay } from '../components/StateDisplay';
import { ExplanationPanel } from '../components/ExplanationPanel';
import { getChallenge, checkChallenge, getChallengeIds } from '../tutorials/challenges';
import { getStateAfterStep } from '../lib/simulator/applyGate';
import '../App.css';
import styles from './TutorialChallenge.module.css';

export function TutorialChallenge() {
  const { id } = useParams<{ id: string }>();
  const challenge = id ? getChallenge(id) : undefined;

  const circuit = useCircuit({
    initialQubitCount: challenge?.qubitCount ?? 2,
  });
  const simulator = useSimulator(circuit.circuit, circuit.qubitCount);
  const [selectedQubitIndex, setSelectedQubitIndex] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!challenge) return;
    circuit.setQubitCount(challenge.qubitCount);
    circuit.clearCircuit();
  }, [challenge?.id, circuit.setQubitCount, circuit.clearCircuit]);

  const finalState = getStateAfterStep(
    circuit.circuit,
    circuit.qubitCount,
    circuit.circuit.length > 0 ? circuit.circuit.length - 1 : -1
  );

  useEffect(() => {
    if (!challenge) return;
    const ok = checkChallenge(challenge, circuit.circuit, finalState);
    setCompleted(ok);
  }, [challenge, circuit.circuit, finalState]);

  if (!challenge) {
    return (
      <main className="app">
        <p>Challenge not found.</p>
        <Link to="/">Back to playground</Link>
      </main>
    );
  }

  const ids = getChallengeIds();
  const currentIndex = ids.indexOf(challenge.id);
  const nextId = currentIndex >= 0 && currentIndex < ids.length - 1 ? ids[currentIndex + 1] : null;
  const prevId = currentIndex > 0 ? ids[currentIndex - 1] : null;

  return (
    <main className="app">
      <header className="app-header">
        <nav className="app-nav">
          <Link to="/">Playground</Link>
          {prevId && (
            <Link to={`/tutorial/${prevId}`}>Previous challenge</Link>
          )}
          {nextId && (
            <Link to={`/tutorial/${nextId}`}>Next challenge</Link>
          )}
        </nav>
        <h1>{challenge.title}</h1>
        <p>{challenge.description}</p>
        {challenge.hint && (
          <details className={styles.hint}>
            <summary>Hint</summary>
            <p>{challenge.hint}</p>
          </details>
        )}
      </header>
      {completed && (
        <div className={styles.complete} role="alert">
          Challenge complete!
          {nextId ? (
            <Link to={`/tutorial/${nextId}`}>Next challenge</Link>
          ) : (
            <Link to="/">Back to playground</Link>
          )}
        </div>
      )}
      <section className="app-content">
        <CircuitBuilder circuit={circuit} />
        <section className="app-sim">
          <StepControls simulator={simulator} />
          <ExplanationPanel
            circuit={circuit.circuit}
            stepIndex={simulator.stepIndex}
            state={simulator.stateAtStep}
          />
          <div className="app-sim-row">
            <StateDisplay
              state={simulator.stateAtStep}
              nQubits={circuit.qubitCount}
            />
            <BlochSphere
              state={simulator.stateAtStep}
              nQubits={circuit.qubitCount}
              selectedQubitIndex={selectedQubitIndex}
              onQubitIndexChange={setSelectedQubitIndex}
            />
          </div>
        </section>
      </section>
    </main>
  );
}
