import {
  assertAlertSecret,
  buildAlertMarkdown,
  jsonResponse,
  sendTelegramMessage,
} from '../_shared/telegram.ts'
import {
  evaluarAlertaPropiedad,
  registrarAlerta,
} from '../_shared/supabaseAdmin.ts'

type EnviarAlertaBody = {
  propiedad_id?: string
  tipo_evento?: string
  resumen?: string
  mensaje_huesped?: string
  session_id?: string
  es_prueba?: boolean
}

const TIPOS_VALIDOS = new Set([
  'emergencias',
  'checkin_anticipado',
  'averias',
])

const ALIAS_TIPO_EVENTO: Record<string, string> = {
  emergencies: 'emergencias',
  emergency: 'emergencias',
  emergencia: 'emergencias',
  early_checkin: 'checkin_anticipado',
  early_check_in: 'checkin_anticipado',
  checkin: 'checkin_anticipado',
  breakdown: 'averias',
  breakdowns: 'averias',
  malfunction: 'averias',
  malfunctions: 'averias',
  averia: 'averias',
}

function normalizarTipoEvento(raw: string): string | null {
  const key = raw.trim().toLowerCase()
  if (TIPOS_VALIDOS.has(key)) return key

  const alias = ALIAS_TIPO_EVENTO[key]
  if (alias && TIPOS_VALIDOS.has(alias)) return alias

  return null
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Método no permitido' }, 405)
  }

  if (!assertAlertSecret(req)) {
    return jsonResponse({ error: 'No autorizado' }, 401)
  }

  let body: EnviarAlertaBody
  try {
    body = await req.json()
  } catch {
    return jsonResponse({ error: 'JSON inválido' }, 400)
  }

  const propiedadId = body.propiedad_id?.trim()
  const tipoEvento = body.tipo_evento?.trim()
    ? normalizarTipoEvento(body.tipo_evento)
    : null
  const resumen = body.resumen?.trim() ?? ''
  const mensajeHuesped = body.mensaje_huesped?.trim() ?? ''
  const sessionId = body.session_id?.trim()
  const esPrueba = body.es_prueba === true

  if (!propiedadId || !tipoEvento) {
    return jsonResponse(
      { error: 'Faltan propiedad_id o tipo_evento' },
      400,
    )
  }

  if (!TIPOS_VALIDOS.has(tipoEvento)) {
    return jsonResponse({ error: 'tipo_evento inválido' }, 400)
  }

  if (!resumen && !mensajeHuesped) {
    return jsonResponse(
      { error: 'Indica resumen o mensaje_huesped' },
      400,
    )
  }

  try {
    const evaluacion = await evaluarAlertaPropiedad(propiedadId, tipoEvento)

    if (!evaluacion.notificar) {
      await registrarAlerta({
        propiedadId,
        tipoEvento,
        resumen,
        mensajeHuesped,
        sessionId,
        enviada: false,
        motivoOmitida: evaluacion.motivo ?? 'no_notificar',
        esPrueba,
      })

      return jsonResponse({
        enviada: false,
        motivo: evaluacion.motivo ?? 'no_notificar',
        propiedad_id: propiedadId,
        tipo_evento: tipoEvento,
      })
    }

    const appUrl = Deno.env.get('APP_URL') ?? ''
    const panelUrl = appUrl
      ? `${appUrl.replace(/\/$/, '')}/propiedad/${propiedadId}/chats`
      : undefined

    const texto = buildAlertMarkdown({
      tipoEvento,
      nombreApartamento: evaluacion.nombre_apartamento ?? 'Alojamiento',
      direccionCalle: evaluacion.direccion_calle,
      pisoPuerta: evaluacion.piso_puerta,
      codigoPostal: evaluacion.codigo_postal,
      resumen: resumen || mensajeHuesped.slice(0, 180),
      mensajeHuesped,
      sessionId,
      panelUrl,
      esPrueba,
    })

    const chatId = evaluacion.telegram_chat_id
    if (!chatId) {
      throw new Error('evaluar_alerta_propiedad devolvió notificar=true sin chat_id')
    }

    await sendTelegramMessage(chatId, texto, 'MarkdownV2')

    await registrarAlerta({
      propiedadId,
      tipoEvento,
      resumen,
      mensajeHuesped,
      sessionId,
      telegramChatId: String(chatId),
      enviada: true,
      esPrueba,
    })

    return jsonResponse({
      enviada: true,
      propiedad_id: propiedadId,
      tipo_evento: tipoEvento,
      telegram_chat_id: chatId,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Error interno al enviar alerta'

    return jsonResponse({ error: message }, 500)
  }
})
