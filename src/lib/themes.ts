export const THEMES = ['tradition', 'kdrama', 'kpop', 'daily', 'seoul', 'fantasy'] as const
export type Theme = typeof THEMES[number]

export const THEME_CONFIG: Record<Theme, {
  label: string
  color: string
  accent: string
  emoji: string
  description: string
}> = {
  tradition: {
    label: 'Traditional Korea',
    color: '#2D6A8A',
    accent: '#A8D5E2',
    emoji: '🏯',
    description: 'Joseon dynasty, hanbok, royal culture & heritage',
  },
  kdrama: {
    label: 'K-Drama & Film',
    color: '#7B3FA0',
    accent: '#E8B4E8',
    emoji: '🎭',
    description: 'Genre culture codes, iconic scenes & storytelling',
  },
  kpop: {
    label: 'K-Pop & Idols',
    color: '#CC2F7A',
    accent: '#FFB3D9',
    emoji: '🎵',
    description: 'Fandom culture, MVs & the Korean music industry',
  },
  daily: {
    label: 'Food & Daily Life',
    color: '#8B5E3C',
    accent: '#F0D5B0',
    emoji: '🍜',
    description: 'Mukbang, convenience stores, language & lifestyle',
  },
  seoul: {
    label: 'Seoul Lifestyle',
    color: '#1A4A7A',
    accent: '#A0C4E8',
    emoji: '🏙️',
    description: 'MZ culture, beauty, fashion & urban trends',
  },
  fantasy: {
    label: 'Myth & Fantasy',
    color: '#1A7A4A',
    accent: '#A0E8C4',
    emoji: '🦊',
    description: 'Dokkaebi, Gumiho, Korean folklore & mythology',
  },
}
