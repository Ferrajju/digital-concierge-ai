import type {
  N8nFlujo4Payload,
  N8nFlujo4Response,
} from '../pages/huesped/types/guestChat'
import type {
  N8nFlujo1Payload,
  N8nFlujo1Response,
  N8nFlujo2Payload,
  N8nFlujo3Payload,
} from '../pages/propietario/types/propiedadChat'
import type {
  CategoriaGuiaLocal,
  LugarGoogleRaw,
  TarjetaGuiaLocal,
} from '../pages/propietario/types/guiaLocal'
import {
  obtenerBorradorPropiedad,
} from './propiedadService'

const FLUJO1_URL = import.meta.env.VITE_N8N_FLUJO1_WEBHOOK_URL
const FLUJO2_URL = import.meta.env.VITE_N8N_FLUJO2_WEBHOOK_URL
const FLUJO3_URL = import.meta.env.VITE_N8N_FLUJO3_WEBHOOK_URL
const FLUJO4_URL = import.meta.env.VITE_N8N_FLUJO4_WEBHOOK_URL
const GUIA_LOCAL_URL = import.meta.env.VITE_N8N_GUIA_LOCAL_WEBHOOK_URL

function assertWebhookUrl(url: string | undefined, flujo: string): asserts url is string {
  const placeholders = ['TU_URL_WEBHOOK_N8N_AQUI', 'TU_URL_WEBHOOK_N8N_BATCH_AQUI', 'TU_URL_WEBHOOK_N8N_EMBEDDINGS_AQUI']
  if (!url || placeholders.includes(url)) {
    throw new Error(
      `Configura VITE_N8N_${flujo}_WEBHOOK_URL en tu archivo .env con la URL real del webhook de n8n.`,
    )
  }
}

function unwrapRecord(data: unknown): Record<string, unknown> {
  if (Array.isArray(data) && data.length > 0) {
    return unwrapRecord(data[0])
  }
  if (data && typeof data === 'object') {
    return data as Record<string, unknown>
  }
  return {}
}

function tryExtractTextFromRecord(record: Record<string, unknown>): string {
  for (const key of [
    'borrador',
    'borrador_texto',
    'contenido_texto',
    'texto_estructurado',
    'resultado',
    'respuesta',
    'response',
    'texto',
    'message',
    'output',
    'text',
    'content',
  ]) {
    const value = record[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }

  if (record.output && typeof record.output === 'object') {
    return tryExtractTextFromRecord(record.output as Record<string, unknown>)
  }

  return ''
}

function formatBloques(bloques: unknown[]): string {
  return bloques
    .map((bloque) => {
      if (typeof bloque === 'string') return bloque
      if (bloque && typeof bloque === 'object') {
        const b = bloque as Record<string, unknown>
        const titulo = b.titulo ?? b.title ?? b.categoria ?? 'Bloque'
        const contenido = b.contenido ?? b.contenido_texto ?? b.texto ?? b.content ?? ''
        return `## ${titulo}\n${contenido}`
      }
      return ''
    })
    .filter(Boolean)
    .join('\n\n')
}

function tryExtractBorrador(data: unknown): string {
  const record = unwrapRecord(data)

  if (record.body && typeof record.body === 'object') {
    const nested = tryExtractBorrador(record.body)
    if (nested) return nested
  }

  if (typeof record.borrador === 'string' && record.borrador.trim()) {
    return record.borrador.trim()
  }
  if (Array.isArray(record.borrador)) {
    const formatted = formatBloques(record.borrador)
    if (formatted) return formatted
  }
  if (Array.isArray(record.bloques)) {
    const formatted = formatBloques(record.bloques)
    if (formatted) return formatted
  }
  if (typeof record.draft === 'string' && record.draft.trim()) {
    return record.draft.trim()
  }

  return tryExtractTextFromRecord(record)
}

function extractBorrador(data: unknown): string {
  return tryExtractBorrador(data)
}

type FlujoResponseHint = {
  nombre: string
  formatoEsperado: string
}

function parseBooleanStrict(value: unknown, flujo: string): boolean {
  if (typeof value === 'boolean') return value
  if (value === 'true') return true
  if (value === 'false') return false
  throw new Error(
    `${flujo}: la respuesta de n8n no incluye el campo booleano "finalizado".`,
  )
}

function parseFlujo1Response(data: unknown): N8nFlujo1Response {
  const record = unwrapRecord(data)

  const respuesta = record.respuesta
  if (typeof respuesta !== 'string' || !respuesta.trim()) {
    throw new Error(
      'Flujo 1: la respuesta de n8n no incluye el campo "respuesta" válido.',
    )
  }

  return {
    respuesta: respuesta.trim(),
    finalizado: parseBooleanStrict(record.finalizado, 'Flujo 1'),
  }
}

async function parseResponseJson(
  response: Response,
  hint: FlujoResponseHint,
): Promise<unknown> {
  const text = (await response.text()).trim()

  if (!text) {
    throw new Error(
      `${hint.nombre}: n8n devolvió una respuesta vacía. Comprueba que el webhook use "Respond to Webhook" y devuelva ${hint.formatoEsperado}.`,
    )
  }

  try {
    return JSON.parse(text) as unknown
  } catch {
    throw new Error(
      `${hint.nombre}: n8n devolvió un JSON inválido. Revisa el nodo "Respond to Webhook". Formato esperado: ${hint.formatoEsperado}.`,
    )
  }
}

export async function enviarMensajeFlujo1(
  payload: N8nFlujo1Payload,
  signal?: AbortSignal,
): Promise<N8nFlujo1Response> {
  assertWebhookUrl(FLUJO1_URL, 'FLUJO1')

  const response = await fetch(FLUJO1_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  })

  if (!response.ok) {
    throw new Error(`n8n Flujo 1 respondió con error ${response.status}.`)
  }

  return parseFlujo1Response(
    await parseResponseJson(response, {
      nombre: 'Flujo 1',
      formatoEsperado: '{ "respuesta": "...", "finalizado": false }',
    }),
  )
}

