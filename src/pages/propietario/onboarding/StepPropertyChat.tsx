import { useEffect, useRef, useState } from 'react'
import type { ChatMessage } from './types'

const INITIAL_AI_MESSAGE: ChatMessage = {
  id: 'initial',
  role: 'assistant',
  content:
    '¡Perfecto! Vamos a configurar tu primer alojamiento. Háblame libremente de tu casa: ¿Cómo se llama el apartamento? ¿Cómo entran los huéspedes o dónde dejas las llaves? ¿Cuál es la clave del Wi-Fi o qué normas importantes de ruido tienes?',
}

type StepPropertyChatProps = {
  onFinish: () => void
}

export default function StepPropertyChat({ onFinish }: StepPropertyChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_AI_MESSAGE])
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  /**
   * Envía el texto libre del propietario al webhook de n8n.
   * n8n procesará el mensaje con un LLM, lo troceará en fragmentos
   * estructurados y alimentará la tabla 'propiedad_conocimiento' en Supabase.
   *
   * TODO: Configurar la URL del webhook y el payload cuando n8n esté listo.
   */
  const handleSendToN8n = async (userMessage: string): Promise<void> => {
    // const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_ONBOARDING_WEBHOOK_URL
    //
    // await fetch(N8N_WEBHOOK_URL, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     message: userMessage,
    //     source: 'onboarding_propietario',
    //   }),
    // })

    void userMessage
    await new Promise((resolve) => setTimeout(resolve, 600))
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || isSending) return

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsSending(true)

    try {
      await handleSendToN8n(trimmed)

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content:
          'Información recibida. Cuando n8n esté conectado, procesaré tus datos y los guardaré en la base de conocimiento de tu propiedad.',
      }
      setMessages((prev) => [...prev, assistantMessage])
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="animate-fade-in-up">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-400">
            Paso 3 de 3
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Asistente de Configuración Inicial
          </h1>
        </div>
        <button
          type="button"
          onClick={onFinish}
          className="shrink-0 rounded-lg border border-slate-700 bg-slate-800/60 px-4 py-2 text-xs font-medium text-slate-400 transition-colors hover:border-slate-600 hover:bg-slate-800 hover:text-slate-200"
        >
          Finalizar Onboarding
        </button>
      </div>

      <div className="flex h-[calc(100vh-22rem)] min-h-[420px] flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm">
        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-6 sm:px-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed sm:max-w-[75%] ${
                  message.role === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-200 ring-1 ring-slate-700'
                }`}
              >
                {message.role === 'assistant' && (
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-indigo-400">
                    Asistente IA
                  </p>
                )}
                {message.content}
              </div>
            </div>
          ))}
          {isSending && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-slate-800 px-4 py-3 ring-1 ring-slate-700">
                <span className="inline-flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400 [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400 [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400" />
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form
          onSubmit={handleSend}
          className="border-t border-slate-800 bg-slate-950/50 p-4 sm:p-5"
        >
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe tu alojamiento libremente..."
              disabled={isSending}
              className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white placeholder:text-slate-600 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isSending}
              className="shrink-0 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:from-indigo-400 hover:to-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Enviar información
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
