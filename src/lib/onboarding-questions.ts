export interface OnboardingQuestion {
  id: string
  text: string
  options: { value: string; label: string; emoji: string }[]
}

export const ONBOARDING_QUESTIONS: OnboardingQuestion[] = [
  {
    id: 'q1',
    text: 'What brought you to K-culture?',
    options: [
      { value: 'drama', label: 'K-Dramas or Movies', emoji: '🎭' },
      { value: 'music', label: 'K-Pop Music', emoji: '🎵' },
      { value: 'food', label: 'Korean Food', emoji: '🍜' },
      { value: 'mythology', label: 'Folklore & History', emoji: '🏯' },
    ],
  },
  {
    id: 'q2',
    text: 'How do you usually enjoy Korean content?',
    options: [
      { value: 'watching', label: 'Binge-watching shows', emoji: '📺' },
      { value: 'listening', label: 'Listening to music', emoji: '🎧' },
      { value: 'reading', label: 'Reading about culture', emoji: '📖' },
      { value: 'traveling', label: 'Planning to visit Korea', emoji: '✈️' },
    ],
  },
  {
    id: 'q3',
    text: 'Which vibe matches you most?',
    options: [
      { value: 'romance', label: 'Romantic & emotional', emoji: '💕' },
      { value: 'trendy', label: 'Trendy & modern', emoji: '✨' },
      { value: 'mystical', label: 'Mystical & fantastical', emoji: '🦊' },
      { value: 'authentic', label: 'Authentic & traditional', emoji: '🎎' },
    ],
  },
]