async function parseResponseJsonOptional(response: Response): Promise<unknown | null> {
  const text = (await response.text()).trim()
  if (!text) return null

  try {
    return JSON.parse(text) as unknown
  } catch {
    return text
  }
}

export async function procesarBorradorFlujo2(
  payload: N8nFlujo2Payload,
  signal?: AbortSignal,
): Promise<string> {
  assertWebhookUrl(FLUJO2_URL, 'FLUJO2')

  const response = await fetch(FLUJO2_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  })

  if (!response.ok) {
    throw new Error(`n8n Flujo 2 respondió con error ${response.status}.`)
  }

  const raw = await parseResponseJsonOptional(response)
  let borrador = raw ? extractBorrador(raw) : ''

  if (!borrador) {
    borrador = await obtenerBorradorPropiedad(payload.propiedad_id)
  }

  if (!borrador) {
    throw new Error(
      'El Flujo 2 no devolvió borrador. Comprueba que n8n responda con { "borrador": "..." } o guarde el texto en propiedades.borrador_texto.',
    )
  }

  return borrador
}

export async function inyectarConocimientoFlujo3(
  payload: N8nFlujo3Payload,
  signal?: AbortSignal,
): Promise<void> {
  assertWebhookUrl(FLUJO3_URL, 'FLUJO3')

  const response = await fetch(FLUJO3_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  })

  if (!response.ok) {
    const detalle = response.status === 404
      ? ' El webhook no acepta POST — configura el nodo Webhook de n8n en método POST.'
      : ''
    throw new Error(
      `n8n Flujo 3 respondió con error ${response.status}.${detalle}`,
    )
  }
}

export type N8nGuiaLocalPayload = {
  direccion: string
  lugares: LugarGoogleRaw[]
}

type TarjetaGuiaLocalN8n = {
  categoria: CategoriaGuiaLocal
  nombre: string
  distancia: string
  informacion: string
}

