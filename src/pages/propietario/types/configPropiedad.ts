export const PERSONALIDADES_AGENTE = [
  {
    id: 'premium',
    titulo: 'Conserje premium',
    subtitulo: 'Gama alta y profesional',
    descripcion:
      'Elegante, preciso y transmite confianza. Ideal para apartamentos urbanos o de lujo.',
    perfilPropietario: 'Propietarios de apartamentos premium',
    icono: '🎩',
    iaElegancia: 'formal',
    iaExpresividad: 2,
  },
  {
    id: 'acogedor',
    titulo: 'Anfitrión acogedor',
    subtitulo: 'Cálido y cercano',
    descripcion:
      'Amable y con detalle humano. Perfecto para alojamientos familiares o rurales.',
    perfilPropietario: 'Anfitriones que buscan trato personal',
    icono: '🏡',
    iaElegancia: 'cercano',
    iaExpresividad: 4,
  },
  {
    id: 'eficiente',
    titulo: 'Guía eficiente',
    subtitulo: 'Directo y sin rodeos',
    descripcion:
      'Respuestas concisas y rápidas. Ideal si gestionas varios pisos o priorizas agilidad.',
    perfilPropietario: 'Inversores y gestores con varios alojamientos',
    icono: '⚡',
    iaElegancia: 'discreto',
    iaExpresividad: 2,
  },
] as const

export type PersonalidadAgenteId =
  (typeof PERSONALIDADES_AGENTE)[number]['id']

export type EstiloAgente =
  (typeof PERSONALIDADES_AGENTE)[number]['iaElegancia']

const MAPA_ELEGANCIA_A_PERSONALIDAD: Record<string, PersonalidadAgenteId> = {
  formal: 'premium',
  cercano: 'acogedor',
  relajado: 'acogedor',
  entusiasta: 'acogedor',
  discreto: 'eficiente',
}

export function obtenerPersonalidadAgente(id: PersonalidadAgenteId) {
  const personalidad = PERSONALIDADES_AGENTE.find((item) => item.id === id)
  if (!personalidad) {
    return PERSONALIDADES_AGENTE[1]
  }
  return personalidad
}

export function resolverPersonalidadAgente(
  iaElegancia: string,
  iaExpresividad: number,
): PersonalidadAgenteId {
  const exacta = PERSONALIDADES_AGENTE.find(
    (personalidad) =>
      personalidad.iaElegancia === iaElegancia &&
      personalidad.iaExpresividad === iaExpresividad,
  )
  if (exacta) return exacta.id

  return MAPA_ELEGANCIA_A_PERSONALIDAD[iaElegancia.trim()] ?? 'acogedor'
}

export function normalizarPersonalidadAgente(
  iaElegancia: string,
  iaExpresividad: number,
): { iaElegancia: EstiloAgente; iaExpresividad: number } {
  const personalidad = obtenerPersonalidadAgente(
    resolverPersonalidadAgente(iaElegancia, iaExpresividad),
  )

  return {
    iaElegancia: personalidad.iaElegancia,
    iaExpresividad: personalidad.iaExpresividad,
  }
}

export type ConfigPropiedadForm = {
  nombreApartamento: string
  nombreIa: string
  iaElegancia: EstiloAgente
  iaExpresividad: number
  busquedaRapida: string
  direccionCalle: string
  pisoPuerta: string
  codigoPostal: string
  ciudadRegion: string
  indicacionesAcceso: string
}

export type ConfigPropiedadGuardada = ConfigPropiedadForm & {
  zonaId: string
}
