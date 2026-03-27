import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { BADGES, type Badge, type Rarity } from '../config/badges'

// ─── TYPES ────────────────────────────────────────────────────────────────────

export interface ProgressData {
    completedModules: string[] // List of module IDs ('qubit', 'superposition', etc.)
    completedTracks: Record<string, ('blue' | 'amber')[]> // moduleID -> list of tracks completed
    unlockedBadges: string[] // List of badge IDs
    lastPlayed: number
    devMode?: boolean
}

interface ProgressContextValue {
    progress: ProgressData
    badges: Badge[]
    completeModule: (moduleId: string, track?: 'blue' | 'amber', perfectScore?: boolean) => void
    unlockBadge: (badgeId: string) => void
    isModuleLocked: (moduleId: string) => boolean
    resetProgress: () => void
    toggleDevMode: () => void
}

// ─── CONTEXT ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'quantum_start_progress_v1'

const INITIAL_PROGRESS: ProgressData = {
    completedModules: [],
    completedTracks: {},
    unlockedBadges: [],
    lastPlayed: Date.now(),
    devMode: false
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
        if (progress.devMode) return false

        const moduleOrder = ['qubit', 'superposition', 'bloch', 'measurement', 'entanglement', 'gates', 'algorithms']
        const index = moduleOrder.indexOf(moduleId)
        if (index <= 0) return false // First module never locked
        
        const previousModule = moduleOrder[index - 1]
        return !progress.completedModules.includes(previousModule)
    }, [progress.completedModules, progress.devMode])

    const resetProgress = useCallback(() => {
        setProgress(INITIAL_PROGRESS)
    }, [])

    const toggleDevMode = useCallback(() => {
        setProgress(prev => ({
            ...prev,
            devMode: !prev.devMode
        }))
    }, [])

    return (
        <ProgressContext.Provider value={{
            progress,
            badges: BADGES,
            completeModule,
            unlockBadge,
            isModuleLocked,
            resetProgress,
            toggleDevMode
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
