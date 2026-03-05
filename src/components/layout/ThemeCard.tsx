import Link from 'next/link'
import type { Theme } from '@/lib/themes'
import { THEME_CONFIG } from '@/lib/themes'

interface Props {
  theme: Theme
  highlighted?: boolean
}

export function ThemeCard({ theme, highlighted = false }: Props) {
  const config = THEME_CONFIG[theme]
  return (
    <article className={`p-5 rounded-2xl border transition-all duration-200 ${
      highlighted
        ? 'border-[#E94560] bg-[#E94560]/10 scale-[1.02]'
        : 'border-[#2A2A3E] bg-[#1A1A2E] hover:border-[#E94560]/50'
    }`}>
      <div className="text-3xl mb-3" aria-hidden="true">{config.emoji}</div>
      <h3 className="font-playfair text-lg text-[#EAEAEA] mb-1">{config.label}</h3>
      <p className="text-[#9A9AB0] text-sm mb-4">{config.description}</p>
      <div className="flex gap-2">
        <Link href={`/explore/${theme}`}
          aria-label={`Explore ${config.label}`}
          className="text-xs px-3 py-1.5 rounded-full bg-[#E94560] text-white hover:bg-[#c73650]">
          Explore →
        </Link>
        <Link href={`/archive/${theme}`}
          aria-label={`Read about ${config.label}`}
          className="text-xs px-3 py-1.5 rounded-full border border-[#2A2A3E] text-[#9A9AB0] hover:text-[#EAEAEA]">
          Read
        </Link>
      </div>
    </article>
  )
}
