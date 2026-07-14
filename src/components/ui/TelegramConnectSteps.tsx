import {
  TELEGRAM_BOT_DISPLAY,
  TELEGRAM_BOT_URL,
} from '../../config/telegramBot'

export default function TelegramConnectSteps({
  className = '',
}: {
  className?: string
}) {
  return (
    <ol
      className={`list-decimal space-y-2 pl-5 text-sm leading-relaxed text-host-muted ${className}`}
    >
      <li>
        Abre{' '}
        <a
          href={TELEGRAM_BOT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-host-primary hover:underline"
        >
          {TELEGRAM_BOT_DISPLAY}
        </a>{' '}
        en Telegram.
      </li>
      <li>
        Pulsa <span className="font-semibold text-host-text">Iniciar</span> o
        escribe <span className="font-mono text-host-text">/start</span>.
      </li>
      <li>
        El bot te enviará tu <span className="font-semibold text-host-text">Chat ID</span>{' '}
        (un número largo). Cópialo.
      </li>
      <li>Pégalo en el campo de abajo y guarda.</li>
    </ol>
  )
}
