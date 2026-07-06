import type { N8nFlujo1Payload, N8nFlujo2Payload } from '../pages/propietario/types/propiedadChat'

const FLUJO1_URL = import.meta.env.VITE_N8N_FLUJO1_WEBHOOK_URL
const FLUJO2_URL = import.meta.env.VITE_N8N_FLUJO2_WEBHOOK_URL

function assertWebhookUrl(url: string | undefined, flujo: string): asserts url is string {
  if (!url || url === 'TU_URL_WEBHOOK_N8N_AQUI') {
    throw new Error(
      `Configura VITE_N8N_${flujo}_WEBHOOK_URL en tu archivo .env con la URL real del webhook de n8n.`,
    )
  }
}

function extractN8nResponse(data: unknown): string {
  if (typeof data === 'string' && data.trim()) return data.trim()

  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>

    for (const key of ['respuesta', 'response', 'texto', 'message', 'output']) {
      const value = record[key]
      if (typeof value === 'string' && value.trim()) return value.trim()
    }
  }

  throw new Error('La respuesta de n8n no contiene un texto válido.')
}

export async function enviarMensajeFlujo1(
  payload: N8nFlujo1Payload,
): Promise<string> {
  assertWebhookUrl(FLUJO1_URL, 'FLUJO1')

  const response = await fetch(FLUJO1_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`n8n Flujo 1 respondió con error ${response.status}.`)
  }

  const contentType = response.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    return extractN8nResponse(await response.json())
  }

  return extractN8nResponse(await response.text())
}

export async function procesarConversacionFlujo2(
  payload: N8nFlujo2Payload,
): Promise<void> {
  assertWebhookUrl(FLUJO2_URL, 'FLUJO2')

  const response = await fetch(FLUJO2_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`n8n Flujo 2 respondió con error ${response.status}.`)
  }
}
