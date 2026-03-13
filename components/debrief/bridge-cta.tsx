'use client'

import { motion } from 'motion/react'

export default function BridgeCTA() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.5 }}
      className="bg-volt border-3 sm:border-4 border-black shadow-[2px_2px_0px_#000] sm:shadow-[8px_8px_0px_#000] p-5 sm:p-10 text-center relative overflow-hidden"
    >
      {/* Background watermark */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        aria-hidden="true"
      >
        <span
          className="font-display text-[100px] sm:text-[180px] text-black"
          style={{ opacity: 0.04 }}
        >
          CRM
        </span>
      </div>

      <div className="relative">
        {/* Badge */}
        <div className="mb-3 sm:mb-4">
          <span className="inline-block bg-black text-volt font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.1em] font-bold px-2.5 py-1 sm:px-3 border-2 border-black">
            Coming Soon
          </span>
        </div>

        <h3
          className="font-display text-[22px] sm:text-[40px] uppercase leading-[0.85] text-black mb-2 sm:mb-3"
        >
          Now imagine this
          <br />
          pushed straight
          <br className="sm:hidden" />
          {' '}to your CRM.
        </h3>

        <p className="font-body text-base sm:text-xl text-black/70 mb-1.5 sm:mb-2">
          That&apos;s StreetNotes.
        </p>
        <p className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.1em] text-black/50 mb-5 sm:mb-6">
          Every call. Every field. No typing.
        </p>

        <a
          href="/#waitlist"
          className="brutalist-btn bg-black text-white inline-block hover:bg-dark text-sm sm:text-base"
        >
          Join the Beta
        </a>

        {/* What you get vs what's missing */}
        <div className="mt-6 sm:mt-8 grid grid-cols-2 gap-3 sm:gap-4 text-left max-w-sm sm:max-w-md mx-auto">
          <div>
            <p className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.1em] text-black/50 mb-1.5 sm:mb-2">
              What you got (free)
            </p>
            <ul className="space-y-0.5 sm:space-y-1">
              {[
                'Structured notes',
                'Deal mind map',
                'Branded PDF',
                'Objection tracking',
              ].map((item) => (
                <li
                  key={item}
                  className="font-body text-xs sm:text-sm text-black/70 flex items-center gap-1.5 sm:gap-2"
                >
                  <span className="text-black font-bold">+</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.1em] text-black/50 mb-1.5 sm:mb-2">
              What&apos;s missing (paid)
            </p>
            <ul className="space-y-0.5 sm:space-y-1">
              {[
                'CRM auto-sync',
                'Deal history',
                'Living mind map',
                'Pipeline analytics',
              ].map((item) => (
                <li
                  key={item}
                  className="font-body text-xs sm:text-sm text-black/40 flex items-center gap-1.5 sm:gap-2"
                >
                  <span className="text-black/30 font-bold">+</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </motion.section>
  )
}
