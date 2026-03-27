export type Track = 'blue' | 'amber'

export interface Module {
    id: string
    name: string
    emoji: string
    blueLabel: string
    amberLabel: string
    // Position angle on the orbit ring (radians)
    angle: number
    radius: number
    qubitBlue: string
    qubitAmber: string
    route: string
}

export const MODULE_DATA: Module[] = [
    {
        id: 'qubit',
        name: 'What is a Qubit?',
        emoji: '⚛️',
        angle: 0,
        radius: 1,
        blueLabel: 'Intuition',
        amberLabel: 'Technical',
        qubitBlue: "Imagine a coin spinning in the air — it's neither heads nor tails until it lands. That's your qubit. The universe's way of saying 'why choose?'",
        qubitAmber: "A qubit is a two-level quantum system represented as |ψ⟩ = α|0⟩ + β|1⟩, where α and β are complex amplitudes satisfying |α|² + |β|² = 1.",
        route: '/learn/qubit',
    },
    {
        id: 'superposition',
        name: 'Superposition',
        emoji: '🌊',
        angle: (Math.PI * 2) / 7,
        radius: 1,
        blueLabel: 'Intuition',
        amberLabel: 'Technical',
        qubitBlue: "Being in two places at once isn't magic — it's superposition. A qubit holds all possible answers simultaneously... until you dare to look.",
        qubitAmber: "Superposition is a linear combination of basis states. The Hadamard gate H maps |0⟩ → (|0⟩+|1⟩)/√2, placing the qubit in equal superposition.",
        route: '/learn/superposition',
    },
    {
        id: 'measurement',
        name: 'Measurement',
        emoji: '👁️',
        angle: (Math.PI * 2 * 2) / 7,
        radius: 1,
        blueLabel: 'Intuition',
        amberLabel: 'Technical',
        qubitBlue: "The moment you look at a qubit, the universe makes a decision. Superposition collapses into a single reality. You are the Observer. Choose carefully.",
        qubitAmber: "Measurement projects the state onto a basis. For |ψ⟩ = α|0⟩ + β|1⟩, P(0) = |α|², P(1) = |β|². Post-measurement state collapses irreversibly.",
        route: '/learn/measurement',
    },
    {
        id: 'bloch',
        name: 'Bloch Sphere',
        emoji: '🔮',
        angle: (Math.PI * 2 * 3) / 7,
        radius: 1,
        blueLabel: 'Intuition',
        amberLabel: 'Technical',
        qubitBlue: "Picture a snow globe — every point on its surface is a valid quantum state. The north pole is |0⟩, the south is |1⟩, and everywhere else? Pure magic.",
        qubitAmber: "The Bloch sphere maps qubit states to unit vectors: |ψ⟩ = cos(θ/2)|0⟩ + e^(iφ)sin(θ/2)|1⟩. Rotations on this sphere correspond to quantum gate operations.",
        route: '/learn/bloch',
    },
    {
        id: 'entanglement',
        name: 'Entanglement',
        emoji: '🔗',
        angle: (Math.PI * 2 * 4) / 7,
        radius: 1,
        blueLabel: 'Intuition',
        amberLabel: 'Technical',
        qubitBlue: "Two qubits, separated by galaxies, yet one knows what the other felt the instant you measured it. Einstein called it spooky. I call it my favourite trick.",
        qubitAmber: "Bell states are maximally entangled: |Φ⁺⟩ = (|00⟩+|11⟩)/√2. CNOT + Hadamard creates entanglement. Measuring one qubit instantly determines its partner.",
        route: '/learn/entanglement',
    },
    {
        id: 'gates',
        name: 'Quantum Gates',
        emoji: '🎛️',
        angle: (Math.PI * 2 * 5) / 7,
        radius: 1,
        blueLabel: 'Intuition',
        amberLabel: 'Technical',
        qubitBlue: "Quantum gates are like dance moves for qubits — they flip, rotate, and entangle. The Hadamard gate is the moonwalk of the quantum world.",
        qubitAmber: "Quantum gates are unitary matrices. X = [[0,1],[1,0]], H = [[1,1],[1,-1]]/√2. Their unitarity ensures reversibility: UU† = I.",
        route: '/learn/gates',
    },
    {
        id: 'algorithms',
        name: 'Quantum Algorithms',
        emoji: '⚡',
        angle: (Math.PI * 2 * 6) / 7,
        radius: 1,
        blueLabel: 'Intuition',
        amberLabel: 'Technical',
        qubitBlue: "A quantum computer doesn't try every answer — it makes all wrong answers cancel out, leaving only the right one standing. It's interference, not magic.",
        qubitAmber: "Grover's algorithm achieves O(√N) search via amplitude amplification. Shor's factors N in O((log N)³) using QFT-based period finding. Classical: O(e^N^(1/3)).",
        route: '/learn/algorithms',
    },
]
