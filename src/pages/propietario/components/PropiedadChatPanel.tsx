import { useEffect, useRef, useState } from 'react'
import {
  buildHistorial,
  cargarConversacion,
  guardarMensajeConversacion,
} from '../../../services/conversacionService'
import { enviarMensajeFlujo1 } from '../../../services/n8nService'
import type { MensajeChat } from '../types/propiedadChat'

const DELAY_CIERRE_MS = 1500

const MENSAJE_INICIAL_IA: MensajeChat = {
  id: 'inicial',
  remitente: 'ia',
  texto:
    '¡Perfecto! Vamos a configurar tu alojamiento. Háblame libremente de tu casa: ¿Cómo entran los huéspedes o dónde dejas las llaves? ¿Cuál es la clave del Wi-Fi o qué normas importantes de ruido tienes?',
}

type PropiedadChatPanelProps = {
  propiedadId: string
  nombreVivienda: string
  nombreIa: string
  onEntrevistaCompletada: () => void
}

export default function PropiedadChatPanel({
  propiedadId,
  nombreVivienda,
  nombreIa,
  onEntrevistaCompletada,
}: PropiedadChatPanelProps) {
  const [mensajes, setMensajes] = useState<MensajeChat[]>([MENSAJE_INICIAL_IA])
  const [input, setInput] = useState('')
  const [escribiendo, setEscribiendo] = useState(false)
  const [entrevistaFinalizada, setEntrevistaFinalizada] = useState(false)
  const [cargandoHistorial, setCargandoHistorial] = useState(true)
  const [error, setError] = useState('')
  const mensajesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const cierreTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const chatBloqueado = escribiendo || entrevistaFinalizada

  useEffect(() => {
    let activo = true

    const cargar = async () => {
      try {
        const historial = await cargarConversacion(propiedadId)
        if (!activo) return
        if (historial.length > 0) {
          setMensajes(historial)
        }
      } catch (err) {
        if (!activo) return
        setError(
          err instanceof Error
            ? err.message
            : 'No se pudo cargar la conversación.',
        )
      } finally {
        if (activo) setCargandoHistorial(false)
      }
    }

    cargar()

    return () => {
      activo = false
      abortRef.current?.abort()
      if (cierreTimeoutRef.current) clearTimeout(cierreTimeoutRef.current)
    }
  }, [propiedadId])

  useEffect(() => {
    const container = chatContainerRef.current
    if (container) {
      container.scrollTop = container.scrollHeight
    }
    mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes, escribiendo])

  const evaluarCierreEntrevista = (finalizado: boolean) => {
    if (finalizado) {
      setEntrevistaFinalizada(true)
      cierreTimeoutRef.current = setTimeout(() => {
        onEntrevistaCompletada()
      }, DELAY_CIERRE_MS)
      return
    }

    requestAnimationFrame(() => {
      inputRef.current?.focus()
    })
  }

  const handleEnviar = async (e: React.FormEvent) => {
    e.preventDefault()
    const texto = input.trim()
    if (!texto || chatBloqueado) return

    const historial = buildHistorial(mensajes)

    const mensajeOptimista: MensajeChat = {
      id: crypto.randomUUID(),
      remitente: 'propietario',
      texto,
    }

    setMensajes((prev) => [...prev, mensajeOptimista])
    setInput('')
    setError('')
    setEscribiendo(true)

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const mensajeGuardado = await guardarMensajeConversacion(
        propiedadId,
        'propietario',
        texto,
      )

      setMensajes((prev) =>
        prev.map((m) => (m.id === mensajeOptimista.id ? mensajeGuardado : m)),
      )

      const data = await enviarMensajeFlujo1(
        {
          propiedad_id: propiedadId,
          mensaje: texto,
          historial,
        },
        controller.signal,
      )

      const mensajeIaOptimista: MensajeChat = {
        id: crypto.randomUUID(),
        remitente: 'ia',
        texto: data.respuesta,
      }

      setMensajes((prev) => [...prev, mensajeIaOptimista])
      setEscribiendo(false)
      evaluarCierreEntrevista(data.finalizado)

      const mensajeIaGuardado = await guardarMensajeConversacion(
        propiedadId,
        'ia',
        data.respuesta,
      )

      setMensajes((prev) =>
        prev.map((m) =>
          m.id === mensajeIaOptimista.id ? mensajeIaGuardado : m,
        ),
      )
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return

      setMensajes((prev) => prev.filter((m) => m.id !== mensajeOptimista.id))
      setError(
        err instanceof Error ? err.message : 'No se pudo contactar con n8n.',
      )
      setEscribiendo(false)
    }
  }

  if (cargandoHistorial) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-[3px] border-indigo-500/20 border-t-indigo-400" />
          <p className="text-sm text-slate-400">Cargando conversación...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="mb-6 text-center sm:text-left">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-400">
          Paso 4 de 6 · Entrevista con {nombreIa}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Configura {nombreVivienda}
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Cuéntale a {nombreIa} todo lo que un huésped necesita saber: accesos,
          Wi-Fi, normas y más.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </div>
      )}

      <div className="flex h-[calc(100vh-14rem)] min-h-[480px] flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm">
        <div
          ref={chatContainerRef}
          className="flex-1 space-y-4 overflow-y-auto px-5 py-6 sm:px-6"
        >
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
                    {nombreIa}
                  </p>
                )}
                {mensaje.texto}
              </div>
            </div>
          ))}

          {escribiendo && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-slate-800 px-4 py-3 ring-1 ring-slate-700">
                <p className="text-xs text-slate-400">
                  La IA está escribiendo y tomando notas...
                </p>
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
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                entrevistaFinalizada
                  ? 'Entrevista completada. Preparando revisión...'
                  : 'Describe tu alojamiento libremente...'
              }
              disabled={chatBloqueado}
              className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white placeholder:text-slate-600 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || chatBloqueado}
              className="shrink-0 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:from-indigo-400 hover:to-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Enviar información
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
