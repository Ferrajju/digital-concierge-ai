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
  ubicacionBase: string
}

export async function crearPropiedadConDatos({
  nombreApartamento,
  ubicacionBase,
}: CrearPropiedadParams): Promise<string> {
  const propietarioId = await obtenerPropietarioId()

  const { data: zona, error: zonaError } = await supabase
    .from('zonas')
    .insert({
      propietario_id: propietarioId,
      nombre_zona: 'General',
      ubicacion_base: ubicacionBase,
    })
    .select('id')
    .single()

  if (zonaError) throw zonaError

  const { data: propiedad, error: propiedadError } = await supabase
    .from('propiedades')
    .insert({
      zona_id: zona.id,
      nombre_apartamento: nombreApartamento,
      borrador_texto: '',
    })
    .select('id')
    .single()

  if (propiedadError) throw propiedadError
  return propiedad.id
}
