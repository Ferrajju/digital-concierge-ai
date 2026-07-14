import { useEffect, useRef, useState } from 'react'
import Button from '../../../components/ui/Button'
import FormSection, { FieldGroup } from '../../../components/ui/FormSection'
import HostFeedback from '../../../components/ui/HostFeedback'
import { HostSubpageHeader } from '../../../components/ui/HostPageShell'
import { HostOverlayLoading } from '../../../components/ui/HostModal'
import { HostLoading } from '../../../components/ui/HostShell'
import {
  inputClassName,
} from '../../../components/ui/inputClassName'
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
      <HostSubpageHeader
        onBack={onVolver}
        backLabel="Volver al hub"
        title="Guía local"
        description="Edita, elimina o añade recomendaciones cercanas. Al guardar se actualizan los embeddings."
      />

      {error && <HostFeedback className="mb-4">{error}</HostFeedback>}
      {mensajeOk && (
        <HostFeedback variant="success" className="mb-4">
          {mensajeOk}
        </HostFeedback>
      )}

      {cargando ? (
        <HostLoading label="Cargando tarjetas..." />
      ) : (
        <div className="space-y-6">
          {tarjetasPorCategoria.map(({ id, label, icono, tarjetas: grupo }) => (
            <FormSection
              key={id}
              title={`${icono} ${label}`}
              action={
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => anadirTarjeta(id)}
                  disabled={guardando}
                >
                  + Añadir
                </Button>
              }
            >
              {grupo.length === 0 ? (
                <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50 px-4 py-6 text-center text-sm font-medium text-host-muted">
                  No hay recomendaciones en esta categoría.
                </div>
              ) : (
                <div className="space-y-4">
                  {grupo.map((tarjeta) => (
                    <div
                      key={tarjeta.id}
                      className={`rounded-xl border-2 p-4 sm:p-5 ${
                        tarjeta.activa
                          ? 'border-stone-200 bg-white'
                          : 'border-stone-200 bg-stone-50 opacity-70'
                      }`}
                    >
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-stone-700">
                          <input
                            type="checkbox"
                            checked={tarjeta.activa}
                            onChange={(e) =>
                              actualizarTarjeta(tarjeta.id, {
                                activa: e.target.checked,
                              })
                            }
                            disabled={guardando}
                            className="h-4 w-4 rounded border-stone-300 text-host-primary focus:ring-host-primary/30"
                          />
                          Incluir en la guía
                        </label>
                        <button
                          type="button"
                          onClick={() => eliminarTarjeta(tarjeta.id)}
                          disabled={guardando}
                          className="text-xs font-semibold text-host-muted transition-colors hover:text-rose-600 disabled:opacity-40"
                        >
                          Eliminar
                        </button>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <FieldGroup label="Nombre del lugar" className="sm:col-span-2">
                          <input
                            type="text"
                            value={tarjeta.nombre}
                            onChange={(e) =>
                              actualizarTarjeta(tarjeta.id, {
                                nombre: e.target.value,
                              })
                            }
                            disabled={guardando}
                            className={inputClassName}
                          />
                        </FieldGroup>
                        <FieldGroup label="Distancia">
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
                            className={inputClassName}
                          />
                        </FieldGroup>
                        <FieldGroup label="Categoría">
                          <select
                            value={tarjeta.categoria}
                            onChange={(e) =>
                              actualizarTarjeta(tarjeta.id, {
                                categoria: e.target.value as CategoriaGuiaLocal,
                              })
                            }
                            disabled={guardando}
                            className={inputClassName}
                          >
                            {CATEGORIAS_GUIA.map((categoria) => (
                              <option key={categoria.id} value={categoria.id}>
                                {categoria.label}
                              </option>
                            ))}
                          </select>
                        </FieldGroup>
                        <FieldGroup label="Información útil" className="sm:col-span-2">
                          <textarea
                            value={tarjeta.informacion}
                            onChange={(e) =>
                              actualizarTarjeta(tarjeta.id, {
                                informacion: e.target.value,
                              })
                            }
                            rows={3}
                            disabled={guardando}
                            className={`resize-none ${inputClassName}`}
                          />
                        </FieldGroup>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </FormSection>
          ))}

          <div className="flex justify-end pt-2">
            <Button
              type="button"
              onClick={handleGuardar}
              loading={guardando}
              disabled={guardando}
              size="lg"
            >
              Guardar guía local
            </Button>
          </div>
        </div>
      )}

      {guardando && (
        <HostOverlayLoading
          title="Reindexando guía local..."
          description="n8n está actualizando los embeddings del apartamento."
        />
      )}
    </div>
  )
}
