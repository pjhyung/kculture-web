import type { Theme } from '@/lib/themes'

interface Answer {
  questionId: string
  value: string
}

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
    .sort(([, a], [, b]) => b - a)
    .map(([theme]) => theme)
}
