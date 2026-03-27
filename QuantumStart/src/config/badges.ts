export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Secret'

export interface Badge {
    id: string
    name: string
    emoji: string
    description: string
    unlockCondition: string
    rarity: Rarity
    hidden?: boolean // If true, show as "???" until unlocked
}

export const BADGES: Badge[] = [
    {
        id: 'first_observer',
        name: 'First Observer',
        emoji: '🐱',
        description: 'You took your first step into the quantum realm.',
        unlockCondition: 'Complete any first lesson',
        rarity: 'Common'
    },
    {
        id: 'qubit_intuition',
        name: 'State |0⟩ Initiate',
        emoji: '🔵',
        description: 'You have a feeling for how qubits exist.',
        unlockCondition: 'Complete Qubit Basics (Intuition track)',
        rarity: 'Common'
    },
    {
        id: 'qubit_technical',
        name: 'State |1⟩ Scholar',
        emoji: '🟡',
        description: 'You understand the math behind the qubit.',
        unlockCondition: 'Complete Qubit Basics (Technical track)',
        rarity: 'Common'
    },
    {
        id: 'superposition_sage',
        name: 'Superposition Sage',
        emoji: '🌸',
        description: 'Perfectly balanced, as all things should be.',
        unlockCondition: 'Score 100% on Superposition quiz',
        rarity: 'Uncommon'
    },
    {
        id: 'entanglement_witness',
        name: 'Entanglement Witness',
        emoji: '🔗',
        description: 'Spooky action at a distance? Not for you.',
        unlockCondition: 'Complete Entanglement module',
        rarity: 'Uncommon'
    },
    {
        id: 'bloch_navigator',
        name: 'Bloch Sphere Navigator',
        emoji: '🌀',
        description: 'You know your way around the sphere.',
        unlockCondition: 'Rotate Bloch Sphere to all 6 cardinal states',
        rarity: 'Rare'
    },
    {
        id: 'wave_collapser',
        name: 'Wave Collapser',
        emoji: '⚛️',
        description: 'Observation is an art form.',
        unlockCondition: 'Complete Measurement & Collapse with perfect quiz',
        rarity: 'Rare'
    },
    {
        id: 'koi_keeper',
        name: 'Koi Keeper',
        emoji: '🐟',
        description: 'A master of the intuitive path.',
        unlockCondition: 'Unlock all Intuition track modules',
        rarity: 'Epic'
    },
    {
        id: 'quantum_architect',
        name: 'Quantum Architect',
        emoji: '🔮',
        description: 'The master of both math and magic.',
        unlockCondition: 'Complete all modules on both tracks',
        rarity: 'Legendary'
    },
    {
        id: 'qubit_equal',
        name: 'Qubit\'s Equal',
        emoji: '🐾',
        description: 'You found the secret hiding in plain sight.',
        unlockCondition: 'Find the hidden easter egg in the 3D scene',
        rarity: 'Secret',
        hidden: true
    }
]
