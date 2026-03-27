import { Routes, Route, useLocation, Outlet } from 'react-router-dom'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CatProvider, useCat } from './context/CatContext'
import { ProgressProvider } from './context/ProgressContext'
import QuantumCat from './models/quantum_cat'
import ProceduralBackground from './models/procedural-background'
import { Landing } from './pages/Landing'
import { Learn } from './pages/Learn'
import { Profile } from './pages/Profile'
import { Playground } from './pages/Playground'
import { TutorialChallenge } from './pages/TutorialChallenge'
import { QubitModule } from './pages/modules/qubit/QubitModule'
import { SuperpositionModule } from './pages/modules/superposition/SuperpositionModule'
import { BlochSphereModule } from './pages/modules/bloch/BlochSphereModule'
import { MeasurementModule } from './pages/modules/measurement/MeasurementModule'
import { EntanglementModule } from './pages/modules/entanglement/EntanglementModule'
import { GatesModule } from './pages/modules/gates/GatesModule'
import { AlgorithmsModule } from './pages/modules/algorithms/AlgorithmsModule'
import { TRANSITION_CONFIG } from './config/transitions'
import './App.css'

// ─── GLOBAL CAT CANVAS ────────────────────────────────────────────────────────
// Fixed behind everything. Never unmounts on route changes.
function CatCanvas() {
  const { mode, qubitState, catPosition, isAwake, setAwake } = useCat()
  const location = useLocation()
  const isLanding = location.pathname === '/'

  // State for click count lives here so native DOM handler can drive it
  // without relying on R3F raycasting (which was blocked by Html overlays)
  const handleCanvasClick = () => {
    if (!isLanding || mode !== 'hero' || isAwake) return
    // Dispatch a custom event that QuantumCat listens to
    window.dispatchEvent(new CustomEvent('cat:click'))
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: isLanding ? 'auto' : 'none',
        cursor: isLanding && !isAwake ? 'pointer' : 'default',
      }}
      onClick={handleCanvasClick}
    >
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          {/* Shared lighting */}
          <ambientLight intensity={1.1} />
          <directionalLight position={[5, 5, 5]} intensity={2} />
          <pointLight position={[-5, 3, -5]} intensity={1.2} color="#5DA7DB" />
          <pointLight position={[5, 3, 5]} intensity={1.0} color="#C4955A" />

          {/* Procedural background — always present */}
          <ProceduralBackground />

          {/* The persistent cat */}
          <QuantumCat
            mode={mode}
            qubitState={qubitState}
            catPosition={catPosition}
            onWakeUp={() => setAwake(true)}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}

// ─── APP SHELL ────────────────────────────────────────────────────────────────
function AppShell() {
  const location = useLocation()
  return (
    <>
      {/* Layer 0: persistent cat + starfield */}
      <CatCanvas />

      {/* Layer 1: page content — pointer-events:none so clicks fall through to cat canvas. */}
      <div style={{ position: 'relative', zIndex: 1, width: '100vw', height: '100vh', overflow: 'hidden', pointerEvents: 'none' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={{
              initial: { opacity: 0, y: TRANSITION_CONFIG.page.yOffset },
              animate: { opacity: 1, y: 0 },
              exit: { opacity: 0, y: -TRANSITION_CONFIG.page.yOffset }
            }}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ 
                duration: TRANSITION_CONFIG.page.duration, 
                ease: TRANSITION_CONFIG.page.ease 
            }}
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              willChange: 'transform, opacity'
            }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  )
}

function App() {
  return (
    <ProgressProvider>
      <CatProvider>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<Landing />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/learn/qubit" element={<QubitModule />} />
            <Route path="/learn/superposition" element={<SuperpositionModule />} />
            <Route path="/learn/bloch" element={<BlochSphereModule />} />
            <Route path="/learn/measurement" element={<MeasurementModule />} />
            <Route path="/learn/entanglement" element={<EntanglementModule />} />
            <Route path="/learn/gates" element={<GatesModule />} />
            <Route path="/learn/algorithms" element={<AlgorithmsModule />} />
            <Route path="/playground" element={<Playground />} />
            <Route path="/tutorial/:id" element={<TutorialChallenge />} />
          </Route>
        </Routes>
      </CatProvider>
    </ProgressProvider>
  )
}

export default App
