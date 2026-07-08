import type {
  MensajeHuespedChat,
  PropiedadGuestInfo,
} from '../pages/huesped/types/guestChat'
import { supabase } from './supabaseClient'

const COLUMNAS_PUBLICAS =
  'id, nombre_apartamento, direccion_calle, piso_puerta, codigo_postal, ia_identidad'

function formatearDireccion(
  calle: string | null,
  piso: string | null,
  cp: string | null,
): string {
  const partes = [calle?.trim(), piso?.trim(), cp?.trim()].filter(Boolean)
  return partes.join(', ')
}

export async function obtenerPropiedadGuest(
  propiedadId: string,
): Promise<PropiedadGuestInfo> {
  console.log('[GuestChat] obtenerPropiedadGuest — propiedad_id:', propiedadId)

  const { data, error } = await supabase
    .from('propiedades')
    .select(COLUMNAS_PUBLICAS)
    .eq('id', propiedadId)
    .maybeSingle()

  console.log('[GuestChat] Supabase propiedades — data:', data)
  console.log('[GuestChat] Supabase propiedades — error:', error)

  if (error) {
    throw new Error(
      error.message || 'Error al consultar la propiedad en Supabase.',
    )
  }

  if (!data) {
    throw new Error(
      'No se encontró esta propiedad. Comprueba que el enlace QR sea correcto.',
    )
  }

  return {
    id: data.id,
    nombreApartamento: data.nombre_apartamento ?? 'Tu alojamiento',
    direccionCompleta: formatearDireccion(
      data.direccion_calle,
      data.piso_puerta,
      data.codigo_postal,
    ),
    iaIdentidad: data.ia_identidad ?? 'Conserje',
  }
}

function parseHistorial(raw: unknown): MensajeHuespedChat[] {
  if (!Array.isArray(raw)) return []

  return raw
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const msg = item as Record<string, unknown>
      const rol = msg.rol === 'user' || msg.rol === 'assistant' ? msg.rol : null
      const contenido =
        typeof msg.contenido === 'string' ? msg.contenido.trim() : ''
      const timestamp =
        typeof msg.timestamp === 'string'
          ? msg.timestamp
          : new Date().toISOString()

      if (!rol || !contenido) return null
      return { rol, contenido, timestamp }
    })
    .filter((msg): msg is MensajeHuespedChat => msg !== null)
}

export async function cargarHistorialHuesped(
  propiedadId: string,
  sessionId: string,
): Promise<MensajeHuespedChat[]> {
  console.log('[GuestChat] cargarHistorial — propiedad_id:', propiedadId)
  console.log('[GuestChat] cargarHistorial — session_id:', sessionId)

  const { data, error } = await supabase
    .from('conversaciones_huesped')
    .select('historial_mensajes')
    .eq('propiedad_id', propiedadId)
    .eq('session_id', sessionId)
    .maybeSingle()

  console.log('[GuestChat] Supabase conversaciones_huesped — data:', data)
  console.log('[GuestChat] Supabase conversaciones_huesped — error:', error)

  if (error) throw error
  if (!data?.historial_mensajes) return []

  return parseHistorial(data.historial_mensajes)
}

export async function guardarHistorialHuesped(
  propiedadId: string,
  sessionId: string,
  mensajes: MensajeHuespedChat[],
): Promise<void> {
  const { data: existente, error: selectError } = await supabase
    .from('conversaciones_huesped')
    .select('id')
    .eq('propiedad_id', propiedadId)
    .eq('session_id', sessionId)
    .maybeSingle()

  if (selectError) throw selectError

  if (existente?.id) {
    const { error } = await supabase
      .from('conversaciones_huesped')
      .update({ historial_mensajes: mensajes })
      .eq('id', existente.id)

    if (error) throw error
    return
  }

  const { error } = await supabase.from('conversaciones_huesped').insert({
    propiedad_id: propiedadId,
    session_id: sessionId,
    historial_mensajes: mensajes,
  })

  if (error) throw error
}
