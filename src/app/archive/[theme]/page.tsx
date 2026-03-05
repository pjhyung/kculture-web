import { THEMES, THEME_CONFIG } from '@/lib/themes'
import type { Theme } from '@/lib/themes'
import { getArticlesByTheme } from '@/lib/content'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export const revalidate = 86400 // ISR: 24시간

export function generateStaticParams() {
  return THEMES.map((theme) => ({ theme }))
}

interface Props {
  params: Promise<{ theme: string }>
}

export default async function ArchiveThemePage({ params }: Props) {
  const { theme } = await params
  if (!THEMES.includes(theme as Theme)) notFound()

  const config = THEME_CONFIG[theme as Theme]
  const articles = getArticlesByTheme(theme as Theme)

  return (
    <main className="min-h-screen bg-[#0F0F1A] px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <Link href="/dashboard" className="text-[#9A9AB0] text-sm hover:text-[#EAEAEA] mb-6 inline-block">
          ← Back
        </Link>
        <h1 className="font-playfair text-4xl font-bold text-[#EAEAEA] mb-2">
          {config.emoji} {config.label}
        </h1>
        <p className="text-[#9A9AB0] mb-10">{config.description}</p>

        {articles.length === 0 ? (
          <p className="text-[#9A9AB0]">Content coming soon — check back tomorrow!</p>
        ) : (
          <div className="space-y-4">
            {articles.map((article) => (
              <Link
                key={article.slug}
                href={`/archive/${theme}/${article.slug}`}
                className="block p-6 rounded-2xl border border-[#2A2A3E] bg-[#1A1A2E]
                           hover:border-[#E94560] transition-all duration-200"
              >
                <p className="text-[#9A9AB0] text-xs mb-2">{article.date}</p>
                <h2 className="font-playfair text-xl text-[#EAEAEA] mb-2">{article.title}</h2>
                <p className="text-[#9A9AB0] text-sm">{article.excerpt}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
