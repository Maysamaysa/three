import { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { useCircuit } from '../hooks/useCircuit';
import { useSimulator } from '../hooks/useSimulator';
import { CircuitBuilder } from '../components/CircuitBuilder';
import { StepControls } from '../components/StepControls';
import { BlochSphere } from '../components/BlochSphere';
import { StateDisplay } from '../components/StateDisplay';
import { ExplanationPanel } from '../components/ExplanationPanel';
import { Link } from 'react-router-dom';
import KoiCat from '../models/koi_cat';
import ProceduralBackground from '../models/procedural-background';
import '../App.css';

export function Playground() {
  const circuit = useCircuit({ initialQubitCount: 2 });
  const simulator = useSimulator(circuit.circuit, circuit.qubitCount);
  const [selectedQubitIndex, setSelectedQubitIndex] = useState(0);

  return (
    <main className="app">
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1 }}>
        <Canvas camera={{ position: [0, 2, 10], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={1.5} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#5DA7DB" />
            <ProceduralBackground />
            <group position={[-6, -2, 0]} rotation={[0, 0.5, 0]} scale={0.8}>
              <KoiCat />
            </group>
          </Suspense>
        </Canvas>
      </div>
      <header className="app-header">
        <h1>Quantum <span style={{ color: 'var(--state-0)' }}>Lotus</span></h1>
        <p>Observe the quantum state collapse with your familiar companion.</p>

        <nav className="app-nav">
          <Link to="/tutorial/add-hadamard">Tutorial: Start here</Link>
        </nav>
      </header>
      <section className="app-content">
        <CircuitBuilder circuit={circuit} />
        <section className="app-sim">
          <StepControls simulator={simulator} />
          <ExplanationPanel
            circuit={circuit.circuit}
            stepIndex={simulator.stepIndex}
            state={simulator.stateAtStep}
          />
          <div className="app-sim-row">
            <StateDisplay
              state={simulator.stateAtStep}
              nQubits={circuit.qubitCount}
            />
            <BlochSphere
              state={simulator.stateAtStep}
              nQubits={circuit.qubitCount}
              selectedQubitIndex={selectedQubitIndex}
              onQubitIndexChange={setSelectedQubitIndex}
            />
          </div>
        </section>
      </section>
    </main>
  );
}
