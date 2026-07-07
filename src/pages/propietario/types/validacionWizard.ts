export type CanalAlerta = 'telegram' | 'email' | 'ambos'

export type ConfigAlertas = {
  activas: boolean
  canal: CanalAlerta
  contacto: string
}

export type ConfigRecomendaciones = {
  activo: boolean
  restaurantes: string
  transporte: string
  lugaresInteres: string
}

export type WizardValidacionState = {
  borradorEditado: string
  alertas: ConfigAlertas
  recomendaciones: ConfigRecomendaciones
}

export const WIZARD_INICIAL: WizardValidacionState = {
  borradorEditado: '',
  alertas: {
    activas: true,
    canal: 'telegram',
    contacto: '',
  },
  recomendaciones: {
    activo: false,
    restaurantes: '',
    transporte: '',
    lugaresInteres: '',
  },
}
