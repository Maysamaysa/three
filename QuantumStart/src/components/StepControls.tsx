import type { UseSimulatorReturn } from '../hooks/useSimulator';
import styles from './StepControls.module.css';

export interface StepControlsProps {
  simulator: UseSimulatorReturn;
}

export function StepControls({ simulator }: StepControlsProps) {
  const {
    stepIndex,
    numSteps,
    goNext,
    goPrev,
    goToStart,
    goToEnd,
    reset,
    canGoNext,
    canGoPrev,
  } = simulator;

  return (
    <div className={styles.controls}>
      <div className={styles.row}>
        <button
          type="button"
          className={styles.btn}
          onClick={goToStart}
          disabled={stepIndex === -1}
          title="Reset to initial state"
        >
          Start
        </button>
        <button
          type="button"
          className={styles.btn}
          onClick={goPrev}
          disabled={!canGoPrev}
          title="Previous step"
        >
          Previous
        </button>
        <span className={styles.stepInfo}>
          Step {stepIndex + 1} of {numSteps || 0}
        </span>
        <button
          type="button"
          className={styles.btn}
          onClick={goNext}
          disabled={!canGoNext}
          title="Next step"
        >
          Next
        </button>
        <button
          type="button"
          className={styles.btn}
          onClick={goToEnd}
          disabled={stepIndex >= numSteps - 1 && numSteps > 0}
          title="Run to end"
        >
          End
        </button>
      </div>
      <button
        type="button"
        className={styles.resetBtn}
        onClick={reset}
        title="Reset simulation"
      >
        Reset simulation
      </button>
    </div>
  );
}
