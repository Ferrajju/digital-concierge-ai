import { useState } from 'react'

type StepTelegramProps = {
  telegramChatId: string
  onTelegramChatIdChange: (value: string) => void
  onContinue: () => void
}

export default function StepTelegram({
  telegramChatId,
  onTelegramChatIdChange,
  onContinue,
}: StepTelegramProps) {
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = telegramChatId.trim()

    if (!trimmed) {
      setError('Introduce tu Telegram Chat ID para continuar.')
      return
    }

    setError('')
    onContinue()
  }

  return (
    <div className="animate-fade-in-up">
      <div className="mb-10 text-center">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-indigo-400">
          Paso 2 de 3
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Activa tus alertas críticas en tiempo real
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-400">
          Recibirás las incidencias graves de tus huéspedes directamente en tu
          móvil mediante nuestro Bot de Telegram. Sin entrar al panel, sin
          perder tiempo: solo lo que realmente importa, al instante.
        </p>
      </div>

      <div className="mx-auto max-w-lg">
        <div className="mb-8 flex items-center justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-500/20 to-indigo-600/20 ring-1 ring-sky-500/30">
            <svg
              className="h-10 w-10 text-sky-400"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
            </svg>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm sm:p-8"
        >
          <label htmlFor="telegram-chat-id" className="block text-sm font-medium text-slate-300">
            Telegram Chat ID
          </label>
          <input
            id="telegram-chat-id"
            type="text"
            value={telegramChatId}
            onChange={(e) => {
              onTelegramChatIdChange(e.target.value)
              if (error) setError('')
            }}
            placeholder="Ej: 123456789"
            className="mt-3 w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3.5 text-white placeholder:text-slate-600 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
          <p className="mt-2 text-xs text-slate-500">
            Introduce tu ID de Telegram para las pruebas
          </p>
          {error && (
            <p className="mt-3 text-sm text-rose-400">{error}</p>
          )}

          <button
            type="submit"
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:from-indigo-400 hover:to-violet-500 hover:shadow-indigo-500/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            Verificar y Continuar
          </button>
        </form>
      </div>
    </div>
  )
}
