import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * useTypewriter — A shared hook for manageable typewriter effects with skip support.
 * 
 * @param text The full string to type out.
 * @param speed Milliseconds per character.
 * @param active Whether the typewriter effect is currently running.
 */
export function useTypewriter(text: string, speed = 32, active = true) {
    const [displayed, setDisplayed] = useState('')
    const [finished, setFinished] = useState(false)
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

    const stop = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
        }
    }, [])

    const skip = useCallback(() => {
        stop()
        setDisplayed(text)
        setFinished(true)
    }, [text, stop])

    useEffect(() => {
        if (!active || !text) {
            setDisplayed('')
            setFinished(false)
            return
        }

        setDisplayed('')
        setFinished(false)
        stop()

        let i = 0
        timerRef.current = setInterval(() => {
            i++
            if (i <= text.length) {
                setDisplayed(text.substring(0, i))
            } else {
                stop()
                setFinished(true)
            }
        }, speed)

        return () => stop()
    }, [text, speed, active, stop])

    return { displayed, finished, skip }
}
