export type RolMensajeHuesped = 'user' | 'assistant' | 'propietario'

export type MensajeHuespedChat = {
  rol: RolMensajeHuesped
  contenido: string
  timestamp: string
}

export type ConversacionHuespedEstado = {
  mensajes: MensajeHuespedChat[]
  modoAsistenciaPropietario: boolean
}

export type PropiedadGuestInfo = {
  id: string
  nombreApartamento: string
  direccionCompleta: string
  iaIdentidad: string
}

export type PerfilHuesped = {
  nombreHuesped: string
  idioma: string
  perfilCompletado: boolean
}

export type N8nFlujo4Payload = {
  propiedad_id: string
  session_id: string
  mensaje: string
  historial: { rol: 'user' | 'assistant'; contenido: string }[]
  modo_prueba?: boolean
  /** Código BCP-47 / ISO, p. ej. "es", "en", "pt-BR" */
  idioma?: string
  /** Nombre legible del idioma para el prompt de la IA, p. ej. "Español" */
  idioma_nombre?: string
  /** Nombre o apodo del huésped */
  nombre_huesped?: string
  /** Nombre del agente configurado en la propiedad */
  ia_identidad?: string
}

export type N8nFlujo4Response = {
  respuesta: string
  alerta?: {
    detectada: boolean
    tipo?: 'emergencias' | 'checkin_anticipado' | 'averias'
    resumen?: string
  }
}
