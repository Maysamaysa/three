/**
 * Complex number for state vector amplitudes.
 */
export interface Complex {
  re: number;
  im: number;
}

export function complex(re: number, im: number): Complex {
  return { re, im };
}

export function add(a: Complex, b: Complex): Complex {
  return { re: a.re + b.re, im: a.im + b.im };
}

export function sub(a: Complex, b: Complex): Complex {
  return { re: a.re - b.re, im: a.im - b.im };
}

export function mul(a: Complex, b: Complex): Complex {
  return {
    re: a.re * b.re - a.im * b.im,
    im: a.re * b.im + a.im * b.re,
  };
}

export function scale(s: number, z: Complex): Complex {
  return { re: s * z.re, im: s * z.im };
}

export function conj(z: Complex): Complex {
  return { re: z.re, im: -z.im };
}

/** |z|^2 */
export function normSq(z: Complex): number {
  return z.re * z.re + z.im * z.im;
}

/** Initial state |0...0⟩ for n qubits: amplitude 1 at index 0, 0 elsewhere. */
export function initialState(nQubits: number): Complex[] {
  const dim = 2 ** nQubits;
  const state: Complex[] = new Array(dim);
  state[0] = { re: 1, im: 0 };
  for (let i = 1; i < dim; i++) state[i] = { re: 0, im: 0 };
  return state;
}

/**
 * Format state vector as ket string (compact): only basis states with |amplitude|^2 > threshold.
 */
export function toKetString(
  state: Complex[],
  threshold = 1e-10
): string {
  const n = Math.log2(state.length);
  if (!Number.isInteger(n) || n <= 0) return '|?⟩';
  const terms: string[] = [];
  for (let i = 0; i < state.length; i++) {
    const amp = state[i];
    const p = normSq(amp);
    if (p <= threshold) continue;
    const basis = i.toString(2).padStart(n, '0');
    const coeff = formatComplex(amp);
    terms.push(coeff === '1' ? `|${basis}⟩` : `(${coeff})|${basis}⟩`);
  }
  if (terms.length === 0) return '|0⟩'; // fallback
  return terms.join(' + ');
}

function formatComplex(z: Complex): string {
  if (Math.abs(z.im) < 1e-10) return formatReal(z.re);
  if (Math.abs(z.re) < 1e-10) return formatImag(z.im);
  return `${formatReal(z.re)} ${z.im >= 0 ? '+' : '-'} ${formatReal(Math.abs(z.im))}i`;
}

function formatReal(r: number): string {
  if (Math.abs(r - 1) < 1e-10) return '1';
  if (Math.abs(r + 1) < 1e-10) return '-1';
  return String(r);
}

function formatImag(im: number): string {
  if (Math.abs(im - 1) < 1e-10) return 'i';
  if (Math.abs(im + 1) < 1e-10) return '-i';
  return `${im}i`;
}

/**
 * Get probabilities for each basis state (real array, same length as state).
 */
export function getProbabilities(state: Complex[]): number[] {
  return state.map((z) => normSq(z));
}
