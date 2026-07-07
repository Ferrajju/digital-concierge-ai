export type PropiedadResumen = {
  id: string
  nombreApartamento: string
  direccionCalle: string
  pisoPuerta: string
  codigoPostal: string
  iaIdentidad: string
  activa: boolean
  direccionCompleta: string
}

export type MensajeHuesped = {
  rol: 'user' | 'assistant'
  contenido: string
  timestamp: string
}
