import { useState } from 'react';
import { useCircuit } from '../hooks/useCircuit';
import { useSimulator } from '../hooks/useSimulator';
import { CircuitBuilder } from '../components/CircuitBuilder';
import { StepControls } from '../components/StepControls';
import { BlochSphere } from '../components/BlochSphere';
import { StateDisplay } from '../components/StateDisplay';
import { ExplanationPanel } from '../components/ExplanationPanel';
import { Link } from 'react-router-dom';
import '../App.css';

export function Playground() {
  const circuit = useCircuit({ initialQubitCount: 2 });
  const simulator = useSimulator(circuit.circuit, circuit.qubitCount);
  const [selectedQubitIndex, setSelectedQubitIndex] = useState(0);

  return (
    <main className="app">
      <header className="app-header">
        <h1>Quantum Start</h1>
        <p>Build circuits with drag-and-drop. Step through to see the state and Bloch sphere.</p>
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
