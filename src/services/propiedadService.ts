import { supabase } from './supabaseClient'
import type { PropiedadResumen } from '../pages/propietario/types/propiedadDashboard'

export async function obtenerPropietarioId(): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error('Debes iniciar sesión para continuar.')
  }

  return user.id
}

export type CrearPropiedadParams = {
  nombreApartamento: string
  nombreIa: string
  ciudadRegion: string
  direccionCalle: string
  pisoPuerta: string
  codigoPostal: string
  indicacionesAcceso: string
}

async function obtenerOCrearZona(
  propietarioId: string,
  ciudadRegion: string,
): Promise<string> {
  const { data: zonas, error: selectError } = await supabase
    .from('zonas')
    .select('id')
    .eq('propietario_id', propietarioId)
    .limit(1)

  if (selectError) throw selectError
  if (zonas && zonas.length > 0) return zonas[0].id

  const ubicacion = ciudadRegion.trim() || 'Por definir'

  const { data: zona, error: insertError } = await supabase
    .from('zonas')
    .insert({
      propietario_id: propietarioId,
      nombre_zona: ubicacion,
      ubicacion_base: ubicacion,
    })
    .select('id')
    .single()

  if (insertError) throw insertError
  return zona.id
}

export async function crearPropiedadConDatos(
  params: CrearPropiedadParams,
): Promise<string> {
  const propietarioId = await obtenerPropietarioId()
  const zonaId = await obtenerOCrearZona(propietarioId, params.ciudadRegion)

  const { data: propiedad, error: propiedadError } = await supabase
    .from('propiedades')
    .insert({
      zona_id: zonaId,
      nombre_apartamento: params.nombreApartamento,
      ia_identidad: params.nombreIa,
      direccion_calle: params.direccionCalle,
      piso_puerta: params.pisoPuerta || null,
      codigo_postal: params.codigoPostal,
      indicaciones_acceso: params.indicacionesAcceso || null,
      borrador_texto: '',
    })
    .select('id')
    .single()

  if (propiedadError) throw propiedadError
  return propiedad.id
}

export async function obtenerBorradorPropiedad(
  propiedadId: string,
): Promise<string> {
  const { data, error } = await supabase
    .from('propiedades')
    .select('borrador_texto')
    .eq('id', propiedadId)
    .single()

  if (error) throw error
  return (data?.borrador_texto ?? '').trim()
}

export async function guardarBorradorPropiedad(
  propiedadId: string,
  borrador: string,
): Promise<void> {
  const { error } = await supabase
    .from('propiedades')
    .update({ borrador_texto: borrador })
    .eq('id', propiedadId)

  if (error) throw error
}

export type AlertasPropiedadConfig = {
  activas: boolean
  canal: 'telegram' | 'email' | 'ambos'
  contacto: string
  eventos: {
    emergencias: boolean
    checkin_anticipado: boolean
    averias: boolean
  }
}

export async function guardarAlertasPropiedad(
  propiedadId: string,
  alertas: AlertasPropiedadConfig,
): Promise<void> {
  const { error } = await supabase
    .from('propiedades')
    .update({
      permiso_modo_alerta: alertas.activas,
      alertas_config: alertas,
    })
    .eq('id', propiedadId)

  if (error) throw error
}

export async function obtenerTelegramPropietario(): Promise<string> {
  const propietarioId = await obtenerPropietarioId()

  const { data, error } = await supabase
    .from('propietarios')
    .select('telegram_chat_id')
    .eq('id', propietarioId)
    .single()

  if (error) throw error
  if (!data?.telegram_chat_id) return ''
  return String(data.telegram_chat_id)
}

function formatearDireccionPropiedad(
  calle: string,
  piso: string | null,
  cp: string,
): string {
  const partes = [calle.trim()]
  if (piso?.trim()) partes.push(piso.trim())
  if (cp.trim()) partes.push(cp.trim())
  return partes.filter(Boolean).join(', ')
}

export async function listarPropiedadesPropietario(): Promise<PropiedadResumen[]> {
  const propietarioId = await obtenerPropietarioId()

  const { data: zonas, error: zonasError } = await supabase
    .from('zonas')
    .select('id')
    .eq('propietario_id', propietarioId)

  if (zonasError) throw zonasError
  if (!zonas?.length) return []

  const zonaIds = zonas.map((zona) => zona.id)

  const { data, error } = await supabase
    .from('propiedades')
    .select(
      'id, nombre_apartamento, direccion_calle, piso_puerta, codigo_postal, borrador_texto, ia_identidad',
    )
    .in('zona_id', zonaIds)
    .order('nombre_apartamento')

  if (error) throw error

  return (data ?? []).map((propiedad) => {
    const direccionCalle = propiedad.direccion_calle ?? ''
    const pisoPuerta = propiedad.piso_puerta ?? ''
    const codigoPostal = propiedad.codigo_postal ?? ''
    const borrador = (propiedad.borrador_texto ?? '').trim()

    return {
      id: propiedad.id,
      nombreApartamento: propiedad.nombre_apartamento ?? 'Sin nombre',
      direccionCalle,
      pisoPuerta,
      codigoPostal,
      iaIdentidad: propiedad.ia_identidad ?? '',
      activa: borrador.length > 0,
      direccionCompleta: formatearDireccionPropiedad(
        direccionCalle,
        pisoPuerta,
        codigoPostal,
      ),
    }
  })
}
