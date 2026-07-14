import { useCallback, useEffect, useRef, useState } from 'react'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import FormSection, { FieldGroup } from '../../../components/ui/FormSection'
import HostFeedback from '../../../components/ui/HostFeedback'
import { inputClassName } from '../../../components/ui/inputClassName'
import WizardStepShell from '../../../components/ui/WizardStepShell'
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
    <>
      <WizardStepShell
        paso={5}
        title={nombreVivienda}
        description="Revisa el borrador del manual. Lo indexaremos junto con la Guía Local al final del proceso."
      >
        <div className="mb-6 flex justify-center gap-8">
          {PASOS.map(({ numero, label }) => {
            const activo = paso === numero
            const completado = paso > numero
            return (
              <div key={numero} className="flex flex-col items-center gap-1.5">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                    activo
                      ? 'bg-host-primary text-white shadow-sm ring-2 ring-teal-200'
                      : completado
                        ? 'bg-teal-50 text-host-primary ring-2 ring-teal-200'
                        : 'bg-stone-100 text-stone-400 ring-1 ring-stone-200'
                  }`}
                >
                  {completado ? '✓' : numero}
                </div>
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wide ${
                    activo ? 'text-host-primary' : 'text-stone-400'
                  }`}
                >
                  {label}
                </span>
              </div>
            )
          })}
        </div>

        {error && paso === 2 && (
          <HostFeedback className="mb-6">{error}</HostFeedback>
        )}

        {paso === 2 && (
          <FormSection
            title="Borrador editable"
            description="Corrige cualquier dato del manual (Wi-Fi, normas, accesos...) antes de continuar."
          >
            <FieldGroup label="Contenido del manual">
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
            </FieldGroup>
            <div className="flex justify-end pt-2">
              <Button
                type="button"
                onClick={handleSiguienteBorrador}
                loading={guardando}
                disabled={!wizard.borradorEditado.trim() || guardando}
                size="lg"
              >
                Siguiente → Guía Local
              </Button>
            </div>
          </FormSection>
        )}
      </WizardStepShell>

      {paso === 1 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-sm">
          <Card padding="lg" className="w-full max-w-xl text-center shadow-card-hover">
            {isLoading ? (
              <>
                <div className="mx-auto mb-6 h-14 w-14 animate-spin rounded-full border-[3px] border-teal-100 border-t-host-primary" />
                <h2 className="font-display text-xl font-bold text-host-text sm:text-2xl">
                  ¡Gracias por los datos!
                </h2>
                <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-host-muted">
                  Estamos procesando y estructurando toda la información de tu
                  alojamiento.
                </p>

                <div className="relative mx-auto mt-8 h-1.5 max-w-xs overflow-hidden rounded-full bg-stone-200">
                  <div className="absolute inset-y-0 w-1/2 animate-shimmer rounded-full bg-gradient-to-r from-transparent via-teal-400/80 to-transparent" />
                </div>

                <p
                  key={etapaProcesado}
                  className="mt-6 animate-fade-in-up text-sm font-semibold text-host-primary"
                >
                  {ETAPAS_PROCESADO[etapaProcesado]}
                </p>

                <div className="mt-6 flex justify-center gap-1.5">
                  {ETAPAS_PROCESADO.map((_, index) => (
                    <span
                      key={index}
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        index === etapaProcesado
                          ? 'w-6 bg-host-primary'
                          : 'w-1.5 bg-stone-300'
                      }`}
                    />
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-2xl font-bold text-rose-600">
                  !
                </div>
                <h2 className="font-display text-xl font-bold text-host-text">
                  No se pudo procesar
                </h2>
                <p className="mx-auto mt-3 max-w-md text-sm text-host-muted">
                  {error}
                </p>
                <Button
                  type="button"
                  onClick={handleReintentar}
                  className="mt-8"
                  size="lg"
                >
                  Reintentar procesamiento
                </Button>
              </>
            )}
          </Card>
        </div>
      )}
    </>
  )
}
