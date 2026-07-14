import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

export function createServiceClient() {
  const url = Deno.env.get('SUPABASE_URL')
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!url || !key) {
    throw new Error('Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.')
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

type EvaluacionAlerta = {
  notificar: boolean
  motivo?: string
  telegram_chat_id?: string
  propiedad_id?: string
  nombre_apartamento?: string
  direccion_calle?: string | null
  piso_puerta?: string | null
  codigo_postal?: string | null
  tipo_evento?: string
}

export async function evaluarAlertaPropiedad(
  propiedadId: string,
  tipoEvento: string,
): Promise<EvaluacionAlerta> {
  const supabase = createServiceClient()

  const { data, error } = await supabase.rpc('evaluar_alerta_propiedad', {
    p_propiedad_id: propiedadId,
    p_tipo_evento: tipoEvento,
  })

  if (error) throw error
  return (data ?? { notificar: false, motivo: 'respuesta_vacia' }) as EvaluacionAlerta
}

export async function registrarAlerta(input: {
  propiedadId: string
  tipoEvento: string
  resumen: string
  mensajeHuesped: string
  sessionId?: string
  telegramChatId?: string
  enviada: boolean
  motivoOmitida?: string
}) {
  const supabase = createServiceClient()

  const { error } = await supabase.from('alertas_enviadas').insert({
    propiedad_id: input.propiedadId,
    tipo_evento: input.tipoEvento,
    resumen: input.resumen,
    mensaje_huesped: input.mensajeHuesped,
    session_id: input.sessionId ?? null,
    telegram_chat_id: input.telegramChatId ?? null,
    enviada: input.enviada,
    motivo_omitida: input.motivoOmitida ?? null,
  })

  if (error) throw error
}
