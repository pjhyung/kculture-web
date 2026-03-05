import { describe, it, expect } from 'vitest'
import { scoreThemes } from '@/lib/theme-scorer'

describe('Theme Scorer', () => {
  it('drama 응답이 많으면 kdrama가 상위에 위치', () => {
    const answers = [
      { questionId: 'q1', value: 'drama' },
      { questionId: 'q2', value: 'watching' },
      { questionId: 'q3', value: 'romance' },
    ]
    const result = scoreThemes(answers)
    expect(result[0]).toBe('kdrama')
  })

  it('mythology 응답은 fantasy와 tradition 점수 모두 올림', () => {
    const answers = [{ questionId: 'q1', value: 'mythology' }]
    const result = scoreThemes(answers)
    expect(result.slice(0, 2)).toContain('fantasy')
    expect(result.slice(0, 2)).toContain('tradition')
  })

  it('항상 6개 테마 모두 반환 (순위 포함)', () => {
    const answers = [{ questionId: 'q1', value: 'music' }]
    const result = scoreThemes(answers)
    expect(result).toHaveLength(6)
  })

  it('빈 응답도 6개 테마 반환, 동점 시 기본 순서 적용', () => {
    const result = scoreThemes([])
    expect(result).toHaveLength(6)
    // 동점 시 DEFAULT_THEME_ORDER 기준 — kdrama가 첫 번째
    expect(result[0]).toBe('kdrama')
  })

  it('music 응답은 kpop이 상위', () => {
    const answers = [
      { questionId: 'q1', value: 'music' },
      { questionId: 'q2', value: 'listening' },
    ]
    const result = scoreThemes(answers)
    expect(result[0]).toBe('kpop')
  })
})
