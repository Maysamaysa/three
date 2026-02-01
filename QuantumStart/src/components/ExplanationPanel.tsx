import type { Circuit } from '../lib/circuit/types';
import type { Complex } from '../lib/simulator/stateVector';
import { explainGate } from '../lib/explanations/gateExplanations';
import { explainState } from '../lib/explanations/stateExplanations';
import styles from './ExplanationPanel.module.css';

export interface ExplanationPanelProps {
  circuit: Circuit;
  stepIndex: number;
  state: Complex[];
}

export function ExplanationPanel({
  circuit,
  stepIndex,
  state,
}: ExplanationPanelProps) {
  const stateExplanation = explainState(state);
  const gateExplanation =
    stepIndex >= 0 &&
    stepIndex < circuit.length &&
    circuit[stepIndex]
      ? explainGate(circuit[stepIndex], stepIndex)
      : null;

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.title}>Explanation</h3>
      <div className={styles.section}>
        <span className={styles.label}>Current state</span>
        <p className={styles.text}>{stateExplanation}</p>
      </div>
      {gateExplanation && (
        <div className={styles.section}>
          <span className={styles.label}>Last gate applied</span>
          <p className={styles.text}>{gateExplanation}</p>
        </div>
      )}
    </div>
  );
}
