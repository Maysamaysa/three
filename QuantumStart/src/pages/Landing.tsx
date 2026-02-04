import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import styles from './Landing.module.css';
import ProceduralBackground from '../models/procedural-background';
import BackgroundLanding from '../models/background-landing';
import Cat from '../models/cat';
import BlackCat from '../models/black_cat';
import KoiCat from '../models/koi_cat';

export function Landing() {
    const navigate = useNavigate();

    return (
        <section className={styles.container}>
            <Canvas
                className={styles.canvas}
                camera={{ position: [0, 2, 8], fov: 60 }}
                gl={{
                    antialias: true,
                    alpha: true,
                    powerPreference: 'high-performance'
                }}
                dpr={[1, 2]}
            >
                <Suspense fallback={null}>
                    {/* Lighting for the cat */}
                    <ambientLight intensity={0.8} />
                    <directionalLight position={[5, 5, 5]} intensity={1.2} castShadow />
                    <pointLight position={[-5, 3, -5]} intensity={0.8} color="#8b5cf6" />
                    <pointLight position={[5, 3, 5]} intensity={0.6} color="#6366f1" />

                    {/* Background */}
                    <ProceduralBackground />
                    {/* <BackgroundLanding /> */}
                    <BlackCat />
                    <KoiCat />

                    {/* Your cat! */}
                    {/* <Cat /> */}
                </Suspense>
            </Canvas>
            <div className={styles.hero}>
                <h1 className={styles.title}>
                    Quantum<span className={styles.highlight}>Start</span>
                </h1>
                <p className={styles.subtitle}>
                    Your journey into the quantum realm begins here
                </p>
                <p className={styles.description}>
                    Explore quantum computing through interactive 3D visualizations,
                    hands-on circuit building, and step-by-step tutorials.
                </p>

                <div className={styles.buttons}>
                    <button
                        type="button"
                        className={styles.primaryBtn}
                        onClick={() => navigate('/learn')}
                    >
                        Let's Get Started
                    </button>

                    <button
                        type="button"
                        className={styles.secondaryBtn}
                        onClick={() => navigate('/playground')}
                    >
                        Go to Playground
                    </button>
                </div>

                <p className={styles.hint}>
                    Already familiar with quantum? Jump straight to the playground →
                </p>
            </div>

            <div className={styles.features}>
                <div className={styles.feature}>
                    <div className={styles.featureIcon}>📚</div>
                    <h3>Learn Theory</h3>
                    <p>Understand quantum principles with 3D visualizations</p>
                </div>
                <div className={styles.feature}>
                    <div className={styles.featureIcon}>🎮</div>
                    <h3>Build Circuits</h3>
                    <p>Drag and drop gates to create quantum algorithms</p>
                </div>
                <div className={styles.feature}>
                    <div className={styles.featureIcon}>🔬</div>
                    <h3>Experiment</h3>
                    <p>See real-time quantum state evolution</p>
                </div>
            </div>
        </section >
    );
}
