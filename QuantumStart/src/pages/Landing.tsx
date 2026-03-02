import { useNavigate } from 'react-router-dom';
import { useState, Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import styles from './Landing.module.css';
import ProceduralBackground from '../models/procedural-background';
import KoiCat from '../models/koi_cat';

// Custom Typewriter Hook
function useTypewriter(text: string, speed = 30, active = true) {
    const [displayedText, setDisplayedText] = useState("");
    const [isFinished, setIsFinished] = useState(false);

    useEffect(() => {
        if (!active) return;
        setDisplayedText("");
        setIsFinished(false);
        let i = 0;
        const timer = setInterval(() => {
            if (i < text.length) {
                setDisplayedText((prev) => prev + text.charAt(i));
                i++;
            } else {
                clearInterval(timer);
                setIsFinished(true);
            }
        }, speed);
        return () => clearInterval(timer);
    }, [text, speed, active]);

    return { displayedText, isFinished };
}

export function Landing() {
    const navigate = useNavigate();
    const [showDialogue, setShowDialogue] = useState(false);
    const [hoveredChoice, setHoveredChoice] = useState<'A' | 'B' | null>(null);
    const [dialoguePhase, setDialoguePhase] = useState(1);

    const phase1Text = "*Yawn*... Oh! An Observer? You caught me in a state of deep superposition. Or maybe just a fuzzy nap... both are equally valid until you clicked!";
    const phase2Text = "I'm Qubit, your guide to the weird, the tiny, and the 'both-at-once.' We call it Quantum, and it’s the secret language of the universe. Want to learn how to break the 'on or off' rules of your boring old computer?";

    const { displayedText: currentText, isFinished: textFinished } = useTypewriter(
        dialoguePhase === 1 ? phase1Text : phase2Text,
        40, // Slightly slower for better readability and stability
        showDialogue
    );

    const handleAnimationComplete = () => {
        setShowDialogue(true);
    };

    const nextPhase = () => {
        setDialoguePhase(2);
        setHoveredChoice(null);
    };

    return (
        <section className={styles.container}>
            <Canvas
                className={styles.canvas}
                camera={{ position: [0, 0, 6], fov: 50 }}
                gl={{
                    antialias: true,
                    alpha: true,
                    powerPreference: 'high-performance'
                }}
                dpr={[1, 2]}
            >
                <Suspense fallback={null}>
                    {/* Lighting for the cat */}
                    <ambientLight intensity={1} />
                    <directionalLight position={[5, 5, 5]} intensity={2} castShadow />
                    <pointLight
                        position={[-5, 3, -5]}
                        intensity={hoveredChoice === 'A' ? 3 : 1}
                        color="#5DA7DB"
                    />
                    <pointLight
                        position={[5, 3, 5]}
                        intensity={hoveredChoice === 'B' ? 3 : 0.8}
                        color="#A67B5B"
                    />

                    <ProceduralBackground />
                    <KoiCat onAnimationComplete={handleAnimationComplete} />

                </Suspense>
            </Canvas>

            {showDialogue && (
                <div className={styles.dialogueOverlay}>
                    <div className={styles.speechBubble}>
                        <p className={styles.qubitName}>Qubit:</p>
                        <p className={styles.dialogueText}>
                            {currentText}
                            {textFinished && dialoguePhase === 1 && <span className={styles.cursor}>_</span>}
                        </p>
                    </div>

                    {textFinished && (
                        <div className={styles.choices}>
                            {dialoguePhase === 1 ? (
                                <>
                                    <button
                                        className={`${styles.choiceBtn} ${styles.blueChoice} ${styles.smallChoice}`}
                                        onMouseEnter={() => setHoveredChoice('A')}
                                        onMouseLeave={() => setHoveredChoice(null)}
                                        onClick={nextPhase}
                                    >
                                        Okay?
                                    </button>
                                    <button
                                        className={`${styles.choiceBtn} ${styles.amberChoice} ${styles.smallChoice}`}
                                        onMouseEnter={() => setHoveredChoice('B')}
                                        onMouseLeave={() => setHoveredChoice(null)}
                                        onClick={nextPhase}
                                    >
                                        A cat?
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        className={`${styles.choiceBtn} ${styles.blueChoice}`}
                                        onMouseEnter={() => setHoveredChoice('A')}
                                        onMouseLeave={() => setHoveredChoice(null)}
                                        onClick={() => navigate('/learn')}
                                    >
                                        <span className={styles.choiceEye}>👁️</span>
                                        Teach me the secret language!
                                    </button>
                                    <button
                                        className={`${styles.choiceBtn} ${styles.amberChoice}`}
                                        onMouseEnter={() => setHoveredChoice('B')}
                                        onMouseLeave={() => setHoveredChoice(null)}
                                        onClick={() => navigate('/playground')}
                                    >
                                        <span className={styles.choiceEye}>👁️</span>
                                        Does being a liquid feel like a bath?
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}
        </section >
    );
}
