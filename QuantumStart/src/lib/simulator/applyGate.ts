import type { Circuit, Gate } from '../circuit/types';
import { isTwoQubitGate } from '../circuit/types';
import type { Complex } from './stateVector';
import { add, mul } from './stateVector';
import { gateMatrices, getCNOTMatrix, getCZMatrix } from './gates';
import type { Matrix2x2 } from './gates';
import { initialState } from './stateVector';

/**
 * Apply a 2x2 single-qubit gate to the state vector.
 * Gate acts on the qubit at position `qubitIndex` (0 = least significant bit).
 */
export function applySingleQubitGate(
  state: Complex[],
  _nQubits: number,
  qubitIndex: number,
  matrix: Matrix2x2
): Complex[] {
  const dim = state.length;
  const newState = state.map((z) => ({ ...z }));
  const bit = 1 << qubitIndex;
  for (let i = 0; i < dim; i++) {
    if ((i & bit) !== 0) continue; // process each pair once: lower index
    const j = i | bit;
    const a = state[i];
    const b = state[j];
    newState[i] = add(mul(matrix[0][0], a), mul(matrix[0][1], b));
    newState[j] = add(mul(matrix[1][0], a), mul(matrix[1][1], b));
  }
  return newState;
}

/**
 * Apply a 4x4 two-qubit gate (control, target) to the state vector.
 * control and target are qubit indices (0 = LSB).
 */
export function applyTwoQubitGate(
  state: Complex[],
  _nQubits: number,
  control: number,
  target: number,
  matrix: Complex[][]
): Complex[] {
  const dim = state.length;
  const newState = state.map((z) => ({ ...z }));
  const cBit = 1 << control;
  const tBit = 1 << target;
  const mask = cBit | tBit;
  for (let rest = 0; rest < dim; rest++) {
    if (rest & mask) continue; // rest has control/target bits 0 only
    const i00 = rest;
    const i01 = rest | tBit;
    const i10 = rest | cBit;
    const i11 = rest | cBit | tBit;
    const v0 = state[i00];
    const v1 = state[i01];
    const v2 = state[i10];
    const v3 = state[i11];
    newState[i00] = add(
      add(mul(matrix[0][0], v0), mul(matrix[0][1], v1)),
      add(mul(matrix[0][2], v2), mul(matrix[0][3], v3))
    );
    newState[i01] = add(
      add(mul(matrix[1][0], v0), mul(matrix[1][1], v1)),
      add(mul(matrix[1][2], v2), mul(matrix[1][3], v3))
    );
    newState[i10] = add(
      add(mul(matrix[2][0], v0), mul(matrix[2][1], v1)),
      add(mul(matrix[2][2], v2), mul(matrix[2][3], v3))
    );
    newState[i11] = add(
      add(mul(matrix[3][0], v0), mul(matrix[3][1], v1)),
      add(mul(matrix[3][2], v2), mul(matrix[3][3], v3))
    );
  }
  return newState;
}

/**
 * Apply one gate to the state vector. Returns a new state (does not mutate).
 */
export function applyGate(
  state: Complex[],
  nQubits: number,
  gate: Gate
): Complex[] {
  if (isTwoQubitGate(gate.type)) {
    const control = gate.controls?.[0] ?? gate.targets[0];
    const target = gate.targets[0];
    const matrix =
      gate.type === 'CNOT' ? getCNOTMatrix() : getCZMatrix();
    return applyTwoQubitGate(state, nQubits, control, target, matrix);
  }
  const target = gate.targets[0];
  const matrix = gateMatrices[gate.type];
  if (!matrix) return state;
  return applySingleQubitGate(state, nQubits, target, matrix);
}

/**
 * Run the circuit from |0...0⟩ up to and including gate at stepIndex.
 * stepIndex 0 = after first gate; stepIndex -1 or no gates = initial state.
 */
export function getStateAfterStep(
  circuit: Circuit,
  qubitCount: number,
  stepIndex: number
): Complex[] {
  let state = initialState(qubitCount);
  const n = circuit.length;
  if (n === 0 || stepIndex < 0) return state;
  const last = Math.min(stepIndex, n - 1);
  for (let k = 0; k <= last; k++) {
    state = applyGate(state, qubitCount, circuit[k]);
  }
  return state;
}
