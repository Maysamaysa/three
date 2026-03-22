/**
 * useModuleCatSetup.ts — Shared hook to configure the global cat NPC
 * on mount for a module page. Restores cat to a visible state on unmount
 * so the cat never stays hidden when navigating back.
 *
 * Usage:
 *   useModuleCatSetup('corner', 'idle')
 *   useModuleCatSetup('hidden', 'amber')
 */
import { useEffect } from 'react'
import { useCat } from '../context/CatContext'
import type { CatPosition, QubitState } from '../context/CatContext'

export function useModuleCatSetup(
    position: CatPosition,
    qubitState: QubitState = 'idle',
) {
    const { setMode, setCatPosition, setQubitState } = useCat()

    useEffect(() => {
        setMode('npc')
        setCatPosition(position)
        setQubitState(qubitState)

        // On unmount: restore cat to a visible corner state so it doesn't
        // stay 'hidden' when navigating back to the Learn page.
        // The Learn page will then set its own position ('center') on mount,
        // but this ensures no flash of missing cat during the transition.
        return () => {
            setCatPosition('corner')
            setQubitState('idle')
        }
    // Only run on mount/unmount — intentionally not re-running on prop change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
}
