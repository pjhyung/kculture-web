import { describe, it, expect } from 'vitest'
import { generateWithFallback } from '@/lib/ai-chain'

describe('AI Fallback Chain', () => {
  it('1순위(Gemini) 성공 시 Gemini 응답 반환', async () => {
    const result = await generateWithFallback('test prompt', {
      _testOverride: {
        gemini: async () => ({ content: 'gemini response', model: 'gemini' }),
        groq: async () => { throw new Error('should not call') },
        cloudflare: async () => { throw new Error('should not call') },
      }
    })
    expect(result.model).toBe('gemini')
    expect(result.content).toBe('gemini response')
  })

  it('Gemini 실패 시 Groq로 폴백', async () => {
    const result = await generateWithFallback('test prompt', {
      _testOverride: {
        gemini: async () => { throw new Error('rate limit') },
        groq: async () => ({ content: 'groq response', model: 'groq' }),
        cloudflare: async () => { throw new Error('should not call') },
      }
    })
    expect(result.model).toBe('groq')
    expect(result.content).toBe('groq response')
  })

  it('Gemini + Groq 실패 시 Cloudflare로 폴백', async () => {
    const result = await generateWithFallback('test prompt', {
      _testOverride: {
        gemini: async () => { throw new Error('rate limit') },
        groq: async () => { throw new Error('rate limit') },
        cloudflare: async () => ({ content: 'cf response', model: 'cloudflare' }),
      }
    })
    expect(result.model).toBe('cloudflare')
  })

  it('전부 실패 시 캐시 폴백 반환', async () => {
    const result = await generateWithFallback('test prompt', {
      _testOverride: {
        gemini: async () => { throw new Error('fail') },
        groq: async () => { throw new Error('fail') },
        cloudflare: async () => { throw new Error('fail') },
        fallbackContent: 'cached fallback',
      }
    })
    expect(result.model).toBe('cache')
    expect(result.content).toBe('cached fallback')
  })

  it('빈 content 반환 시 다음 모델로 폴백', async () => {
    const result = await generateWithFallback('test prompt', {
      _testOverride: {
        gemini: async () => ({ content: '', model: 'gemini' }),
        groq: async () => ({ content: 'groq fallback', model: 'groq' }),
        cloudflare: async () => { throw new Error('should not call') },
      }
    })
    expect(result.model).toBe('groq')
    expect(result.content).toBe('groq fallback')
  })
})
