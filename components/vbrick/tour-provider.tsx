'use client'

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import 'driver.js/dist/driver.css'
import '@/styles/vbrick-tour.css'
import { TOUR_STEPS, type TourStep } from '@/lib/vbrick/tour/steps'
import { TourContextProvider } from '@/lib/vbrick/tour/tour-context'
import { useDashboard } from '@/lib/vbrick/dashboard-context'
import { markTourSeen } from '@/lib/vbrick/tour/storage'
import { waitForElement } from '@/lib/vbrick/tour/use-wait-for-element'

type DriverInstance = {
  drive: (stepIndex?: number) => void
  destroy: () => void
  moveNext: () => void
  movePrevious: () => void
  getActiveIndex: () => number | undefined
  isActive: () => boolean
}

export function TourProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { email } = useDashboard()
  const [running, setRunning] = useState(false)
  const driverRef = useRef<DriverInstance | null>(null)
  const emailRef = useRef<string | null>(email)

  useEffect(() => {
    emailRef.current = email
  }, [email])

  useEffect(() => {
    return () => {
      driverRef.current?.destroy()
    }
  }, [])

  const ensureRouteForStep = useCallback(
    async (step: TourStep) => {
      if (typeof window === 'undefined') return
      if (step.route !== window.location.pathname) {
        router.push(step.route)
      }
      if (step.target) {
        await waitForElement(step.target, { timeoutMs: 3000 })
      } else {
        await new Promise<void>((r) => setTimeout(r, 200))
      }
    },
    [router],
  )

  const startTour = useCallback(async () => {
    if (driverRef.current?.isActive()) return

    const mod = await import('driver.js')
    const driver = mod.driver

    const driverObj = driver({
      showProgress: true,
      allowClose: true,
      animate: true,
      smoothScroll: true,
      stagePadding: 6,
      stageRadius: 8,
      overlayOpacity: 0.55,
      nextBtnText: 'Next',
      prevBtnText: 'Back',
      doneBtnText: 'Done',
      progressText: '{{current}} of {{total}}',
      steps: TOUR_STEPS.map((s) => ({
        element: s.target,
        popover: {
          title: s.title,
          description: s.body,
          side: s.position && s.position !== 'auto' ? s.position : 'bottom',
          align: 'center',
        },
      })),
      onNextClick: async () => {
        const current = driverObj.getActiveIndex() ?? 0
        const nextIdx = current + 1
        if (nextIdx >= TOUR_STEPS.length) {
          driverObj.destroy()
          return
        }
        await ensureRouteForStep(TOUR_STEPS[nextIdx])
        driverObj.moveNext()
      },
      onPrevClick: async () => {
        const current = driverObj.getActiveIndex() ?? 0
        const prevIdx = current - 1
        if (prevIdx < 0) return
        await ensureRouteForStep(TOUR_STEPS[prevIdx])
        driverObj.movePrevious()
      },
      onCloseClick: () => {
        driverObj.destroy()
      },
      onDestroyed: () => {
        markTourSeen(emailRef.current)
        setRunning(false)
        driverRef.current = null
      },
    }) as DriverInstance

    driverRef.current = driverObj
    setRunning(true)
    await ensureRouteForStep(TOUR_STEPS[0])
    driverObj.drive(0)
  }, [ensureRouteForStep])

  const stopTour = useCallback(() => {
    driverRef.current?.destroy()
  }, [])

  return (
    <TourContextProvider value={{ running, startTour, stopTour }}>
      {children}
    </TourContextProvider>
  )
}
