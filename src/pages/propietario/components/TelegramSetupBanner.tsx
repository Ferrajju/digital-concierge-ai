import { useEffect, useState } from 'react'
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

  return (
    <Card
      padding="md"
      className={
        configurado
          ? 'mb-6 border-stone-200'
          : 'mb-6 border-amber-200 bg-amber-50/40'
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-display text-base font-bold text-host-text">
            {configurado
              ? 'Alertas por Telegram'
              : 'Conecta Telegram para recibir alertas'}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-host-muted">
            Bot oficial de Umbral:{' '}
            <a
              href={TELEGRAM_BOT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-host-primary hover:underline"
            >
              {TELEGRAM_BOT_DISPLAY}
            </a>
          </p>
        </div>
        <Button type="button" variant="secondary" size="sm" onClick={abrirBot}>
          Abrir {TELEGRAM_BOT_DISPLAY}
        </Button>
      </div>

      {!configurado && (
        <div className="mt-4 rounded-xl border border-stone-200 bg-stone-50 px-4 py-4">
          <TelegramConnectSteps />
        </div>
      )}

      <form onSubmit={handleGuardar} className="mt-5 space-y-4">
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

        <Button type="submit" loading={guardando} disabled={guardando} size="sm">
          {configurado ? 'Actualizar Chat ID' : 'Guardar Chat ID'}
        </Button>
      </form>
    </Card>
  )
}
