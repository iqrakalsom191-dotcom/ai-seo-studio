'use client'

import { Check } from 'lucide-react'

const STEPS = ['Keyword', 'Research', 'Content Plan', 'Write', 'Publish']

export default function ProjectStepper({ currentStep, onStepClick }) {
  return (
    <div className="flex items-center w-full mb-8">
      {STEPS.map((label, i) => {
        const step = i + 1
        const isDone = step < currentStep
        const isActive = step === currentStep
        const isLast = i === STEPS.length - 1

        return (
          <div key={label} className={`flex items-center ${isLast ? '' : 'flex-1'}`}>
            <button
              onClick={() => onStepClick?.(step)}
              className="flex flex-col items-center gap-2 shrink-0"
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition"
                style={
                  isDone
                    ? { background: '#FFD4C2', color: '#1a1a1a' }
                    : isActive
                    ? { background: '#FF6B35', color: '#fff', boxShadow: '0 0 0 4px rgba(255,107,53,0.2)' }
                    : { background: '#1a1a1a', color: '#666', border: '1px solid #1f1f1f' }
                }
              >
                {isDone ? <Check size={16} /> : step}
              </div>
              <span
                className="text-xs font-medium whitespace-nowrap"
                style={{ color: isActive ? '#FF6B35' : isDone ? '#FFD4C2' : '#666' }}
              >
                {label}
              </span>
            </button>

            {!isLast && (
              <div
                className="flex-1 h-[2px] mx-2 mb-5"
                style={{ background: isDone ? '#FFD4C2' : '#1f1f1f' }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
