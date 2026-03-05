import { GoogleGenerativeAI } from '@google/generative-ai'
import fs from 'fs'
import path from 'path'

const THEMES = ['tradition', 'kdrama', 'kpop', 'daily', 'seoul', 'fantasy'] as const

const THEME_PROMPTS: Record<typeof THEMES[number], string> = {
  tradition: 'Korean traditional culture, Joseon dynasty, hanbok, royal palaces, ancestral rites',
  kdrama: 'Korean drama industry, storytelling culture, filming locations, genre conventions',
  kpop: 'Korean pop music industry, idol training system, fandom culture, music production',
  daily: 'Korean daily life, street food, convenience store culture, Korean language expressions',
  seoul: 'Seoul modern lifestyle, MZ generation culture, Korean beauty trends, fashion districts',
  fantasy: 'Korean mythology, dokkaebi goblins, gumiho nine-tailed fox, Korean folklore tales',
}

interface ArticleResponse {
  title: string
  excerpt: string
  body: string
  recommendations: string[]
}

function isValidArticle(obj: unknown): obj is ArticleResponse {
  if (!obj || typeof obj !== 'object') return false
  const a = obj as Record<string, unknown>
  return (
    typeof a.title === 'string' && a.title.length > 0 &&
    typeof a.excerpt === 'string' && a.excerpt.length > 0 &&
    typeof a.body === 'string' && a.body.length > 0 &&
    Array.isArray(a.recommendations) &&
    a.recommendations.every((r: unknown) => typeof r === 'string')
  )
}

function escapeYaml(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n')
}

async function generateArticle(theme: string, genAI: GoogleGenerativeAI): Promise<boolean> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const today = new Date().toISOString().split('T')[0]
    const prompt = `Write an engaging, FACTUAL article about ${THEME_PROMPTS[theme as typeof THEMES[number]]} for foreigners interested in Korean culture.

Requirements:
- Title: Compelling and specific (not generic)
- Length: 350-500 words
- Tone: Informative yet engaging
- CRITICAL: Only include verified, real facts. Never fabricate information.
- Include 2-3 real recommendations (actual titles, real places, real products)

Format as JSON:
{
  "title": "Article title",
  "excerpt": "One sentence summary (max 120 chars)",
  "body": "Full article content in markdown",
  "recommendations": ["Real recommendation 1", "Real recommendation 2"]
}
`

    const result = await model.generateContent(prompt)
    const text = result.response.text().replace(/\`\`\`json\n?|\n?\`\`\`/g, '').trim()

    let article: unknown
    try {
      article = JSON.parse(text)
    } catch {
      console.error(`Failed to parse JSON for ${theme}`)
      return false
    }

    if (!isValidArticle(article)) {
      console.error(`Invalid article structure for ${theme}`)
      return false
    }

    const slug = article.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 60)

    const mdx = `---
title: "${escapeYaml(article.title)}"
excerpt: "${escapeYaml(article.excerpt)}"
date: "${today}"
recommendations:
${article.recommendations.map((r: string) => `  - "${escapeYaml(r)}"`).join('\n')}
---

${article.body}
`

    const dir = path.join(process.cwd(), 'content', theme)
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(path.join(dir, `${today}-${slug}.mdx`), mdx)
    console.log(`✓ Generated: ${theme}/${today}-${slug}.mdx`)
    return true
  } catch (err) {
    console.error(`Failed to generate article for ${theme}:`, err)
    return false
  }
}

async function main() {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY not set')

  const genAI = new GoogleGenerativeAI(apiKey)
  let failures = 0

  for (const theme of THEMES) {
    const ok = await generateArticle(theme, genAI)
    if (!ok) failures++
    // Rate limit 방지: 4초 대기
    await new Promise((r) => setTimeout(r, 4000))
  }

  if (failures > 0) {
    console.error(`\n${failures} theme(s) failed to generate content`)
    process.exit(1)
  }
}

main().catch(console.error)
