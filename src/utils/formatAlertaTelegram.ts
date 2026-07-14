export type TipoEventoAlerta =
  | 'emergencias'
  | 'checkin_anticipado'
  | 'averias'

export type AlertaTelegramPayload = {
  propiedad_id: string
  tipo_evento: TipoEventoAlerta
  resumen: string
  mensaje_huesped: string
  session_id?: string
}

const TITULOS_EVENTO: Record<TipoEventoAlerta, { titulo: string; emoji: string }> =
  {
    emergencias: {
      emoji: '🚨',
      titulo: 'Emergencia grave',
    },
    checkin_anticipado: {
      emoji: '🕐',
      titulo: 'Check-in anticipado',
    },
    averias: {
      emoji: '🔧',
      titulo: 'Avería técnica',
    },
  }

function formatearDireccion(
  calle?: string | null,
  piso?: string | null,
  cp?: string | null,
): string {
  return [calle?.trim(), piso?.trim(), cp?.trim()].filter(Boolean).join(', ')
}

export function formatearMensajeAlertaTelegram(input: {
  tipoEvento: TipoEventoAlerta
  nombreApartamento: string
  direccionCalle?: string | null
  pisoPuerta?: string | null
  codigoPostal?: string | null
  resumen: string
  mensajeHuesped: string
  sessionId?: string
  panelUrl?: string
}): string {
  const meta = TITULOS_EVENTO[input.tipoEvento]
  const direccion = formatearDireccion(
    input.direccionCalle,
    input.pisoPuerta,
    input.codigoPostal,
  )
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
    `🏠 *Propiedad:* ${escapeMarkdown(input.nombreApartamento)}`,
  ]

  if (direccion) {
    lineas.push(`📍 *Ubicación:* ${escapeMarkdown(direccion)}`)
  }

  lineas.push(
    '',
    `📝 *Resumen:* ${escapeMarkdown(input.resumen.trim())}`,
    '',
    '💬 *Mensaje del huésped:*',
    escapeMarkdown(input.mensajeHuesped.trim()),
    '',
    `🕐 ${fecha}`,
  )

  if (input.sessionId) {
    lineas.push(`🔑 Sesión: \`${input.sessionId.slice(0, 8)}\``)
  }

  if (input.panelUrl) {
    lineas.push('', `🔗 [Abrir chats del alojamiento](${input.panelUrl})`)
  }

  return lineas.join('\n')
}

function escapeMarkdown(value: string): string {
  return value.replace(/([_*[\]()~`>#+\-=|{}.!\\])/g, '\\$1')
}

export function esTipoEventoAlerta(value: string): value is TipoEventoAlerta {
  return (
    value === 'emergencias' ||
    value === 'checkin_anticipado' ||
    value === 'averias'
  )
}
