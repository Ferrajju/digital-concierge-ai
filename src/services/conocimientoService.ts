import type { TarjetaGuiaLocal } from '../pages/propietario/types/guiaLocal'
import type { BloqueConocimiento } from '../pages/propietario/types/gestionConocimiento'
import { inyectarConocimientoFlujo3 } from './n8nService'
import { supabase } from './supabaseClient'
import { obtenerPropietarioId } from './propiedadService'
import { formatConocimientoUnificado } from '../utils/formatConocimientoUnificado'
import { formatGuiaLocalMarkdown } from '../utils/formatGuiaLocalMarkdown'

const ES_CHUNK_GUIA = /## Guia de recomendacion/i

type ChunkRow = {
  id: number
  content: string
  metadata: Record<string, unknown> | null
}

function parseTituloYContenido(content: string): { titulo: string; contenido: string } {
  const lineas = content.split('\n')
  const primera = lineas[0]?.trim() ?? ''

  if (primera.startsWith('## ')) {
    const titulo = primera.replace(/^##\s+/, '').trim()
    const cuerpo = lineas.slice(1).join('\n').trim()
    return { titulo, contenido: cuerpo }
  }

  if (primera.startsWith('# ')) {
    const titulo = primera.replace(/^#\s+/, '').trim()
    const cuerpo = lineas.slice(1).join('\n').trim()
    return { titulo, contenido: cuerpo }
  }

  return { titulo: 'Bloque de conocimiento', contenido: content.trim() }
}

export function bloqueToMarkdown(bloque: Pick<BloqueConocimiento, 'titulo' | 'contenido'>): string {
  const titulo = bloque.titulo.trim() || 'Bloque sin título'
  const contenido = bloque.contenido.trim()
  return contenido ? `## ${titulo}\n${contenido}` : `## ${titulo}`
}

export function parseGuiaChunk(content: string, id: number | string): TarjetaGuiaLocal | null {
  const header = content.match(/^## Guia de recomendacion - (.+?) - (.+)$/m)
  if (!header) return null

  const categoria = header[1].trim()
  const nombre = header[2].trim()
  const distancia =
    content.match(/-\s*\*\*Distancia:\*\*\s*(.+)/i)?.[1]?.trim() ?? ''
  const informacion =
    content.match(/-\s*\*\*Informaci[oó]n:\*\*\s*(.+)/i)?.[1]?.trim() ?? ''

  if (
    categoria !== 'Supermercados' &&
    categoria !== 'Farmacias' &&
    categoria !== 'Restaurantes'
  ) {
    return null
  }

  return {
    id: String(id),
    categoria: categoria,
    nombre,
    distancia,
    informacion,
    activa: true,
  }
}

function parseTarjetasJson(raw: unknown): TarjetaGuiaLocal[] {
  if (!Array.isArray(raw)) return []

  return raw
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const tarjeta = item as Record<string, unknown>
      const categoria = tarjeta.categoria
      if (
        categoria !== 'Supermercados' &&
        categoria !== 'Farmacias' &&
        categoria !== 'Restaurantes'
      ) {
        return null
      }
      const nombre = typeof tarjeta.nombre === 'string' ? tarjeta.nombre : ''
      const distancia = typeof tarjeta.distancia === 'string' ? tarjeta.distancia : ''
      const informacion =
        typeof tarjeta.informacion === 'string' ? tarjeta.informacion : ''
      const id =
        typeof tarjeta.id === 'string' && tarjeta.id.trim()
          ? tarjeta.id
          : crypto.randomUUID()

      return {
        id,
        categoria,
        nombre,
        distancia,
        informacion,
        activa: tarjeta.activa !== false,
      } satisfies TarjetaGuiaLocal
    })
    .filter((tarjeta): tarjeta is TarjetaGuiaLocal => tarjeta !== null)
}

async function listarChunksPropiedad(propiedadId: string): Promise<ChunkRow[]> {
  await obtenerPropietarioId()

  const { data, error } = await supabase
    .from('documentos_vectores')
    .select('id, content, metadata')
    .eq('metadata->>propiedad_id', propiedadId)
    .order('id')

  if (error) throw error
  return (data ?? []) as ChunkRow[]
}

export async function listarBloquesConocimiento(
  propiedadId: string,
): Promise<BloqueConocimiento[]> {
  const chunks = await listarChunksPropiedad(propiedadId)

  return chunks
    .filter((chunk) => !ES_CHUNK_GUIA.test(chunk.content))
    .map((chunk) => {
      const { titulo, contenido } = parseTituloYContenido(chunk.content)
      const chunkIndex =
        typeof chunk.metadata?.chunk_index === 'number'
          ? chunk.metadata.chunk_index
          : 0

      return {
        id: chunk.id,
        titulo,
        contenido,
        chunkIndex,
        esNuevo: false,
      }
    })
    .sort((a, b) => a.chunkIndex - b.chunkIndex)
}

export async function listarTarjetasGuiaPropiedad(
  propiedadId: string,
): Promise<TarjetaGuiaLocal[]> {
  await obtenerPropietarioId()

  const { data, error } = await supabase
    .from('propiedades')
    .select('guia_local_tarjetas')
    .eq('id', propiedadId)
    .maybeSingle()

  if (error) throw error

  const guardadas = parseTarjetasJson(data?.guia_local_tarjetas)
  if (guardadas.length > 0) return guardadas

  const chunks = await listarChunksPropiedad(propiedadId)
  const desdeChunks = chunks
    .filter((chunk) => ES_CHUNK_GUIA.test(chunk.content))
    .map((chunk) => parseGuiaChunk(chunk.content, chunk.id))
    .filter((tarjeta): tarjeta is TarjetaGuiaLocal => tarjeta !== null)

  if (desdeChunks.length > 0) {
    await guardarTarjetasGuiaPropiedad(propiedadId, desdeChunks)
  }

  return desdeChunks
}

export async function guardarTarjetasGuiaPropiedad(
  propiedadId: string,
  tarjetas: TarjetaGuiaLocal[],
): Promise<void> {
  await obtenerPropietarioId()

  const { error } = await supabase
    .from('propiedades')
    .update({ guia_local_tarjetas: tarjetas })
    .eq('id', propiedadId)

  if (error) throw error
}

function bloquesToManualMarkdown(bloques: BloqueConocimiento[]): string {
  return bloques
    .map((bloque) => bloqueToMarkdown(bloque))
    .filter(Boolean)
    .join('\n\n')
}

export async function reindexarConocimientoPropiedad(
  propiedadId: string,
  bloques: BloqueConocimiento[],
  tarjetas: TarjetaGuiaLocal[],
  signal?: AbortSignal,
): Promise<void> {
  await obtenerPropietarioId()

  const manualMarkdown = bloquesToManualMarkdown(bloques)
  const tarjetasActivas = tarjetas.filter((tarjeta) => tarjeta.activa)
  const guiaMarkdown = formatGuiaLocalMarkdown(tarjetasActivas)
  const borradorUnificado = formatConocimientoUnificado(
    manualMarkdown,
    guiaMarkdown,
  )

  if (!borradorUnificado.trim()) {
    throw new Error('No hay contenido para indexar.')
  }

  const { error: borradorError } = await supabase
    .from('propiedades')
    .update({
      borrador_texto: manualMarkdown,
      guia_local_tarjetas: tarjetas,
    })
    .eq('id', propiedadId)

  if (borradorError) throw borradorError

  await inyectarConocimientoFlujo3(
    {
      propiedad_id: propiedadId,
      borrador: borradorUnificado,
    },
    signal,
  )
}

export async function guardarSoloGuiaLocal(
  propiedadId: string,
  tarjetas: TarjetaGuiaLocal[],
  signal?: AbortSignal,
): Promise<void> {
  const bloques = await listarBloquesConocimiento(propiedadId)
  await reindexarConocimientoPropiedad(propiedadId, bloques, tarjetas, signal)
}

export async function guardarSoloBaseConocimiento(
  propiedadId: string,
  bloques: BloqueConocimiento[],
  signal?: AbortSignal,
): Promise<void> {
  const tarjetas = await listarTarjetasGuiaPropiedad(propiedadId)
  await reindexarConocimientoPropiedad(propiedadId, bloques, tarjetas, signal)
}

export function crearBloqueVacio(): BloqueConocimiento {
  return {
    id: null,
    titulo: '',
    contenido: '',
    chunkIndex: 0,
    esNuevo: true,
  }
}
