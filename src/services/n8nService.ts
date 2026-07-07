import type {
  N8nFlujo1Payload,
  N8nFlujo1Response,
  N8nFlujo2Payload,
  N8nFlujo3Payload,
} from '../pages/propietario/types/propiedadChat'

const FLUJO1_URL = import.meta.env.VITE_N8N_FLUJO1_WEBHOOK_URL
const FLUJO2_URL = import.meta.env.VITE_N8N_FLUJO2_WEBHOOK_URL
const FLUJO3_URL = import.meta.env.VITE_N8N_FLUJO3_WEBHOOK_URL

const FRASES_CIERRE = [
  'entrevista completada',
  'hemos terminado',
  'toda la información necesaria',
  'ya tengo todo lo que necesito',
  'información está completa',
  'configuración inicial está lista',
  'repasaremos toda la información',
  'vamos a repasar',
]

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

function extractTextFromRecord(record: Record<string, unknown>): string {
  for (const key of [
    'respuesta',
    'response',
    'texto',
    'message',
    'output',
    'text',
    'borrador',
  ]) {
    const value = record[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }

  if (record.output && typeof record.output === 'object') {
    return extractTextFromRecord(record.output as Record<string, unknown>)
  }

  throw new Error('La respuesta de n8n no contiene un texto válido.')
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

function extractBorrador(data: unknown): string {
  const record = unwrapRecord(data)

  if (typeof record.borrador === 'string') return record.borrador.trim()
  if (Array.isArray(record.borrador)) return formatBloques(record.borrador)
  if (Array.isArray(record.bloques)) return formatBloques(record.bloques)
  if (typeof record.draft === 'string') return record.draft.trim()

  return extractTextFromRecord(record)
}

function esFraseDeCierre(texto: string): boolean {
  const normalizado = texto.toLowerCase()
  return FRASES_CIERRE.some((frase) => normalizado.includes(frase))
}

function parseFlujo1Response(data: unknown): N8nFlujo1Response {
  const record = unwrapRecord(data)
  const respuesta = extractTextFromRecord(record)
  const finalizado =
    record.finalizado === true ||
    record.finalizado === 'true' ||
    esFraseDeCierre(respuesta)

  return { respuesta, finalizado }
}

async function parseResponseJson(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    return response.json()
  }
  const text = await response.text()
  try {
    return JSON.parse(text)
  } catch {
    return text
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

  return parseFlujo1Response(await parseResponseJson(response))
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

  return extractBorrador(await parseResponseJson(response))
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
    throw new Error(`n8n Flujo 3 respondió con error ${response.status}.`)
  }
}
