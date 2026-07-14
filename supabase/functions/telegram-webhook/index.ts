import { jsonResponse, sendTelegramMessage } from '../_shared/telegram.ts'

type TelegramUpdate = {
  message?: {
    chat: { id: number }
    text?: string
    from?: { first_name?: string }
  }
}

function assertWebhookSecret(req: Request): boolean {
  const expected = Deno.env.get('TELEGRAM_WEBHOOK_SECRET')
  if (!expected) return true

  const url = new URL(req.url)
  return url.searchParams.get('secret') === expected
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return jsonResponse({ ok: true, hint: 'telegram-webhook activo' })
  }

  if (!assertWebhookSecret(req)) {
    console.error('telegram-webhook: secret inválido en la URL')
    return jsonResponse({ error: 'Webhook no autorizado' }, 401)
  }

  let update: TelegramUpdate
  try {
    update = await req.json()
  } catch {
    return jsonResponse({ ok: true })
  }

  const message = update.message
  if (!message?.chat?.id) {
    return jsonResponse({ ok: true })
  }

  const chatId = message.chat.id
  const text = (message.text ?? '').trim()
  const nombre = message.from?.first_name ?? 'propietario'

  try {
    if (text.startsWith('/start')) {
      await sendTelegramMessage(
        chatId,
        [
          `Bienvenido a Umbral, ${nombre}.`,
          '',
          'Este bot envia alertas criticas de tus alojamientos turisticos.',
          '',
          `Tu Chat ID es: ${chatId}`,
          '',
          'Pasos:',
          '1. Copia el numero de arriba',
          '2. Entra en elumbral.com (panel de propietario)',
          '3. Pegalo en Alertas por Telegram y guarda',
          '',
          'Comandos: /ayuda',
        ].join('\n'),
        undefined,
      )
      return jsonResponse({ ok: true })
    }

    if (text.startsWith('/help') || text.startsWith('/ayuda')) {
      await sendTelegramMessage(
        chatId,
        [
          'Umbral Alertas',
          'Bot oficial: @TheUmbralbot',
          '',
          '/start - Obtener tu Chat ID',
          '/ayuda - Ver esta ayuda',
          '',
          'Recibiras avisos cuando un huesped reporte incidencias en tus propiedades.',
        ].join('\n'),
        undefined,
      )
      return jsonResponse({ ok: true })
    }

    await sendTelegramMessage(
      chatId,
      'Umbral Alertas: usa /start para obtener tu Chat ID o /ayuda para mas informacion.',
      undefined,
    )

    return jsonResponse({ ok: true })
  } catch (error) {
    const detalle =
      error instanceof Error ? error.message : 'Error desconocido en telegram-webhook'
    console.error('telegram-webhook:', detalle)

    return jsonResponse({ ok: false, error: detalle }, 500)
  }
})
