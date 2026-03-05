'use client'
import { motion } from 'framer-motion'
import type { OnboardingQuestion } from '@/lib/onboarding-questions'

interface Props {
  question: OnboardingQuestion
  currentStep: number
  totalSteps: number
  onAnswer: (value: string) => void
}

export function SurveyStep({ question, currentStep, totalSteps, onAnswer }: Props) {
  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-xl mx-auto"
    >
      {/* 진행 바 */}
      <div className="flex gap-2 mb-10">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-500 ${
              i < currentStep ? 'bg-[#E94560]' : 'bg-[#2A2A3E]'
            }`}
          />
        ))}
      </div>

      <p className="text-[#9A9AB0] text-sm mb-3">
        Question {currentStep} of {totalSteps}
      </p>
      <h2 className="font-playfair text-3xl font-bold text-[#EAEAEA] mb-8">
        {question.text}
      </h2>

      <div className="grid grid-cols-1 gap-3">
        {question.options.map((option) => (
          <button
            key={option.value}
            onClick={() => onAnswer(option.value)}
            className="flex items-center gap-4 p-4 rounded-xl border border-[#2A2A3E]
                       bg-[#1A1A2E] hover:border-[#E94560] hover:bg-[#E94560]/10
                       transition-all duration-200 text-left group cursor-pointer"
          >
            <span className="text-2xl">{option.emoji}</span>
            <span className="text-[#EAEAEA] group-hover:text-white font-medium">
              {option.label}
            </span>
          </button>
        ))}
      </div>
    </motion.div>
  )
}
