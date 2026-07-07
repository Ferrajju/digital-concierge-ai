export type CategoriaGuiaLocal = 'Supermercados' | 'Farmacias' | 'Restaurantes'

export type TarjetaGuiaLocal = {
  id: string
  categoria: CategoriaGuiaLocal
  nombre: string
  distancia: string
  informacion: string
  activa: boolean
}

export type LugarGoogleRaw = {
  categoria: CategoriaGuiaLocal
  nombre: string
  direccion: string
  distancia_metros: number
  rating?: number
}

export const CATEGORIAS_GUIA: {
  id: CategoriaGuiaLocal
  label: string
  icono: string
  googleType: string
  consultaTexto: string
}[] = [
  {
    id: 'Supermercados',
    label: 'Supermercados',
    icono: '🛒',
    googleType: 'supermarket',
    consultaTexto: 'supermercado',
  },
  {
    id: 'Farmacias',
    label: 'Farmacias',
    icono: '💊',
    googleType: 'pharmacy',
    consultaTexto: 'farmacia',
  },
  {
    id: 'Restaurantes',
    label: 'Restaurantes',
    icono: '🍽️',
    googleType: 'restaurant',
    consultaTexto: 'restaurante',
  },
]

export function crearTarjetaVacia(
  categoria: CategoriaGuiaLocal,
): TarjetaGuiaLocal {
  return {
    id: crypto.randomUUID(),
    categoria,
    nombre: '',
    distancia: '',
    informacion: '',
    activa: true,
  }
}
