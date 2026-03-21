/**
 * Math utilities for quantum gate applications.
 * State vectors are represented as flat arrays of complex numbers:
 * Single qubit: [alpha_real, alpha_imag, beta_real, beta_imag]
 * Two qubits: [00_r, 00_i, 01_r, 01_i, 10_r, 10_i, 11_r, 11_i]
 */

export type Complex = [number, number]; // [real, imag]
export type State1Q = [number, number, number, number]; // [a_r, a_i, b_r, b_i]
export type State2Q = [number, number, number, number, number, number, number, number];

export const GATES = {
    H: [
        [1/Math.SQRT2, 0, 1/Math.SQRT2, 0],
        [1/Math.SQRT2, 0, -1/Math.SQRT2, 0]
    ],
    X: [
        [0, 0, 1, 0],
        [1, 0, 0, 0]
    ],
    Y: [
        [0, 0, 0, -1],
        [0, 1, 0, 0]
    ],
    Z: [
        [1, 0, 0, 0],
        [0, 0, -1, 0]
    ],
};

function complexMul(a: Complex, b: Complex): Complex {
    return [a[0]*b[0] - a[1]*b[1], a[0]*b[1] + a[1]*b[0]];
}

function complexAdd(a: Complex, b: Complex): Complex {
    return [a[0]+b[0], a[1]+b[1]];
}

export function applyGate1Q(gateMatrix: number[][], state: State1Q): State1Q {
    const a: Complex = [state[0], state[1]];
    const b: Complex = [state[2], state[3]];
    
    // row 0
    const m00: Complex = [gateMatrix[0][0], gateMatrix[0][1]];
    const m01: Complex = [gateMatrix[0][2], gateMatrix[0][3]];
    const newA = complexAdd(complexMul(m00, a), complexMul(m01, b));
    
    // row 1
    const m10: Complex = [gateMatrix[1][0], gateMatrix[1][1]];
    const m11: Complex = [gateMatrix[1][2], gateMatrix[1][3]];
    const newB = complexAdd(complexMul(m10, a), complexMul(m11, b));
    
    return [newA[0], newA[1], newB[0], newB[1]];
}

export function applyCNOT(control: number, target: number, state: State2Q): State2Q {
    // 00, 01, 10, 11
    const newState = [...state] as State2Q;
    if (control === 0 && target === 1) { // Control=Q0, Target=Q1 (using big-endian or little-endian, let's define Q0 is left bit)
        // Swap 10 and 11
        newState[4] = state[6]; newState[5] = state[7];
        newState[6] = state[4]; newState[7] = state[5];
    } else if (control === 1 && target === 0) {
        // Swap 01 and 11
        newState[2] = state[6]; newState[3] = state[7];
        newState[6] = state[2]; newState[7] = state[3];
    }
    return newState;
}

export function stateToBloch(state: State1Q): { theta: number, phi: number } {
    const [ar, ai, br, bi] = state;
    
    // Find phase of alpha to remove global phase
    const alphaPhase = Math.atan2(ai, ar);
    
    // Rotate beta by -alphaPhase
    const bRot_r = br * Math.cos(-alphaPhase) - bi * Math.sin(-alphaPhase);
    const bRot_i = br * Math.sin(-alphaPhase) + bi * Math.cos(-alphaPhase);
    
    const alphaMag = Math.sqrt(ar*ar + ai*ai);
    
    const theta = 2 * Math.acos(Math.max(-1, Math.min(1, alphaMag)));
    const phi = Math.atan2(bRot_i, bRot_r);
    
    return { theta, phi };
}

// Single Qubit to 2-Qubit product state: |q0> \otimes |q1>
export function tensorProduct(q0: State1Q, q1: State1Q): State2Q {
    const a0: Complex = [q0[0], q0[1]];
    const b0: Complex = [q0[2], q0[3]];
    const a1: Complex = [q1[0], q1[1]];
    const b1: Complex = [q1[2], q1[3]];
    
    const s00 = complexMul(a0, a1);
    const s01 = complexMul(a0, b1);
    const s10 = complexMul(b0, a1);
    const s11 = complexMul(b0, b1);
    
    return [s00[0], s00[1], s01[0], s01[1], s10[0], s10[1], s11[0], s11[1]];
}

export function getPartialState(state: State2Q, qubit: 0 | 1): State1Q {
    // Calculates reduced density matrix then finds closest pure state, 
    // or just assume standard pure separable states.
    // For visual purposes, we will just measure probability amplitudes.
    if (qubit === 0) {
        // q0 is the first bit. It is a linear combination of |0> (00 + 01) and |1> (10 + 11)
        const prob0 = state[0]*state[0]+state[1]*state[1] + state[2]*state[2]+state[3]*state[3];
        const prob1 = state[4]*state[4]+state[5]*state[5] + state[6]*state[6]+state[7]*state[7];
        return [Math.sqrt(prob0), 0, Math.sqrt(prob1), 0]; // simplified fallback
    } else {
        const prob0 = state[0]*state[0]+state[1]*state[1] + state[4]*state[4]+state[5]*state[5];
        const prob1 = state[2]*state[2]+state[3]*state[3] + state[6]*state[6]+state[7]*state[7];
        return [Math.sqrt(prob0), 0, Math.sqrt(prob1), 0];
    }
}

export function isEntangled(state: State2Q): boolean {
    // Check if separable: det of coefficient matrix = ad - bc = 0
    // Matrix: [s00 s01 ; s10 s11]
    const s00: Complex = [state[0], state[1]];
    const s01: Complex = [state[2], state[3]];
    const s10: Complex = [state[4], state[5]];
    const s11: Complex = [state[6], state[7]];
    
    const ad = complexMul(s00, s11);
    const bc = complexMul(s01, s10);
    
    const diffR = Math.abs(ad[0] - bc[0]);
    const diffI = Math.abs(ad[1] - bc[1]);
    
    return diffR > 0.001 || diffI > 0.001;
}

export function formatStateString(state: State1Q): string {
    const { theta, phi } = stateToBloch(state);
    if (theta < 0.01) return '|0⟩';
    if (Math.abs(theta - Math.PI) < 0.01) return '|1⟩';
    
    if (Math.abs(theta - Math.PI/2) < 0.01) {
        if (Math.abs(phi) < 0.01) return '|+⟩';
        if (Math.abs(phi - Math.PI) < 0.01 || Math.abs(phi + Math.PI) < 0.01) return '|−⟩';
        if (Math.abs(phi - Math.PI/2) < 0.01) return '|i⟩';
        if (Math.abs(phi + Math.PI/2) < 0.01) return '|−i⟩';
    }
    
    return '|ψ⟩';
}

export const INITIAL_STATE: State1Q = [1, 0, 0, 0];
