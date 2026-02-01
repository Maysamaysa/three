/**
 * Gate types supported by the simulator.
 * Single-qubit: H, X, Y, Z, S, T
 * Two-qubit: CNOT, CZ
 */
export type SingleQubitGateType = 'H' | 'X' | 'Y' | 'Z' | 'S' | 'T';
export type TwoQubitGateType = 'CNOT' | 'CZ';
export type GateType = SingleQubitGateType | TwoQubitGateType;

export function isTwoQubitGate(type: GateType): type is TwoQubitGateType {
  return type === 'CNOT' || type === 'CZ';
}

/** A single gate in the circuit (immutable). */
export interface Gate {
  readonly type: GateType;
  /** Qubit index(es) the gate acts on. For CNOT/CZ: [control, target]. */
  readonly targets: readonly number[];
  /** For CNOT/CZ: control qubit index. Stored in targets[0] for CNOT/CZ; this is for clarity. */
  readonly controls?: readonly number[];
}

/** Full circuit: ordered list of gates. */
export type Circuit = readonly Gate[];

/** Build a single-qubit gate. */
export function singleQubitGate(type: SingleQubitGateType, target: number): Gate {
  return { type, targets: [target] };
}

/** Build a two-qubit gate (control, target). */
export function twoQubitGate(
  type: TwoQubitGateType,
  control: number,
  target: number
): Gate {
  return { type, targets: [target], controls: [control] };
}

/** Minimum and maximum qubit counts. */
export const MIN_QUBITS = 2;
export const MAX_QUBITS = 8;
