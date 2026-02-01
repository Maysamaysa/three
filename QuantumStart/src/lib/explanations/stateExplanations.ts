import type { Complex } from '../simulator/stateVector';
import { normSq } from '../simulator/stateVector';

const THRESHOLD = 1e-6;

/**
 * Plain-language explanation of the current state vector.
 */
export function explainState(state: Complex[]): string {
  const n = Math.log2(state.length);
  if (!Number.isInteger(n) || n <= 0) return 'Invalid state.';

  const terms: { basis: string; p: number }[] = [];
  for (let i = 0; i < state.length; i++) {
    const p = normSq(state[i]);
    if (p > THRESHOLD) {
      terms.push({ basis: i.toString(2).padStart(n, '0'), p });
    }
  }

  if (terms.length === 0) return 'The state is zero (no probability on any basis state).';
  if (terms.length === 1 && terms[0].p > 1 - THRESHOLD) {
    return `The system is in the state |${terms[0].basis}⟩ with (essentially) 100% probability. All qubits are in a definite 0 or 1.`;
  }

  const superPos = terms.length > 1;
  const summary =
    superPos
      ? `The system is in a superposition of ${terms.length} basis state${terms.length > 1 ? 's' : ''}. When you measure, you'll see one of these outcomes with the probabilities shown.`
      : `The system is in |${terms[0].basis}⟩.`;

  return summary;
}

/**
 * Short one-line summary for the current step (e.g. for tooltip or panel).
 */
export function explainStateShort(state: Complex[]): string {
  const n = Math.log2(state.length);
  if (!Number.isInteger(n) || n <= 0) return 'Invalid state.';

  const terms: { basis: string; p: number }[] = [];
  for (let i = 0; i < state.length; i++) {
    const p = normSq(state[i]);
    if (p > THRESHOLD) terms.push({ basis: i.toString(2).padStart(n, '0'), p });
  }

  if (terms.length === 0) return 'State is zero.';
  if (terms.length === 1 && terms[0].p > 1 - THRESHOLD) {
    return `In state |${terms[0].basis}⟩.`;
  }
  return `Superposition over ${terms.length} states.`;
}
