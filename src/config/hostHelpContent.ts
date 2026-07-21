export type HostScreenId =
  | 'dashboard'
  | 'wizard-nombre'
  | 'wizard-ubicacion'
  | 'wizard-agente'
  | 'wizard-chat'
  | 'wizard-validacion'
  | 'wizard-guia-local'
  | 'wizard-alertas'
  | 'gestionar-hub'
  | 'gestionar-conocimiento'
  | 'gestionar-guia'
  | 'gestionar-alertas'
  | 'gestionar-config'
  | 'chats-lista'
  | 'chats-detalle'

export type HostHelpContent = {
  title: string
  intro: string
  bullets: string[]
}

export const HOST_HELP_CONTENT: Record<HostScreenId, HostHelpContent> = {
  dashboard: {
    title: 'Panel principal',
    intro: 'Desde aquí gestionas todos tus alojamientos.',
    bullets: [
      'Conecta Telegram para recibir alertas críticas en tu móvil.',
      'Añade una nueva propiedad con el asistente de configuración.',
      'Entra en cada tarjeta para editar conocimiento, guía local o chats.',
      'Descarga el QR o enlace del huésped desde cada propiedad.',
    ],
  },
  'wizard-nombre': {
    title: 'Paso 1 — Nombre',
    intro: 'Identifica el alojamiento con un nombre claro para ti y tus huéspedes.',
    bullets: [
      'Usa un nombre reconocible (ej. “Ático Mar” o “Piso Centro”).',
      'Este nombre aparece en el panel y en la cabecera del chat del huésped.',
    ],
  },
  'wizard-ubicacion': {
    title: 'Paso 2 — Ubicación',
    intro: 'Define dónde está el alojamiento para la guía local y el contexto del agente.',
    bullets: [
      'Busca la dirección con el buscador de Google Maps.',
      'Completa piso, código postal e indicaciones de acceso si aplica.',
      'No repitas la entrevista de acceso: aquí va la ubicación física.',
    ],
  },
  'wizard-agente': {
    title: 'Paso 3 — Agente',
    intro: 'Personaliza cómo se presenta tu conserje digital.',
    bullets: [
      'Elige un nombre para el agente (ej. Lucas, Ana).',
      'Define el tono: formal, cercano o discreto.',
    ],
  },
  'wizard-chat': {
    title: 'Paso 4 — Entrevista',
    intro: 'Responde las preguntas del agente para crear el manual del alojamiento.',
    bullets: [
      'Responde con detalle: Wi-Fi, llaves, normas, electrodomésticos…',
      'Una respuesta por mensaje ayuda a no olvidar nada.',
      'La entrevista termina cuando el agente confirma que tiene toda la info.',
    ],
  },
  'wizard-validacion': {
    title: 'Paso 5 — Borrador',
    intro: 'Revisa y edita el manual generado antes de indexarlo.',
    bullets: [
      'Lee el borrador estructurado y corrige lo que haga falta.',
      'Al guardar, se procesa e indexa para el chat del huésped.',
    ],
  },
  'wizard-guia-local': {
    title: 'Paso 6 — Guía local',
    intro: 'Añade recomendaciones cercanas para tus huéspedes.',
    bullets: [
      'Genera sugerencias automáticas o añade lugares manualmente.',
      'Edita distancias y descripciones antes de activar el conserje.',
    ],
  },
  'wizard-alertas': {
    title: 'Paso 7 — Alertas',
    intro: 'Elige qué incidencias quieres recibir en Telegram.',
    bullets: [
      'Usa el Telegram que configuraste en el panel (onboarding o dashboard).',
      'Activa emergencias, check-in anticipado o averías según prefieras.',
      'Al finalizar, la propiedad queda lista en tu panel.',
    ],
  },
  'gestionar-hub': {
    title: 'Hub del alojamiento',
    intro: 'Centro de gestión de una propiedad concreta.',
    bullets: [
      'Base de conocimiento: bloques del manual indexados.',
      'Guía local: restaurantes, farmacias, transporte…',
      'Alertas Telegram: incidencias críticas de esta propiedad.',
      'Agente y alojamiento: nombre, personalidad y datos generales.',
    ],
  },
  'gestionar-conocimiento': {
    title: 'Base de conocimiento',
    intro: 'Edita los bloques que usa el agente para responder al huésped.',
    bullets: [
      'Cada bloque cubre un tema (Wi-Fi, acceso, normas…).',
      'Al guardar se regeneran los embeddings para búsqueda semántica.',
      'Mantén textos claros y operativos, como hablarías con un huésped.',
    ],
  },
  'gestionar-guia': {
    title: 'Guía local',
    intro: 'Gestiona recomendaciones de la zona.',
    bullets: [
      'Añade, edita o elimina tarjetas por categoría.',
      'Indica distancias a pie o en transporte cuando puedas.',
      'Los cambios se indexan para el chat del huésped.',
    ],
  },
  'gestionar-alertas': {
    title: 'Alertas Telegram',
    intro: 'Configura avisos de esta propiedad.',
    bullets: [
      'Puedes usar tu Chat ID global o uno distinto para este alojamiento.',
      'Marca qué tipos de incidencia quieres recibir.',
      'Desactiva alertas si no quieres notificaciones temporales.',
    ],
  },
  'gestionar-config': {
    title: 'Agente y alojamiento',
    intro: 'Ajusta datos generales y personalidad del conserje.',
    bullets: [
      'Cambia nombre del agente, tono y expresividad.',
      'Actualiza dirección o indicaciones si cambian.',
      'Si mueves la ubicación, revisa también la guía local.',
    ],
  },
  'chats-lista': {
    title: 'Chats de huéspedes',
    intro: 'Historial de conversaciones de esta propiedad.',
    bullets: [
      'Cada sesión agrupa los mensajes de un huésped.',
      'Abre una conversación para leer el detalle completo.',
      'Útil para detectar incidencias recurrentes o dudas frecuentes.',
    ],
  },
  'chats-detalle': {
    title: 'Detalle de conversación',
    intro: 'Mensajes intercambiados en una sesión concreta.',
    bullets: [
      'Revisa qué preguntó el huésped y cómo respondió el agente.',
      'Vuelve a la lista con el botón atrás.',
    ],
  },
}

export const HOST_HELP_FALLBACK: HostHelpContent = {
  title: 'Ayuda',
  intro: 'Estás en el panel de propietario de Umbral.',
  bullets: [
    'Usa el menú o los botones de la pantalla para navegar.',
    'Si algo no funciona, envíanos un comentario desde este mismo botón de ayuda.',
  ],
}

export function obtenerAyudaPantalla(screenId: HostScreenId): HostHelpContent {
  return HOST_HELP_CONTENT[screenId] ?? HOST_HELP_FALLBACK
}
