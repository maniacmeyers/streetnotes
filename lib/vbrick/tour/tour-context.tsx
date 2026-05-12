'use client'

import { createContext, useContext, type ReactNode } from 'react'

export interface TourContextValue {
  running: boolean
  startTour: () => void
  stopTour: () => void
}

const TourContext = createContext<TourContextValue | null>(null)

export function TourContextProvider({
  value,
  children,
}: {
  value: TourContextValue
  children: ReactNode
}) {
  return <TourContext.Provider value={value}>{children}</TourContext.Provider>
}

export function useTour(): TourContextValue {
  const ctx = useContext(TourContext)
  if (!ctx) {
    return {
      running: false,
      startTour: () => {},
      stopTour: () => {},
    }
  }
  return ctx
}
