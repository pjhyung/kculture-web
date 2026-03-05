'use client'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { THEMES } from '@/lib/themes'
import type { Theme } from '@/lib/themes'
import { ThemeCard } from '@/components/layout/ThemeCard'

function DashboardContent() {
  const params = useSearchParams()
  const themesParam = params.get('themes')
  const rankedThemes: Theme[] = themesParam
    ? themesParam.split(',').filter((t): t is Theme => (THEMES as readonly string[]).includes(t))
    : [...THEMES]

  const topThemes = rankedThemes.slice(0, 2)

  return (
    <main className="min-h-screen bg-[#0F0F1A] px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <p className="text-[#E94560] uppercase tracking-widest text-sm mb-2">
          Your Korean World
        </p>
        <h1 className="font-playfair text-4xl font-bold text-[#EAEAEA] mb-3">
          Welcome to K-World
        </h1>
        <p className="text-[#9A9AB0] mb-10">
          {themesParam
            ? 'Based on your interests, we highlighted your top themes below.'
            : 'Explore all available K-Culture themes.'}
        </p>

        {/* 추천 테마 (상위 2개 강조) */}
        {topThemes.length > 0 && (
          <>
            <h2 className="text-[#EAEAEA] font-medium mb-4">
              <span aria-hidden="true">✨ </span>Recommended for you
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
              {topThemes.map((theme) => (
                <ThemeCard key={theme} theme={theme} highlighted />
              ))}
            </div>
          </>
        )}

        {/* 나머지 테마 */}
        <h2 className="text-[#9A9AB0] font-medium mb-4">Explore all worlds</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rankedThemes.slice(2).map((theme) => (
            <ThemeCard key={theme} theme={theme} />
          ))}
        </div>
      </div>
    </main>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0F0F1A]" />}>
      <DashboardContent />
    </Suspense>
  )
}
