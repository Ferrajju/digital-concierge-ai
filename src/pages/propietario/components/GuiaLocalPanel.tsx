import { useCallback, useEffect, useRef, useState } from 'react'
import Button from '../../../components/ui/Button'
import FormSection, { FieldGroup } from '../../../components/ui/FormSection'
import HostFeedback from '../../../components/ui/HostFeedback'
import { HostOverlayLoading } from '../../../components/ui/HostModal'
import { HostLoading } from '../../../components/ui/HostShell'
import { inputClassName } from '../../../components/ui/inputClassName'
import WizardStepShell, { WizardActions } from '../../../components/ui/WizardStepShell'
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
    <>
      <WizardStepShell
        paso={6}
        title={`Guía Local de ${nombreVivienda}`}
        description="Hemos buscado supermercados, farmacias y restaurantes cerca de tu alojamiento. Revisa, edita o añade recomendaciones. Al finalizar, indexaremos el manual y la guía juntos."
      >
        <p className="-mt-4 mb-6 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-medium text-stone-600">
          📍 {direccionCompleta}
        </p>

        {error && <HostFeedback className="mb-6">{error}</HostFeedback>}

        {mostrarCarga ? (
          <HostLoading label="Buscando lugares cercanos con Google Maps..." />
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
                    No hay lugares en esta categoría. Pulsa &quot;Añadir&quot; para
                    crear uno manualmente.
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

            <WizardActions>
              <Button
                type="button"
                variant="secondary"
                onClick={cargarTarjetas}
                disabled={guardando || cargando}
              >
                ↻ Regenerar con Google Maps
              </Button>
              <Button
                type="button"
                onClick={handleFinalizarYActivar}
                loading={guardando}
                disabled={guardando}
                size="lg"
              >
                Finalizar y activar conserje
              </Button>
            </WizardActions>
          </div>
        )}
      </WizardStepShell>

      {guardando && (
        <HostOverlayLoading
          title="Indexando Manual + Guía Local..."
          description="n8n borrará los vectores antiguos e indexará el bloque unificado."
        />
      )}
    </>
  )
}
