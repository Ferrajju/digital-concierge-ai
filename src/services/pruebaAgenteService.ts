import type { MensajeHuespedChat } from '../pages/huesped/types/guestChat'
import { supabase } from './supabaseClient'
import { obtenerPropietarioId } from './propiedadService'

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

export async function cargarHistorialPrueba(
  propiedadId: string,
  sessionId: string,
): Promise<MensajeHuespedChat[]> {
  const propietarioId = await obtenerPropietarioId()

  const { data, error } = await supabase
    .from('conversaciones_prueba')
    .select('historial_mensajes')
    .eq('propiedad_id', propiedadId)
    .eq('propietario_id', propietarioId)
    .eq('session_id', sessionId)
    .maybeSingle()

  if (error) throw error
  return parseHistorial(data?.historial_mensajes)
}

export async function guardarHistorialPrueba(
  propiedadId: string,
  sessionId: string,
  mensajes: MensajeHuespedChat[],
): Promise<void> {
  const propietarioId = await obtenerPropietarioId()

  const { data: existente, error: selectError } = await supabase
    .from('conversaciones_prueba')
    .select('id')
    .eq('propiedad_id', propiedadId)
    .eq('propietario_id', propietarioId)
    .eq('session_id', sessionId)
    .maybeSingle()

  if (selectError) throw selectError

  if (existente?.id) {
    const { error } = await supabase
      .from('conversaciones_prueba')
      .update({ historial_mensajes: mensajes })
      .eq('id', existente.id)

    if (error) throw error
    return
  }

  const { error } = await supabase.from('conversaciones_prueba').insert({
    propiedad_id: propiedadId,
    propietario_id: propietarioId,
    session_id: sessionId,
    historial_mensajes: mensajes,
  })

  if (error) throw error
}

export async function eliminarConversacionPrueba(
  propiedadId: string,
  sessionId: string,
): Promise<void> {
  const propietarioId = await obtenerPropietarioId()

  const { error } = await supabase
    .from('conversaciones_prueba')
    .delete()
    .eq('propiedad_id', propiedadId)
    .eq('propietario_id', propietarioId)
    .eq('session_id', sessionId)

  if (error) throw error
}

export async function eliminarTodasPruebasPropiedad(
  propiedadId: string,
): Promise<void> {
  const propietarioId = await obtenerPropietarioId()

  const { error } = await supabase
    .from('conversaciones_prueba')
    .delete()
    .eq('propiedad_id', propiedadId)
    .eq('propietario_id', propietarioId)

  if (error) throw error
}
