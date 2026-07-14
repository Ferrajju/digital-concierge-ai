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
  historial: { rol: 'user' | 'assistant'; contenido: string }[]
}

export type N8nFlujo4Response = {
  respuesta: string
  alerta?: {
    detectada: boolean
    tipo?: 'emergencias' | 'checkin_anticipado' | 'averias'
    resumen?: string
  }
}
