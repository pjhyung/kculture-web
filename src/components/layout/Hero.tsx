'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* 배경 그라디언트 */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0F0F1A] via-[#1A1A2E] to-[#0F0F1A]" />

      {/* 장식적 원형 요소 */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#E94560]/5 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[#F5A623]/5 blur-3xl" />

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-[#E94560] uppercase tracking-[0.3em] text-sm font-medium mb-4"
        >
          Discover Your Korean World
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-playfair text-5xl md:text-7xl font-bold text-[#EAEAEA] leading-tight mb-6"
        >
          한국을<br />
          <span className="italic text-[#F5A623]">느끼다</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-[#9A9AB0] text-lg md:text-xl max-w-2xl mx-auto mb-10"
        >
          Your personalized journey into Korean culture — from ancient palaces
          to modern Seoul, from folklore to K-pop. Let AI guide you.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Link href="/onboarding">
            <Button
              size="lg"
              className="bg-[#E94560] hover:bg-[#c73650] text-white px-10 py-6 text-lg rounded-full cursor-pointer"
            >
              Begin Your Journey →
            </Button>
          </Link>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-[#9A9AB0] text-sm mt-6"
        >
          6 worlds to explore · AI-powered · Always free
        </motion.p>
      </div>
    </section>
  )
}
