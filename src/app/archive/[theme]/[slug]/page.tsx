import { THEMES, THEME_CONFIG } from '@/lib/themes'
import type { Theme } from '@/lib/themes'
import { getArticle, getArticlesByTheme } from '@/lib/content'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MDXRemote } from 'next-mdx-remote/rsc'

export const revalidate = 86400

export async function generateStaticParams() {
  const params: { theme: string; slug: string }[] = []
  for (const theme of THEMES) {
    const articles = getArticlesByTheme(theme)
    for (const article of articles) {
      params.push({ theme, slug: article.slug })
    }
  }
  return params
}

interface Props {
  params: Promise<{ theme: string; slug: string }>
}

export default async function ArticlePage({ params }: Props) {
  const { theme, slug } = await params
  if (!THEMES.includes(theme as Theme)) notFound()

  const article = getArticle(theme as Theme, slug)
  if (!article) notFound()

  const config = THEME_CONFIG[theme as Theme]

  return (
    <main className="min-h-screen bg-[#0F0F1A] px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <Link
          href={`/archive/${theme}`}
          className="text-[#9A9AB0] text-sm hover:text-[#EAEAEA] mb-6 inline-block"
        >
          ← {config.label}
        </Link>

        <p className="text-[#9A9AB0] text-xs mb-4">{article.date}</p>
        <h1 className="font-playfair text-3xl font-bold text-[#EAEAEA] mb-4">
          {article.title}
        </h1>
        <p className="text-[#9A9AB0] mb-8">{article.excerpt}</p>

        <div className="text-[#EAEAEA] [&>p]:text-[#CDCDE0] [&>p]:mb-4 [&>p]:leading-relaxed [&>h2]:font-playfair [&>h2]:text-2xl [&>h2]:text-[#EAEAEA] [&>h2]:mt-8 [&>h2]:mb-4 [&>h3]:font-playfair [&>h3]:text-xl [&>h3]:text-[#EAEAEA] [&>h3]:mt-6 [&>h3]:mb-3 [&>strong]:text-[#EAEAEA]">
          <MDXRemote source={article.content} />
        </div>

        {article.recommendations.length > 0 && (
          <div className="mt-10 p-6 rounded-2xl border border-[#2A2A3E] bg-[#1A1A2E]">
            <h3 className="font-playfair text-lg text-[#F5A623] mb-4">Recommendations</h3>
            <ul className="space-y-2">
              {article.recommendations.map((rec) => (
                <li key={rec} className="text-[#9A9AB0] text-sm flex items-start gap-2">
                  <span className="text-[#E94560] mt-0.5">→</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  )
}
