import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { HostScreenId } from '../config/hostHelpContent'

export type HostScreenState = {
  screenId: HostScreenId
  screenTitle: string
  propiedadId?: string
}

type HostScreenContextValue = {
  screen: HostScreenState
  setScreen: (screen: HostScreenState) => void
}

const DEFAULT_SCREEN: HostScreenState = {
  screenId: 'dashboard',
  screenTitle: 'Panel principal',
}

const HostScreenContext = createContext<HostScreenContextValue | null>(null)

export function HostScreenProvider({ children }: { children: ReactNode }) {
  const [screen, setScreenState] = useState<HostScreenState>(DEFAULT_SCREEN)

  const setScreen = useCallback((next: HostScreenState) => {
    setScreenState(next)
  }, [])

  const value = useMemo(
    () => ({
      screen,
      setScreen,
    }),
    [screen, setScreen],
  )

  return (
    <HostScreenContext.Provider value={value}>
      {children}
    </HostScreenContext.Provider>
  )
}

export function useHostScreenContext(): HostScreenContextValue {
  const ctx = useContext(HostScreenContext)
  if (!ctx) {
    throw new Error('useHostScreenContext debe usarse dentro de HostScreenProvider')
  }
  return ctx
}
