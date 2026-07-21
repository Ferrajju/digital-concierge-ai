import { supabase } from './supabaseClient'

export async function cerrarSesionPropietario(): Promise<void> {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
