'use client'
import { motion } from 'framer-motion'

interface Props {
  label: string
  onClick: () => void
  index: number
  disabled?: boolean
}

export function ChoiceButton({ label, onClick, index, disabled = false }: Props) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={onClick}
      disabled={disabled}
      className="w-full text-left p-4 rounded-xl border border-[#2A2A3E]
                 bg-[#1A1A2E] hover:border-[#E94560] hover:bg-[#E94560]/10
                 text-[#EAEAEA] transition-all duration-200 cursor-pointer
                 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {label}
    </motion.button>
  )
}
