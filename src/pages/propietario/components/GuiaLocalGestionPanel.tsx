import { useEffect, useRef, useState } from 'react'
import {
  guardarSoloGuiaLocal,
  listarTarjetasGuiaPropiedad,
} from '../../../services/conocimientoService'
import {
  CATEGORIAS_GUIA,
  crearTarjetaVacia,
  type CategoriaGuiaLocal,
  type TarjetaGuiaLocal,
} from '../types/guiaLocal'

const inputClassName =
  'w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-white placeholder:text-slate-600 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-50'

type GuiaLocalGestionPanelProps = {
  propiedadId: string
  onVolver: () => void
}

export default function GuiaLocalGestionPanel({
  propiedadId,
  onVolver,
}: GuiaLocalGestionPanelProps) {
  const [tarjetas, setTarjetas] = useState<TarjetaGuiaLocal[]>([])
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [mensajeOk, setMensajeOk] = useState('')
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    let activo = true

    const cargar = async () => {
      setCargando(true)
      setError('')
      try {
        const lista = await listarTarjetasGuiaPropiedad(propiedadId)
        if (!activo) return
        setTarjetas(lista)
      } catch (err) {
        if (!activo) return
        setError(
          err instanceof Error
            ? err.message
            : 'No se pudieron cargar las tarjetas de la guía local.',
        )
      } finally {
        if (activo) setCargando(false)
      }
    }

    cargar()
    return () => {
      activo = false
      abortRef.current?.abort()
    }
  }, [propiedadId])

  const actualizarTarjeta = (id: string, updates: Partial<TarjetaGuiaLocal>) => {
    setTarjetas((prev) =>
      prev.map((tarjeta) =>
        tarjeta.id === id ? { ...tarjeta, ...updates } : tarjeta,
      ),
    )
    setMensajeOk('')
  }

  const eliminarTarjeta = (id: string) => {
    setTarjetas((prev) => prev.filter((tarjeta) => tarjeta.id !== id))
    setMensajeOk('')
  }

  const anadirTarjeta = (categoria: CategoriaGuiaLocal) => {
    setTarjetas((prev) => [...prev, crearTarjetaVacia(categoria)])
    setMensajeOk('')
  }

  const handleGuardar = async () => {
    const invalidas = tarjetas.filter(
      (tarjeta) =>
        tarjeta.activa &&
        (!tarjeta.nombre.trim() ||
          !tarjeta.distancia.trim() ||
          !tarjeta.informacion.trim()),
    )
    if (invalidas.length > 0) {
      setError(
        'Las tarjetas activas necesitan nombre, distancia e información.',
      )
      return
    }

    setGuardando(true)
    setError('')
    setMensajeOk('')
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      await guardarSoloGuiaLocal(propiedadId, tarjetas, controller.signal)
      const actualizadas = await listarTarjetasGuiaPropiedad(propiedadId)
      setTarjetas(actualizadas)
      setMensajeOk('Guía local guardada y reindexada.')
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo guardar la guía local.',
      )
    } finally {
      setGuardando(false)
    }
  }

  const tarjetasPorCategoria = CATEGORIAS_GUIA.map((categoria) => ({
    ...categoria,
    tarjetas: tarjetas.filter((tarjeta) => tarjeta.categoria === categoria.id),
  }))

  return (
    <div>
      <div className="mb-6">
        <button
          type="button"
          onClick={onVolver}
          className="text-sm text-slate-500 transition-colors hover:text-indigo-300"
        >
          ← Volver a gestión
        </button>
        <h2 className="mt-2 text-xl font-semibold text-white">Guía local</h2>
        <p className="mt-1 text-sm text-slate-400">
          Edita, elimina o añade recomendaciones cercanas. Al guardar se
          actualizan los embeddings de la guía.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      {mensajeOk && (
        <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {mensajeOk}
        </div>
      )}

      {cargando ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-indigo-500/20 border-t-indigo-400" />
        </div>
      ) : (
        <div className="space-y-8">
          {tarjetasPorCategoria.map(({ id, label, icono, tarjetas: grupo }) => (
            <section key={id} className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-300">
                  <span aria-hidden>{icono}</span>
                  {label}
                </h3>
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
                  No hay recomendaciones en esta categoría.
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

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleGuardar}
              disabled={guardando}
              className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:from-indigo-400 hover:to-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {guardando ? 'Guardando e indexando...' : 'Guardar guía local'}
            </button>
          </div>
        </div>
      )}

      {guardando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md">
          <div className="mx-6 w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900/90 p-8 text-center shadow-2xl">
            <div className="mx-auto mb-6 h-14 w-14 animate-spin rounded-full border-[3px] border-indigo-500/20 border-t-indigo-400" />
            <p className="text-lg font-semibold text-white">
              Reindexando guía local...
            </p>
            <p className="mt-2 text-sm text-slate-400">
              n8n está actualizando los embeddings del apartamento.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
