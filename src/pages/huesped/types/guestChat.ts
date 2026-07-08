export type MensajeHuespedChat = {
  rol: 'user' | 'assistant'
  contenido: string
  timestamp: string
}

export type PropiedadGuestInfo = {
  id: string
  nombreApartamento: string
  direccionCompleta: string
  iaIdentidad: string
}

export type N8nFlujo4Payload = {
  propiedad_id: string
  session_id: string
  mensaje: string
}

export type N8nFlujo4Response = {
  respuesta: string
}
