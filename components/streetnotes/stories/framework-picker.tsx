'use client'

import { motion } from 'motion/react'
import { Rocket, Shield, BookOpen } from 'lucide-react'
import { BrutalCard, BrutalButton } from '@/components/streetnotes/brutal'
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
    <div className="grid grid-cols-1 gap-4">
      {FRAMEWORK_OPTIONS.map((fw, i) => (
        <motion.div
          key={fw.type}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.3 }}
        >
          <BrutalCard variant="white" padded className="flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-volt border-4 border-black flex items-center justify-center flex-shrink-0">
                <fw.Icon size={22} className="text-black" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-display uppercase text-xl text-black leading-[0.9]">
                  {fw.name}
                </h3>
                <p className="font-body text-sm text-black/70 mt-1.5 leading-snug">
                  {fw.description}
                </p>
              </div>
            </div>
            <BrutalButton
              variant="primary"
              size="sm"
              className="w-full mt-1"
              onClick={() => onSelect(fw.type)}
            >
              Start Drafting →
            </BrutalButton>
          </BrutalCard>
        </motion.div>
      ))}
    </div>
  )
}
