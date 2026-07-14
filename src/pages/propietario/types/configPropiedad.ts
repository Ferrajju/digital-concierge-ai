export const ESTILOS_AGENTE = [
  { value: 'cercano', label: 'Cercano y amable' },
  { value: 'formal', label: 'Formal y profesional' },
  { value: 'relajado', label: 'Relajado y casual' },
  { value: 'entusiasta', label: 'Entusiasta y dinámico' },
  { value: 'discreto', label: 'Discreto y conciso' },
] as const

export type EstiloAgente = (typeof ESTILOS_AGENTE)[number]['value']

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
