import { GoogleGenerativeAI } from '@google/generative-ai'
import fs from 'fs'
import path from 'path'

const THEMES = ['tradition', 'kdrama', 'kpop', 'daily', 'seoul', 'fantasy'] as const

const THEME_PROMPTS: Record<string, string> = {
  tradition: 'Korean traditional culture, Joseon dynasty, hanbok, royal palaces, ancestral rites',
  kdrama: 'Korean drama industry, storytelling culture, filming locations, genre conventions',
  kpop: 'Korean pop music industry, idol training system, fandom culture, music production',
  daily: 'Korean daily life, street food, convenience store culture, Korean language expressions',
  seoul: 'Seoul modern lifestyle, MZ generation culture, Korean beauty trends, fashion districts',
  fantasy: 'Korean mythology, dokkaebi goblins, gumiho nine-tailed fox, Korean folklore tales',
}

async function generateArticle(theme: string, genAI: GoogleGenerativeAI): Promise<void> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

  const today = new Date().toISOString().split('T')[0]
  const prompt = `Write an engaging, FACTUAL article about ${THEME_PROMPTS[theme]} for foreigners interested in Korean culture.

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

  let article
  try {
    article = JSON.parse(text)
  } catch {
    console.error(`Failed to parse JSON for ${theme}`)
    return
  }

  const slug = article.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60)

  const mdx = `---
title: "${article.title}"
excerpt: "${article.excerpt}"
date: "${today}"
recommendations:
${article.recommendations.map((r: string) => `  - "${r}"`).join('\n')}
---

${article.body}
`

  const dir = path.join(process.cwd(), 'content', theme)
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, `${today}-${slug}.mdx`), mdx)
  console.log(`✓ Generated: ${theme}/${today}-${slug}.mdx`)
}

async function main() {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY not set')

  const genAI = new GoogleGenerativeAI(apiKey)

  for (const theme of THEMES) {
    await generateArticle(theme, genAI)
    // Rate limit 방지: 4초 대기
    await new Promise((r) => setTimeout(r, 4000))
  }
}

main().catch(console.error)
