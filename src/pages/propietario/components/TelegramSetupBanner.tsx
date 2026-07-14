import { useEffect, useState } from 'react'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import HostFeedback from '../../../components/ui/HostFeedback'
import { FieldGroup } from '../../../components/ui/FormSection'
import { inputClassName } from '../../../components/ui/inputClassName'
import { obtenerTelegramPropietario } from '../../../services/propiedadService'
import { guardarTelegramPropietario } from '../../../services/propietarioService'

const TELEGRAM_BOT_URL =
  import.meta.env.VITE_TELEGRAM_BOT_URL ?? 'https://t.me/DigitalConciergeBot'

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
      setMensajeOk('Telegram guardado. Las alertas de tus propiedades pueden usar este Chat ID.')
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
            {configurado ? 'Telegram conectado' : 'Conecta Telegram para alertas'}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-host-muted">
            {configurado
              ? 'Este Chat ID se usará por defecto en las alertas de tus alojamientos.'
              : 'Abre el bot, escribe /start y pega aquí tu Chat ID para recibir incidencias críticas en el móvil.'}
          </p>
        </div>
        <Button type="button" variant="secondary" size="sm" onClick={abrirBot}>
          Abrir bot
        </Button>
      </div>

      <form onSubmit={handleGuardar} className="mt-5 space-y-4">
        <FieldGroup label="Chat ID de Telegram">
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
          <p className="mt-1.5 text-xs text-host-muted">
            El bot te lo muestra al enviar /start. Es tu número personal de contacto en Telegram.
          </p>
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
