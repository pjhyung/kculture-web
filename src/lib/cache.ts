import crypto from 'crypto'

export function getCacheKey(theme: string, step: number, choice: string): string {
  return crypto
    .createHash('sha256')
    .update(`${theme}|step${step}|${choice}`)
    .digest('hex')
}

export async function getCachedResponse(key: string): Promise<string | null> {
  if (typeof window !== 'undefined') return null
  try {
    const { kv } = await import('@vercel/kv')
    return await kv.get<string>(key)
  } catch {
    return null
  }
}

export async function setCachedResponse(
  key: string,
  value: string,
  ttlSeconds = 21600
): Promise<void> {
  if (typeof window !== 'undefined') return
  try {
    const { kv } = await import('@vercel/kv')
    await kv.set(key, value, { ex: ttlSeconds })
  } catch {
    // 캐시 실패는 조용히 무시 — 서비스 중단 방지
  }
}
