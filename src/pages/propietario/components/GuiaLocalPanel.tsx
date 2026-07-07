import { useCallback, useEffect, useRef, useState } from 'react'
import { inyectarConocimientoFlujo3 } from '../../../services/n8nService'
import { generarTarjetasGuiaLocal } from '../../../services/guiaLocalService'
import { obtenerBorradorPropiedad } from '../../../services/propiedadService'
import { useGoogleMaps } from '../../../providers/GoogleMapsProvider'
import { formatConocimientoUnificado } from '../../../utils/formatConocimientoUnificado'
import { formatGuiaLocalMarkdown } from '../../../utils/formatGuiaLocalMarkdown'
import {
  CATEGORIAS_GUIA,
  crearTarjetaVacia,
  type CategoriaGuiaLocal,
  type TarjetaGuiaLocal,
} from '../types/guiaLocal'

const inputClassName =
  'w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-white placeholder:text-slate-600 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-50'

type GuiaLocalPanelProps = {
  propiedadId: string
  nombreVivienda: string
  direccionCompleta: string
  onCompleta: () => void
}

export default function GuiaLocalPanel({
  propiedadId,
  nombreVivienda,
  direccionCompleta,
  onCompleta,
}: GuiaLocalPanelProps) {
  const { isLoaded, loadError, apiKeyConfigured } = useGoogleMaps()

  const [tarjetas, setTarjetas] = useState<TarjetaGuiaLocal[]>([])
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const abortRef = useRef<AbortController | null>(null)

  const actualizarTarjeta = (id: string, updates: Partial<TarjetaGuiaLocal>) => {
    setTarjetas((prev) =>
      prev.map((tarjeta) =>
        tarjeta.id === id ? { ...tarjeta, ...updates } : tarjeta,
      ),
    )
  }

  const eliminarTarjeta = (id: string) => {
    setTarjetas((prev) => prev.filter((tarjeta) => tarjeta.id !== id))
  }

  const anadirTarjeta = (categoria: CategoriaGuiaLocal) => {
    setTarjetas((prev) => [...prev, crearTarjetaVacia(categoria)])
  }

  const cargarTarjetas = useCallback(async () => {
    if (!isLoaded) return

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setCargando(true)
    setError('')

    try {
      const generadas = await generarTarjetasGuiaLocal(
        direccionCompleta,
        controller.signal,
      )
      setTarjetas(generadas)
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudieron generar las recomendaciones.',
      )
    } finally {
      setCargando(false)
    }
  }, [direccionCompleta, isLoaded])

  useEffect(() => {
    if (!apiKeyConfigured) {
      setCargando(false)
      setError(
        'Google Maps no está configurado. Añade recomendaciones manualmente o configura VITE_GOOGLE_MAPS_API_KEY.',
      )
      return
    }

    if (loadError) {
      setCargando(false)
      setError('No se pudo cargar Google Maps. Añade recomendaciones manualmente.')
      return
    }

    if (!isLoaded) return

    cargarTarjetas()

    return () => {
      abortRef.current?.abort()
    }
  }, [cargarTarjetas, isLoaded, loadError, apiKeyConfigured])

  const handleFinalizarYActivar = async () => {
    setGuardando(true)
    setError('')

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const manual = await obtenerBorradorPropiedad(propiedadId)
      if (!manual.trim()) {
        setError(
          'No se encontró el manual del alojamiento. Vuelve al paso anterior y guárdalo.',
        )
        return
      }

      const tarjetasActivas = tarjetas.filter((tarjeta) => tarjeta.activa)
      const guiaMarkdown = formatGuiaLocalMarkdown(tarjetasActivas)
      const borradorUnificado = formatConocimientoUnificado(manual, guiaMarkdown)

      if (!borradorUnificado.trim()) {
        setError('No hay contenido para indexar.')
        return
      }

      await inyectarConocimientoFlujo3(
        {
          propiedad_id: propiedadId,
          borrador: borradorUnificado,
        },
        controller.signal,
      )
      onCompleta()
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return

      const mensaje =
        err instanceof TypeError && err.message === 'Failed to fetch'
          ? 'No se pudo conectar con n8n (Flujo 3). Comprueba que el webhook processinfo acepte POST.'
          : err instanceof Error
            ? err.message
            : 'No se pudo indexar el conocimiento unificado.'

      setError(mensaje)
    } finally {
      setGuardando(false)
    }
  }

  const mapsPendiente =
    apiKeyConfigured && !isLoaded && !loadError
  const mostrarCarga =
    (cargando && apiKeyConfigured && isLoaded) || mapsPendiente

  const tarjetasPorCategoria = CATEGORIAS_GUIA.map((categoria) => ({
    ...categoria,
    tarjetas: tarjetas.filter((tarjeta) => tarjeta.categoria === categoria.id),
  }))

  return (
    <div className="animate-fade-in-up">
      <div className="mb-8 text-center sm:mb-10">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-400">
          Paso 6 de 7
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Guía Local de {nombreVivienda}
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">
          Hemos buscado supermercados, farmacias y restaurantes cerca de tu
          alojamiento. Revisa, edita o añade recomendaciones. Al finalizar,
          indexaremos el manual y la guía juntos en una sola operación.
        </p>
        <p className="mx-auto mt-2 max-w-xl text-xs text-slate-500">
          📍 {direccionCompleta}
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </div>
      )}

      {mostrarCarga ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-10 text-center backdrop-blur-sm">
          <div className="mx-auto mb-5 h-14 w-14 animate-spin rounded-full border-[3px] border-indigo-500/20 border-t-indigo-400" />
          <p className="text-lg font-semibold text-white">
            Buscando lugares cercanos...
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Google Maps + GPT-4o están generando tus tarjetas de recomendación.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {tarjetasPorCategoria.map(({ id, label, icono, tarjetas: grupo }) => (
            <section key={id} className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-300">
                  <span aria-hidden>{icono}</span>
                  {label}
                </h2>
                <button
                  type="button"
                  onClick={() => anadirTarjeta(id)}
                  disabled={guardando}
                  className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-400 transition-colors hover:border-indigo-500/40 hover:text-indigo-300 disabled:opacity-40"
                >
                  + Añadir
                </button>
              </div>

              {grupo.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950/40 px-4 py-6 text-center text-sm text-slate-500">
                  No hay lugares en esta categoría. Pulsa &quot;Añadir&quot; para
                  crear uno manualmente.
                </div>
              ) : (
                <div className="space-y-4">
                  {grupo.map((tarjeta) => (
                    <article
                      key={tarjeta.id}
                      className={`rounded-2xl border p-5 transition-colors sm:p-6 ${
                        tarjeta.activa
                          ? 'border-slate-800 bg-slate-900/60'
                          : 'border-slate-800/60 bg-slate-950/40 opacity-60'
                      }`}
                    >
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
                          <input
                            type="checkbox"
                            checked={tarjeta.activa}
                            onChange={(e) =>
                              actualizarTarjeta(tarjeta.id, {
                                activa: e.target.checked,
                              })
                            }
                            disabled={guardando}
                            className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-indigo-500 focus:ring-indigo-500"
                          />
                          Incluir en la guía
                        </label>
                        <button
                          type="button"
                          onClick={() => eliminarTarjeta(tarjeta.id)}
                          disabled={guardando}
                          className="text-xs text-slate-500 transition-colors hover:text-rose-400 disabled:opacity-40"
                        >
                          Eliminar
                        </button>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-medium uppercase tracking-wider text-slate-500">
                            Nombre del lugar
                          </label>
                          <input
                            type="text"
                            value={tarjeta.nombre}
                            onChange={(e) =>
                              actualizarTarjeta(tarjeta.id, {
                                nombre: e.target.value,
                              })
                            }
                            disabled={guardando}
                            className={`mt-2 ${inputClassName}`}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium uppercase tracking-wider text-slate-500">
                            Distancia
                          </label>
                          <input
                            type="text"
                            value={tarjeta.distancia}
                            onChange={(e) =>
                              actualizarTarjeta(tarjeta.id, {
                                distancia: e.target.value,
                              })
                            }
                            placeholder="Ej: A 5 min andando"
                            disabled={guardando}
                            className={`mt-2 ${inputClassName}`}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium uppercase tracking-wider text-slate-500">
                            Categoría
                          </label>
                          <select
                            value={tarjeta.categoria}
                            onChange={(e) =>
                              actualizarTarjeta(tarjeta.id, {
                                categoria: e.target.value as CategoriaGuiaLocal,
                              })
                            }
                            disabled={guardando}
                            className={`mt-2 ${inputClassName}`}
                          >
                            {CATEGORIAS_GUIA.map((categoria) => (
                              <option key={categoria.id} value={categoria.id}>
                                {categoria.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-medium uppercase tracking-wider text-slate-500">
                            Información útil
                          </label>
                          <textarea
                            value={tarjeta.informacion}
                            onChange={(e) =>
                              actualizarTarjeta(tarjeta.id, {
                                informacion: e.target.value,
                              })
                            }
                            rows={3}
                            disabled={guardando}
                            className={`mt-2 resize-none ${inputClassName}`}
                          />
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          ))}

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={cargarTarjetas}
              disabled={guardando || cargando}
              className="rounded-xl border border-slate-700 px-5 py-3 text-sm text-slate-400 transition-colors hover:border-slate-600 disabled:opacity-40"
            >
              ↻ Regenerar con Google Maps
            </button>
            <button
              type="button"
              onClick={handleFinalizarYActivar}
              disabled={guardando}
              className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:from-indigo-400 hover:to-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {guardando
                ? 'Indexando conocimiento...'
                : 'Finalizar y Activar Conserje'}
            </button>
          </div>
        </div>
      )}

      {guardando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md">
          <div className="mx-6 w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900/90 p-8 text-center shadow-2xl">
            <div className="mx-auto mb-6 h-14 w-14 animate-spin rounded-full border-[3px] border-indigo-500/20 border-t-indigo-400" />
            <p className="text-lg font-semibold leading-relaxed text-white">
              Indexando Manual + Guía Local...
            </p>
            <p className="mt-2 text-sm text-slate-400">
              n8n borrará los vectores antiguos e indexará el bloque unificado.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
