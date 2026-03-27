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
    ]
};

export const SINGLE_GATES = ['H', 'X', 'Y', 'Z', 'S', 'T', 'Measure'];
export const TWO_GATES = ['CNOT', 'CZ'];

export const GATES_INFO = [
    { id: 'H', x: -4 },
    { id: 'X', x: -2 },
    { id: 'Y', x: 0 },
    { id: 'Z', x: 2 },
    { id: 'CNOT', x: 4 }
];
