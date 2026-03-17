import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

// ─── TYPES ────────────────────────────────────────────────────────────────────
export type QubitState = 'idle' | 'blue' | 'amber'
export type CatMode = 'hero' | 'npc'
// 'center'  → Landing page (cat is large and centered)
// 'corner'  → Learn / Playground (cat floats to top-right, shrinks)
export type CatPosition = 'center' | 'corner'

interface CatContextValue {
    mode: CatMode
    qubitState: QubitState
    catPosition: CatPosition
    isAwake: boolean
    setMode: (m: CatMode) => void
    setQubitState: (q: QubitState) => void
    setCatPosition: (p: CatPosition) => void
    setAwake: (a: boolean) => void
}

// ─── CONTEXT ──────────────────────────────────────────────────────────────────
const CatContext = createContext<CatContextValue | null>(null)

export function CatProvider({ children }: { children: ReactNode }) {
    const [mode, setMode] = useState<CatMode>('hero')
    const [qubitState, setQubitState] = useState<QubitState>('idle')
    const [catPosition, setCatPosition] = useState<CatPosition>('center')
    const [isAwake, setAwake] = useState(false)

    const handleSetMode = useCallback((m: CatMode) => setMode(m), [])
    const handleSetQubit = useCallback((q: QubitState) => setQubitState(q), [])
    const handleSetPosition = useCallback((p: CatPosition) => setCatPosition(p), [])
    const handleSetAwake = useCallback((a: boolean) => setAwake(a), [])

    return (
        <CatContext.Provider value={{
            mode,
            qubitState,
            catPosition,
            isAwake,
            setMode: handleSetMode,
            setQubitState: handleSetQubit,
            setCatPosition: handleSetPosition,
            setAwake: handleSetAwake,
        }}>
            {children}
        </CatContext.Provider>
    )
}

// ─── HOOK ─────────────────────────────────────────────────────────────────────
export function useCat() {
    const ctx = useContext(CatContext)
    if (!ctx) throw new Error('useCat must be used inside <CatProvider>')
    return ctx
}
