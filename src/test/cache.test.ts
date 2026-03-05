import { describe, it, expect } from 'vitest'
import { getCacheKey } from '@/lib/cache'

describe('Cache Key Generator', () => {
  it('동일한 입력은 항상 같은 키 반환', () => {
    const key1 = getCacheKey('tradition', 2, 'palace')
    const key2 = getCacheKey('tradition', 2, 'palace')
    expect(key1).toBe(key2)
  })

  it('다른 입력은 다른 키 반환', () => {
    const key1 = getCacheKey('tradition', 2, 'palace')
    const key2 = getCacheKey('tradition', 2, 'hanbok')
    expect(key1).not.toBe(key2)
  })

  it('키는 64자 hex 문자열 (SHA-256)', () => {
    const key = getCacheKey('kpop', 1, 'bts')
    expect(key).toMatch(/^[a-f0-9]{64}$/)
  })

  it('step 숫자가 다르면 다른 키 반환', () => {
    const key1 = getCacheKey('kdrama', 1, 'romance')
    const key2 = getCacheKey('kdrama', 2, 'romance')
    expect(key1).not.toBe(key2)
  })
})
