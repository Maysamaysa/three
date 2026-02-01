import type { Complex } from '../lib/simulator/stateVector';
import { toKetString, getProbabilities } from '../lib/simulator/stateVector';
import styles from './StateDisplay.module.css';

export interface StateDisplayProps {
  state: Complex[];
  nQubits: number;
}

export function StateDisplay({ state }: StateDisplayProps) {
  const ket = toKetString(state);
  const probs = getProbabilities(state);
  const n = Math.log2(state.length);
  if (!Number.isInteger(n) || n <= 0) return null;
  const basisLabels = Array.from(
    { length: state.length },
    (_, i) => i.toString(2).padStart(n, '0')
  );

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.title}>State</h3>
      <div className={styles.ket}>
        <code>{ket}</code>
      </div>
      <div className={styles.probs}>
        <span className={styles.probsLabel}>Probabilities:</span>
        <div className={styles.bars}>
          {probs.map((p, i) => (
            <div key={i} className={styles.barRow}>
              <span className={styles.basisLabel}>|{basisLabels[i]}⟩</span>
              <div className={styles.barTrack}>
                <div
                  className={styles.barFill}
                  style={{ width: `${Math.min(100, p * 100)}%` }}
                />
              </div>
              <span className={styles.barPct}>
                {(p * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
