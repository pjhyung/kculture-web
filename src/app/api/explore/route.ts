import { NextRequest, NextResponse } from 'next/server'
import { generateWithFallback } from '@/lib/ai-chain'
import { getCacheKey, getCachedResponse, setCachedResponse } from '@/lib/cache'
import { buildExplorePrompt } from '@/lib/explore-prompt'
import { THEMES } from '@/lib/themes'
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

    if (!THEMES.includes(theme)) {
      return NextResponse.json({ error: 'Invalid theme' }, { status: 400 })
    }

    if (!Number.isInteger(step) || step < 1 || step > 10) {
      return NextResponse.json({ error: 'Invalid step' }, { status: 400 })
    }
    if (typeof choice !== 'string' || choice.length > 200) {
      return NextResponse.json({ error: 'Invalid choice' }, { status: 400 })
    }

    // 캐시 우선 확인
    const cacheKey = getCacheKey(theme, step, choice)
    const cached = await getCachedResponse(cacheKey)
    if (cached) {
      try {
        return NextResponse.json({ ...JSON.parse(cached), cached: true })
      } catch {
        // 캐시 파싱 실패 시 AI 호출로 폴백
      }
    }

    // AI 폴백 체인으로 생성
    const prompt = buildExplorePrompt(theme, step, choice)
    const aiResponse = await generateWithFallback(prompt)

    // AI 전체 실패 시 캐시 폴백 → 정적 탐색 데이터로 포맷
    let parsed
    if (aiResponse.model === 'cache') {
      parsed = {
        content: aiResponse.content,
        choices: [
          { value: 'kpop', label: '🎵 Explore K-Pop' },
          { value: 'kdrama', label: '🎬 Discover K-Drama' },
          { value: 'tradition', label: '🏯 Traditional Korea' },
        ],
        recommendations: [],
      }
    } else {
      // JSON 파싱 (AI가 ```json ... ``` 형태로 반환할 수 있으므로 정제)
      try {
        // 코드블록 제거 후 JSON 오브젝트 추출 (Gemini가 앞뒤에 텍스트를 붙이는 경우 대응)
        const stripped = aiResponse.content.replace(/```(?:json)?\s*/g, '').replace(/```/g, '').trim()
        const jsonMatch = stripped.match(/\{[\s\S]*\}/)
        parsed = JSON.parse(jsonMatch ? jsonMatch[0] : stripped)
      } catch {
        console.error('[Explore API] Failed to parse AI response:', aiResponse.content.slice(0, 300))
        return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
      }
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
