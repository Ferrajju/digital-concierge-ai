import { useCallback, useRef } from 'react'
import { Autocomplete, useJsApiLoader } from '@react-google-maps/api'

const libraries: ('places')[] = ['places']

type LocationSearchProps = {
  value: string
  onChange: (value: string) => void
  onPlaceSelect: (address: string) => void
  disabled?: boolean
}

export default function LocationSearch({
  value,
  onChange,
  onPlaceSelect,
  disabled = false,
}: LocationSearchProps) {
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey ?? '',
    libraries,
  })

  const onLoad = useCallback((autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete
  }, [])

  const onPlaceChanged = useCallback(() => {
    const place = autocompleteRef.current?.getPlace()
    const address = place?.formatted_address ?? place?.name ?? ''

    if (address) {
      onChange(address)
      onPlaceSelect(address)
    }
  }, [onChange, onPlaceSelect])

  const inputClassName =
    'w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3.5 text-white placeholder:text-slate-600 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-50'

  if (!apiKey) {
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Introduce la dirección manualmente"
        disabled={disabled}
        className={inputClassName}
      />
    )
  }

  if (loadError) {
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Busca o escribe la dirección de tu alojamiento"
        disabled={disabled}
        className={inputClassName}
      />
    )
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3.5 text-sm text-slate-500">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500/30 border-t-indigo-400" />
        Cargando buscador de Google Maps...
      </div>
    )
  }

  return (
    <Autocomplete
      onLoad={onLoad}
      onPlaceChanged={onPlaceChanged}
      options={{ fields: ['formatted_address', 'name', 'geometry'] }}
    >
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Busca la ubicación exacta de tu alojamiento"
        disabled={disabled}
        className={inputClassName}
      />
    </Autocomplete>
  )
}
