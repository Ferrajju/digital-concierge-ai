import { supabase } from './supabaseClient'
import type { PropiedadResumen } from '../pages/propietario/types/propiedadDashboard'
import type {
  ConfigPropiedadForm,
  ConfigPropiedadGuardada,
} from '../pages/propietario/types/configPropiedad'
import { normalizarPersonalidadAgente } from '../pages/propietario/types/configPropiedad'
import { WIZARD_INICIAL } from '../pages/propietario/types/validacionWizard'

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
  const { data: actualizada, error } = await supabase
    .from('propiedades')
    .update({ borrador_texto: borrador })
    .eq('id', propiedadId)
    .select('id')
    .maybeSingle()

  if (error) throw error
  if (!actualizada) {
    throw new Error(
      'No se pudo guardar el borrador. Comprueba que tienes permiso de edición.',
    )
  }
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
  const { data: actualizada, error } = await supabase
    .from('propiedades')
    .update({
      permiso_modo_alerta: alertas.activas,
      alertas_config: alertas,
    })
    .eq('id', propiedadId)
    .select('id')
    .maybeSingle()

  if (error) throw error
  if (!actualizada) {
    throw new Error(
      'No se pudieron guardar las alertas. Comprueba que tienes permiso de edición.',
    )
  }
}

function normalizarAlertasConfig(raw: unknown): AlertasPropiedadConfig {
  const base = WIZARD_INICIAL.alertas

  if (!raw || typeof raw !== 'object') {
    return { ...base }
  }

  const config = raw as Record<string, unknown>
  const eventosRaw =
    config.eventos && typeof config.eventos === 'object'
      ? (config.eventos as Record<string, unknown>)
      : {}

  const canal =
    config.canal === 'telegram' ||
    config.canal === 'email' ||
    config.canal === 'ambos'
      ? config.canal
      : base.canal

  return {
    activas:
      typeof config.activas === 'boolean' ? config.activas : base.activas,
    canal,
    contacto:
      typeof config.contacto === 'string' ? config.contacto : base.contacto,
    eventos: {
      emergencias:
        typeof eventosRaw.emergencias === 'boolean'
          ? eventosRaw.emergencias
          : base.eventos.emergencias,
      checkin_anticipado:
        typeof eventosRaw.checkin_anticipado === 'boolean'
          ? eventosRaw.checkin_anticipado
          : base.eventos.checkin_anticipado,
      averias:
        typeof eventosRaw.averias === 'boolean'
          ? eventosRaw.averias
          : base.eventos.averias,
    },
  }
}

