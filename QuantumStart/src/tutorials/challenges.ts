import type { Circuit } from '../lib/circuit/types';
import { getStateAfterStep } from '../lib/simulator/applyGate';
import type { Complex } from '../lib/simulator/stateVector';
import { normSq } from '../lib/simulator/stateVector';

export type ChallengeCheck = 
  | { kind: 'circuit_has_gate'; gateType: string; qubit?: number }
  | { kind: 'final_state_basis'; basis: string }
  | { kind: 'circuit_length'; minLength: number }
  | { kind: 'custom'; check: (circuit: Circuit, qubitCount: number, state: Complex[]) => boolean };

export interface Challenge {
  id: string;
  title: string;
  description: string;
  hint?: string;
  qubitCount: number;
  /** Optional: suggested or required gates to have. */
  checks: ChallengeCheck[];
}

const THRESHOLD = 1e-6;

function stateMatchesBasis(state: Complex[], basis: string): boolean {
  const n = basis.length;
  const dim = 2 ** n;
  if (state.length !== dim) return false;
  const idx = parseInt(basis, 2);
  if (Number.isNaN(idx) || idx < 0 || idx >= dim) return false;
  for (let i = 0; i < dim; i++) {
    const p = normSq(state[i]);
    if (i === idx && p < 1 - THRESHOLD) return false;
    if (i !== idx && p > THRESHOLD) return false;
  }
  return true;
}

function circuitHasGate(circuit: Circuit, gateType: string, qubit?: number): boolean {
  return circuit.some((g) => {
    if (g.type !== gateType) return false;
    if (qubit !== undefined) {
      const targets = [...g.targets, ...(g.controls ?? [])];
      return targets.includes(qubit);
    }
    return true;
  });
}

export function checkChallenge(
  challenge: Challenge,
  circuit: Circuit,
  state: Complex[]
): boolean {
  const n = challenge.qubitCount;
  const finalState = getStateAfterStep(circuit, n, circuit.length - 1);
  const stateToCheck = circuit.length > 0 ? finalState : state;

  for (const c of challenge.checks) {
    switch (c.kind) {
      case 'circuit_has_gate':
        if (!circuitHasGate(circuit, c.gateType, c.qubit)) return false;
        break;
      case 'final_state_basis':
        if (!stateMatchesBasis(stateToCheck, c.basis)) return false;
        break;
      case 'circuit_length':
        if (circuit.length < c.minLength) return false;
        break;
      case 'custom':
        if (!c.check(circuit, n, stateToCheck)) return false;
        break;
    }
  }
  return true;
}

export const CHALLENGES: Challenge[] = [
  {
    id: 'add-hadamard',
    title: 'Add a Hadamard gate',
    description: 'Drag a Hadamard (H) gate from the palette onto the circuit and drop it on qubit 0. Then run the simulation to see the qubit go into a superposition.',
    hint: 'The H gate is in the "Single qubit" section of the palette. Drop it on the first wire (q0).',
    qubitCount: 2,
    checks: [{ kind: 'circuit_has_gate', gateType: 'H', qubit: 0 }],
  },
  {
    id: 'create-bell-pair',
    title: 'Create a Bell pair',
    description: 'Build a circuit that creates a Bell pair: put qubit 0 in superposition with H, then apply CNOT with control 0 and target 1. The final state should be (|00⟩ + |11⟩)/√2.',
    hint: 'Add H on qubit 0, then add CNOT with control on qubit 0 and target on qubit 1. Run to the end and check the state.',
    qubitCount: 2,
    checks: [
      { kind: 'circuit_has_gate', gateType: 'H' },
      { kind: 'circuit_has_gate', gateType: 'CNOT' },
      {
        kind: 'custom',
        check: (_circuit, n, state) => {
          const dim = 2 ** n;
          const p00 = normSq(state[0]);
          const p11 = dim >= 4 ? normSq(state[3]) : 0;
          return p00 > 0.4 && p11 > 0.4 && p00 + p11 > 0.99;
        },
      },
    ],
  },
  {
    id: 'two-hadamards',
    title: 'Two Hadamards',
    description: 'Put both qubit 0 and qubit 1 into superposition by adding an H gate on each. Run to the end; you should see a superposition over all four basis states |00⟩, |01⟩, |10⟩, |11⟩ with equal probability.',
    hint: 'Add H on q0 and H on q1. Then run to the end.',
    qubitCount: 2,
    checks: [
      { kind: 'circuit_has_gate', gateType: 'H', qubit: 0 },
      { kind: 'circuit_has_gate', gateType: 'H', qubit: 1 },
      { kind: 'circuit_length', minLength: 2 },
    ],
  },
  {
    id: 'flip-and-cnot',
    title: 'Flip and entangle',
    description: 'Apply an X gate on qubit 0 (to flip it to 1), then apply CNOT with control 0 and target 1. Run to the end. You should get |11⟩.',
    hint: 'Add X on q0, then CNOT control 0 target 1.',
    qubitCount: 2,
    checks: [{ kind: 'final_state_basis', basis: '11' }],
  },
  {
    id: 'phase-gate',
    title: 'Use a phase gate',
    description: 'Add an S or T gate on qubit 0 after a Hadamard. These gates change the phase of the |1⟩ part without changing the 0/1 probabilities.',
    hint: 'Add H on q0, then S or T on q0.',
    qubitCount: 2,
    checks: [
      { kind: 'circuit_has_gate', gateType: 'H' },
      {
        kind: 'custom',
        check: (circuit) =>
          circuit.some((g) => g.type === 'S' || g.type === 'T'),
      },
    ],
  },
];

export function getChallenge(id: string): Challenge | undefined {
  return CHALLENGES.find((c) => c.id === id);
}

export function getChallengeIds(): string[] {
  return CHALLENGES.map((c) => c.id);
}
