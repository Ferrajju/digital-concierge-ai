import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  cargarHistorialHuesped,
  guardarHistorialHuesped,
  obtenerPropiedadGuest,
} from '../../services/huespedService'
import { enviarMensajeFlujo4 } from '../../services/n8nService'
import { obtenerSessionIdHuesped } from '../../utils/guestSession'
import ChatMarkdown from '../../components/ChatMarkdown'
import type {
  MensajeHuespedChat,
  PropiedadGuestInfo,
} from './types/guestChat'

function crearMensajeBienvenida(nombreAgente: string): MensajeHuespedChat {
  return {
    rol: 'assistant',
    contenido: `¡Hola! Soy ${nombreAgente}, tu conserje digital. Pregúntame lo que necesites sobre el alojamiento, la zona o tu estancia.`,
    timestamp: new Date().toISOString(),
  }
}

export default function GuestChatPage() {
  const { propiedadId } = useParams<{ propiedadId: string }>()
  const [propiedad, setPropiedad] = useState<PropiedadGuestInfo | null>(null)
  const [sessionId, setSessionId] = useState('')
  const [mensajes, setMensajes] = useState<MensajeHuespedChat[]>([])
  const [input, setInput] = useState('')
  const [cargando, setCargando] = useState(true)
  const [escribiendo, setEscribiendo] = useState(false)
  const [error, setError] = useState('')

  const chatRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    console.log('[GuestChat] useEffect — propiedadId (params):', propiedadId)

    if (!propiedadId) {
      console.warn('[GuestChat] propiedadId undefined — enlace inválido')
      setError('Enlace no válido.')
      setCargando(false)
      return
    }

    let activo = true

    const iniciar = async () => {
      try {
        const sid = obtenerSessionIdHuesped(propiedadId)
        console.log('[GuestChat] session_id generado/recuperado:', sid)

        const info = await obtenerPropiedadGuest(propiedadId)

        let historial: MensajeHuespedChat[] = []
        try {
          historial = await cargarHistorialHuesped(propiedadId, sid)
        } catch (historialErr) {
          console.warn(
            '[GuestChat] No se pudo cargar historial (no bloquea el chat):',
            historialErr,
          )
        }

        if (!activo) return

        setSessionId(sid)
        setPropiedad(info)

        if (historial.length > 0) {
          setMensajes(historial)
        } else {
          setMensajes([crearMensajeBienvenida(info.iaIdentidad)])
        }
      } catch (err) {
        if (!activo) return
        console.error('[GuestChat] Error al iniciar chat:', err)
        const mensaje =
          err instanceof Error
            ? err.message
            : typeof err === 'object' && err !== null && 'message' in err
              ? String((err as { message: unknown }).message)
              : 'No se pudo cargar el chat del huésped.'
        setError(mensaje)
      } finally {
        if (activo) setCargando(false)
      }
    }

    iniciar()

    return () => {
      activo = false
      abortRef.current?.abort()
    }
  }, [propiedadId])

  useEffect(() => {
    const el = chatRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [mensajes, escribiendo])

  const persistirMensajes = async (lista: MensajeHuespedChat[]) => {
    if (!propiedadId || !sessionId) return
    await guardarHistorialHuesped(propiedadId, sessionId, lista)
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    const texto = input.trim()
    if (!texto || escribiendo || !propiedadId || !sessionId) return

    const mensajeUsuario: MensajeHuespedChat = {
      rol: 'user',
      contenido: texto,
      timestamp: new Date().toISOString(),
    }

    const conUsuario = [...mensajes, mensajeUsuario]
    setMensajes(conUsuario)
    setInput('')
    setError('')
    setEscribiendo(true)

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      try {
        await persistirMensajes(conUsuario)
      } catch (persistErr) {
        console.warn(
          '[GuestChat] No se pudo guardar antes de n8n (continúa Flujo 4):',
          persistErr,
        )
      }

      const historialParaN8n = conUsuario.map(({ rol, contenido }) => ({
        rol,
        contenido,
      }))

      const data = await enviarMensajeFlujo4(
        {
          propiedad_id: propiedadId,
          session_id: sessionId,
          mensaje: texto,
          historial: historialParaN8n,
        },
        controller.signal,
      )

      const mensajeAsistente: MensajeHuespedChat = {
        rol: 'assistant',
        contenido: data.respuesta,
        timestamp: new Date().toISOString(),
      }

      const conRespuesta = [...conUsuario, mensajeAsistente]
      setMensajes(conRespuesta)
      try {
        await persistirMensajes(conRespuesta)
      } catch (persistErr) {
        console.warn('[GuestChat] No se pudo guardar respuesta:', persistErr)
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return

      setMensajes(mensajes)
      setInput(texto)
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo enviar el mensaje. Inténtalo de nuevo.',
      )
    } finally {
      setEscribiendo(false)
      inputRef.current?.focus()
    }
  }

  if (cargando) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[#0b141a] px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-[3px] border-emerald-500/20 border-t-emerald-400" />
          <p className="text-sm text-slate-400">Preparando tu conserje...</p>
        </div>
      </div>
    )
  }

  if (error && !propiedad) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[#0b141a] px-6 text-center">
        <div>
          <p className="text-lg font-semibold text-white">Enlace no disponible</p>
          <p className="mt-2 text-sm text-slate-400">{error}</p>
        </div>
      </div>
    )
  }

  const nombreAgente = propiedad?.iaIdentidad ?? 'Conserje'

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#0b141a] text-slate-100">
      <header className="sticky top-0 z-20 border-b border-white/5 bg-[#111b21]/95 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-lg font-bold text-white shadow-lg shadow-emerald-500/20">
            {nombreAgente.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-semibold text-white">
              {propiedad?.nombreApartamento}
            </h1>
            <p className="truncate text-xs text-emerald-300/90">
              {propiedad?.direccionCompleta || 'Tu alojamiento'}
            </p>
            <p className="mt-0.5 text-[10px] text-slate-500">
              Conserje: {nombreAgente}
            </p>
          </div>
        </div>
      </header>

      <div
        ref={chatRef}
        className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-3 overflow-y-auto px-3 py-4"
      >
        {error && propiedad && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
            {error}
          </div>
        )}

        {mensajes.map((mensaje, index) => {
          const esUsuario = mensaje.rol === 'user'
          return (
            <div
              key={`${mensaje.timestamp}-${index}`}
              className={`flex ${esUsuario ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[15px] leading-relaxed shadow-sm ${
                  esUsuario
                    ? 'rounded-br-md bg-[#005c4b] text-white'
                    : 'rounded-bl-md bg-[#202c33] text-slate-100'
                }`}
              >
                {!esUsuario && (
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-400/80">
                    {nombreAgente}
                  </p>
                )}
                {esUsuario ? (
                  <p className="whitespace-pre-wrap">{mensaje.contenido}</p>
                ) : (
                  <ChatMarkdown contenido={mensaje.contenido} />
                )}
              </div>
            </div>
          )
        })}

        {escribiendo && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-md bg-[#202c33] px-4 py-3">
              <div className="flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-500 [animation-delay:0ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-500 [animation-delay:150ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-500 [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={sendMessage}
        className="sticky bottom-0 border-t border-white/5 bg-[#111b21] px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      >
        <div className="mx-auto flex max-w-lg items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu pregunta..."
            disabled={escribiendo}
            className="flex-1 rounded-full border border-white/10 bg-[#202c33] px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || escribiendo}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 transition-all hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Enviar mensaje"
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5 translate-x-0.5"
              aria-hidden
            >
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  )
}
