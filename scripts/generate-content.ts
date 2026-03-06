import { GoogleGenerativeAI } from '@google/generative-ai'
import Groq from 'groq-sdk'
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

function buildPrompt(theme: string): string {
  return `Write an engaging, FACTUAL article about ${THEME_PROMPTS[theme as typeof THEMES[number]]} for foreigners interested in Korean culture.

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
}

function parseArticleText(text: string): unknown {
  const stripped = text.replace(/```(?:json)?\s*/g, '').replace(/```/g, '').trim()
  const jsonMatch = stripped.match(/\{[\s\S]*\}/)
  return JSON.parse(jsonMatch ? jsonMatch[0] : stripped)
}

async function callGemini(theme: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY not set')
  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
  const result = await model.generateContent(buildPrompt(theme))
  return result.response.text()
}

async function callGroq(theme: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error('GROQ_API_KEY not set')
  const groq = new Groq({ apiKey })
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: buildPrompt(theme) }],
    max_tokens: 1200,
  })
  return completion.choices[0].message.content ?? ''
}

async function generateArticle(theme: string): Promise<boolean> {
  const today = new Date().toISOString().split('T')[0]
  let text: string | null = null

  // Gemini 먼저, 실패 시 Groq 폴백
  for (const [name, caller] of [
    ['Gemini', () => callGemini(theme)],
    ['Groq', () => callGroq(theme)],
  ] as const) {
    try {
      text = await caller()
      console.log(`  [${name}] OK`)
      break
    } catch (err) {
      console.warn(`  [${name}] failed: ${(err as Error).message}`)
    }
  }

  if (!text) {
    console.error(`Failed to generate article for ${theme}: all providers failed`)
    return false
  }

  let article: unknown
  try {
    article = parseArticleText(text)
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
}

async function main() {
  let failures = 0

  for (const theme of THEMES) {
    console.log(`Generating: ${theme}`)
    const ok = await generateArticle(theme)
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
