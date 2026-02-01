import { useState, useMemo, useCallback, useEffect } from 'react';
import type { Circuit } from '../lib/circuit/types';
import { getStateAfterStep } from '../lib/simulator/applyGate';

export function useSimulator(circuit: Circuit, qubitCount: number) {
  const [stepIndex, setStepIndex] = useState(-1);

  useEffect(() => {
    setStepIndex(-1);
  }, [circuit.length, qubitCount]);

  const numSteps = circuit.length;
  const maxStepIndex = numSteps > 0 ? numSteps - 1 : -1;

  const stateAtStep = useMemo(
    () => getStateAfterStep(circuit, qubitCount, stepIndex),
    [circuit, qubitCount, stepIndex]
  );

  const goNext = useCallback(() => {
    setStepIndex((i) => (i < maxStepIndex ? i + 1 : i));
  }, [maxStepIndex]);

  const goPrev = useCallback(() => {
    setStepIndex((i) => (i >= 0 ? i - 1 : i));
  }, []);

  const goToStart = useCallback(() => {
    setStepIndex(-1);
  }, []);

  const goToEnd = useCallback(() => {
    setStepIndex(maxStepIndex);
  }, [maxStepIndex]);

  const reset = useCallback(() => {
    setStepIndex(-1);
  }, []);

  const canGoNext = stepIndex < maxStepIndex;
  const canGoPrev = stepIndex >= 0;
  const isAtStart = stepIndex === -1;
  const isAtEnd = numSteps > 0 && stepIndex === maxStepIndex;

  const api = {
    stepIndex,
    numSteps,
    stateAtStep,
    goNext,
    goPrev,
    goToStart,
    goToEnd,
    reset,
    canGoNext,
    canGoPrev,
    isAtStart,
    isAtEnd,
  };
  return api;
}

export type UseSimulatorReturn = ReturnType<typeof useSimulator>;
