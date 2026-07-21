import { useEffect, useState } from 'react'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import TelegramConnectSteps from '../../../components/ui/TelegramConnectSteps'
import {
  TELEGRAM_BOT_DISPLAY,
  TELEGRAM_BOT_URL,
} from '../../../config/telegramBot'
import HostFeedback from '../../../components/ui/HostFeedback'
import { FieldGroup } from '../../../components/ui/FormSection'
import { inputClassName } from '../../../components/ui/inputClassName'
import { obtenerTelegramPropietario } from '../../../services/propiedadService'
import { guardarTelegramPropietario } from '../../../services/propietarioService'

type TelegramSetupBannerProps = {
  onGuardado?: (chatId: string) => void
}

export default function TelegramSetupBanner({
  onGuardado,
}: TelegramSetupBannerProps) {
  const [chatId, setChatId] = useState('')
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [mensajeOk, setMensajeOk] = useState('')
  const [configurado, setConfigurado] = useState(false)
  const [editando, setEditando] = useState(false)

  useEffect(() => {
    let activo = true

    obtenerTelegramPropietario()
      .then((telegram) => {
        if (!activo) return
        if (telegram) {
          setChatId(telegram)
          setConfigurado(true)
        }
      })
      .catch(() => {})
      .finally(() => {
        if (activo) setCargando(false)
      })

    return () => {
      activo = false
    }
  }, [])

  const abrirBot = () => {
    window.open(TELEGRAM_BOT_URL, '_blank', 'noopener,noreferrer')
  }

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault()
    setGuardando(true)
    setError('')
    setMensajeOk('')

    try {
      await guardarTelegramPropietario(chatId)
      setConfigurado(true)
      setEditando(false)
      setMensajeOk(
        `Telegram conectado con ${TELEGRAM_BOT_DISPLAY}. Ya puedes recibir alertas de tus alojamientos.`,
      )
      onGuardado?.(chatId.trim())
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo guardar el Chat ID de Telegram.',
      )
    } finally {
      setGuardando(false)
    }
  }

  if (cargando) {
    return null
  }

  const mostrarFormulario = !configurado || editando

  return (
    <Card
      padding="md"
      className={
        configurado
          ? 'mb-6 border-emerald-200 bg-emerald-50/40 ring-1 ring-emerald-100'
          : 'mb-6 border-amber-200 bg-amber-50/40'
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {configurado && (
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200"
                aria-hidden
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="h-4 w-4"
                >
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </span>
            )}
            <p className="font-display text-base font-bold text-host-text">
              {configurado
                ? 'Telegram conectado'
                : 'Conecta Telegram para recibir alertas'}
            </p>
            {configurado && (
              <Badge variant="success">Conexión establecida</Badge>
            )}
          </div>

          <p className="mt-2 text-sm leading-relaxed text-host-muted">
            {configurado ? (
              <>
                Recibirás alertas de tus alojamientos en{' '}
                <a
                  href={TELEGRAM_BOT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-emerald-800 hover:underline"
                >
                  {TELEGRAM_BOT_DISPLAY}
                </a>
                {chatId && (
                  <>
                    {' '}
                    · Chat ID{' '}
                    <span className="font-mono font-semibold text-host-text">
                      {chatId}
                    </span>
                  </>
                )}
              </>
            ) : (
              <>
                Bot oficial de Umbral:{' '}
                <a
                  href={TELEGRAM_BOT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-host-primary hover:underline"
                >
                  {TELEGRAM_BOT_DISPLAY}
                </a>
              </>
            )}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          {configurado && !editando && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                setEditando(true)
                setMensajeOk('')
                setError('')
              }}
            >
              Cambiar Chat ID
            </Button>
          )}
          <Button type="button" variant="secondary" size="sm" onClick={abrirBot}>
            Abrir {TELEGRAM_BOT_DISPLAY}
          </Button>
        </div>
      </div>

      {!configurado && (
        <div className="mt-4 rounded-xl border border-amber-200/80 bg-white/70 px-4 py-4">
          <TelegramConnectSteps />
        </div>
      )}

      {mostrarFormulario && (
        <form onSubmit={handleGuardar} className="mt-5 space-y-4">
          {configurado && editando && (
            <p className="text-sm text-host-muted">
              Introduce un nuevo Chat ID si has cambiado de cuenta de Telegram.
            </p>
          )}

          <FieldGroup label="Tu Chat ID">
            <input
              type="text"
              value={chatId}
              onChange={(e) => {
                setChatId(e.target.value)
                setError('')
                setMensajeOk('')
              }}
              placeholder="Ej: 6168367317"
              disabled={guardando}
              className={inputClassName}
            />
          </FieldGroup>

          {error && <HostFeedback>{error}</HostFeedback>}
          {mensajeOk && (
            <HostFeedback variant="success">{mensajeOk}</HostFeedback>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              type="submit"
              loading={guardando}
              disabled={guardando}
              size="sm"
            >
              {configurado ? 'Guardar cambios' : 'Guardar Chat ID'}
            </Button>
            {configurado && editando && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditando(false)
                  setError('')
                  setMensajeOk('')
                  void obtenerTelegramPropietario().then((telegram) => {
                    if (telegram) setChatId(telegram)
                  })
                }}
              >
                Cancelar
              </Button>
            )}
          </div>
        </form>
      )}

      {configurado && !editando && mensajeOk && (
        <HostFeedback variant="success" className="mt-4">
          {mensajeOk}
        </HostFeedback>
      )}
    </Card>
  )
}
