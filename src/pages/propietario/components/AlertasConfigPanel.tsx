import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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

const inputClassName =
  'w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3.5 text-sm text-white placeholder:text-slate-600 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-50'

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
      navigate('/')
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
    <div className="animate-fade-in-up">
      <div className="mb-8 text-center sm:mb-10">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-2xl ring-1 ring-emerald-500/30">
          ✓
        </div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-400">
          Paso 7 de 7
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Alertas para {nombreVivienda}
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-slate-400">
          El conocimiento del alojamiento ya está indexado. Elige qué eventos
          críticos quieres que el bot te notifique directamente al teléfono.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm sm:p-8">
        <div className="space-y-6">
          <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-4 transition-colors hover:border-indigo-500/30">
            <div>
              <p className="text-sm font-medium text-white">
                Activar notificaciones críticas
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                El bot avisará al propietario cuando detecte estos eventos.
              </p>
            </div>
            <input
              type="checkbox"
              checked={alertas.activas}
              onChange={(e) => updateAlertas({ activas: e.target.checked })}
              disabled={guardando}
              className="h-5 w-5 rounded border-slate-600 bg-slate-900 text-indigo-500 focus:ring-indigo-500"
            />
          </label>

          {alertas.activas && (
            <>
              <div className="space-y-3">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  Eventos a notificar
                </p>
                {EVENTOS_ALERTA.map(({ id, titulo, descripcion, icono }) => (
                  <label
                    key={id}
                    className="flex cursor-pointer items-start gap-4 rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-4 transition-colors hover:border-slate-700"
                  >
                    <span className="mt-0.5 text-xl" aria-hidden>
                      {icono}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-200">
                        {titulo}
                      </p>
                      <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                        {descripcion}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={alertas.eventos[id]}
                      onChange={() => toggleEvento(id)}
                      disabled={guardando}
                      className="mt-1 h-5 w-5 shrink-0 rounded border-slate-600 bg-slate-900 text-indigo-500 focus:ring-indigo-500"
                    />
                  </label>
                ))}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-300">
                    Canal de notificación
                  </label>
                  <select
                    value={alertas.canal}
                    onChange={(e) =>
                      updateAlertas({
                        canal: e.target.value as ConfigAlertas['canal'],
                      })
                    }
                    disabled={guardando}
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
                    value={alertas.contacto}
                    onChange={(e) =>
                      updateAlertas({ contacto: e.target.value })
                    }
                    placeholder="Chat ID de Telegram o email"
                    disabled={guardando}
                    className={`mt-2 ${inputClassName}`}
                  />
                  <p className="mt-1.5 text-xs text-slate-500">
                    Se rellena con tu Telegram del onboarding si lo configuraste.
                  </p>
                </div>
              </div>
            </>
          )}

          <button
            type="button"
            onClick={handleFinalizar}
            disabled={guardando}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:from-indigo-400 hover:to-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {guardando ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Guardando...
              </>
            ) : (
              'Finalizar configuración'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
