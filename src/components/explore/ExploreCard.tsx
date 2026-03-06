'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChoiceButton } from './ChoiceButton'
import type { Theme } from '@/lib/themes'
import { THEME_CONFIG } from '@/lib/themes'
import Link from 'next/link'

interface Recommendation {
  type: string
  title: string
  reason: string
}

interface ExploreData {
  content: string
  choices: { value: string; label: string }[]
  recommendations: Recommendation[]
  model?: string
  cached?: boolean
}

interface Props {
  theme: Theme
}

export function ExploreCard({ theme }: Props) {
  const [step, setStep] = useState(1)
  const [data, setData] = useState<ExploreData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [hasError, setHasError] = useState(false)
  const themeConfig = THEME_CONFIG[theme]

  const fetchExplore = async (choice: string, signal?: AbortSignal) => {
    setLoading(true)
    try {
      const res = await fetch('/api/explore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme, step, choice }),
        signal,
      })
      if (!res.ok) throw new Error('API error')
      const result: ExploreData = await res.json()
      setData(result)
      setStep(prev => prev + 1)
      setHasError(false)
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      setHasError(true)
    } finally {
      setLoading(false)
      setIsTransitioning(false)
    }
  }

  const handleChoice = (choice: string) => {
    if (isTransitioning) return
    setIsTransitioning(true)
    fetchExplore(choice)
  }

  useEffect(() => {
    const controller = new AbortController()
    // step은 초기값(1)이 고정이므로 deps 생략 안전
    fetchExplore('start', controller.signal)
    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 에러 발생 시 재시도 화면
  if (!loading && hasError) {
    return (
      <div className="text-center py-10">
        <p className="text-[#9A9AB0] mb-6">Something went wrong. Please try again.</p>
        <button
          onClick={() => { setHasError(false); fetchExplore('start') }}
          className="bg-[#E94560] text-white px-6 py-3 rounded-full hover:bg-[#c73650] transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  // 최대 7스텝 또는 선택지 없을 때 완료 화면
  if (!loading && !hasError && (step > 7 || (data && data.choices.length === 0))) {
    return (
      <div className="text-center py-10">
        <p className="text-[#F5A623] text-xl font-playfair mb-4">Journey Complete!</p>
        <p className="text-[#9A9AB0] mb-6">Explore our archive to go deeper.</p>
        <Link
          href={`/archive/${theme}`}
          className="bg-[#E94560] text-white px-6 py-3 rounded-full hover:bg-[#c73650] transition-colors"
        >
          Read More →
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4 py-10"
          >
            <div className="text-4xl animate-bounce">{themeConfig.emoji}</div>
            <p className="text-[#9A9AB0]">Exploring Korean culture for you...</p>
          </motion.div>
        ) : (
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* 콘텐츠 카드 */}
            <div className="p-6 rounded-2xl border border-[#2A2A3E] bg-[#1A1A2E]">
              <p className="text-[#EAEAEA] leading-relaxed">{data?.content}</p>
            </div>

            {/* 추천 배지 */}
            {data?.recommendations && data.recommendations.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {data.recommendations.map((rec) => (
                  <span
                    key={rec.title}
                    className="text-xs px-3 py-1 rounded-full bg-[#F5A623]/20 text-[#F5A623]"
                  >
                    {rec.type}: {rec.title}
                  </span>
                ))}
              </div>
            )}

            {/* 선택지 */}
            {data?.choices && data.choices.length > 0 && (
              <div className="space-y-3">
                <p className="text-[#9A9AB0] text-sm">Choose your path:</p>
                {data.choices.map((choice, i) => (
                  <ChoiceButton
                    key={choice.value}
                    label={choice.label}
                    onClick={() => handleChoice(choice.value)}
                    index={i}
                    disabled={isTransitioning}
                  />
                ))}
              </div>
            )}

            <p className="text-[#9A9AB0] text-xs text-right">
              Step {Math.max(1, step - 1)} · {data?.cached ? '⚡ cached' : `AI: ${data?.model}`}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
