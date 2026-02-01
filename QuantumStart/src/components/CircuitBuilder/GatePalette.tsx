import { useDraggable } from '@dnd-kit/core';
import type { SingleQubitGateType, TwoQubitGateType } from '../../lib/circuit/types';
import styles from './GatePalette.module.css';

export type PaletteGateType = SingleQubitGateType | TwoQubitGateType;

const SINGLE_GATES: SingleQubitGateType[] = ['H', 'X', 'Y', 'Z', 'S', 'T'];
const TWO_GATES: TwoQubitGateType[] = ['CNOT', 'CZ'];

function DraggableGate({ id, label }: { id: string; label: string }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
    data: { type: 'palette', gateType: label },
  });
  return (
    <button
      ref={setNodeRef}
      type="button"
      className={styles.gateButton}
      data-dragging={isDragging || undefined}
      {...listeners}
      {...attributes}
    >
      {label}
    </button>
  );
}

export function GatePalette() {
  return (
    <div className={styles.palette}>
      <h3 className={styles.title}>Gates</h3>
      <div className={styles.section}>
        <span className={styles.sectionLabel}>Single qubit</span>
        <div className={styles.gateList}>
          {SINGLE_GATES.map((g) => (
            <DraggableGate key={g} id={`palette-${g}`} label={g} />
          ))}
        </div>
      </div>
      <div className={styles.section}>
        <span className={styles.sectionLabel}>Two qubit</span>
        <div className={styles.gateList}>
          {TWO_GATES.map((g) => (
            <DraggableGate key={g} id={`palette-${g}`} label={g} />
          ))}
        </div>
      </div>
    </div>
  );
}
