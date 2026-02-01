import type { Complex } from './stateVector';
import { complex } from './stateVector';

/** 1/sqrt(2) */
const invSqrt2 = 1 / Math.SQRT2;

/** Single-qubit gate as 2x2 matrix (row-major: [row][col]). */
export type Matrix2x2 = [[Complex, Complex], [Complex, Complex]];

const one = (): Complex => ({ re: 1, im: 0 });
const zero = (): Complex => ({ re: 0, im: 0 });
const i = (): Complex => ({ re: 0, im: 1 });
const minusI = (): Complex => ({ re: 0, im: -1 });
const half = (): Complex => ({ re: invSqrt2, im: 0 });
const minusHalf = (): Complex => ({ re: -invSqrt2, im: 0 });

export const gateMatrices: Record<string, Matrix2x2> = {
  H: [
    [half(), half()],
    [half(), minusHalf()],
  ],
  X: [
    [zero(), one()],
    [one(), zero()],
  ],
  Y: [
    [zero(), minusI()],
    [i(), zero()],
  ],
  Z: [
    [one(), zero()],
    [zero(), { re: -1, im: 0 }],
  ],
  S: [
    [one(), zero()],
    [zero(), i()],
  ],
  T: [
    [one(), zero()],
    [zero(), complex(Math.SQRT1_2, Math.SQRT1_2)],
  ],
};

/** CNOT: control 0 → target 1. 4x4 matrix (row-major). */
export function getCNOTMatrix(): Complex[][] {
  // |00⟩→|00⟩, |01⟩→|01⟩, |10⟩→|11⟩, |11⟩→|10⟩
  const dim = 4;
  const m: Complex[][] = Array.from({ length: dim }, () =>
    Array.from({ length: dim }, () => zero())
  );
  m[0][0] = one(); // 00 -> 00
  m[1][1] = one(); // 01 -> 01
  m[2][3] = one(); // 10 -> 11
  m[3][2] = one(); // 11 -> 10
  return m;
}

/** CZ: control 0, target 1. 4x4: apply Z on target when control is 1. */
export function getCZMatrix(): Complex[][] {
  // |00⟩→|00⟩, |01⟩→|01⟩, |10⟩→|10⟩, |11⟩→-|11⟩
  const dim = 4;
  const m: Complex[][] = Array.from({ length: dim }, () =>
    Array.from({ length: dim }, () => zero())
  );
  m[0][0] = one();
  m[1][1] = one();
  m[2][2] = one();
  m[3][3] = { re: -1, im: 0 };
  return m;
}
