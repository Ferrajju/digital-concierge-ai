const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-alert-secret',
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

export async function sendTelegramMessage(
  chatId: string | number,
  text: string,
  parseMode?: 'MarkdownV2',
): Promise<void> {
  const token = Deno.env.get('TELEGRAM_BOT_TOKEN')
  if (!token) {
    throw new Error('TELEGRAM_BOT_TOKEN no configurado en Edge Functions.')
  }

  const payload: Record<string, unknown> = {
    chat_id: chatId,
    text,
    disable_web_page_preview: true,
  }

  if (parseMode === 'MarkdownV2') {
    payload.parse_mode = parseMode
  }

  const response = await fetch(
    `https://api.telegram.org/bot${token}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
  )

  if (!response.ok) {
    const detalle = await response.text()
    throw new Error(`Telegram API error ${response.status}: ${detalle}`)
  }
}

const TITULOS: Record<string, { emoji: string; titulo: string }> = {
  emergencias: { emoji: '🚨', titulo: 'Emergencia grave' },
  checkin_anticipado: { emoji: '🕐', titulo: 'Check\\-in anticipado' },
  averias: { emoji: '🔧', titulo: 'Avería técnica' },
}

function escapeMd(value: string): string {
  return value.replace(/([_*[\]()~`>#+\-=|{}.!\\])/g, '\\$1')
}

export function buildAlertMarkdown(input: {
  tipoEvento: string
  nombreApartamento: string
  direccionCalle?: string | null
  pisoPuerta?: string | null
  codigoPostal?: string | null
  resumen: string
  mensajeHuesped: string
  sessionId?: string
  panelUrl?: string
}): string {
  const meta = TITULOS[input.tipoEvento] ?? {
    emoji: '⚠️',
    titulo: 'Incidencia',
  }

  const direccion = [
    input.direccionCalle?.trim(),
    input.pisoPuerta?.trim(),
    input.codigoPostal?.trim(),
  ]
    .filter(Boolean)
    .join(', ')

  const fecha = new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date())

  const lineas = [
    `${meta.emoji} *ALERTA — ${meta.titulo}*`,
    '',
    `🏠 *Propiedad:* ${escapeMd(input.nombreApartamento)}`,
  ]

  if (direccion) {
    lineas.push(`📍 *Ubicación:* ${escapeMd(direccion)}`)
  }

  lineas.push(
    '',
    `📝 *Resumen:* ${escapeMd(input.resumen.trim())}`,
    '',
    '💬 *Mensaje del huésped:*',
    escapeMd(input.mensajeHuesped.trim()),
    '',
    `🕐 ${escapeMd(fecha)}`,
  )

  if (input.sessionId) {
    lineas.push(`🔑 Sesión: \`${escapeMd(input.sessionId.slice(0, 8))}\``)
  }

  if (input.panelUrl) {
    lineas.push('', `[Abrir chats del alojamiento](${input.panelUrl})`)
  }

  return lineas.join('\n')
}

export function assertAlertSecret(req: Request): boolean {
  const expected = Deno.env.get('ALERT_WEBHOOK_SECRET')
  if (!expected) return true
  return req.headers.get('x-alert-secret') === expected
}
