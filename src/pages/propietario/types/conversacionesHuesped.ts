import type { MensajeHuespedChat } from '../../huesped/types/guestChat'

export type ConversacionHuespedResumen = {
  id: string
  sessionId: string
  nombreHuesped?: string
  idioma?: string
  createdAt: string
  updatedAt: string
  totalMensajes: number
  mensajesUsuario: number
  ultimoMensaje: string
  ultimoMensajeRol: 'user' | 'assistant'
  mensajes: MensajeHuespedChat[]
}
