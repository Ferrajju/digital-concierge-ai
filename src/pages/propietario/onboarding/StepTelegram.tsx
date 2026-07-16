import { useState } from 'react'
import Button from '../../../components/ui/Button'
import FormSection, { FieldGroup, InsetPanel } from '../../../components/ui/FormSection'
import HostFeedback from '../../../components/ui/HostFeedback'
import { inputClassName } from '../../../components/ui/inputClassName'
import TelegramConnectSteps from '../../../components/ui/TelegramConnectSteps'
import WizardStepShell, { WizardActions } from '../../../components/ui/WizardStepShell'
import {
  TELEGRAM_BOT_DISPLAY,
  TELEGRAM_BOT_URL,
} from '../../../config/telegramBot'

type StepTelegramProps = {
  telegramChatId: string
  onTelegramChatIdChange: (value: string) => void
  onContinue: () => void
  onConfigureLater: () => void
}

export default function StepTelegram({
  telegramChatId,
  onTelegramChatIdChange,
  onContinue,
  onConfigureLater,
}: StepTelegramProps) {
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = telegramChatId.trim()

    if (!trimmed) {
      setError('Introduce tu Chat ID de Telegram.')
      return
    }

    if (Number.isNaN(Number.parseInt(trimmed, 10))) {
      setError('El Chat ID debe ser un número válido.')
      return
    }

    setError('')
    onContinue()
  }

  const abrirBotTelegram = () => {
    window.open(TELEGRAM_BOT_URL, '_blank', 'noopener,noreferrer')
  }

  return (
    <WizardStepShell
      paso={2}
      totalPasos={3}
      icon="📱"
      title="Alertas críticas en tiempo real"
      description={
        <>
          Conecta{' '}
          <a
            href={TELEGRAM_BOT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-host-primary hover:underline"
          >
            {TELEGRAM_BOT_DISPLAY}
          </a>{' '}
          y recibe en tu móvil incidencias graves de tus huéspedes.
        </>
      }
      centered
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormSection title="Conectar Telegram">
          <InsetPanel className="space-y-4">
            <TelegramConnectSteps />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={abrirBotTelegram}
            >
              Abrir {TELEGRAM_BOT_DISPLAY}
            </Button>
          </InsetPanel>

          <FieldGroup label="Tu Chat ID">
            <input
              id="telegram-chat-id"
              type="text"
              value={telegramChatId}
              onChange={(e) => {
                onTelegramChatIdChange(e.target.value)
                if (error) setError('')
              }}
              placeholder="Ej: 6168367317"
              className={inputClassName}
            />
          </FieldGroup>
        </FormSection>

        {error && <HostFeedback>{error}</HostFeedback>}

        <WizardActions>
          <Button type="button" variant="ghost" onClick={onConfigureLater}>
            Configurar más tarde
          </Button>
          <Button type="submit" size="lg">
            Verificar y continuar
          </Button>
        </WizardActions>
      </form>
    </WizardStepShell>
  )
}
