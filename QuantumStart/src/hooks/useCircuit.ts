import { useState, useCallback } from 'react';
import type { Circuit, Gate } from '../lib/circuit/types';
import { MIN_QUBITS, MAX_QUBITS } from '../lib/circuit/types';
import { validateCircuit } from '../lib/circuit/validation';

export interface UseCircuitOptions {
  initialQubitCount?: number;
  initialCircuit?: Circuit;
}

export function useCircuit(options: UseCircuitOptions = {}) {
  const [qubitCount, setQubitCountState] = useState(
    options.initialQubitCount ?? 2
  );
  const [circuit, setCircuit] = useState<Gate[]>(
    options.initialCircuit ? [...options.initialCircuit] : []
  );

  const setQubitCount = useCallback((n: number) => {
    const clamped = Math.max(MIN_QUBITS, Math.min(MAX_QUBITS, n));
    setQubitCountState(clamped);
    setCircuit((prev) => {
      const maxQ = clamped - 1;
      return prev.filter((g) => {
        const indices = [...g.targets, ...(g.controls ?? [])];
        return indices.every((i) => i >= 0 && i <= maxQ);
      });
    });
  }, []);

  const addGate = useCallback(
    (gate: Gate) => {
      const errors = validateCircuit([gate], qubitCount);
      if (errors.length > 0) return;
      setCircuit((prev) => [...prev, gate]);
    },
    [qubitCount]
  );

  const removeGate = useCallback((index: number) => {
    setCircuit((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const moveGate = useCallback((fromIndex: number, toIndex: number) => {
    setCircuit((prev) => {
      const next = [...prev];
      const [removed] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, removed);
      return next;
    });
  }, []);

  const setCircuitOrder = useCallback((ordered: Gate[]) => {
    setCircuit(ordered);
  }, []);

  const clearCircuit = useCallback(() => {
    setCircuit([]);
  }, []);

  const validationErrors = validateCircuit(circuit, qubitCount);

  return {
    qubitCount,
    setQubitCount,
    circuit,
    addGate,
    removeGate,
    moveGate,
    setCircuitOrder,
    clearCircuit,
    validationErrors,
    isValid: validationErrors.length === 0,
  };
}

export type UseCircuitReturn = ReturnType<typeof useCircuit>;
