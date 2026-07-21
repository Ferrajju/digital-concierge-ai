import type {
  MensajeHuespedChat,
  PerfilHuesped,
  PropiedadGuestInfo,
} from '../pages/huesped/types/guestChat'
import type { ConversacionHuespedResumen } from '../pages/propietario/types/conversacionesHuesped'
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
  const { data, error } = await supabase
    .from('propiedades')
    .select(COLUMNAS_PUBLICAS)
    .eq('id', propiedadId)
    .maybeSingle()

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

export async function cargarPerfilHuesped(
  propiedadId: string,
  sessionId: string,
): Promise<PerfilHuesped | null> {
  const { data, error } = await supabase
    .from('conversaciones_huesped')
    .select('nombre_huesped, idioma, perfil_completado')
    .eq('propiedad_id', propiedadId)
    .eq('session_id', sessionId)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  return {
    nombreHuesped: data.nombre_huesped?.trim() ?? '',
    idioma: data.idioma?.trim() || 'es',
    perfilCompletado: data.perfil_completado === true,
  }
}

export async function guardarPerfilHuesped(
  propiedadId: string,
  sessionId: string,
  perfil: { nombreHuesped: string; idioma: string },
): Promise<void> {
  const nombre = perfil.nombreHuesped.trim()
  const idioma = perfil.idioma.trim() || 'es'

  const { data: existente, error: selectError } = await supabase
    .from('conversaciones_huesped')
    .select('id')
    .eq('propiedad_id', propiedadId)
    .eq('session_id', sessionId)
    .maybeSingle()

  if (selectError) throw selectError

  const payload = {
    nombre_huesped: nombre,
    idioma,
    perfil_completado: true,
  }

  if (existente?.id) {
    const { error } = await supabase
      .from('conversaciones_huesped')
      .update(payload)
      .eq('id', existente.id)

    if (error) throw error
    return
  }

  const { error } = await supabase.from('conversaciones_huesped').insert({
    propiedad_id: propiedadId,
    session_id: sessionId,
    historial_mensajes: [],
    ...payload,
  })

  if (error) throw error
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
  const { data, error } = await supabase
    .from('conversaciones_huesped')
    .select('historial_mensajes')
    .eq('propiedad_id', propiedadId)
    .eq('session_id', sessionId)
    .maybeSingle()

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

function construirResumenConversacion(row: {
  id: string
  session_id: string
  historial_mensajes: unknown
  nombre_huesped: string | null
  idioma: string | null
  created_at: string
  updated_at: string
}): ConversacionHuespedResumen {
  const mensajes = parseHistorial(row.historial_mensajes)
  const ultimo = mensajes[mensajes.length - 1]

  return {
    id: row.id,
    sessionId: row.session_id,
    nombreHuesped: row.nombre_huesped?.trim() || undefined,
    idioma: row.idioma?.trim() || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    totalMensajes: mensajes.length,
    mensajesUsuario: mensajes.filter((m) => m.rol === 'user').length,
    ultimoMensaje: ultimo?.contenido ?? 'Sin mensajes',
    ultimoMensajeRol: ultimo?.rol ?? 'assistant',
    mensajes,
  }
}

export async function listarConversacionesPropiedad(
  propiedadId: string,
): Promise<ConversacionHuespedResumen[]> {
  const { data, error } = await supabase
    .from('conversaciones_huesped')
    .select(
      'id, session_id, historial_mensajes, nombre_huesped, idioma, created_at, updated_at',
    )
    .eq('propiedad_id', propiedadId)
    .eq('perfil_completado', true)
    .order('updated_at', { ascending: false })

  if (error) throw error

  return (data ?? []).map(construirResumenConversacion)
}
