import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import type { Theme } from '@/lib/themes'

export interface Article {
  slug: string
  theme: Theme
  title: string
  excerpt: string
  date: string
  content: string
  recommendations: string[]
}

const CONTENT_DIR = path.join(process.cwd(), 'content')

export function getArticlesByTheme(theme: Theme): Article[] {
  const dir = path.join(CONTENT_DIR, theme)
  if (!fs.existsSync(dir)) return []

  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.mdx'))
  if (files.length === 0) return []

  return files
    .map((file) => {
      try {
        const raw = fs.readFileSync(path.join(dir, file), 'utf-8')
        const { data, content } = matter(raw)
        return {
          slug: file.replace('.mdx', ''),
          theme,
          title: data.title ?? 'Untitled',
          excerpt: data.excerpt ?? '',
          date: data.date ?? new Date().toISOString().split('T')[0],
          content,
          recommendations: data.recommendations ?? [],
        } satisfies Article
      } catch {
        return null
      }
    })
    .filter((a): a is Article => a !== null)
    .sort((a, b) => b.date.localeCompare(a.date))
}

export function getArticle(theme: Theme, slug: string): Article | null {
  // Validate slug against safe character allowlist
  if (!/^[a-z0-9-]+$/.test(slug)) return null
  const filePath = path.join(CONTENT_DIR, theme, `${slug}.mdx`)
  if (!fs.existsSync(filePath)) return null

  try {
    const raw = fs.readFileSync(filePath, 'utf-8')
    const { data, content } = matter(raw)
    return {
      slug,
      theme,
      title: data.title ?? 'Untitled',
      excerpt: data.excerpt ?? '',
      date: data.date ?? new Date().toISOString().split('T')[0],
      content,
      recommendations: data.recommendations ?? [],
    }
  } catch {
    return null
  }
}
