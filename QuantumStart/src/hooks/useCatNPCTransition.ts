import { useState, useEffect } from 'react'

/**
 * useCatNPCTransition
 *
 * Converts a raw `settled` boolean (fired once from the R3F scene when the
 * cat's "sit" animation clip finishes) into a `panelsVisible` boolean that
 * HTML overlay panels use to ease in.
 *
 * Usage:
 *   const { panelsVisible } = useCatNPCTransition(catSettled)
 *
 * The 40 ms delay ensures the React paint cycle has time to commit the
 * settled state before triggering the CSS transition — preventing any
 * "instant jump" on very fast machines.
 */
export function useCatNPCTransition(settled: boolean): { panelsVisible: boolean } {
    const [panelsVisible, setPanelsVisible] = useState(false)

    useEffect(() => {
        if (!settled) {
            setPanelsVisible(false)
            return
        }
        // Tiny debounce: let the canvas frame finish before easing in
        const id = setTimeout(() => setPanelsVisible(true), 40)
        return () => clearTimeout(id)
    }, [settled])

    return { panelsVisible }
}
