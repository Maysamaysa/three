import type { Circuit, Gate } from './types';
import { isTwoQubitGate, MIN_QUBITS, MAX_QUBITS } from './types';

export interface ValidationError {
  kind: 'qubit_count' | 'gate_target' | 'gate_control' | 'duplicate_qubit';
  message: string;
  gateIndex?: number;
}

/**
 * Validates that qubitCount is within allowed range.
 */
export function validateQubitCount(qubitCount: number): ValidationError | null {
  if (typeof qubitCount !== 'number' || !Number.isInteger(qubitCount)) {
    return { kind: 'qubit_count', message: 'Qubit count must be an integer.' };
  }
  if (qubitCount < MIN_QUBITS || qubitCount > MAX_QUBITS) {
    return {
      kind: 'qubit_count',
      message: `Qubit count must be between ${MIN_QUBITS} and ${MAX_QUBITS}.`,
    };
  }
  return null;
}

/**
 * Validates a single gate against qubit count.
 */
function validateGate(gate: Gate, qubitCount: number, gateIndex: number): ValidationError | null {
  const indices = [...(gate.targets || []), ...(gate.controls || [])];
  for (const i of indices) {
    if (typeof i !== 'number' || !Number.isInteger(i) || i < 0 || i >= qubitCount) {
      return {
        kind: 'gate_target',
        message: `Gate at index ${gateIndex}: qubit index ${i} is out of range [0, ${qubitCount - 1}].`,
        gateIndex,
      };
    }
  }
  if (isTwoQubitGate(gate.type)) {
    const [c, t] = gate.controls && gate.controls.length ? [gate.controls[0], gate.targets[0]] : [gate.targets[0], gate.targets[1]];
    if (c === t) {
      return {
        kind: 'duplicate_qubit',
        message: `Gate at index ${gateIndex}: control and target must be different qubits.`,
        gateIndex,
      };
    }
  }
  return null;
}

/**
 * Validates the full circuit for a given qubit count.
 */
export function validateCircuit(circuit: Circuit, qubitCount: number): ValidationError[] {
  const err = validateQubitCount(qubitCount);
  const errors: ValidationError[] = err ? [err] : [];
  circuit.forEach((gate, i) => {
    const e = validateGate(gate, qubitCount, i);
    if (e) errors.push(e);
  });
  return errors;
}

/**
 * Returns true if the circuit is valid.
 */
export function isCircuitValid(circuit: Circuit, qubitCount: number): boolean {
  return validateCircuit(circuit, qubitCount).length === 0;
}
