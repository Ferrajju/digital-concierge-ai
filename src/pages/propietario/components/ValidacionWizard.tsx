import { useCallback, useEffect, useRef, useState } from 'react'
import { procesarBorradorFlujo2 } from '../../../services/n8nService'
import { guardarBorradorPropiedad } from '../../../services/propiedadService'
import { WIZARD_INICIAL, type WizardValidacionState } from '../types/validacionWizard'

type PasoWizard = 1 | 2

type ValidacionWizardProps = {
  propiedadId: string
  nombreVivienda: string
  onBorradorGuardado: () => void
}

const PASOS = [
  { numero: 1, label: 'Procesado' },
  { numero: 2, label: 'Borrador' },
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
  onBorradorGuardado,
}: ValidacionWizardProps) {
  const [paso, setPaso] = useState<PasoWizard>(1)
  const [wizard, setWizard] = useState<WizardValidacionState>(WIZARD_INICIAL)
  const [isLoading, setIsLoading] = useState(true)
  const [etapaProcesado, setEtapaProcesado] = useState(0)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const abortRef = useRef<AbortController | null>(null)

  const finalizarCargaBorrador = useCallback((borrador: string) => {
    setWizard((prev) => ({ ...prev, borradorEditado: borrador }))
    setIsLoading(false)
    setPaso(2)
  }, [])

  const ejecutarFlujo2 = useCallback(
    async (signal: AbortSignal) => {
      const borrador = await procesarBorradorFlujo2(
        { propiedad_id: propiedadId },
        signal,
      )
      finalizarCargaBorrador(borrador)
    },
    [propiedadId, finalizarCargaBorrador],
  )

  useEffect(() => {
    const controller = new AbortController()
    abortRef.current = controller

    ejecutarFlujo2(controller.signal).catch((err) => {
      if (err instanceof Error && err.name === 'AbortError') return
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo procesar la conversación.',
      )
      setIsLoading(false)
    })

    return () => {
      controller.abort()
    }
  }, [ejecutarFlujo2])

  useEffect(() => {
    if (!isLoading || paso !== 1) return

    const interval = setInterval(() => {
      setEtapaProcesado((prev) => (prev + 1) % ETAPAS_PROCESADO.length)
    }, 2200)

    return () => clearInterval(interval)
  }, [isLoading, paso])

  const handleReintentar = () => {
    setError('')
    setIsLoading(true)
    setEtapaProcesado(0)
    setPaso(1)

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    ejecutarFlujo2(controller.signal).catch((err) => {
      if (err instanceof Error && err.name === 'AbortError') return
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo procesar la conversación.',
      )
      setIsLoading(false)
    })
  }

  const handleSiguienteBorrador = async () => {
    const textoFinal = wizard.borradorEditado.trim()
    if (!textoFinal || guardando) return

    setGuardando(true)
    setError('')

    try {
      await guardarBorradorPropiedad(propiedadId, textoFinal)
      onBorradorGuardado()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo guardar el borrador.',
      )
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="animate-fade-in-up">
      <div className="mb-8 text-center">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-400">
          Paso 5 de 7
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {nombreVivienda}
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Revisa el borrador del manual. Lo indexaremos junto con la Guía Local
          al final del proceso.
        </p>
      </div>

      <div className="mb-8 flex justify-center gap-6">
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

      {error && paso === 2 && (
        <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm sm:p-8">
        {paso === 2 && (
          <div className="animate-fade-in-up space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Borrador editable
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Corrige cualquier dato del manual (Wi-Fi, normas, accesos...)
                antes de continuar.
              </p>
            </div>
            <textarea
              value={wizard.borradorEditado}
              onChange={(e) =>
                setWizard((prev) => ({
                  ...prev,
                  borradorEditado: e.target.value,
                }))
              }
              rows={16}
              disabled={guardando}
              className={`resize-y font-mono text-[13px] leading-relaxed ${inputClassName}`}
              placeholder="El borrador estructurado aparecerá aquí..."
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSiguienteBorrador}
                disabled={!wizard.borradorEditado.trim() || guardando}
                className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:from-indigo-400 hover:to-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {guardando ? 'Guardando...' : 'Siguiente → Guía Local'}
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
              {isLoading ? (
                <>
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-500/15 ring-1 ring-indigo-500/30">
                    <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-indigo-500/20 border-t-indigo-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white sm:text-2xl">
                    ¡Gracias por los datos!
                  </h2>
                  <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-400">
                    Estamos procesando y estructurando toda la información de tu
                    alojamiento.
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
              ) : (
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
                    onClick={handleReintentar}
                    className="mt-8 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-8 py-3.5 text-sm font-semibold text-white"
                  >
                    Reintentar procesamiento
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
