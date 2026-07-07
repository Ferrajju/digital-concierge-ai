import { createContext, useContext, type ReactNode } from 'react'
import { useJsApiLoader } from '@react-google-maps/api'

export const GOOGLE_MAPS_LIBRARIES: ('places' | 'geometry')[] = [
  'places',
  'geometry',
]

type GoogleMapsContextValue = {
  isLoaded: boolean
  loadError: Error | undefined
  apiKeyConfigured: boolean
}

const GoogleMapsContext = createContext<GoogleMapsContextValue>({
  isLoaded: false,
  loadError: undefined,
  apiKeyConfigured: false,
})

export function GoogleMapsProvider({ children }: { children: ReactNode }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? ''
  const apiKeyConfigured = Boolean(apiKey.trim())

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: GOOGLE_MAPS_LIBRARIES,
    preventGoogleFontsLoading: true,
  })

  return (
    <GoogleMapsContext.Provider
      value={{
        isLoaded: apiKeyConfigured ? isLoaded : false,
        loadError: apiKeyConfigured ? loadError : undefined,
        apiKeyConfigured,
      }}
    >
      {children}
    </GoogleMapsContext.Provider>
  )
}

export function useGoogleMaps(): GoogleMapsContextValue {
  return useContext(GoogleMapsContext)
}
