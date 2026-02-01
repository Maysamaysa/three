import { useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { GatePalette } from './GatePalette';
import { CircuitGrid } from './CircuitGrid';
import type { Gate } from '../../lib/circuit/types';
import {
  singleQubitGate,
  twoQubitGate,
  type SingleQubitGateType,
  type TwoQubitGateType,
  MIN_QUBITS,
  MAX_QUBITS,
} from '../../lib/circuit/types';
import type { UseCircuitReturn } from '../../hooks/useCircuit';
import styles from './CircuitBuilder.module.css';

export interface CircuitBuilderProps {
  circuit: UseCircuitReturn;
}

function parseGateType(type: string): Gate | null {
  if (['H', 'X', 'Y', 'Z', 'S', 'T'].includes(type)) {
    return singleQubitGate(type as SingleQubitGateType, 0);
  }
  if (type === 'CNOT' || type === 'CZ') {
    return twoQubitGate(type as TwoQubitGateType, 0, 1);
  }
  return null;
}

export function CircuitBuilder({ circuit }: CircuitBuilderProps) {
  const {
    qubitCount,
    setQubitCount,
    circuit: gates,
    addGate,
    removeGate,
    moveGate,
    clearCircuit,
  } = circuit;

  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = event;
      if (!over) return;

      const activeId = String(active.id);
      const overId = String(over.id);

      if (activeId.startsWith('palette-')) {
        const gateType = activeId.replace('palette-', '');
        if (overId === 'circuit-append') {
          const gate = parseGateType(gateType);
          if (gate) addGate(gate);
        }
        return;
      }

      if (activeId.startsWith('circuit-')) {
        const fromIndex = parseInt(activeId.replace('circuit-', ''), 10);
        if (Number.isNaN(fromIndex)) return;
        if (overId === 'circuit-append') {
          moveGate(fromIndex, gates.length - 1);
          return;
        }
        if (overId.startsWith('circuit-')) {
          const toIndex = parseInt(overId.replace('circuit-', ''), 10);
          if (!Number.isNaN(toIndex) && fromIndex !== toIndex) {
            moveGate(fromIndex, toIndex);
          }
        }
      }
    },
    [addGate, moveGate]
  );

  const sortableIds = gates.map((_, i) => `circuit-${i}`);

  return (
    <div className={styles.builder}>
      <div className={styles.toolbar}>
        <label className={styles.label}>
          Qubits
          <select
            value={qubitCount}
            onChange={(e) => setQubitCount(Number(e.target.value))}
            className={styles.select}
          >
            {Array.from(
              { length: MAX_QUBITS - MIN_QUBITS + 1 },
              (_: unknown, i: number) => MIN_QUBITS + i
            ).map((n: number) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className={styles.clearBtn} onClick={clearCircuit}>
          Clear circuit
        </button>
      </div>
      <div className={styles.main}>
        <GatePalette />
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortableIds}
            strategy={horizontalListSortingStrategy}
          >
            <CircuitGrid
              circuit={gates}
              qubitCount={qubitCount}
              onRemoveGate={removeGate}
            />
          </SortableContext>
          <DragOverlay>
            {activeId ? (
              activeId.startsWith('palette-') ? (
                <div className={styles.dragOverlay}>
                  {activeId.replace('palette-', '')}
                </div>
              ) : (
                <div className={styles.dragOverlay}>
                  Gate
                </div>
              )
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
