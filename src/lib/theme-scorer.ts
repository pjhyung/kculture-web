import type { Theme } from '@/lib/themes'

interface Answer {
  questionId: string
  value: string
}

const DEFAULT_THEME_ORDER: Theme[] = ['kdrama', 'kpop', 'tradition', 'fantasy', 'daily', 'seoul']

const SCORE_MAP: Record<string, Theme[]> = {
  // q1
  drama: ['kdrama'],
  music: ['kpop'],
  food: ['daily'],
  mythology: ['fantasy', 'tradition'],
  // q2
  watching: ['kdrama', 'kpop'],
  listening: ['kpop'],
  reading: ['tradition', 'fantasy'],
  traveling: ['seoul', 'daily'],
  // q3
  romance: ['kdrama'],
  trendy: ['kpop', 'seoul'],
  mystical: ['fantasy'],
  authentic: ['tradition', 'daily'],
}

export function scoreThemes(answers: Answer[]): Theme[] {
  const scores: Record<Theme, number> = {
    tradition: 0,
    kdrama: 0,
    kpop: 0,
    daily: 0,
    seoul: 0,
    fantasy: 0,
  }

  for (const answer of answers) {
    const themes = SCORE_MAP[answer.value] ?? []
    for (const theme of themes) {
      scores[theme] += 1
    }
  }

  return (Object.entries(scores) as [Theme, number][])
    .sort(([themeA, scoreA], [themeB, scoreB]) => {
      if (scoreB !== scoreA) return scoreB - scoreA
      // 동점 시 DEFAULT_THEME_ORDER 기준으로 정렬
      return DEFAULT_THEME_ORDER.indexOf(themeA) - DEFAULT_THEME_ORDER.indexOf(themeB)
    })
    .map(([theme]) => theme)
}
