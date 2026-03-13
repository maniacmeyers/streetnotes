'use client'

import { motion } from 'motion/react'
import { FaCheck } from 'react-icons/fa'

type ProcessingPhase = 'transcribing' | 'extracting' | 'complete'

interface ProcessingStepsProps {
  phase: ProcessingPhase
  error: string | null
  onRetry: () => void
}

interface StepConfig {
  key: string
  label: string
  activeLabel: string
}

const STEPS: StepConfig[] = [
  {
    key: 'transcribing',
    label: 'Transcribe audio',
    activeLabel: 'Transcribing your recording...',
  },
  {
    key: 'extracting',
    label: 'Extract deal intelligence',
    activeLabel: 'Extracting deal intelligence...',
  },
]

function getStepState(
  stepKey: string,
  phase: ProcessingPhase
): 'pending' | 'active' | 'complete' {
  const stepOrder = ['transcribing', 'extracting']
  const stepIndex = stepOrder.indexOf(stepKey)
  const phaseIndex =
    phase === 'complete' ? stepOrder.length : stepOrder.indexOf(phase)

  if (stepIndex < phaseIndex) return 'complete'
  if (stepIndex === phaseIndex) return 'active'
  return 'pending'
}

function Spinner() {
  return (
    <div className="w-6 h-6 border-3 border-volt/30 border-t-volt rounded-full animate-spin" />
  )
}

export default function ProcessingSteps({
  phase,
  error,
  onRetry,
}: ProcessingStepsProps) {
  return (
    <div className="relative flex flex-col items-center gap-8 sm:gap-12 py-8 sm:py-16">
      {/* Watermark */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
        aria-hidden="true"
      >
        <span
          className="font-display text-[200px] sm:text-[300px] text-white"
          style={{ opacity: 0.02 }}
        >
          SN
        </span>
      </div>

      {/* Steps */}
      <div className="relative flex flex-col gap-6 w-full max-w-sm">
        {STEPS.map((stepConfig, i) => {
          const state = error ? 'active' : getStepState(stepConfig.key, phase)

          return (
            <motion.div
              key={stepConfig.key}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15, duration: 0.3 }}
              className="flex items-center gap-4"
            >
              {/* Icon */}
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                {state === 'complete' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: 'spring',
                      stiffness: 500,
                      damping: 20,
                    }}
                    className="w-8 h-8 rounded-full bg-volt border-3 border-black flex items-center justify-center"
                  >
                    <FaCheck className="text-black text-xs" />
                  </motion.div>
                )}
                {state === 'active' && !error && <Spinner />}
                {state === 'active' && error && (
                  <div className="w-8 h-8 rounded-full border-3 border-red-500 flex items-center justify-center">
                    <span className="text-red-500 font-bold text-sm">!</span>
                  </div>
                )}
                {state === 'pending' && (
                  <div className="w-8 h-8 rounded-full border-3 border-gray-600" />
                )}
              </div>

              {/* Label */}
              <span
                className={`font-mono text-sm uppercase tracking-wider ${
                  state === 'complete'
                    ? 'text-gray-500'
                    : state === 'active'
                      ? error
                        ? 'text-red-400'
                        : 'text-volt font-bold'
                      : 'text-gray-600'
                }`}
              >
                {state === 'active' && !error
                  ? stepConfig.activeLabel
                  : stepConfig.label}
              </span>
            </motion.div>
          )
        })}
      </div>

      {/* Error state */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm flex flex-col gap-4"
        >
          <div className="border-4 border-red-500 bg-red-500/10 p-4">
            <p className="font-mono text-xs uppercase tracking-[0.1em] text-red-400">
              {error}
            </p>
          </div>
          <button
            type="button"
            onClick={onRetry}
            className="brutalist-btn bg-volt text-black w-full text-center"
          >
            Retry
          </button>
        </motion.div>
      )}

      {/* Processing text */}
      {!error && phase !== 'complete' && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="font-body text-sm text-gray-500 text-center max-w-xs"
        >
          This usually takes 10-15 seconds. Hang tight.
        </motion.p>
      )}
    </div>
  )
}
