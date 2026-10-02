import React, { useCallback } from 'react';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';

export interface WizardStep {
  id: string;
  title: string;
  description?: string;
}

export interface WizardStepperProps {
  steps: WizardStep[];
  currentStepIndex: number;
  onStepChange: (newIndex: number) => void;
  canAdvance?: boolean;
  onComplete?: () => void;
  completeLabel?: string;
  nextLabel?: string;
  backLabel?: string;
}

/**
 * WizardStepper
 * Production-ready multi-step wizard state machine and indicator component.
 * Features mobile-optimized thumb-zone navigation controls and step progress feedback.
 */
export const WizardStepper: React.FC<WizardStepperProps> = ({
  steps,
  currentStepIndex,
  onStepChange,
  canAdvance = true,
  onComplete,
  completeLabel = 'Hoàn Tất',
  nextLabel = 'Tiếp Tục',
  backLabel = 'Quay Lại',
}) => {
  // REACT RULES OF HOOKS INVARIANT: All hooks placed unconditionally at top of component
  const handlePrev = useCallback(() => {
    if (currentStepIndex > 0) {
      onStepChange(currentStepIndex - 1);
    }
  }, [currentStepIndex, onStepChange]);

  const handleNext = useCallback(() => {
    if (!canAdvance) return;

    if (currentStepIndex < steps.length - 1) {
      onStepChange(currentStepIndex + 1);
    } else if (onComplete) {
      onComplete();
    }
  }, [canAdvance, currentStepIndex, steps.length, onStepChange, onComplete]);

  const isLastStep = currentStepIndex === steps.length - 1;

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col gap-6">
      {/* Progress Indicators Bar (Hard / Reach Zone) */}
      <nav aria-label="Tiến trình các bước" className="w-full px-2">
        <ol className="flex items-center justify-between w-full relative">
          {/* Connector Line Background */}
          <div 
            aria-hidden="true"
            className="absolute top-1/2 left-4 right-4 -translate-y-1/2 h-0.5 bg-stone-200 dark:bg-stone-800 -z-0"
          />
          {/* Active Connector Progress */}
          <div
            aria-hidden="true"
            style={{
              width: `${steps.length > 1 ? (currentStepIndex / (steps.length - 1)) * 100 : 0}%`,
            }}
            className="absolute top-1/2 left-4 -translate-y-1/2 h-0.5 bg-[#4F46E5] transition-all duration-300 -z-0"
          />

          {steps.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <li key={step.id} className="relative z-10 flex flex-col items-center">
                <button
                  type="button"
                  disabled={idx > currentStepIndex}
                  onClick={() => idx < currentStepIndex && onStepChange(idx)}
                  aria-current={isCurrent ? 'step' : undefined}
                  className={`w-10 h-10 min-w-[40px] min-h-[40px] rounded-full flex items-center justify-center font-medium text-sm transition-all duration-200 ${
                    isCompleted
                      ? 'bg-[#4F46E5] text-white'
                      : isCurrent
                      ? 'bg-[#4F46E5] text-white ring-4 ring-indigo-100 dark:ring-indigo-950/60'
                      : 'bg-stone-200 dark:bg-stone-800 text-stone-500 dark:text-stone-400'
                  }`}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : idx + 1}
                </button>
                <span className={`text-xs mt-1.5 font-medium truncate max-w-[80px] text-center ${
                  isCurrent 
                    ? 'text-[#1C1917] dark:text-[#FAF8F5]' 
                    : 'text-stone-400 dark:text-stone-500'
                }`}>
                  {step.title}
                </span>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Stepper Navigation Buttons (Natural Thumb Zone) */}
      <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#E8E2D8] dark:border-[#252220]">
        <button
          type="button"
          disabled={currentStepIndex === 0}
          onClick={handlePrev}
          className="flex items-center justify-center gap-1.5 px-5 py-3 min-h-[44px] rounded-xl text-sm font-medium text-stone-700 dark:text-stone-200 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{backLabel}</span>
        </button>

        <button
          type="button"
          disabled={!canAdvance}
          onClick={handleNext}
          className="flex-1 flex items-center justify-center gap-1.5 px-6 py-3 min-h-[44px] rounded-xl text-sm font-medium text-white bg-[#4F46E5] hover:bg-[#4338CA] active:bg-[#3730A3] disabled:opacity-50 disabled:pointer-events-none shadow-sm transition-colors"
        >
          <span>{isLastStep ? completeLabel : nextLabel}</span>
          {!isLastStep && <ChevronRight className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
