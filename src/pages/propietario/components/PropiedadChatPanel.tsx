import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  enviarMensajeFlujo1,
  procesarConversacionFlujo2,
} from '../../../services/n8nService'
import type { MensajeChat } from '../types/propiedadChat'

const MENSAJE_INICIAL_IA: MensajeChat = {
  id: 'inicial',
  remitente: 'ia',
  texto:
    '¡Perfecto! Vamos a configurar tu alojamiento. Háblame libremente de tu casa: ¿Cómo entran los huéspedes o dónde dejas las llaves? ¿Cuál es la clave del Wi-Fi o qué normas importantes de ruido tienes?',
}

type PropiedadChatPanelProps = {
  propiedadId: string
  nombreVivienda: string
}

export default function PropiedadChatPanel({
  propiedadId,
  nombreVivienda,
}: PropiedadChatPanelProps) {
  const navigate = useNavigate()
  const [mensajes, setMensajes] = useState<MensajeChat[]>([MENSAJE_INICIAL_IA])
  const [input, setInput] = useState('')
  const [escribiendo, setEscribiendo] = useState(false)
  const [error, setError] = useState('')
  const [procesando, setProcesando] = useState(false)
  const mensajesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes, escribiendo])

  const handleEnviar = async (e: React.FormEvent) => {
    e.preventDefault()
    const texto = input.trim()
    if (!texto || escribiendo) return

    const mensajePropietario: MensajeChat = {
      id: crypto.randomUUID(),
      remitente: 'propietario',
      texto,
    }

    setMensajes((prev) => [...prev, mensajePropietario])
    setInput('')
    setError('')
    setEscribiendo(true)

    try {
      const respuestaIa = await enviarMensajeFlujo1({
        propiedad_id: propiedadId,
        mensaje: texto,
      })

      setMensajes((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          remitente: 'ia',
          texto: respuestaIa,
        },
      ])
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudo contactar con n8n.',
      )
    } finally {
      setEscribiendo(false)
    }
  }

  const handleFinalizar = async () => {
    if (procesando) return

    setProcesando(true)
    setError('')

    try {
      await procesarConversacionFlujo2({ propiedad_id: propiedadId })
      navigate('/')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo completar el procesamiento.',
      )
      setProcesando(false)
    }
  }

  return (
    <>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-400">
            Entrevista con la IA
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            {nombreVivienda}
          </h1>
          <p className="mt-2 text-xs text-slate-500">
            ID: <span className="font-mono text-slate-400">{propiedadId}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={handleFinalizar}
          disabled={procesando || escribiendo}
          className="shrink-0 rounded-xl border border-indigo-500/40 bg-indigo-500/10 px-4 py-2 text-xs font-semibold text-indigo-300 transition-colors hover:border-indigo-400/60 hover:bg-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Finalizar y Procesar AI
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </div>
      )}

      <div className="flex h-[calc(100vh-14rem)] min-h-[480px] flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm">
        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-6 sm:px-6">
          {mensajes.map((mensaje) => (
            <div
              key={mensaje.id}
              className={`flex ${
                mensaje.remitente === 'propietario'
                  ? 'justify-end'
                  : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed sm:max-w-[75%] ${
                  mensaje.remitente === 'propietario'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-200 ring-1 ring-slate-700'
                }`}
              >
                {mensaje.remitente === 'ia' && (
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-indigo-400">
                    Asistente IA
                  </p>
                )}
                {mensaje.texto}
              </div>
            </div>
          ))}

          {escribiendo && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-slate-800 px-4 py-3 ring-1 ring-slate-700">
                <p className="text-xs text-slate-400">La IA está respondiendo...</p>
              </div>
            </div>
          )}

          <div ref={mensajesEndRef} />
        </div>

        <form
          onSubmit={handleEnviar}
          className="border-t border-slate-800 bg-slate-950/50 p-4 sm:p-5"
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe tu alojamiento libremente..."
              disabled={escribiendo || procesando}
              className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white placeholder:text-slate-600 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || escribiendo || procesando}
              className="shrink-0 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:from-indigo-400 hover:to-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Enviar información
            </button>
          </div>
        </form>
      </div>

      {procesando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md">
          <div className="mx-6 w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900/90 p-8 text-center shadow-2xl">
            <div className="mx-auto mb-6 h-14 w-14 animate-spin rounded-full border-[3px] border-indigo-500/20 border-t-indigo-400" />
            <p className="text-lg font-semibold leading-relaxed text-white">
              Procesando toda la conversación y generando tus tarjetas
              vectoriales... Por favor, no cierres esta ventana.
            </p>
          </div>
        </div>
      )}
    </>
  )
}
