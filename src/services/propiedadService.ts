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

export async function obtenerOCrearZona(propietarioId: string): Promise<string> {
  const { data: zonas, error: selectError } = await supabase
    .from('zonas')
    .select('id')
    .eq('propietario_id', propietarioId)
    .limit(1)

  if (selectError) throw selectError
  if (zonas && zonas.length > 0) return zonas[0].id

  const { data: nuevaZona, error: insertError } = await supabase
    .from('zonas')
    .insert({
      propietario_id: propietarioId,
      nombre_zona: 'General',
      ubicacion_base: 'Por definir',
    })
    .select('id')
    .single()

  if (insertError) throw insertError
  return nuevaZona.id
}

export async function crearPropiedadEnConfiguracion(
  zonaId: string,
): Promise<string> {
  const { data, error } = await supabase
    .from('propiedades')
    .insert({
      zona_id: zonaId,
      nombre_apartamento: 'Nuevo Alojamiento en Configuración',
    })
    .select('id')
    .single()

  if (error) throw error
  return data.id
}

export async function inicializarNuevaPropiedad(): Promise<string> {
  const propietarioId = await obtenerPropietarioId()
  const zonaId = await obtenerOCrearZona(propietarioId)
  return crearPropiedadEnConfiguracion(zonaId)
}
