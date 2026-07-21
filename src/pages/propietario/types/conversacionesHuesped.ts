import type {
  MensajeHuespedChat,
  RolMensajeHuesped,
} from '../../huesped/types/guestChat'

export type ConversacionHuespedResumen = {
  id: string
  sessionId: string
  nombreHuesped?: string
  idioma?: string
  modoAsistenciaPropietario: boolean
  createdAt: string
  updatedAt: string
  totalMensajes: number
  mensajesUsuario: number
  ultimoMensaje: string
  ultimoMensajeRol: RolMensajeHuesped
  mensajes: MensajeHuespedChat[]
}
