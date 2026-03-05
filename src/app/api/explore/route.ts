import { NextRequest, NextResponse } from 'next/server'
import { generateWithFallback } from '@/lib/ai-chain'
import { getCacheKey, getCachedResponse, setCachedResponse } from '@/lib/cache'
import { buildExplorePrompt } from '@/lib/explore-prompt'
import type { Theme } from '@/lib/themes'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      theme: Theme
      step: number
      choice: string
    }

    const { theme, step, choice } = body

    if (!theme || step === undefined || !choice) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 캐시 우선 확인
    const cacheKey = getCacheKey(theme, step, choice)
    const cached = await getCachedResponse(cacheKey)
    if (cached) {
      return NextResponse.json({ ...JSON.parse(cached), cached: true })
    }

    // AI 폴백 체인으로 생성
    const prompt = buildExplorePrompt(theme, step, choice)
    const aiResponse = await generateWithFallback(prompt)

    // JSON 파싱 (AI가 ```json ... ``` 형태로 반환할 수 있으므로 정제)
    let parsed
    try {
      const cleaned = aiResponse.content.replace(/```json\n?|\n?```/g, '').trim()
      parsed = JSON.parse(cleaned)
    } catch {
      parsed = { content: aiResponse.content, choices: [], recommendations: [] }
    }

    const result = { ...parsed, model: aiResponse.model }

    // 캐시 저장 (6시간)
    await setCachedResponse(cacheKey, JSON.stringify(result))

    return NextResponse.json(result)
  } catch (error) {
    console.error('Explore API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
