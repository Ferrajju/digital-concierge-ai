import { supabase } from './supabaseClient'
import { obtenerPropietarioId } from './propiedadService'

export type TipoFeedbackPropietario = 'comentario' | 'error'

export type EnviarFeedbackInput = {
  tipo: TipoFeedbackPropietario
  pantalla: string
  ruta: string
  mensaje: string
  propiedadId?: string
  contexto?: Record<string, unknown>
}

export async function enviarFeedbackPropietario(
  input: EnviarFeedbackInput,
): Promise<void> {
  const mensaje = input.mensaje.trim()
  if (mensaje.length < 10) {
    throw new Error('El mensaje debe tener al menos 10 caracteres.')
  }

  const propietarioId = await obtenerPropietarioId()

  const { error } = await supabase.from('feedback_propietario').insert({
    propietario_id: propietarioId,
    tipo: input.tipo,
    pantalla: input.pantalla,
    ruta: input.ruta,
    propiedad_id: input.propiedadId ?? null,
    mensaje,
    contexto: input.contexto ?? {},
  })

  if (error) throw error
}
