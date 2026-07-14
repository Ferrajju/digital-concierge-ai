export type BloqueConocimiento = {
  id: number | null
  titulo: string
  contenido: string
  chunkIndex: number
  esNuevo: boolean
}

export type VistaGestion = 'hub' | 'conocimiento' | 'guia' | 'config' | 'alertas'
