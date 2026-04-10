'use client'

import { motion } from 'motion/react'
import { Rocket, Shield, BookOpen } from 'lucide-react'
import type { StoryType } from '@/lib/vbrick/story-types'

const FRAMEWORK_OPTIONS: {
  type: StoryType
  name: string
  description: string
  Icon: typeof Rocket
}[] = [
  {
    type: 'elevator_pitch',
    name: 'Elevator Pitch',
    description:
      'A 30-60 second pitch that answers: what do you do and why should I care?',
    Icon: Rocket,
  },
  {
    type: 'feel_felt_found',
    name: 'Feel / Felt / Found',
    description: 'Handle any objection with empathy, social proof, and resolution.',
    Icon: Shield,
  },
  {
    type: 'abt_customer_story',
    name: 'Customer Story (ABT)',
    description: 'Tell a customer success story using And, But, Therefore.',
    Icon: BookOpen,
  },
]

interface FrameworkPickerProps {
  onSelect: (type: StoryType) => void
}

export function FrameworkPicker({ onSelect }: FrameworkPickerProps) {
  return (
    <div className="grid grid-cols-1 gap-4">
      {FRAMEWORK_OPTIONS.map((fw, i) => (
        <motion.button
          key={fw.type}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.3 }}
          type="button"
          onClick={() => onSelect(fw.type)}
          className="group glass rounded-2xl p-5 text-left cursor-pointer hover:border-volt/40 hover:shadow-glow-volt transition-all duration-300"
        >
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-xl glass-inset flex items-center justify-center flex-shrink-0"
              style={{
                boxShadow:
                  'inset 0 2px 4px rgba(0,0,0,0.5), inset 0 -1px 0 rgba(255,255,255,0.1), 0 0 20px rgba(0,230,118,0.15)',
              }}
            >
              <fw.Icon size={20} className="text-volt drop-shadow-[0_0_6px_rgba(0,230,118,0.6)]" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-display uppercase text-lg text-white leading-tight">
                {fw.name}
              </h3>
              <p className="font-body text-sm text-white/70 mt-1.5 leading-relaxed">
                {fw.description}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-end mt-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] font-bold text-volt group-hover:translate-x-1 transition-transform">
              Start Drafting →
            </span>
          </div>
        </motion.button>
      ))}
    </div>
  )
}
