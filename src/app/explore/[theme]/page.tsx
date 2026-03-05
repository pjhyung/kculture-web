import { THEMES, THEME_CONFIG } from '@/lib/themes'
import type { Theme } from '@/lib/themes'
import { ExploreCard } from '@/components/explore/ExploreCard'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export function generateStaticParams() {
  return THEMES.map((theme) => ({ theme }))
}

interface Props {
  params: Promise<{ theme: string }>
}

export default async function ExplorePage({ params }: Props) {
  const { theme } = await params
  if (!THEMES.includes(theme as Theme)) notFound()
  const config = THEME_CONFIG[theme as Theme]

  return (
    <main className="min-h-screen bg-[#0F0F1A] px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <Link href="/dashboard" className="text-[#9A9AB0] text-sm hover:text-[#EAEAEA] mb-6 inline-block">
          ← Back
        </Link>
        <p className="text-[#9A9AB0] mb-2 text-sm uppercase tracking-widest">Exploring</p>
        <h1 className="font-playfair text-4xl font-bold text-[#EAEAEA] mb-8">
          {config.emoji} {config.label}
        </h1>
        <ExploreCard theme={theme as Theme} />
      </div>
    </main>
  )
}
