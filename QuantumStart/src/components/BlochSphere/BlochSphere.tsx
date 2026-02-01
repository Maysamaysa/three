import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { Complex } from '../../lib/simulator/stateVector';
import { stateToBlochVector } from '../../lib/simulator/bloch';
import styles from './BlochSphere.module.css';

const RADIUS = 1.2;

function SphereAndAxes() {
  return (
    <>
      <mesh>
        <sphereGeometry args={[RADIUS, 32, 24]} />
        <meshBasicMaterial
          color="#e3f2fd"
          wireframe
          transparent
          opacity={0.6}
        />
      </mesh>
      <axesHelper args={[RADIUS * 1.1]} />
    </>
  );
}

function BlochArrow({ x, y, z, length }: { x: number; y: number; z: number; length: number }) {
  const arrowLength = Math.min(length * RADIUS * 0.9, RADIUS * 0.95);
  const len = Math.sqrt(x * x + y * y + z * z) || 1;
  const dx = x / len;
  const dy = y / len;
  const dz = z / len;
  const pitch = -Math.acos(Math.max(-1, Math.min(1, dy)));
  const yaw = Math.atan2(dx, dz);
  const coneHeight = 0.15;
  const coneRad = 0.08;
  const cylinderHeight = Math.max(0.01, arrowLength - coneHeight);
  const cylinderRad = 0.03;

  return (
    <group rotation={[pitch, yaw, 0]}>
      {cylinderHeight > 0.01 && (
        <mesh position={[0, cylinderHeight / 2, 0]}>
          <cylinderGeometry args={[cylinderRad, cylinderRad, cylinderHeight, 16]} />
          <meshBasicMaterial color="#1565c0" />
        </mesh>
      )}
      {arrowLength > 0.1 && (
        <mesh position={[0, arrowLength, 0]}>
          <coneGeometry args={[coneRad, coneHeight, 16]} />
          <meshBasicMaterial color="#1565c0" />
        </mesh>
      )}
    </group>
  );
}

function Scene({
  state,
  nQubits,
  selectedQubit,
}: {
  state: Complex[];
  nQubits: number;
  selectedQubit: number;
}) {
  const bloch = stateToBlochVector(state, nQubits, selectedQubit);

  return (
    <>
      <SphereAndAxes />
      <BlochArrow
        x={bloch.x}
        y={bloch.y}
        z={bloch.z}
        length={bloch.length}
      />
    </>
  );
}

export interface BlochSphereProps {
  state: Complex[];
  nQubits: number;
  selectedQubitIndex: number;
  onQubitIndexChange: (index: number) => void;
}

export function BlochSphere({
  state,
  nQubits,
  selectedQubitIndex,
  onQubitIndexChange,
}: BlochSphereProps) {
  const bloch = stateToBlochVector(state, nQubits, selectedQubitIndex);

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span className={styles.label}>Bloch sphere</span>
        <div className={styles.qubitSelector}>
          <span className={styles.qubitLabel}>Qubit:</span>
          {Array.from({ length: nQubits }, (_, i) => (
            <button
              key={i}
              type="button"
              className={styles.qubitBtn}
              data-selected={selectedQubitIndex === i || undefined}
              onClick={() => onQubitIndexChange(i)}
            >
              {i}
            </button>
          ))}
        </div>
      </div>
      {!bloch.isPure && (
        <p className={styles.mixedNote}>Mixed state (arrow length &lt; 1)</p>
      )}
      <div className={styles.canvasWrap}>
        <Canvas
          camera={{ position: [2.5, 2, 2.5], fov: 45 }}
          gl={{ antialias: true }}
        >
          <Scene
            state={state}
            nQubits={nQubits}
            selectedQubit={selectedQubitIndex}
          />
          <OrbitControls enableDamping dampingFactor={0.05} />
        </Canvas>
      </div>
    </div>
  );
}
