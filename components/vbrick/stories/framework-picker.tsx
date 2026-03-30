'use client'

import { motion } from 'motion/react'
import { Rocket, Shield, BookOpen } from 'lucide-react'
import { NeuCard, NeuButton } from '@/components/vbrick/neu'
import { neuTheme } from '@/lib/vbrick/theme'
import { cascadeIn, staggerContainer } from '@/lib/vbrick/animations'
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
    description: 'A 30-60 second pitch that answers: what do you do and why should I care?',
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
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-3 gap-6"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {FRAMEWORK_OPTIONS.map((fw, i) => (
        <motion.div key={fw.type} variants={cascadeIn} custom={i}>
          <NeuCard hover padding="lg" className="flex flex-col items-center text-center gap-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{
                background: neuTheme.colors.bg,
                boxShadow: neuTheme.shadows.raised,
              }}
            >
              <fw.Icon size={26} style={{ color: neuTheme.colors.accent.primary }} />
            </div>

            <h3
              className="font-general-sans font-bold text-lg"
              style={{ color: neuTheme.colors.text.heading }}
            >
              {fw.name}
            </h3>

            <p
              className="font-satoshi text-sm leading-relaxed"
              style={{ color: neuTheme.colors.text.muted }}
            >
              {fw.description}
            </p>

            <NeuButton
              variant="accent"
              size="sm"
              className="mt-auto w-full"
              onClick={() => onSelect(fw.type)}
            >
              Start Drafting
            </NeuButton>
          </NeuCard>
        </motion.div>
      ))}
    </motion.div>
  )
}
