import { useEffect } from 'react'
import {
  useHostScreenContext,
  type HostScreenState,
} from '../context/HostScreenContext'

export function useHostScreen(screen: HostScreenState) {
  const { setScreen } = useHostScreenContext()

  useEffect(() => {
    setScreen(screen)
  }, [screen.screenId, screen.screenTitle, screen.propiedadId, setScreen])
}
