import type { Gate } from '../circuit/types';
import { isTwoQubitGate } from '../circuit/types';

/**
 * Plain-language explanation for a gate at a given step.
 */
export function explainGate(gate: Gate, stepIndex: number): string {
  const step = stepIndex + 1;
  if (isTwoQubitGate(gate.type)) {
    const c = gate.controls?.[0] ?? gate.targets[0];
    const t = gate.targets[0];
    if (gate.type === 'CNOT') {
      return `Step ${step}: The CNOT gate uses qubit ${c} as control and qubit ${t} as target. When the control is 1, it flips the target; otherwise the target stays the same. This creates entanglement between the two qubits.`;
    }
    if (gate.type === 'CZ') {
      return `Step ${step}: The CZ gate applies a phase flip (Z) to qubit ${t} only when qubit ${c} is 1. Both qubits stay in 0 or 1, but the sign of the state can change.`;
    }
  }
  const target = gate.targets[0];
  switch (gate.type) {
    case 'H':
      return `Step ${step}: The Hadamard gate on qubit ${target} puts it into an equal superposition of 0 and 1. So instead of being definitely 0 or 1, it's "half of each" until you measure.`;
    case 'X':
      return `Step ${step}: The X gate flips qubit ${target} from 0 to 1 or from 1 to 0. It's like a quantum NOT.`;
    case 'Y':
      return `Step ${step}: The Y gate flips qubit ${target} and adds a phase. It's a combination of X and Z.`;
    case 'Z':
      return `Step ${step}: The Z gate leaves 0 and 1 as they are but flips the sign of the 1 part. So the state stays "the same" in terms of 0 vs 1, but the phase changes.`;
    case 'S':
      return `Step ${step}: The S gate is a "quarter turn" phase gate on qubit ${target}. It adds a 90° phase to the 1 part.`;
    case 'T':
      return `Step ${step}: The T gate is an "eighth turn" phase gate on qubit ${target}. It adds a 45° phase to the 1 part.`;
    default: {
      const t = gate.targets[0];
      return `Step ${step}: A gate was applied to qubit ${t}.`;
    }
  }
}
