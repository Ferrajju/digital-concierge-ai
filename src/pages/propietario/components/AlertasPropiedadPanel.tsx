import { useEffect, useState } from 'react'
import Button from '../../../components/ui/Button'
import FormSection, { FieldGroup, InsetPanel } from '../../../components/ui/FormSection'
import HostFeedback from '../../../components/ui/HostFeedback'
import { HostSubpageHeader } from '../../../components/ui/HostPageShell'
import { HostLoading } from '../../../components/ui/HostShell'
import { inputClassName } from '../../../components/ui/inputClassName'
import {
  guardarAlertasPropiedad,
  obtenerAlertasPropiedad,
  obtenerTelegramPropietario,
} from '../../../services/propiedadService'
import {
  EVENTOS_ALERTA,
  WIZARD_INICIAL,
  type ConfigAlertas,
  type TipoEventoAlerta,
} from '../types/validacionWizard'

const TELEGRAM_BOT_URL =
  import.meta.env.VITE_TELEGRAM_BOT_URL ?? 'https://t.me/DigitalConciergeBot'

type AlertasPropiedadPanelProps = {
  propiedadId: string
  nombrePropiedad: string
  onVolver: () => void
}

function validarAlertas(alertas: ConfigAlertas): string | null {
  if (!alertas.activas) return null

  const algunoActivo = Object.values(alertas.eventos).some(Boolean)
  if (!algunoActivo) {
    return 'Activa al menos un tipo de alerta o desactiva las notificaciones.'
  }

  if (!alertas.contacto.trim()) {
    return 'Introduce un contacto para recibir las alertas.'
  }

  return null
}

export default function AlertasPropiedadPanel({
  propiedadId,
  nombrePropiedad,
  onVolver,
}: AlertasPropiedadPanelProps) {
  const [alertas, setAlertas] = useState<ConfigAlertas>(WIZARD_INICIAL.alertas)
  const [telegramCuenta, setTelegramCuenta] = useState('')
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [mensajeOk, setMensajeOk] = useState('')

  useEffect(() => {
    let activo = true

    const cargar = async () => {
      setCargando(true)
      setError('')

      try {
        const [config, telegram] = await Promise.all([
          obtenerAlertasPropiedad(propiedadId),
          obtenerTelegramPropietario(),
        ])

        if (!activo) return

        setTelegramCuenta(telegram)
        setAlertas(
          config.contacto.trim()
            ? config
            : { ...config, contacto: telegram },
        )
      } catch (err) {
        if (!activo) return
        setError(
          err instanceof Error
            ? err.message
            : 'No se pudieron cargar las alertas.',
        )
      } finally {
        if (activo) setCargando(false)
      }
    }

    cargar()

    return () => {
      activo = false
    }
  }, [propiedadId])

  const updateAlertas = (updates: Partial<ConfigAlertas>) => {
    setAlertas((prev) => ({ ...prev, ...updates }))
    setError('')
    setMensajeOk('')
  }

  const toggleEvento = (evento: TipoEventoAlerta) => {
    setAlertas((prev) => ({
      ...prev,
      eventos: {
        ...prev.eventos,
        [evento]: !prev.eventos[evento],
      },
    }))
    setError('')
    setMensajeOk('')
  }

  const usarTelegramCuenta = () => {
    if (!telegramCuenta) return
    updateAlertas({ contacto: telegramCuenta })
  }

  const abrirBot = () => {
    window.open(TELEGRAM_BOT_URL, '_blank', 'noopener,noreferrer')
  }

  const handleGuardar = async () => {
    const validacion = validarAlertas(alertas)
    if (validacion) {
      setError(validacion)
      return
    }

    setGuardando(true)
    setError('')
    setMensajeOk('')

    try {
      await guardarAlertasPropiedad(propiedadId, alertas)
      setMensajeOk('Alertas guardadas para este alojamiento.')
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

  if (cargando) {
    return <HostLoading label="Cargando alertas..." />
  }

  return (
    <div>
      <HostSubpageHeader
        onBack={onVolver}
        title="Alertas Telegram"
        description={`Configura qué incidencias de ${nombrePropiedad} quieres recibir en tu móvil.`}
      />

      {error && <HostFeedback className="mb-6">{error}</HostFeedback>}
      {mensajeOk && (
        <HostFeedback variant="success" className="mb-6">
          {mensajeOk}
        </HostFeedback>
      )}

      <div className="space-y-6">
        <FormSection
          title="Telegram de contacto"
          description="Cuando un huésped reporte una incidencia crítica, el aviso llegará a este Chat ID."
        >
          <InsetPanel className="space-y-3">
            <p className="text-sm text-host-muted">
              {telegramCuenta
                ? `Chat ID de tu cuenta: ${telegramCuenta}`
                : 'Aún no has guardado un Chat ID en el panel principal. Configúralo en el dashboard o aquí abajo.'}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={abrirBot}>
                Abrir bot y obtener Chat ID
              </Button>
              {telegramCuenta && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={usarTelegramCuenta}
                >
                  Usar Chat ID de mi cuenta
                </Button>
              )}
            </div>
          </InsetPanel>

          <FieldGroup label="Contacto para este alojamiento">
            <input
              type="text"
              value={alertas.contacto}
              onChange={(e) => updateAlertas({ contacto: e.target.value })}
              placeholder="Chat ID de Telegram"
              disabled={guardando}
              className={inputClassName}
            />
          </FieldGroup>
        </FormSection>

        <FormSection title="Notificaciones críticas">
          <label className="flex cursor-pointer items-center justify-between rounded-xl border-2 border-stone-200 bg-white px-4 py-4 transition-colors hover:border-stone-300">
            <div>
              <p className="text-sm font-semibold text-host-text">
                Activar alertas para este alojamiento
              </p>
              <p className="mt-0.5 text-xs text-host-muted">
                Si está desactivado, no se enviarán avisos aunque el huésped reporte incidencias.
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

              <FieldGroup label="Canal de notificación" className="pt-2">
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
            </>
          )}
        </FormSection>

        <div className="flex justify-end">
          <Button
            type="button"
            onClick={handleGuardar}
            loading={guardando}
            disabled={guardando}
            size="lg"
          >
            Guardar alertas
          </Button>
        </div>
      </div>
    </div>
  )
}
