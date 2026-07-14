import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../../components/ui/Button'
import FormSection, { FieldGroup } from '../../../components/ui/FormSection'
import HostFeedback from '../../../components/ui/HostFeedback'
import { inputClassName } from '../../../components/ui/inputClassName'
import WizardStepShell from '../../../components/ui/WizardStepShell'
import {
  guardarAlertasPropiedad,
  obtenerTelegramPropietario,
} from '../../../services/propiedadService'
import {
  EVENTOS_ALERTA,
  WIZARD_INICIAL,
  type ConfigAlertas,
  type TipoEventoAlerta,
} from '../types/validacionWizard'

type AlertasConfigPanelProps = {
  propiedadId: string
  nombreVivienda: string
}

export default function AlertasConfigPanel({
  propiedadId,
  nombreVivienda,
}: AlertasConfigPanelProps) {
  const navigate = useNavigate()
  const [alertas, setAlertas] = useState<ConfigAlertas>(WIZARD_INICIAL.alertas)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (alertas.contacto) return

    obtenerTelegramPropietario()
      .then((telegram) => {
        if (!telegram) return
        setAlertas((prev) => ({ ...prev, contacto: telegram }))
      })
      .catch(() => {})
  }, [alertas.contacto])

  const updateAlertas = (updates: Partial<ConfigAlertas>) => {
    setAlertas((prev) => ({ ...prev, ...updates }))
  }

  const toggleEvento = (evento: TipoEventoAlerta) => {
    setAlertas((prev) => ({
      ...prev,
      eventos: {
        ...prev.eventos,
        [evento]: !prev.eventos[evento],
      },
    }))
  }

  const handleFinalizar = async () => {
    if (guardando) return

    if (alertas.activas) {
      const algunoActivo = Object.values(alertas.eventos).some(Boolean)
      if (!algunoActivo) {
        setError(
          'Activa al menos un tipo de alerta o desactiva las notificaciones.',
        )
        return
      }
      if (!alertas.contacto.trim()) {
        setError('Introduce un contacto para recibir las alertas.')
        return
      }
    }

    setGuardando(true)
    setError('')

    try {
      await guardarAlertasPropiedad(propiedadId, alertas)
      navigate('/dashboard')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudieron guardar las alertas.',
      )
    } finally {
      setGuardando(false)
    }
  }

  return (
    <WizardStepShell
      paso={7}
      icon="✓"
      title={`Alertas para ${nombreVivienda}`}
      description="El conocimiento del alojamiento ya está indexado. Elige qué eventos críticos quieres que el bot te notifique directamente al teléfono."
      centered
    >
      {error && <HostFeedback className="mb-6">{error}</HostFeedback>}

      <FormSection title="Notificaciones críticas">
        <label className="flex cursor-pointer items-center justify-between rounded-xl border-2 border-stone-200 bg-white px-4 py-4 transition-colors hover:border-stone-300">
          <div>
            <p className="text-sm font-semibold text-host-text">
              Activar notificaciones críticas
            </p>
            <p className="mt-0.5 text-xs text-host-muted">
              El bot avisará al propietario cuando detecte estos eventos.
            </p>
          </div>
          <input
            type="checkbox"
            checked={alertas.activas}
            onChange={(e) => updateAlertas({ activas: e.target.checked })}
            disabled={guardando}
            className="h-5 w-5 rounded border-stone-300 text-host-primary focus:ring-host-primary/30"
          />
        </label>

        {alertas.activas && (
          <>
            <div className="space-y-3 pt-2">
              <p className="text-xs font-bold uppercase tracking-wider text-stone-600">
                Eventos a notificar
              </p>
              {EVENTOS_ALERTA.map(({ id, titulo, descripcion, icono }) => (
                <label
                  key={id}
                  className="flex cursor-pointer items-start gap-4 rounded-xl border-2 border-stone-200 bg-stone-50 px-4 py-4 transition-colors hover:border-stone-300"
                >
                  <span className="mt-0.5 text-xl" aria-hidden>
                    {icono}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-host-text">
                      {titulo}
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-host-muted">
                      {descripcion}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={alertas.eventos[id]}
                    onChange={() => toggleEvento(id)}
                    disabled={guardando}
                    className="mt-1 h-5 w-5 shrink-0 rounded border-stone-300 text-host-primary focus:ring-host-primary/30"
                  />
                </label>
              ))}
            </div>

            <div className="grid gap-4 pt-2 sm:grid-cols-2">
              <FieldGroup label="Canal de notificación">
                <select
                  value={alertas.canal}
                  onChange={(e) =>
                    updateAlertas({
                      canal: e.target.value as ConfigAlertas['canal'],
                    })
                  }
                  disabled={guardando}
                  className={inputClassName}
                >
                  <option value="telegram">Telegram</option>
                  <option value="email">Email</option>
                  <option value="ambos">Ambos</option>
                </select>
              </FieldGroup>
              <FieldGroup label="Contacto de alertas">
                <input
                  type="text"
                  value={alertas.contacto}
                  onChange={(e) =>
                    updateAlertas({ contacto: e.target.value })
                  }
                  placeholder="Chat ID de Telegram o email"
                  disabled={guardando}
                  className={inputClassName}
                />
                <p className="mt-1.5 text-xs text-host-muted">
                  Se rellena con tu Telegram del onboarding si lo configuraste.
                </p>
              </FieldGroup>
            </div>
          </>
        )}
      </FormSection>

      <Button
        type="button"
        onClick={handleFinalizar}
        loading={guardando}
        disabled={guardando}
        fullWidth
        size="lg"
        className="mt-6"
      >
        Finalizar configuración
      </Button>
    </WizardStepShell>
  )
}
