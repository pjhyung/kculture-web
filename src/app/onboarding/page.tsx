'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence } from 'framer-motion'
import { ONBOARDING_QUESTIONS } from '@/lib/onboarding-questions'
import { scoreThemes } from '@/lib/theme-scorer'
import { SurveyStep } from '@/components/onboarding/SurveyStep'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<{ questionId: string; value: string }[]>([])

  const handleAnswer = (value: string) => {
    const newAnswers = [
      ...answers,
      { questionId: ONBOARDING_QUESTIONS[step].id, value },
    ]
    setAnswers(newAnswers)

    if (step < ONBOARDING_QUESTIONS.length - 1) {
      setStep(step + 1)
    } else {
      const rankedThemes = scoreThemes(newAnswers)
      const params = new URLSearchParams({ themes: rankedThemes.join(',') })
      router.push(`/dashboard?${params.toString()}`)
    }
  }

  return (
    <main className="min-h-screen bg-[#0F0F1A] flex items-center justify-center px-4">
      <AnimatePresence mode="wait">
        <SurveyStep
          key={step}
          question={ONBOARDING_QUESTIONS[step]}
          currentStep={step + 1}
          totalSteps={ONBOARDING_QUESTIONS.length}
          onAnswer={handleAnswer}
        />
      </AnimatePresence>
    </main>
  )
}
