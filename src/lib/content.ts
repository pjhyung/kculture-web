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
      }
    })
    .sort((a, b) => b.date.localeCompare(a.date))
}

export function getArticle(theme: Theme, slug: string): Article | null {
  const filePath = path.join(CONTENT_DIR, theme, `${slug}.mdx`)
  if (!fs.existsSync(filePath)) return null

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
}
