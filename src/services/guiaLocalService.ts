import {
  CATEGORIAS_GUIA,
  type CategoriaGuiaLocal,
  type LugarGoogleRaw,
  type TarjetaGuiaLocal,
} from '../pages/propietario/types/guiaLocal'
import { generarTarjetasGuiaLocalN8n } from './n8nService'

const MAX_LUGARES_POR_CATEGORIA = 3

function crearPlacesService(): google.maps.places.PlacesService {
  const div = document.createElement('div')
  return new google.maps.places.PlacesService(div)
}

function distanciaEnMetros(
  origen: google.maps.LatLngLiteral,
  destino: google.maps.LatLng,
): number {
  const origenLatLng = new google.maps.LatLng(origen.lat, origen.lng)
  return google.maps.geometry.spherical.computeDistanceBetween(
    origenLatLng,
    destino,
  )
}

export function formatearDistancia(metros: number): string {
  if (metros < 1000) {
    const minutos = Math.max(1, Math.round(metros / 80))
    return `A ${minutos} min andando`
  }
  return `A ${(metros / 1000).toFixed(1)} km`
}

async function geocodificarDireccion(
  direccion: string,
): Promise<google.maps.LatLngLiteral> {
  const geocoder = new google.maps.Geocoder()

  return new Promise((resolve, reject) => {
    geocoder.geocode({ address: direccion }, (results, status) => {
      if (status !== 'OK' || !results?.[0]?.geometry?.location) {
        reject(new Error('No se pudo localizar la dirección en Google Maps.'))
        return
      }

      const location = results[0].geometry.location
      resolve({ lat: location.lat(), lng: location.lng() })
    })
  })
}

function ejecutarNearbySearch(
  service: google.maps.places.PlacesService,
  request: google.maps.places.PlaceSearchRequest,
): Promise<google.maps.places.PlaceResult[]> {
  return new Promise((resolve, reject) => {
    service.nearbySearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        resolve(results)
        return
      }
      if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
        resolve([])
        return
      }
      reject(new Error(`Búsqueda de lugares fallida (${status}).`))
    })
  })
}

function ejecutarTextSearch(
  service: google.maps.places.PlacesService,
  request: google.maps.places.TextSearchRequest,
): Promise<google.maps.places.PlaceResult[]> {
  return new Promise((resolve, reject) => {
    service.textSearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        resolve(results)
        return
      }
      if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
        resolve([])
        return
      }
      reject(new Error(`Búsqueda de texto fallida (${status}).`))
    })
  })
}

async function buscarLugaresCategoria(
  service: google.maps.places.PlacesService,
  origen: google.maps.LatLngLiteral,
  direccion: string,
  categoria: CategoriaGuiaLocal,
  googleType: string,
  consultaTexto: string,
): Promise<LugarGoogleRaw[]> {
  const origenLatLng = new google.maps.LatLng(origen.lat, origen.lng)

  let resultados = await ejecutarNearbySearch(service, {
    location: origenLatLng,
    radius: 2000,
    type: googleType,
  })

  if (resultados.length === 0) {
    resultados = await ejecutarTextSearch(service, {
      query: `${consultaTexto} cerca de ${direccion}`,
      location: origenLatLng,
      radius: 2000,
    })
  }

  return resultados.slice(0, MAX_LUGARES_POR_CATEGORIA).map((lugar) => {
    const location = lugar.geometry?.location
    const distancia_metros = location
      ? distanciaEnMetros(origen, location)
      : 0

    return {
      categoria,
      nombre: lugar.name ?? 'Sin nombre',
      direccion: lugar.vicinity ?? lugar.formatted_address ?? '',
      distancia_metros,
      rating: lugar.rating,
    }
  })
}

function construirTarjetasFallback(lugares: LugarGoogleRaw[]): TarjetaGuiaLocal[] {
  return lugares.map((lugar) => ({
    id: crypto.randomUUID(),
    categoria: lugar.categoria,
    nombre: lugar.nombre,
    distancia: formatearDistancia(lugar.distancia_metros),
    informacion: [
      lugar.direccion ? `Ubicado en ${lugar.direccion}.` : '',
      lugar.rating ? `Valoración en Google: ${lugar.rating}/5.` : '',
      'Recomendado para huéspedes de la zona.',
    ]
      .filter(Boolean)
      .join(' '),
    activa: true,
  }))
}

export async function generarTarjetasGuiaLocal(
  direccion: string,
  signal?: AbortSignal,
): Promise<TarjetaGuiaLocal[]> {
  if (!direccion.trim()) {
    throw new Error('La dirección de la propiedad es obligatoria.')
  }

  if (!window.google?.maps?.places) {
    throw new Error('Google Maps Places no está cargado.')
  }

  const origen = await geocodificarDireccion(direccion)
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')

  const service = crearPlacesService()
  const lugares: LugarGoogleRaw[] = []

  for (const categoria of CATEGORIAS_GUIA) {
    const encontrados = await buscarLugaresCategoria(
      service,
      origen,
      direccion,
      categoria.id,
      categoria.googleType,
      categoria.consultaTexto,
    )
    lugares.push(...encontrados)
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
  }

  if (lugares.length === 0) {
    throw new Error(
      'No se encontraron lugares cercanos. Añade recomendaciones manualmente.',
    )
  }

  try {
    const tarjetasGpt = await generarTarjetasGuiaLocalN8n(
      { direccion, lugares },
      signal,
    )
    if (tarjetasGpt.length > 0) return tarjetasGpt
  } catch {
    // Fallback local si n8n/GPT no está disponible.
  }

  return construirTarjetasFallback(lugares)
}
