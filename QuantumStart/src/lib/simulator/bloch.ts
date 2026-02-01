import type { Complex } from './stateVector';

/**
 * Reduced density matrix for one qubit (2x2) from full state vector.
 * Qubit index: 0 = LSB.
 */
export function reducedDensityMatrix(
  state: Complex[],
  _nQubits: number,
  qubitIndex: number
): [[Complex, Complex], [Complex, Complex]] {
  const dim = state.length;
  const bit = 1 << qubitIndex;
  const rho00 = { re: 0, im: 0 };
  const rho01 = { re: 0, im: 0 };
  const rho10 = { re: 0, im: 0 };
  const rho11 = { re: 0, im: 0 };

  for (let i = 0; i < dim; i++) {
    const amp = state[i];
    const i0 = i & ~bit;
    const i1 = i | bit;
    const bitI = (i & bit) !== 0 ? 1 : 0;

    if (bitI === 0) {
      rho00.re += amp.re * amp.re + amp.im * amp.im;
      const s1 = state[i1];
      rho01.re += amp.re * s1.re + amp.im * s1.im;
      rho01.im += amp.re * s1.im - amp.im * s1.re;
    } else {
      rho11.re += amp.re * amp.re + amp.im * amp.im;
      const s0 = state[i0];
      rho10.re += s0.re * amp.re + s0.im * amp.im;
      rho10.im += s0.im * amp.re - s0.re * amp.im;
    }
  }

  return [
    [rho00, rho01],
    [{ re: rho10.re, im: -rho10.im }, rho11],
  ];
}

export interface BlochVector {
  x: number;
  y: number;
  z: number;
  /** Length of the vector; < 1 for mixed states. */
  length: number;
  isPure: boolean;
}

/**
 * Bloch vector (x, y, z) for the selected qubit from full state.
 * For pure states length ≈ 1; for mixed states length < 1.
 */
export function stateToBlochVector(
  state: Complex[],
  nQubits: number,
  qubitIndex: number
): BlochVector {
  const rho = reducedDensityMatrix(state, nQubits, qubitIndex);
  const x = 2 * rho[0][1].re;
  const y = -2 * rho[0][1].im;
  const z = 2 * rho[0][0].re - 1;
  const length = Math.sqrt(x * x + y * y + z * z);
  const isPure = length > 0.99;
  return { x, y, z, length, isPure };
}
