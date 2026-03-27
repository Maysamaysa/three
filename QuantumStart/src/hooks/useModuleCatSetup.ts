/**
 * useModuleCatSetup.ts — Shared hook to configure the global cat NPC
 * on mount for a module page.
 *
 * Usage:
 *   useModuleCatSetup('corner', 'idle')   // cat visible in corner
 *   useModuleCatSetup('hidden', 'amber')  // cat hidden during module
 */
import { useEffect } from 'react'
import { useCat } from '../context/CatContext'
import { TRANSITION_CONFIG } from '../config/transitions'
import type { CatPosition, QubitState } from '../context/CatContext'

export function useModuleCatSetup(
    position: CatPosition,
    qubitState: QubitState = 'idle',
) {
    const { setMode, setCatPosition, setQubitState } = useCat()

    useEffect(() => {
        // Delay the cat state change slightly to sync with the page transition.
        // This prevents the cat from 'jumping' or 'disappearing' while the 
        // old page is still fading out.
        const delay = (TRANSITION_CONFIG.page.duration * 1000) * 0.4;
        
        const id = setTimeout(() => {
            setMode('npc')
            setCatPosition(position)
            setQubitState(qubitState)
        }, delay)
        
        return () => clearTimeout(id)
    }, [position, qubitState, setMode, setCatPosition, setQubitState])
}
