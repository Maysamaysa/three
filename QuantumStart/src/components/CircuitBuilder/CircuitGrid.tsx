import { useDroppable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Gate } from '../../lib/circuit/types';
import { isTwoQubitGate } from '../../lib/circuit/types';
import styles from './CircuitGrid.module.css';

function GateBox({ gate, onRemove }: { gate: Gate; onRemove: () => void }) {
  const isTwo = isTwoQubitGate(gate.type);
  const control = gate.controls?.[0];
  const target = gate.targets[0];
  return (
    <div className={styles.gateBox} data-two-qubit={isTwo || undefined}>
      <span className={styles.gateLabel}>{gate.type}</span>
      {isTwo && (
        <span className={styles.gateSub}>
          {control}→{target}
        </span>
      )}
      <button
        type="button"
        className={styles.removeBtn}
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        aria-label="Remove gate"
      >
        ×
      </button>
    </div>
  );
}

interface SortableGateColumnProps {
  gate: Gate;
  index: number;
  qubitCount: number;
  onRemove: () => void;
}

function SortableGateColumn({
  gate,
  index,
  qubitCount,
  onRemove,
}: SortableGateColumnProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `circuit-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const control = isTwoQubitGate(gate.type) ? gate.controls?.[0] : undefined;
  const target = gate.targets[0];

  const colIndex = index + 1;
  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        gridColumn: colIndex,
        gridRow: '1 / -1',
        display: 'grid',
        gridTemplateRows: `repeat(${qubitCount}, 1fr)`,
      }}
      className={styles.gateColumn}
      data-dragging={isDragging || undefined}
      {...attributes}
      {...listeners}
    >
      {Array.from({ length: qubitCount }, (_, q) => {
        if (isTwoQubitGate(gate.type) && control !== undefined) {
          if (q === control) {
            return (
              <div key={q} className={styles.cell}>
                <div className={styles.controlDot} title="Control" />
              </div>
            );
          }
          if (q === target) {
            return (
              <div key={q} className={styles.cell}>
                <GateBox gate={gate} onRemove={onRemove} />
              </div>
            );
          }
          return (
            <div key={q} className={styles.cell}>
              <div className={styles.wireSegment} />
            </div>
          );
        }
        if (q === target) {
          return (
            <div key={q} className={styles.cell}>
              <GateBox gate={gate} onRemove={onRemove} />
            </div>
          );
        }
        return (
          <div key={q} className={styles.cell}>
            <div className={styles.wireSegment} />
          </div>
        );
      })}
    </div>
  );
}

export interface CircuitGridProps {
  circuit: readonly Gate[];
  qubitCount: number;
  onRemoveGate: (index: number) => void;
}

export function CircuitGrid({
  circuit,
  qubitCount,
  onRemoveGate,
}: CircuitGridProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'circuit-append',
    data: { type: 'append' },
  });

  return (
    <div className={styles.grid}>
      <div className={styles.wireLabels}>
        {Array.from({ length: qubitCount }, (_, q) => (
          <div key={q} className={styles.wireLabel}>
            q{q}
          </div>
        ))}
      </div>
      <div
        className={styles.strip}
        style={{
          gridTemplateColumns: `repeat(${circuit.length + 1}, minmax(64px, auto))`,
          gridTemplateRows: `repeat(${qubitCount}, 1fr)`,
        }}
      >
        {circuit.map((gate, i) => (
          <SortableGateColumn
            key={`${i}-${gate.type}-${(gate.controls ?? []).join('-')}-${gate.targets.join('-')}`}
            gate={gate}
            index={i}
            qubitCount={qubitCount}
            onRemove={() => onRemoveGate(i)}
          />
        ))}
        <div
          ref={setNodeRef}
          className={styles.dropZone}
          style={{ gridColumn: circuit.length + 1, gridRow: `1 / -1` }}
          data-over={isOver || undefined}
        >
          Drop gate here
        </div>
      </div>
    </div>
  );
}
