import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useProgress } from '../context/ProgressContext'
import { TRANSITION_CONFIG } from '../config/transitions'
import styles from './Profile.module.css'

export function Profile() {
    const navigate = useNavigate()
    const { progress, badges, resetProgress, toggleDevMode } = useProgress()

    const TOTAL_MODULES = 7 // qubit, superposition, bloch, gates, measurement, entanglement, algorithms

    const blueCount = Object.values(progress.completedTracks).filter(tracks => tracks.includes('blue')).length
    const amberCount = Object.values(progress.completedTracks).filter(tracks => tracks.includes('amber')).length

    const bluePercent = (blueCount / TOTAL_MODULES) * 100
    const amberPercent = (amberCount / TOTAL_MODULES) * 100

    const handleReset = () => {
        if (window.confirm('Are you sure you want to reset all your progress? This cannot be undone.')) {
            resetProgress()
        }
    }

    return (
        <div className= { styles.container } >
        <motion.header 
            className={ styles.header }
            initial={{ opacity: 0, y: TRANSITION_CONFIG.header.yOffset }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
                duration: TRANSITION_CONFIG.header.duration, 
                delay: TRANSITION_CONFIG.header.delay, 
                ease: TRANSITION_CONFIG.header.ease 
            }}
        >
            <div className={ styles.titleSection }>
                <h1>Observer Identity </h1>
                    < p > Tracking your quantum journey across the multiverse </p>
                        </div>
                        < button className = { styles.backBtn } onClick = {() => navigate('/learn')
}>
                    ← Learn Hub
    </button>
    </motion.header>

    < main className = { styles.mainGrid } >
        {/* Left: Track Stats */ }
        < div className = { styles.statsPanel } >
            <div className={ styles.trackCard }>
                <div className={ styles.trackHeader }>
                    <h3>Intuition Track </h3>
                        < span className = { styles.trackInfo } > { blueCount } / { TOTAL_MODULES } </span>
                            </div>
                            < div className = { styles.progressBar } >
                                <div 
                                className={ `${styles.progressFill} ${styles.blueFill}` }
style = {{ width: `${bluePercent}%` }}
                            />
    </div>
    < div className = { styles.statRow } >
        <span>Classical → Quantum </span>
            < span > { Math.round(bluePercent) } % </span>
            </div>
            </div>

            < div className = { styles.trackCard } >
                <div className={ styles.trackHeader }>
                    <h3>Technical Track </h3>
                        < span className = { styles.trackInfo } > { amberCount } / { TOTAL_MODULES } </span>
                            </div>
                            < div className = { styles.progressBar } >
                                <div 
                                className={ `${styles.progressFill} ${styles.amberFill}` }
style = {{ width: `${amberPercent}%` }}
                            />
    </div>
    < div className = { styles.statRow } >
        <span>Amplitudes → Matrices </span>
            < span > { Math.round(amberPercent) } % </span>
            </div>
            </div>
            </div>

{/* Right: Terrarium */ }
<div className={ styles.terrarium }>
    <h2 className={ styles.terrariumTitle }> Quantum Terrarium </h2>
        < div className = { styles.badgeGrid } >
        {
            badges.map(badge => {
                const isUnlocked = progress.unlockedBadges.includes(badge.id)
                const isSecret = badge.rarity === 'Secret' && !isUnlocked

                return (
                    <div key= { badge.id } className = { styles.badgeItem } >
                        <div className={ `${styles.badgeIcon} ${isUnlocked ? styles.unlockedIcon : styles.lockedIcon} ${isUnlocked ? styles[badge.rarity.toLowerCase()] : ''}` }>
                            { isSecret? '?': badge.emoji }
                            </div>

                {/* Tooltip */ }
                <div className={ styles.tooltip }>
                    <span className={ styles.tooltipTitle }>
                        { isSecret? '???': badge.name }
                        </span>
                        < span className = {`${styles.tooltipRarity} ${styles[badge.rarity.toLowerCase() + 'Text']}`
            }>
            { badge.rarity }
            </span>
            < span className = { styles.tooltipDesc } >
            { isSecret? 'This achievement is hidden in the quantum noise. Keep exploring to reveal it.': badge.description }
            </span>
            < span className = { styles.tooltipCondition } >
            { isSecret? 'Condition: ???': `Condition: ${badge.unlockCondition}` }
            </span>
            </div>
            </div>
            )
        })}
</div>
    </div>
    </main>

    < div className = { styles.resetZone } >
        <button className={ styles.resetBtn } onClick = { handleReset } >
            Reset Quantum State(Clear Progress)
                </button>
        <button 
            className={`${styles.resetBtn} ${progress.devMode ? styles.devModeActive : ''}`} 
            style={{ marginLeft: '16px', borderColor: progress.devMode ? '#4ade80' : undefined, color: progress.devMode ? '#4ade80' : undefined }}
            onClick={toggleDevMode}
        >
            {progress.devMode ? 'Disable Dev Mode' : 'Enable Dev Mode (Unlock All)'}
        </button>
                </div>
                </div>
    )
}
