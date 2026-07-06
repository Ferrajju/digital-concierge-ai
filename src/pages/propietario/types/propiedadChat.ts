export type MensajeChat = {
  id: string
  remitente: 'propietario' | 'ia'
  texto: string
}

export type N8nFlujo1Payload = {
  propiedad_id: string
  mensaje: string
}

export type N8nFlujo2Payload = {
  propiedad_id: string
}