function parseTarjetasGuiaLocal(data: unknown): TarjetaGuiaLocal[] {
  const record = unwrapRecord(data)
  const tarjetasRaw = record.tarjetas

  if (!Array.isArray(tarjetasRaw)) {
    throw new Error(
      'n8n no devolvió un array "tarjetas" válido para la Guía Local.',
    )
  }

  const tarjetas: TarjetaGuiaLocal[] = []

  for (const item of tarjetasRaw) {
    if (!item || typeof item !== 'object') continue
    const tarjeta = item as TarjetaGuiaLocalN8n
    if (
      typeof tarjeta.nombre !== 'string' ||
      typeof tarjeta.distancia !== 'string' ||
      typeof tarjeta.informacion !== 'string' ||
      typeof tarjeta.categoria !== 'string'
    ) {
      continue
    }

    tarjetas.push({
      id: crypto.randomUUID(),
      categoria: tarjeta.categoria as CategoriaGuiaLocal,
      nombre: tarjeta.nombre.trim(),
      distancia: tarjeta.distancia.trim(),
      informacion: tarjeta.informacion.trim(),
      activa: true,
    })
  }

  return tarjetas
}

export async function generarTarjetasGuiaLocalN8n(
  payload: N8nGuiaLocalPayload,
  signal?: AbortSignal,
): Promise<TarjetaGuiaLocal[]> {
  const placeholders = ['TU_URL_WEBHOOK_GUIA_LOCAL_AQUI']
  if (!GUIA_LOCAL_URL || placeholders.includes(GUIA_LOCAL_URL)) {
    throw new Error('Webhook de Guía Local no configurado.')
  }

  const response = await fetch(GUIA_LOCAL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  })

  if (!response.ok) {
    throw new Error(`n8n Guía Local respondió con error ${response.status}.`)
  }

  const raw = await parseResponseJson(response, {
    nombre: 'Guía Local',
    formatoEsperado: '{ "tarjetas": [{ "categoria": "...", "nombre": "...", "distancia": "...", "informacion": "..." }] }',
  })
  return parseTarjetasGuiaLocal(raw)
}

function parseFlujo4Response(data: unknown): N8nFlujo4Response {
  const record = unwrapRecord(data)
  const respuesta = record.respuesta

  if (typeof respuesta !== 'string' || !respuesta.trim()) {
    throw new Error(
      'Flujo 4: la respuesta de n8n no incluye el campo "respuesta" válido.',
    )
  }

  const result: N8nFlujo4Response = {
    respuesta: respuesta.trim(),
  }

  if (record.alerta && typeof record.alerta === 'object') {
    const alerta = record.alerta as Record<string, unknown>
    result.alerta = {
      detectada: alerta.detectada === true,
      tipo:
        alerta.tipo === 'emergencias' ||
        alerta.tipo === 'checkin_anticipado' ||
        alerta.tipo === 'averias'
          ? alerta.tipo
          : undefined,
      resumen:
        typeof alerta.resumen === 'string' ? alerta.resumen.trim() : undefined,
    }
  }

  return result
}

export async function enviarMensajeFlujo4(
  payload: N8nFlujo4Payload,
  signal?: AbortSignal,
): Promise<N8nFlujo4Response> {
  const placeholders = ['TU_URL_WEBHOOK_FLUJO4_AQUI', '']

  console.log('[Flujo4] URL configurada:', FLUJO4_URL ? 'sí' : 'NO')
  console.log('[Flujo4] Payload:', payload)

  if (!FLUJO4_URL || placeholders.includes(FLUJO4_URL)) {
    console.error(
      '[Flujo4] Webhook NO llamado — falta VITE_N8N_FLUJO4_WEBHOOK_URL en .env o Vercel.',
    )
    throw new Error(
      'Flujo 4 no configurado. Añade VITE_N8N_FLUJO4_WEBHOOK_URL y reinicia el servidor.',
    )
  }

  console.log('[Flujo4] Llamando webhook:', FLUJO4_URL)

  const response = await fetch(FLUJO4_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  })

  console.log('[Flujo4] Respuesta HTTP status:', response.status)

  if (!response.ok) {
    const detalle = response.status === 404
      ? ' El webhook no acepta POST — configura el nodo Webhook de n8n en método POST.'
      : ''
    throw new Error(
      `n8n Flujo 4 respondió con error ${response.status}.${detalle}`,
    )
  }

  return parseFlujo4Response(
    await parseResponseJson(response, {
      nombre: 'Flujo 4',
      formatoEsperado: '{ "respuesta": "..." }',
    }),
  )
}
