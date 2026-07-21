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
    intro:
      'Aquí ves todos tus alojamientos y accedes a la configuración de cada uno.',
    bullets: [
      'Conecta tu Telegram arriba para recibir alertas de incidencias en el móvil.',
      'Pulsa «Añadir propiedad» para crear un alojamiento nuevo con el asistente paso a paso.',
      'En cada tarjeta puedes gestionar el manual, la guía local, los chats y el QR del huésped.',
      'Desde «Gestionar» entras al hub de una propiedad concreta.',
    ],
  },
  'wizard-nombre': {
    title: 'Paso 1 — Nombre del alojamiento',
    intro:
      'En este paso pones el nombre con el que identificarás el piso en Umbral y en el chat del huésped.',
    bullets: [
      'Elige algo claro y reconocible: «Ático Mar», «Piso Gran Vía», etc.',
      'No hace falta el nombre comercial de Airbnb; es para ti y para la cabecera del conserje.',
      'Al continuar, pasarás a indicar la ubicación en el mapa.',
    ],
  },
  'wizard-ubicacion': {
    title: 'Paso 2 — Ubicación',
    intro:
      'Aquí registras la dirección física del alojamiento. Se usa para la guía local y el contexto del agente.',
    bullets: [
      'Busca la calle con el buscador de Google Maps y selecciona el resultado correcto.',
      'Completa piso, puerta, código postal y ciudad si faltan datos.',
      'Las indicaciones de acceso (portal, timbre…) las darás en la entrevista del paso 4, no aquí.',
    ],
  },
  'wizard-agente': {
    title: 'Paso 3 — Personalidad del agente',
    intro:
      'Defines cómo se presenta y habla tu conserje digital con los huéspedes.',
    bullets: [
      'El nombre del agente aparece en el chat (ej. Lucas, Ana, Marco).',
      'El tono (formal, cercano o discreto) marca el estilo de las respuestas.',
      'Podrás ajustarlo más adelante desde «Agente y alojamiento» en el hub de la propiedad.',
    ],
  },
  'wizard-chat': {
    title: 'Paso 4 — Entrevista de configuración',
    intro:
      'El agente te hace preguntas para recoger la información operativa del piso: acceso, Wi-Fi, normas y electrodomésticos.',
    bullets: [
      'Responde con detalle concreto: contraseñas, códigos, horarios de silencio, etc.',
      'Responde una cosa por mensaje; el agente irá tema a tema hasta cubrirlo todo.',
      'La entrevista acaba cuando el agente confirma que ya tiene toda la información.',
      'No cierres antes de tiempo: cuanto más completo el manual, mejor responderá el conserje.',
    ],
  },
  'wizard-validacion': {
    title: 'Paso 5 — Revisión del borrador',
    intro:
      'Se muestra el manual estructurado a partir de la entrevista. Aquí lo revisas y corriges antes de publicarlo.',
    bullets: [
      'Lee cada sección y edita lo que no sea exacto o falte.',
      'Al guardar, el texto se procesa y se indexa para que el huésped pueda preguntar al agente.',
      'Este paso puede tardar unos segundos mientras se generan los embeddings.',
    ],
  },
  'wizard-guia-local': {
    title: 'Paso 6 — Guía local',
    intro:
      'Añades recomendaciones de la zona (comercios, transporte, ocio) que el conserje podrá sugerir a los huéspedes.',
    bullets: [
      'Puedes generar sugerencias automáticas según la ubicación o crear tarjetas a mano.',
      'Revisa nombre, distancia y descripción de cada recomendación.',
      'Al activar el conserje, estas tarjetas quedan indexadas junto al manual del alojamiento.',
    ],
  },
  'wizard-alertas': {
    title: 'Paso 7 — Alertas por Telegram',
    intro:
      'Eliges qué incidencias críticas quieres recibir en tu móvil cuando un huésped las reporte.',
    bullets: [
      'Se usa el Chat ID de Telegram que configuraste en el panel o en el onboarding.',
      'Marca los tipos de alerta: emergencias, check-in anticipado o averías técnicas.',
      'Puedes desactivar las alertas para este alojamiento si no las necesitas.',
      'Al pulsar «Finalizar configuración», la propiedad queda lista en tu panel.',
    ],
  },
  'gestionar-hub': {
    title: 'Hub del alojamiento',
    intro:
      'Centro de gestión de una propiedad. Desde aquí accedes a las cuatro áreas principales.',
    bullets: [
      'Base de conocimiento: el manual indexado (Wi-Fi, normas, acceso…).',
      'Guía local: recomendaciones de la zona para huéspedes.',
      'Alertas Telegram: qué incidencias te avisan para este piso.',
      'Agente y alojamiento: nombre del conserje, personalidad y datos generales.',
    ],
  },
  'gestionar-conocimiento': {
    title: 'Base de conocimiento',
    intro:
      'Editas los bloques de texto que el conserje usa para responder preguntas de los huéspedes.',
    bullets: [
      'Cada bloque cubre un tema: acceso, Wi-Fi, normas, electrodomésticos, etc.',
      'Al guardar cambios, se vuelven a indexar los textos para mejorar las respuestas.',
      'Escribe como le hablarías a un huésped: claro, directo y con datos concretos.',
      'Puedes añadir, editar o eliminar bloques según evolucione el alojamiento.',
    ],
  },
  'gestionar-guia': {
    title: 'Guía local',
    intro:
      'Gestionas las recomendaciones de la zona que el agente puede citar en el chat.',
    bullets: [
      'Organiza tarjetas por categoría: restauración, transporte, salud, ocio…',
      'Indica distancias aproximadas («5 min a pie», «2 paradas de metro»).',
      'Los cambios se guardan e indexan; el huésped los verá reflejados en las respuestas.',
    ],
  },
  'gestionar-alertas': {
    title: 'Alertas Telegram',
    intro:
      'Configuras las notificaciones de incidencias críticas para este alojamiento concreto.',
    bullets: [
      'Por defecto se usa tu Chat ID global; aquí puedes poner otro si gestionas el piso con otra persona.',
      'Activa o desactiva alertas para todo el alojamiento con el interruptor principal.',
      'Elige qué eventos avisan: emergencias, check-in anticipado o averías técnicas.',
      'Solo se envía Telegram si el huésped reporta algo que el agente clasifica como alerta.',
    ],
  },
  'gestionar-config': {
    title: 'Agente y alojamiento',
    intro:
      'Ajustas los datos generales del piso y la personalidad del conserje digital.',
    bullets: [
      'Cambia el nombre del agente, el tono y el nivel de expresividad.',
      'Actualiza dirección, piso o indicaciones si algo ha cambiado en el alojamiento.',
      'Si modificas la ubicación, conviene revisar también la guía local del hub.',
    ],
  },
  'chats-lista': {
    title: 'Chats de huéspedes',
    intro:
      'Listado de conversaciones que los huéspedes han tenido con el conserje de esta propiedad.',
    bullets: [
      'Cada fila es una sesión distinta (un huésped o una estancia).',
      'Pulsa una conversación para leer el hilo completo.',
      'Útil para ver dudas frecuentes, incidencias o la calidad de las respuestas del agente.',
    ],
  },
  'chats-detalle': {
    title: 'Detalle de conversación',
    intro:
      'Vista completa de los mensajes de una sesión entre un huésped y el conserje.',
    bullets: [
      'Los mensajes del huésped aparecen a la derecha; los del agente, a la izquierda.',
      'Revisa si el agente respondió bien o si falta información en el manual.',
      'Vuelve al listado con «Volver» o la flecha en móvil.',
    ],
  },
}

export const HOST_HELP_FALLBACK: HostHelpContent = {
  title: 'Panel de propietario',
  intro: 'Estás en el panel de Umbral para gestionar tus alojamientos turísticos.',
  bullets: [
    'Usa los botones y enlaces de la pantalla para navegar.',
    'Si algo no funciona o echas en falta algo, envíanos un comentario con el botón de ayuda.',
  ],
}

export function obtenerAyudaPantalla(screenId: HostScreenId): HostHelpContent {
  return HOST_HELP_CONTENT[screenId] ?? HOST_HELP_FALLBACK
}
