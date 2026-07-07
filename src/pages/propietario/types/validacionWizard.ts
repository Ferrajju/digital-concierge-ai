export type CanalAlerta = 'telegram' | 'email' | 'ambos'

export type TipoEventoAlerta = 'emergencias' | 'checkin_anticipado' | 'averias'

export type EventosAlerta = Record<TipoEventoAlerta, boolean>

export type ConfigAlertas = {
  activas: boolean
  canal: CanalAlerta
  contacto: string
  eventos: EventosAlerta
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

export const EVENTOS_ALERTA: {
  id: TipoEventoAlerta
  titulo: string
  descripcion: string
  icono: string
}[] = [
  {
    id: 'emergencias',
    titulo: 'Emergencias graves',
    descripcion: 'Fugas de agua, cortes de luz, llaves perdidas o situaciones urgentes.',
    icono: '🚨',
  },
  {
    id: 'checkin_anticipado',
    titulo: 'Check-in antes de tiempo',
    descripcion: 'Huéspedes que solicitan entrar antes de la hora acordada.',
    icono: '🕐',
  },
  {
    id: 'averias',
    titulo: 'Averías técnicas',
    descripcion: 'Problemas con Wi-Fi, electrodomésticos, calefacción o equipamiento.',
    icono: '🔧',
  },
]

export const WIZARD_INICIAL: WizardValidacionState = {
  borradorEditado: '',
  alertas: {
    activas: true,
    canal: 'telegram',
    contacto: '',
    eventos: {
      emergencias: true,
      checkin_anticipado: true,
      averias: true,
    },
  },
  recomendaciones: {
    activo: false,
    restaurantes: '',
    transporte: '',
    lugaresInteres: '',
  },
}