export async function obtenerAlertasPropiedad(
  propiedadId: string,
): Promise<AlertasPropiedadConfig> {
  const { data, error } = await supabase
    .from('propiedades')
    .select('alertas_config, permiso_modo_alerta')
    .eq('id', propiedadId)
    .single()

  if (error) throw error

  const alertas = normalizarAlertasConfig(data?.alertas_config)

  if (typeof data?.permiso_modo_alerta === 'boolean') {
    return { ...alertas, activas: data.permiso_modo_alerta }
  }

  return alertas
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

export function construirDireccionCompletaConfig(
  config: Pick<
    ConfigPropiedadForm,
    'direccionCalle' | 'pisoPuerta' | 'codigoPostal' | 'ciudadRegion'
  >,
): string {
  const partes = [
    config.direccionCalle.trim(),
    config.pisoPuerta.trim(),
    config.codigoPostal.trim(),
    config.ciudadRegion.trim(),
  ].filter(Boolean)

  return partes.join(', ')
}

export function ubicacionCambioAfectaGuia(
  original: ConfigPropiedadForm,
  actualizada: ConfigPropiedadForm,
): boolean {
  return (
    original.direccionCalle.trim() !== actualizada.direccionCalle.trim() ||
    original.pisoPuerta.trim() !== actualizada.pisoPuerta.trim() ||
    original.codigoPostal.trim() !== actualizada.codigoPostal.trim() ||
    original.ciudadRegion.trim() !== actualizada.ciudadRegion.trim()
  )
}

export async function obtenerConfiguracionPropiedad(
  propiedadId: string,
): Promise<ConfigPropiedadGuardada> {
  await obtenerPropietarioId()

  const { data, error } = await supabase
    .from('propiedades')
    .select(
      `
      id,
      zona_id,
      nombre_apartamento,
      ia_identidad,
      ia_elegancia,
      ia_expresividad,
      direccion_calle,
      piso_puerta,
      codigo_postal,
      indicaciones_acceso,
      zonas ( ubicacion_base )
    `,
    )
    .eq('id', propiedadId)
    .maybeSingle()

  if (error) throw error
  if (!data) {
    throw new Error('Propiedad no encontrada o no tienes acceso.')
  }

  const zonaRaw = data.zonas as
    | { ubicacion_base: string | null }
    | { ubicacion_base: string | null }[]
    | null
  const zona = Array.isArray(zonaRaw) ? zonaRaw[0] : zonaRaw
  const ciudadRegion = (zona?.ubicacion_base ?? '').trim()
  const direccionCalle = (data.direccion_calle ?? '').trim()
  const pisoPuerta = (data.piso_puerta ?? '').trim()
  const codigoPostal = (data.codigo_postal ?? '').trim()

  const busquedaRapida = construirDireccionCompletaConfig({
    direccionCalle,
    pisoPuerta,
    codigoPostal,
    ciudadRegion,
  })

  const eleganciaRaw = (data.ia_elegancia ?? 'cercano').trim()
  const expresividadRaw =
    typeof data.ia_expresividad === 'number'
      ? Math.min(5, Math.max(1, data.ia_expresividad))
      : 3
  const { iaElegancia, iaExpresividad } = normalizarPersonalidadAgente(
    eleganciaRaw,
    expresividadRaw,
  )

  return {
    zonaId: data.zona_id,
    nombreApartamento: data.nombre_apartamento ?? '',
    nombreIa: data.ia_identidad ?? '',
    iaElegancia,
    iaExpresividad,
    busquedaRapida,
    direccionCalle,
    pisoPuerta,
    codigoPostal,
    ciudadRegion,
    indicacionesAcceso: (data.indicaciones_acceso ?? '').trim(),
  }
}

export async function actualizarConfiguracionPropiedad(
  propiedadId: string,
  config: ConfigPropiedadForm,
  zonaId: string,
): Promise<void> {
  await obtenerPropietarioId()

  const ciudadRegion = config.ciudadRegion.trim()

  const { data: propiedadActualizada, error: propiedadError } = await supabase
    .from('propiedades')
    .update({
      nombre_apartamento: config.nombreApartamento.trim(),
      ia_identidad: config.nombreIa.trim(),
      ia_elegancia: config.iaElegancia,
      ia_expresividad: config.iaExpresividad,
      direccion_calle: config.direccionCalle.trim(),
      piso_puerta: config.pisoPuerta.trim() || null,
      codigo_postal: config.codigoPostal.trim(),
      indicaciones_acceso: config.indicacionesAcceso.trim() || null,
    })
    .eq('id', propiedadId)
    .select('id')
    .maybeSingle()

  if (propiedadError) throw propiedadError
  if (!propiedadActualizada) {
    throw new Error(
      'No se pudo guardar la configuración. Comprueba que tienes permiso de edición.',
    )
  }

  if (ciudadRegion) {
    const { data: zonaActualizada, error: zonaError } = await supabase
      .from('zonas')
      .update({
        ubicacion_base: ciudadRegion,
        nombre_zona: ciudadRegion,
      })
      .eq('id', zonaId)
      .select('id')
      .maybeSingle()

    if (zonaError) throw zonaError
    if (!zonaActualizada) {
      throw new Error(
        'No se pudo actualizar la zona. Comprueba que tienes permiso de edición.',
      )
    }
  }
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

export async function obtenerPropiedadBasicaPropietario(
  propiedadId: string,
): Promise<{ id: string; nombreApartamento: string; iaIdentidad: string }> {
  await obtenerPropietarioId()

  const { data, error } = await supabase
    .from('propiedades')
    .select('id, nombre_apartamento, ia_identidad')
    .eq('id', propiedadId)
    .maybeSingle()

  if (error) throw error
  if (!data) {
    throw new Error('Propiedad no encontrada o no tienes acceso.')
  }

  return {
    id: data.id,
    nombreApartamento: data.nombre_apartamento ?? 'Sin nombre',
    iaIdentidad: data.ia_identidad ?? 'Conserje',
  }
}
