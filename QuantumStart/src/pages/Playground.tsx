import { useState } from 'react';
import { useCircuit } from '../hooks/useCircuit';
import { useSimulator } from '../hooks/useSimulator';
import { CircuitBuilder } from '../components/CircuitBuilder';
import { StepControls } from '../components/StepControls';
import { BlochSphere } from '../components/BlochSphere';
import { StateDisplay } from '../components/StateDisplay';
import { ExplanationPanel } from '../components/ExplanationPanel';
import { Link } from 'react-router-dom';
import { ModuleCanvas } from '../components/ModuleCanvas';
import ProceduralBackground from '../models/procedural-background';
import styles from './Playground.module.css';
import type { UseCircuitReturn } from '../hooks/useCircuit';
import type { UseSimulatorReturn } from '../hooks/useSimulator';

// ── Left panel with tabs ──────────────────────────────────────────
function LeftPanel({
  circuit,
  simulator,
}: {
  circuit: UseCircuitReturn;
  simulator: UseSimulatorReturn;
}) {
  const [tab, setTab] = useState<'builder' | 'explainer'>('builder');

  return (
    <div className= { styles.leftPanel } >
    {/* Tab bar */ }
    < div className = { styles.tabBar } >
      <button
          type="button"
  className = {`${styles.tab} ${tab === 'builder' ? styles.tabActive : ''}`
}
onClick = {() => setTab('builder')}
        >
          ⚛ Circuit
  </button>
  < button
type = "button"
className = {`${styles.tab} ${tab === 'explainer' ? styles.tabActive : ''}`}
onClick = {() => setTab('explainer')}
        >
          💬 Explainer
  </button>
  </div>

{
  tab === 'builder' ? (
    <>
    <div className= { styles.card } >
    <CircuitBuilder circuit={ circuit } currentStepIndex = { simulator.stepIndex } />
      </div>
      < div className = { styles.card } >
        <p className={ styles.cardLabel }>▶ Simulation Controls </p>
          < StepControls simulator = { simulator } />
            </div>
            </>
      ) : (
    <>
    <div className= { styles.card } >
    <p className={ styles.cardLabel }>▶ Simulation Controls </p>
      < StepControls simulator = { simulator } />
        </div>
        < div className = { styles.explainerCard } >
          <ExplanationPanel
              circuit={ circuit.circuit }
  stepIndex = { simulator.stepIndex }
  state = { simulator.stateAtStep }
    />
    </div>
    </>
      )
}
</div>
  );
}

// ── Main page ─────────────────────────────────────────────────────
export function Playground() {
  const circuit = useCircuit({ initialQubitCount: 2 });
  const simulator = useSimulator(circuit.circuit, circuit.qubitCount);
  const [selectedQubitIndex, setSelectedQubitIndex] = useState(0);

  return (
    <div className= { styles.root } >
    {/* Background canvas — pointer-events: none so it never blocks UI */ }
    < div className = { styles.canvasShell } >
      <ModuleCanvas camera={ { position: [0, 2, 10], fov: 45 } }>
        <ambientLight intensity={ 1.5 } />
          < pointLight position = { [10, 10, 10]} intensity = { 1} color = "#5DA7DB" />
            </ModuleCanvas>
            </div>

  {/* All interactive UI lives here, on top of the canvas */ }
  <div className={ styles.overlay }>
    {/* ── Top Bar ── */ }
    < header className = { styles.topBar } >
      <h1 className={ styles.topBarTitle }>
        Quantum < span > Playground </span>
        </h1>
        < p className = { styles.topBarSub } > Build circuits · Observe collapse </p>
          < div className = { styles.topBarSpacer } />
            <Link to="/learn" className = { styles.topBarLink } >
            ← Back to Learn
    </Link>
    </header>

  {/* ── Two-column layout ── */ }
  <div className={ styles.grid }>
    <LeftPanel circuit={ circuit } simulator = { simulator } />

      {/* RIGHT — results */ }
      < div className = { styles.rightPanel } >
        <div className={ styles.card }>
          <p className={ styles.cardLabel }>📊 Quantum State </p>
            < StateDisplay
  state = { simulator.stateAtStep }
  nQubits = { circuit.qubitCount }
    />
    </div>

    < div className = { styles.card } >
      <p className={ styles.cardLabel }>🌐 Bloch Sphere </p>
        < BlochSphere
  state = { simulator.stateAtStep }
  nQubits = { circuit.qubitCount }
  selectedQubitIndex = { selectedQubitIndex }
  onQubitIndexChange = { setSelectedQubitIndex }
    />
    </div>
    </div>
    </div>
    </div>
    </div>
  );
}
