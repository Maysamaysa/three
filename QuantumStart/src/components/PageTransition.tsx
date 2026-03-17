import { useEffect, useState, useRef, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'

interface PageTransitionProps {
    children: ReactNode
}

/**
 * Wraps page content in a fade + translateY-up/down animation on route change.
 * Mounts: fades in from below.  Unmount: handled by re-key on location.key.
 */
export default function PageTransition({ children }: PageTransitionProps) {
    const location = useLocation()
    const [visible, setVisible] = useState(false)
    const [key, setKey] = useState(location.key)
    const prevKey = useRef(location.key)

    useEffect(() => {
        if (location.key === prevKey.current) {
            // Initial mount
            requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
            return
        }

        // Route changed: fade out, swap content, fade back in
        setVisible(false)
        const swap = setTimeout(() => {
            prevKey.current = location.key
            setKey(location.key)
            requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
        }, 320) // matches CSS transition duration

        return () => clearTimeout(swap)
    }, [location.key])

    return (
        <div
            key={key}
            style={{
                position: 'absolute',
                inset: 0,
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0px)' : 'translateY(24px)',
                transition: 'opacity 0.32s ease, transform 0.38s cubic-bezier(0.22,1,0.36,1)',
                pointerEvents: 'none',
                willChange: 'opacity, transform',
            }}
        >
            {children}
        </div>
    )
}
