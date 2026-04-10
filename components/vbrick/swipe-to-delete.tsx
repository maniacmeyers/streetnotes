'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { motion, useAnimationControls } from 'motion/react'
import { Trash2 } from 'lucide-react'

/**
 * Shared "one-row-open-at-a-time" registry. Module-level so any SwipeToDelete
 * instance can close the previously opened row without prop drilling.
 */
let currentOpenId: string | null = null
const openListeners = new Set<(id: string | null) => void>()
function setOpenId(id: string | null) {
  currentOpenId = id
  openListeners.forEach((fn) => fn(id))
}

const ACTION_WIDTH = 88 // px — width of the revealed delete action
const OPEN_THRESHOLD = 44 // px — past this on release, snap open
const AXIS_LOCK_PX = 10 // px — distance before we decide horizontal vs vertical

interface SwipeToDeleteProps {
  onDelete: () => void | Promise<void>
  disabled?: boolean
  children: React.ReactNode
  confirmLabel?: string
  /** Border radius applied to the red action background, matches the card */
  radius?: number
}

/**
 * iOS-style swipe-to-delete wrapper. Drag the row left to reveal a red delete
 * action. Tap the action to delete. Tap elsewhere to close. Only one row can
 * be open at a time across the page.
 *
 * Vertical scroll is preserved: if the first ~10px of movement are mostly
 * vertical, the swipe aborts and the parent scroll takes over.
 */
export function SwipeToDelete({
  onDelete,
  disabled = false,
  children,
  confirmLabel = 'Delete',
  radius = 16,
}: SwipeToDeleteProps) {
  const id = useId()
  const controls = useAnimationControls()
  const containerRef = useRef<HTMLDivElement>(null)

  const startX = useRef(0)
  const startY = useRef(0)
  const baseX = useRef(0) // where we were when the drag started (0 or -ACTION_WIDTH)
  const axis = useRef<'unknown' | 'x' | 'y'>('unknown')
  const pointerActive = useRef(false)

  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const close = useCallback(
    (notify = true) => {
      baseX.current = 0
      setIsOpen(false)
      controls.start({ x: 0, transition: { type: 'spring', stiffness: 500, damping: 40 } })
      if (notify && currentOpenId === id) setOpenId(null)
    },
    [controls, id],
  )

  const open = useCallback(() => {
    baseX.current = -ACTION_WIDTH
    setIsOpen(true)
    controls.start({ x: -ACTION_WIDTH, transition: { type: 'spring', stiffness: 500, damping: 40 } })
    setOpenId(id)
  }, [controls, id])

  // Listen for other rows opening — close if it's not us.
  useEffect(() => {
    const listener = (openId: string | null) => {
      if (openId !== id && isOpen) close(false)
    }
    openListeners.add(listener)
    return () => {
      openListeners.delete(listener)
    }
  }, [id, isOpen, close])

  // Close on outside pointerdown when open.
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: PointerEvent) => {
      if (!containerRef.current) return
      if (!containerRef.current.contains(e.target as Node)) close()
    }
    // Use capture so we see the event before other handlers
    document.addEventListener('pointerdown', handler, true)
    return () => document.removeEventListener('pointerdown', handler, true)
  }, [isOpen, close])

  // Cleanup on unmount: release any global lock
  useEffect(() => {
    return () => {
      if (currentOpenId === id) currentOpenId = null
    }
  }, [id])

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return
    // Only left mouse button / touch / pen primary
    if (e.pointerType === 'mouse' && e.button !== 0) return
    pointerActive.current = true
    startX.current = e.clientX
    startY.current = e.clientY
    axis.current = 'unknown'
    // Don't capture yet — wait until we know it's a horizontal drag so vertical
    // scroll keeps working.
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || !pointerActive.current) return
    const dx = e.clientX - startX.current
    const dy = e.clientY - startY.current

    if (axis.current === 'unknown') {
      if (Math.abs(dx) < AXIS_LOCK_PX && Math.abs(dy) < AXIS_LOCK_PX) return
      if (Math.abs(dy) > Math.abs(dx)) {
        // Vertical — abort swipe, let page scroll
        pointerActive.current = false
        axis.current = 'y'
        return
      }
      axis.current = 'x'
      // Now that we know it's a horizontal drag, capture the pointer so we get
      // the up event even if the finger leaves the element.
      try {
        ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
      } catch {
        /* noop */
      }
    }

    if (axis.current !== 'x') return

    // Prevent the browser from interpreting horizontal drags as scroll / nav
    e.preventDefault()

    let nextX = baseX.current + dx
    // Clamp right: can't drag past 0
    if (nextX > 0) nextX = 0
    // Elastic past -ACTION_WIDTH
    if (nextX < -ACTION_WIDTH) {
      const overflow = -ACTION_WIDTH - nextX
      nextX = -ACTION_WIDTH - overflow * 0.35
    }
    controls.set({ x: nextX })
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointerActive.current) return
    const wasX = axis.current === 'x'
    pointerActive.current = false
    axis.current = 'unknown'
    try {
      ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {
      /* noop */
    }
    if (!wasX) return

    const dx = e.clientX - startX.current
    const finalX = baseX.current + dx

    // Decide: open or close
    if (finalX <= -OPEN_THRESHOLD) {
      open()
    } else {
      close()
    }
  }

  const handleDelete = async () => {
    if (isDeleting) return
    setIsDeleting(true)
    try {
      // Exit animation: slide the row the rest of the way off, then fade
      await controls.start({
        x: -400,
        opacity: 0,
        transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
      })
      await onDelete()
    } finally {
      // Parent will unmount us on success. On failure, snap back.
      if (currentOpenId === id) setOpenId(null)
      setIsDeleting(false)
      controls.start({ x: 0, opacity: 1, transition: { duration: 0.2 } })
      baseX.current = 0
      setIsOpen(false)
    }
  }

  if (disabled) {
    return <>{children}</>
  }

  return (
    <div ref={containerRef} className="relative" style={{ touchAction: 'pan-y' }}>
      {/* Red delete action revealed behind the row */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          handleDelete()
        }}
        aria-label={confirmLabel}
        disabled={isDeleting}
        className="absolute top-0 right-0 bottom-0 flex items-center justify-center gap-1.5 border-none cursor-pointer"
        style={{
          width: ACTION_WIDTH,
          background: '#dc2626',
          color: '#ffffff',
          borderTopRightRadius: radius,
          borderBottomRightRadius: radius,
          pointerEvents: isOpen ? 'auto' : 'none',
          opacity: isOpen ? 1 : 0.9,
          transition: 'opacity 0.15s',
        }}
      >
        <Trash2 size={16} />
        <span className="font-inter text-xs font-bold">{confirmLabel}</span>
      </button>

      {/* The row itself — draggable */}
      <motion.div
        animate={controls}
        initial={{ x: 0 }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ position: 'relative', touchAction: 'pan-y' }}
      >
        {children}
      </motion.div>
    </div>
  )
}
