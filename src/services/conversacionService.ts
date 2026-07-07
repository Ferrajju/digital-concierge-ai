import { supabase } from './supabaseClient'
import type { HistorialItem, MensajeChat } from '../pages/propietario/types/propiedadChat'

export function buildHistorial(mensajes: MensajeChat[]): HistorialItem[] {
  return mensajes.map(({ remitente, texto }) => ({
    remitente,
    texto,
  }))
}

export async function cargarConversacion(
  propiedadId: string,
): Promise<MensajeChat[]> {
  const { data, error } = await supabase
    .from('conversacion_configuracion')
    .select('id, remitente, mensaje')
    .eq('propiedad_id', propiedadId)
    .order('created_at', { ascending: true })

  if (error) throw error

  return (data ?? []).map((row) => ({
    id: row.id,
    remitente: row.remitente as MensajeChat['remitente'],
    texto: row.mensaje,
  }))
}

export async function guardarMensajeConversacion(
  propiedadId: string,
  remitente: MensajeChat['remitente'],
  mensaje: string,
): Promise<MensajeChat> {
  const { data, error } = await supabase
    .from('conversacion_configuracion')
    .insert({
      propiedad_id: propiedadId,
      remitente,
      mensaje,
    })
    .select('id, remitente, mensaje')
    .single()

  if (error) throw error

  return {
    id: data.id,
    remitente: data.remitente as MensajeChat['remitente'],
    texto: data.mensaje,
  }
}
