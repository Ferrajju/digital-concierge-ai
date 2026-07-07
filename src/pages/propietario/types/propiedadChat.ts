export type MensajeChat = {
  id: string
  remitente: 'propietario' | 'ia'
  texto: string
}

export type HistorialItem = {
  remitente: 'propietario' | 'ia'
  texto: string
}

export type N8nFlujo1Payload = {
  propiedad_id: string
  mensaje: string
  historial: HistorialItem[]
}

export type N8nFlujo1Response = {
  respuesta: string
  finalizado: boolean
}

export type N8nFlujo2Payload = {
  propiedad_id: string
}

export type N8nFlujo3Payload = {
  propiedad_id: string
  borrador: string
}
