import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  inyectarConocimientoFlujo3,
  procesarBorradorFlujo2,
} from '../../../services/n8nService'
import {
  WIZARD_INICIAL,
  type WizardValidacionState,
} from '../types/validacionWizard'

type PasoWizard = 1 | 2 | 3 | 4

type ValidacionWizardProps = {
  propiedadId: string
  nombreVivienda: string
}

const PASOS = [
  { numero: 1, label: 'Procesado' },
  { numero: 2, label: 'Borrador' },
  { numero: 3, label: 'Alertas' },
  { numero: 4, label: 'Guía local' },
] as const

const ETAPAS_PROCESADO = [
  'Leyendo toda tu conversación...',
  'Extrayendo datos clave del alojamiento...',
  'Organizando bloques: Wi-Fi, acceso, normas...',
  'Generando tu borrador estructurado...',
] as const

const inputClassName =
  'w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3.5 text-sm text-white placeholder:text-slate-600 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-50'

export default function ValidacionWizard({
  propiedadId,
  nombreVivienda,
}: ValidacionWizardProps) {
  const navigate = useNavigate()
  const [paso, setPaso] = useState<PasoWizard>(1)
  const [wizard, setWizard] = useState<WizardValidacionState>(WIZARD_INICIAL)
  const [procesandoBatch, setProcesandoBatch] = useState(true)
  const [etapaProcesado, setEtapaProcesado] = useState(0)
  const [inyectando, setInyectando] = useState(false)
  const [error, setError] = useState('')
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    abortRef.current = controller

    const ejecutarBatch = async () => {
      try {
        const borrador = await procesarBorradorFlujo2(
          { propiedad_id: propiedadId },
          controller.signal,
        )
        setWizard((prev) => ({ ...prev, borradorEditado: borrador }))
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return
        setError(
          err instanceof Error
            ? err.message
            : 'No se pudo procesar la conversación.',
        )
      } finally {
        setProcesandoBatch(false)
      }
    }

    ejecutarBatch()

    return () => {
      controller.abort()
    }
  }, [propiedadId])

  useEffect(() => {
    if (!procesandoBatch || paso !== 1) return

    const interval = setInterval(() => {
      setEtapaProcesado((prev) => (prev + 1) % ETAPAS_PROCESADO.length)
    }, 2200)

    return () => clearInterval(interval)
  }, [procesandoBatch, paso])

  const updateWizard = (updates: Partial<WizardValidacionState>) => {
    setWizard((prev) => ({ ...prev, ...updates }))
  }

  const handleInyectar = async () => {
    if (inyectando) return

    if (!wizard.borradorEditado.trim()) {
      setError('El borrador no puede estar vacío.')
      setPaso(2)
      return
    }

    if (wizard.alertas.activas && !wizard.alertas.contacto.trim()) {
      setError('Introduce un contacto para las alertas de emergencia.')
      setPaso(3)
      return
    }

    setInyectando(true)
    setError('')

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      await inyectarConocimientoFlujo3(
        {
          propiedad_id: propiedadId,
          borrador_editado: wizard.borradorEditado,
          alertas: {
            activas: wizard.alertas.activas,
            canal: wizard.alertas.canal,
            contacto: wizard.alertas.contacto,
          },
          recomendaciones: {
            activo: wizard.recomendaciones.activo,
            restaurantes: wizard.recomendaciones.restaurantes,
            transporte: wizard.recomendaciones.transporte,
            lugares_interes: wizard.recomendaciones.lugaresInteres,
          },
        },
        controller.signal,
      )
      navigate('/')
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo inyectar el conocimiento.',
      )
      setInyectando(false)
    }
  }

  return (
    <div className="animate-fade-in-up">
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-400">
          Validación final
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {nombreVivienda}
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Revisa, ajusta y confirma antes de indexar el conocimiento.
        </p>
      </div>

      <div className="mb-8 flex justify-center gap-2 sm:gap-4">
        {PASOS.map(({ numero, label }) => {
          const activo = paso === numero
          const completado = paso > numero
          return (
            <div key={numero} className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all ${
                  activo
                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/40'
                    : completado
                      ? 'bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/40'
                      : 'bg-slate-800 text-slate-500 ring-1 ring-slate-700'
                }`}
              >
                {completado ? '✓' : numero}
              </div>
              <span
                className={`text-[10px] font-medium uppercase tracking-wider ${
                  activo ? 'text-indigo-300' : 'text-slate-600'
                }`}
              >
                {label}
              </span>
            </div>
          )
        })}
      </div>

      {error && paso !== 1 && (
        <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm sm:p-8">
        {paso === 1 && (
          <div className="py-12 text-center">
            <p className="text-sm text-slate-500">
              Estamos preparando tu borrador en segundo plano...
            </p>
          </div>
        )}

        {paso === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Borrador editable
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Corrige cualquier dato antes de indexarlo (Wi-Fi, normas,
                accesos...).
              </p>
            </div>
            <textarea
              value={wizard.borradorEditado}
              onChange={(e) => updateWizard({ borradorEditado: e.target.value })}
              rows={14}
              className={`resize-y ${inputClassName}`}
              placeholder="El borrador estructurado aparecerá aquí..."
            />
            <div className="flex justify-between gap-3">
              <button
                type="button"
                onClick={() => setPaso(1)}
                className="rounded-xl border border-slate-700 px-5 py-3 text-sm text-slate-400 hover:border-slate-600"
              >
                Atrás
              </button>
              <button
                type="button"
                onClick={() => setPaso(3)}
                disabled={!wizard.borradorEditado.trim()}
                className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-6 py-3 text-sm font-semibold text-white disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

        {paso === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Alertas de emergencia
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Configura cómo recibir incidencias graves (fugas, cortes de luz,
                llaves perdidas).
              </p>
            </div>

            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-4">
              <span className="text-sm text-slate-300">
                Activar alertas de emergencia graves
              </span>
              <input
                type="checkbox"
                checked={wizard.alertas.activas}
                onChange={(e) =>
                  updateWizard({
                    alertas: { ...wizard.alertas, activas: e.target.checked },
                  })
                }
                className="h-5 w-5 rounded border-slate-600 bg-slate-900 text-indigo-500 focus:ring-indigo-500"
              />
            </label>

            {wizard.alertas.activas && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-300">
                    Canal de notificación
                  </label>
                  <select
                    value={wizard.alertas.canal}
                    onChange={(e) =>
                      updateWizard({
                        alertas: {
                          ...wizard.alertas,
                          canal: e.target.value as WizardValidacionState['alertas']['canal'],
                        },
                      })
                    }
                    className={`mt-2 ${inputClassName}`}
                  >
                    <option value="telegram">Telegram</option>
                    <option value="email">Email</option>
                    <option value="ambos">Ambos</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300">
                    Contacto de alertas
                  </label>
                  <input
                    type="text"
                    value={wizard.alertas.contacto}
                    onChange={(e) =>
                      updateWizard({
                        alertas: { ...wizard.alertas, contacto: e.target.value },
                      })
                    }
                    placeholder="@usuario, email o Chat ID"
                    className={`mt-2 ${inputClassName}`}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-between gap-3">
              <button
                type="button"
                onClick={() => setPaso(2)}
                className="rounded-xl border border-slate-700 px-5 py-3 text-sm text-slate-400"
              >
                Atrás
              </button>
              <button
                type="button"
                onClick={() => setPaso(4)}
                className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-6 py-3 text-sm font-semibold text-white"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

        {paso === 4 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Asistente de recomendaciones
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Tu IA podrá sugerir lugares locales a los huéspedes.
              </p>
            </div>

            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-4">
              <span className="text-sm text-slate-300">
                ¿Quieres que tu IA recomiende lugares locales?
              </span>
              <input
                type="checkbox"
                checked={wizard.recomendaciones.activo}
                onChange={(e) =>
                  updateWizard({
                    recomendaciones: {
                      ...wizard.recomendaciones,
                      activo: e.target.checked,
                    },
                  })
                }
                className="h-5 w-5 rounded border-slate-600 bg-slate-900 text-indigo-500"
              />
            </label>

            {wizard.recomendaciones.activo && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300">
                    Restaurantes recomendados
                  </label>
                  <textarea
                    value={wizard.recomendaciones.restaurantes}
                    onChange={(e) =>
                      updateWizard({
                        recomendaciones: {
                          ...wizard.recomendaciones,
                          restaurantes: e.target.value,
                        },
                      })
                    }
                    rows={2}
                    placeholder="Ej: La Mar Salada, Can Paixano..."
                    className={`mt-2 resize-none ${inputClassName}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300">
                    Transporte cercano
                  </label>
                  <textarea
                    value={wizard.recomendaciones.transporte}
                    onChange={(e) =>
                      updateWizard({
                        recomendaciones: {
                          ...wizard.recomendaciones,
                          transporte: e.target.value,
                        },
                      })
                    }
                    rows={2}
                    placeholder="Ej: Metro L4, parada bus 24..."
                    className={`mt-2 resize-none ${inputClassName}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300">
                    Lugares de interés
                  </label>
                  <textarea
                    value={wizard.recomendaciones.lugaresInteres}
                    onChange={(e) =>
                      updateWizard({
                        recomendaciones: {
                          ...wizard.recomendaciones,
                          lugaresInteres: e.target.value,
                        },
                      })
                    }
                    rows={2}
                    placeholder="Ej: Playa de la Barceloneta, Park Güell..."
                    className={`mt-2 resize-none ${inputClassName}`}
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-between">
              <button
                type="button"
                onClick={() => setPaso(3)}
                className="rounded-xl border border-slate-700 px-5 py-3 text-sm text-slate-400"
              >
                Atrás
              </button>
              <button
                type="button"
                onClick={handleInyectar}
                disabled={inyectando}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:from-indigo-400 hover:to-violet-500 disabled:opacity-50"
              >
                🚀 Estudiar e Inyectar Información con IA
              </button>
            </div>
          </div>
        )}
      </div>

      {paso === 1 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-md">
          <div className="relative mx-6 w-full max-w-xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/95 p-8 shadow-2xl sm:p-10">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -left-20 -top-20 h-56 w-56 rounded-full bg-indigo-600/20 blur-3xl" />
              <div className="absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-violet-600/15 blur-3xl" />
            </div>

            <div className="relative text-center">
              {procesandoBatch ? (
                <>
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-500/15 ring-1 ring-indigo-500/30">
                    <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-indigo-500/20 border-t-indigo-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white sm:text-2xl">
                    ¡Gracias por los datos!
                  </h2>
                  <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-400">
                    Estamos procesando y estructurando toda la información de tu
                    alojamiento. Esto puede tardar unos segundos.
                  </p>

                  <div className="relative mx-auto mt-8 h-1.5 max-w-xs overflow-hidden rounded-full bg-slate-800">
                    <div className="absolute inset-y-0 w-1/2 animate-shimmer rounded-full bg-gradient-to-r from-transparent via-indigo-400/80 to-transparent" />
                  </div>

                  <p
                    key={etapaProcesado}
                    className="mt-6 animate-fade-in-up text-sm font-medium text-indigo-300"
                  >
                    {ETAPAS_PROCESADO[etapaProcesado]}
                  </p>

                  <div className="mt-6 flex justify-center gap-1.5">
                    {ETAPAS_PROCESADO.map((_, index) => (
                      <span
                        key={index}
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                          index === etapaProcesado
                            ? 'w-6 bg-indigo-400'
                            : 'w-1.5 bg-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                </>
              ) : error ? (
                <>
                  <div className="mx-auto mb-6 flex h-20 w-20 animate-scale-in items-center justify-center rounded-full bg-rose-500/15 text-3xl ring-1 ring-rose-500/40">
                    !
                  </div>
                  <h2 className="text-xl font-semibold text-white">
                    No se pudo procesar
                  </h2>
                  <p className="mx-auto mt-3 max-w-md text-sm text-slate-400">
                    {error}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setError('')
                      setProcesandoBatch(true)
                      setEtapaProcesado(0)
                      abortRef.current?.abort()
                      const controller = new AbortController()
                      abortRef.current = controller
                      procesarBorradorFlujo2(
                        { propiedad_id: propiedadId },
                        controller.signal,
                      )
                        .then((borrador) => {
                          setWizard((prev) => ({
                            ...prev,
                            borradorEditado: borrador,
                          }))
                          setProcesandoBatch(false)
                        })
                        .catch((err) => {
                          if (err instanceof Error && err.name === 'AbortError')
                            return
                          setError(
                            err instanceof Error
                              ? err.message
                              : 'No se pudo procesar la conversación.',
                          )
                          setProcesandoBatch(false)
                        })
                    }}
                    className="mt-8 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-8 py-3.5 text-sm font-semibold text-white"
                  >
                    Reintentar procesamiento
                  </button>
                </>
              ) : (
                <>
                  <div className="mx-auto mb-6 flex h-20 w-20 animate-scale-in items-center justify-center rounded-full bg-emerald-500/20 text-4xl ring-1 ring-emerald-500/40">
                    ✓
                  </div>
                  <h2 className="text-xl font-semibold text-white sm:text-2xl">
                    ¡Borrador listo!
                  </h2>
                  <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-400">
                    Hemos organizado toda tu información. Ahora puedes revisarla
                    y corregir cualquier detalle antes de continuar.
                  </p>
                  <button
                    type="button"
                    onClick={() => setPaso(2)}
                    disabled={!wizard.borradorEditado.trim()}
                    className="mt-8 animate-pulse-soft rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:from-indigo-400 hover:to-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Revisar borrador →
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {inyectando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md">
          <div className="mx-6 w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900/90 p-8 text-center shadow-2xl">
            <div className="mx-auto mb-6 h-14 w-14 animate-spin rounded-full border-[3px] border-indigo-500/20 border-t-indigo-400" />
            <p className="text-lg font-semibold leading-relaxed text-white">
              La IA está leyendo tus textos y generando mapas vectoriales de
              conocimiento en la base de datos...
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
