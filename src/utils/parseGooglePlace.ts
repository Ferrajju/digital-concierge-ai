export type ParsedAddress = {
  busquedaRapida: string
  direccionCalle: string
  codigoPostal: string
  ciudadRegion: string
}

function getComponent(
  components: google.maps.GeocoderAddressComponent[],
  type: string,
  useShort = false,
): string {
  const match = components.find((c) => c.types.includes(type))
  if (!match) return ''
  return useShort ? (match.short_name ?? '') : (match.long_name ?? '')
}

export function parseGooglePlace(
  place: google.maps.places.PlaceResult,
): ParsedAddress {
  const components = place.address_components ?? []
  const route = getComponent(components, 'route')
  const streetNumber = getComponent(components, 'street_number')
  const direccionCalle =
    [route, streetNumber].filter(Boolean).join(', ') ||
    place.formatted_address?.split(',')[0]?.trim() ||
    ''

  const codigoPostal = getComponent(components, 'postal_code')
  const ciudad =
    getComponent(components, 'locality') ||
    getComponent(components, 'postal_town') ||
    getComponent(components, 'administrative_area_level_2')
  const region = getComponent(components, 'administrative_area_level_1')
  const ciudadRegion = [ciudad, region].filter(Boolean).join(', ')

  return {
    busquedaRapida: place.formatted_address ?? place.name ?? '',
    direccionCalle,
    codigoPostal,
    ciudadRegion,
  }
}
