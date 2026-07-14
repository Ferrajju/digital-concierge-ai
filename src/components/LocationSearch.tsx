import { useCallback, useRef } from 'react'
import { Autocomplete } from '@react-google-maps/api'
import { useGoogleMaps } from '../providers/GoogleMapsProvider'
import type { ParsedAddress } from '../utils/parseGooglePlace'
import { parseGooglePlace } from '../utils/parseGooglePlace'
import { inputClassName } from './ui/inputClassName'

type LocationSearchProps = {
  value: string
  onChange: (value: string) => void
  onPlaceSelect: (parsed: ParsedAddress) => void
  disabled?: boolean
}

export default function LocationSearch({
  value,
  onChange,
  onPlaceSelect,
  disabled = false,
}: LocationSearchProps) {
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const { isLoaded, loadError, apiKeyConfigured } = useGoogleMaps()

  const onLoad = useCallback((autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete
  }, [])

  const onPlaceChanged = useCallback(() => {
    const place = autocompleteRef.current?.getPlace()
    if (!place) return

    const parsed = parseGooglePlace(place)
    if (parsed.busquedaRapida) {
      onChange(parsed.busquedaRapida)
      onPlaceSelect(parsed)
    }
  }, [onChange, onPlaceSelect])

  if (!apiKeyConfigured) {
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscador rápido — escribe una dirección"
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
        placeholder="Buscador rápido — escribe una dirección"
        disabled={disabled}
        className={inputClassName}
      />
    )
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-host-border bg-host-surface px-4 py-3.5 text-sm text-host-muted">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-teal-100 border-t-host-primary" />
        Cargando buscador de Google Maps...
      </div>
    )
  }

  return (
    <Autocomplete
      onLoad={onLoad}
      onPlaceChanged={onPlaceChanged}
      options={{
        fields: ['formatted_address', 'name', 'geometry', 'address_components'],
      }}
    >
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscador rápido — escribe y selecciona tu dirección"
        disabled={disabled}
        className={inputClassName}
      />
    </Autocomplete>
  )
}
