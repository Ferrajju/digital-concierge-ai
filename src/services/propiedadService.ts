import { supabase } from './supabaseClient'

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
