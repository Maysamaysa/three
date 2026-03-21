import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

// ─── TYPES ────────────────────────────────────────────────────────────────────

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

export interface ProgressData {
    completedModules: string[] // List of module IDs ('qubit', 'superposition', etc.)
    completedTracks: Record<string, ('blue' | 'amber')[]> // moduleID -> list of tracks completed
    unlockedBadges: string[] // List of badge IDs
    lastPlayed: number
}

interface ProgressContextValue {
    progress: ProgressData
    badges: Badge[]
    completeModule: (moduleId: string, track?: 'blue' | 'amber', perfectScore?: boolean) => void
    unlockBadge: (badgeId: string) => void
    isModuleLocked: (moduleId: string) => boolean
    resetProgress: () => void
}

// ─── BADGE DEFINITIONS ────────────────────────────────────────────────────────

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

// ─── CONTEXT ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'quantum_start_progress_v1'

const INITIAL_PROGRESS: ProgressData = {
    completedModules: [],
    completedTracks: {},
    unlockedBadges: [],
    lastPlayed: Date.now()
}

const ProgressContext = createContext<ProgressContextValue | null>(null)

export function ProgressProvider({ children }: { children: ReactNode }) {
    const [progress, setProgress] = useState<ProgressData>(() => {
        const saved = localStorage.getItem(STORAGE_KEY)
        return saved ? JSON.parse(saved) : INITIAL_PROGRESS
    })

    // Save to localStorage whenever progress changes
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
    }, [progress])

    const unlockBadge = useCallback((badgeId: string) => {
        setProgress(prev => {
            if (prev.unlockedBadges.includes(badgeId)) return prev
            return {
                ...prev,
                unlockedBadges: [...prev.unlockedBadges, badgeId],
                lastPlayed: Date.now()
            }
        })
    }, [])

    const completeModule = useCallback((moduleId: string, track?: 'blue' | 'amber', perfectScore?: boolean) => {
        setProgress(prev => {
            const newCompletedModules = prev.completedModules.includes(moduleId)
                ? prev.completedModules
                : [...prev.completedModules, moduleId]

            const currentTracks = prev.completedTracks[moduleId] || []
            const newTracks = (track && !currentTracks.includes(track))
                ? [...currentTracks, track]
                : currentTracks

            const nextProgress = {
                ...prev,
                completedModules: newCompletedModules,
                completedTracks: {
                    ...prev.completedTracks,
                    [moduleId]: newTracks
                },
                lastPlayed: Date.now()
            }

            // Logic for automatic badge unlocks
            const newBadges = [...prev.unlockedBadges]
            
            // First Observer
            if (newBadges.length === 0) {
                newBadges.push('first_observer')
            }

            // Qubit specific badges
            if (moduleId === 'qubit') {
                if (track === 'blue' && !newBadges.includes('qubit_intuition')) newBadges.push('qubit_intuition')
                if (track === 'amber' && !newBadges.includes('qubit_technical')) newBadges.push('qubit_technical')
            }

            // Superposition Sage (Perfect score)
            if (moduleId === 'superposition' && perfectScore && !newBadges.includes('superposition_sage')) {
                newBadges.push('superposition_sage')
            }

            // Wave Collapser (Measurement perfect)
            if (moduleId === 'measurement' && perfectScore && !newBadges.includes('wave_collapser')) {
                newBadges.push('wave_collapser')
            }

            // Entanglement Witness
            if (moduleId === 'entanglement' && !newBadges.includes('entanglement_witness')) {
                newBadges.push('entanglement_witness')
            }

            // Koi Keeper (Intuition master)
            const intuitionModules = ['qubit', 'superposition', 'bloch', 'gates', 'measurement', 'entanglement', 'algorithms']
            const allIntuition = intuitionModules.every(m => (nextProgress.completedTracks[m] || []).includes('blue'))
            if (allIntuition && !newBadges.includes('koi_keeper')) {
                newBadges.push('koi_keeper')
            }

            // Quantum Architect
            const allBoth = intuitionModules.every(m => {
                const tracks = nextProgress.completedTracks[m] || []
                return tracks.includes('blue') && tracks.includes('amber')
            })
            if (allBoth && !newBadges.includes('quantum_architect')) {
                newBadges.push('quantum_architect')
            }

            return {
                ...nextProgress,
                unlockedBadges: newBadges
            }
        })
    }, [])

    const isModuleLocked = useCallback((moduleId: string) => {
        const moduleOrder = ['qubit', 'superposition', 'bloch', 'measurement', 'entanglement', 'gates', 'algorithms']
        const index = moduleOrder.indexOf(moduleId)
        if (index <= 0) return false // First module never locked
        
        const previousModule = moduleOrder[index - 1]
        return !progress.completedModules.includes(previousModule)
    }, [progress.completedModules])

    const resetProgress = useCallback(() => {
        setProgress(INITIAL_PROGRESS)
    }, [])

    return (
        <ProgressContext.Provider value={{
            progress,
            badges: BADGES,
            completeModule,
            unlockBadge,
            isModuleLocked,
            resetProgress
        }}>
            {children}
        </ProgressContext.Provider>
    )
}

export function useProgress() {
    const ctx = useContext(ProgressContext)
    if (!ctx) throw new Error('useProgress must be used inside <ProgressProvider>')
    return ctx
}
