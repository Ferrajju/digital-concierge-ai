import { useCallback, useEffect, useRef, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import ChatMarkdown from '../../components/ChatMarkdown'
import { crearMensajeBienvenidaChat, obtenerPreguntasRapidas } from '../../config/guestOnboardingCopy'
import { obtenerIdiomaGuest } from '../../config/guestLanguages'
import {
  cargarConversacionHuesped,
  cargarPerfilHuesped,
  guardarHistorialHuesped,
  obtenerPropiedadGuest,
} from '../../services/huespedService'
import { enviarMensajeFlujo4 } from '../../services/n8nService'
import { obtenerSessionIdHuesped } from '../../utils/guestSession'
import type {
  MensajeHuespedChat,
  PerfilHuesped,
  PropiedadGuestInfo,
} from './types/guestChat'

const MAX_TEXTAREA_ALTURA = 128
const POLLING_MS = 3000

function formatearHora(iso: string, idioma = 'es'): string {
  try {
    return new Intl.DateTimeFormat(idioma, {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso))
  } catch {
    return ''
  }
}

export default function GuestChatPage() {
  const { propiedadId } = useParams<{ propiedadId: string }>()
  const [propiedad, setPropiedad] = useState<PropiedadGuestInfo | null>(null)
  const [perfil, setPerfil] = useState<PerfilHuesped | null>(null)
  const [sessionId, setSessionId] = useState('')
  const [mensajes, setMensajes] = useState<MensajeHuespedChat[]>([])
  const [input, setInput] = useState('')
  const [cargando, setCargando] = useState(true)
  const [perfilIncompleto, setPerfilIncompleto] = useState(false)
  const [escribiendo, setEscribiendo] = useState(false)
  const [modoAsistenciaPropietario, setModoAsistenciaPropietario] =
    useState(false)
  const [error, setError] = useState('')
  const [tecladoAbierto, setTecladoAbierto] = useState(false)

  const chatRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const mensajesRef = useRef(mensajes)
  const perfilRef = useRef(perfil)
  const modoAsistenciaRef = useRef(modoAsistenciaPropietario)

  mensajesRef.current = mensajes
  perfilRef.current = perfil
  modoAsistenciaRef.current = modoAsistenciaPropietario

  const scrollAlFinal = useCallback((suave = true) => {
    const el = chatRef.current
    if (!el) return
    el.scrollTo({
      top: el.scrollHeight,
      behavior: suave ? 'smooth' : 'auto',
    })
  }, [])

  const ajustarAlturaTextarea = useCallback(() => {
    const el = inputRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, MAX_TEXTAREA_ALTURA)}px`
  }, [])

  useEffect(() => {
    document.body.classList.add('guest-chat-active')
    return () => {
      document.body.classList.remove('guest-chat-active')
    }
  }, [])

  useEffect(() => {
    const viewport = window.visualViewport
    if (!viewport) return

    const actualizarTeclado = () => {
      const abierto = viewport.height < window.innerHeight * 0.85
      setTecladoAbierto(abierto)
      document.documentElement.style.setProperty(
        '--guest-keyboard-offset',
        `${Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop)}px`,
      )
    }

    viewport.addEventListener('resize', actualizarTeclado)
    viewport.addEventListener('scroll', actualizarTeclado)
    actualizarTeclado()

    return () => {
      viewport.removeEventListener('resize', actualizarTeclado)
      viewport.removeEventListener('scroll', actualizarTeclado)
      document.documentElement.style.removeProperty('--guest-keyboard-offset')
    }
  }, [])

  useEffect(() => {
    if (!propiedadId) {
      setError('Enlace no válido.')
      setCargando(false)
      return
    }

    let activo = true

    const iniciar = async () => {
      try {
        const sid = obtenerSessionIdHuesped(propiedadId)
        const info = await obtenerPropiedadGuest(propiedadId)

        let perfilHuesped: PerfilHuesped | null = null
        try {
          perfilHuesped = await cargarPerfilHuesped(propiedadId, sid)
        } catch (perfilErr) {
          console.warn('[GuestChat] No se pudo cargar perfil:', perfilErr)
        }

        if (!perfilHuesped?.perfilCompletado) {
          if (!activo) return
          setPerfilIncompleto(true)
          setCargando(false)
          return
        }

        let historial: MensajeHuespedChat[] = []
        let asistenciaPropietario = false
        try {
          const estado = await cargarConversacionHuesped(propiedadId, sid)
          historial = estado.mensajes
          asistenciaPropietario = estado.modoAsistenciaPropietario
        } catch (historialErr) {
          console.warn('[GuestChat] No se pudo cargar historial:', historialErr)
        }

        if (!activo) return

        setSessionId(sid)
        setPropiedad(info)
        setPerfil(perfilHuesped)
        setModoAsistenciaPropietario(asistenciaPropietario)
        setMensajes(
          historial.length > 0
            ? historial
            : [
                {
                  rol: 'assistant',
                  contenido: crearMensajeBienvenidaChat({
                    nombreAgente: info.iaIdentidad,
                    nombreHuesped: perfilHuesped.nombreHuesped,
                    idioma: perfilHuesped.idioma,
                  }),
                  timestamp: new Date().toISOString(),
                },
              ],
        )
      } catch (err) {
        if (!activo) return
        setError(
          err instanceof Error
            ? err.message
            : 'No se pudo cargar el chat del huésped.',
        )
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
    if (!propiedadId || !sessionId || perfilIncompleto) return

    let activo = true

    const sincronizar = async () => {
      try {
        const estado = await cargarConversacionHuesped(propiedadId, sessionId)
        if (!activo) return
        setMensajes(estado.mensajes)
        setModoAsistenciaPropietario(estado.modoAsistenciaPropietario)
      } catch {
        // polling silencioso
      }
    }

    const intervalo = window.setInterval(() => {
      void sincronizar()
    }, POLLING_MS)

    return () => {
      activo = false
      window.clearInterval(intervalo)
    }
  }, [propiedadId, sessionId, perfilIncompleto])

  useEffect(() => {
    scrollAlFinal(!cargando)
  }, [mensajes, escribiendo, cargando, scrollAlFinal])

  const persistirMensajes = async (lista: MensajeHuespedChat[]) => {
    if (!propiedadId || !sessionId) return
    await guardarHistorialHuesped(propiedadId, sessionId, lista)
  }

  const enviarTexto = async (texto: string) => {
    const mensaje = texto.trim()
    if (!mensaje || escribiendo || !propiedadId || !sessionId) return

    const mensajeUsuario: MensajeHuespedChat = {
      rol: 'user',
      contenido: mensaje,
      timestamp: new Date().toISOString(),
    }

    const conUsuario = [...mensajesRef.current, mensajeUsuario]
    setMensajes(conUsuario)
    setInput('')
    setError('')
    setEscribiendo(true)

    requestAnimationFrame(ajustarAlturaTextarea)

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      try {
        await persistirMensajes(conUsuario)
      } catch (persistErr) {
        console.warn('[GuestChat] No se pudo guardar antes de n8n:', persistErr)
      }

      if (modoAsistenciaRef.current) {
        setEscribiendo(false)
        inputRef.current?.focus()
        return
      }

      const historialParaN8n = conUsuario.map(({ rol, contenido }) => ({
        rol: (rol === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
        contenido:
          rol === 'propietario' ? `[Propietario]: ${contenido}` : contenido,
      }))

      const data = await enviarMensajeFlujo4(
        {
          propiedad_id: propiedadId,
          session_id: sessionId,
          mensaje: mensaje,
          historial: historialParaN8n,
          idioma: perfilRef.current?.idioma,
          idioma_nombre:
            obtenerIdiomaGuest(perfilRef.current?.idioma ?? 'es')?.native ??
            perfilRef.current?.idioma,
          nombre_huesped: perfilRef.current?.nombreHuesped,
          ia_identidad: propiedad?.iaIdentidad,
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

      setMensajes(mensajesRef.current)
      setInput(mensaje)
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo enviar el mensaje. Inténtalo de nuevo.',
      )
      requestAnimationFrame(ajustarAlturaTextarea)
    } finally {
      setEscribiendo(false)
      inputRef.current?.focus()
    }
  }

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    void enviarTexto(input)
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void enviarTexto(input)
    }
  }

  const mostrarSugerencias =
    !escribiendo && mensajes.length <= 2 && !input.trim()

  if (perfilIncompleto && propiedadId) {
    return <Navigate to={`/guest/${propiedadId}`} replace />
  }

  if (cargando) {
    return (
      <div className="guest-chat-shell flex items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 h-11 w-11 animate-spin rounded-full border-[3px] border-emerald-500/20 border-t-emerald-400" />
          <p className="text-sm text-slate-400">Preparando tu conserje...</p>
        </div>
      </div>
    )
  }

  if (error && !propiedad) {
    return (
      <div className="guest-chat-shell flex items-center justify-center px-6 text-center">
        <div>
          <p className="text-lg font-semibold text-white">Enlace no disponible</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">{error}</p>
        </div>
      </div>
    )
  }

  const nombreAgente = propiedad?.iaIdentidad ?? 'Conserje'
  const idiomaHuesped = perfil?.idioma ?? 'es'
  const preguntasRapidas = obtenerPreguntasRapidas(idiomaHuesped)

  return (
    <div className="guest-chat-shell">
      <header className="guest-chat-header shrink-0 border-b border-white/5 bg-[#111b21]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-3">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-lg font-bold text-white shadow-lg shadow-emerald-500/20"
            aria-hidden
          >
            {nombreAgente.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[17px] font-semibold leading-tight text-white">
              {propiedad?.nombreApartamento}
            </h1>
            <p className="truncate text-xs text-emerald-300/90">
              {propiedad?.direccionCompleta || 'Tu alojamiento'}
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-500">
              <span
                className={`inline-block h-1.5 w-1.5 rounded-full ${
                  modoAsistenciaPropietario ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
              />
              {modoAsistenciaPropietario
                ? 'Propietario · te atiende personalmente'
                : `${nombreAgente} · en línea`}
            </p>
          </div>
        </div>
        {modoAsistenciaPropietario && (
          <div className="mx-auto mt-2 max-w-lg px-4">
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-center text-xs text-amber-100">
              El conserje automático está en pausa. El propietario responderá a
              tus mensajes.
            </div>
          </div>
        )}
      </header>

      <main
        ref={chatRef}
        className="guest-chat-messages mx-auto w-full max-w-lg flex-1 overflow-y-auto overscroll-contain px-3 py-4"
        aria-live="polite"
        aria-relevant="additions"
      >
        <div className="flex flex-col gap-3 pb-2">
          {error && propiedad && (
            <div
              role="alert"
              className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm leading-relaxed text-rose-200"
            >
              {error}
            </div>
          )}

          {mensajes.map((mensaje, index) => {
            const esUsuario = mensaje.rol === 'user'
            const esPropietario = mensaje.rol === 'propietario'
            const hora = formatearHora(mensaje.timestamp, idiomaHuesped)

            return (
              <div
                key={`${mensaje.timestamp}-${index}`}
                className={`flex ${esUsuario ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[92%] sm:max-w-[85%] ${
                    esUsuario ? 'items-end' : 'items-start'
                  } flex flex-col gap-1`}
                >
                  <div
                    className={`rounded-2xl px-4 py-3 text-[16px] leading-relaxed shadow-sm ${
                      esUsuario
                        ? 'rounded-br-md bg-[#005c4b] text-white'
                        : 'rounded-bl-md bg-[#202c33] text-slate-100'
                    }`}
                  >
                    {!esUsuario && (
                      <p
                        className={`mb-1.5 text-[10px] font-semibold uppercase tracking-wider ${
                          esPropietario
                            ? 'text-amber-300/90'
                            : 'text-emerald-400/80'
                        }`}
                      >
                        {esPropietario ? 'Propietario' : nombreAgente}
                      </p>
                    )}
                    {esUsuario ? (
                      <p className="whitespace-pre-wrap break-words">
                        {mensaje.contenido}
                      </p>
                    ) : (
                      <ChatMarkdown contenido={mensaje.contenido} />
                    )}
                  </div>
                  {hora && (
                    <span
                      className={`px-1 text-[10px] text-slate-500 ${
                        esUsuario ? 'text-right' : 'text-left'
                      }`}
                    >
                      {hora}
                    </span>
                  )}
                </div>
              </div>
            )
          })}

          {escribiendo && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-md bg-[#202c33] px-4 py-3.5">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-400/80 [animation-delay:0ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-400/80 [animation-delay:150ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-400/80 [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer
        className="guest-chat-footer shrink-0 border-t border-white/5 bg-[#111b21]/98 backdrop-blur-md"
        style={{
          paddingBottom: tecladoAbierto
            ? 'max(0.5rem, env(safe-area-inset-bottom))'
            : undefined,
        }}
      >
        {mostrarSugerencias && (
          <div className="mx-auto max-w-lg px-3 pt-3">
            <p className="mb-2 px-1 text-[11px] font-medium uppercase tracking-wider text-slate-500">
              Preguntas frecuentes
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {preguntasRapidas.map((pregunta) => (
                <button
                  key={pregunta}
                  type="button"
                  onClick={() => void enviarTexto(pregunta)}
                  className="shrink-0 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-4 py-2.5 text-sm font-medium text-emerald-100 transition-colors active:scale-[0.98] active:bg-emerald-500/20"
                >
                  {pregunta}
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={sendMessage} className="mx-auto max-w-lg px-3 py-3">
          <div className="flex items-end gap-2">
            <label htmlFor="guest-chat-input" className="sr-only">
              Escribe tu pregunta
            </label>
            <textarea
              id="guest-chat-input"
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                ajustarAlturaTextarea()
              }}
              onKeyDown={handleInputKeyDown}
              onFocus={() => {
                setTimeout(() => scrollAlFinal(true), 150)
              }}
              placeholder="Escribe tu pregunta..."
              disabled={escribiendo}
              enterKeyHint="send"
              inputMode="text"
              autoComplete="off"
              autoCorrect="on"
              spellCheck
              className="max-h-32 min-h-[48px] flex-1 resize-none rounded-3xl border border-white/10 bg-[#202c33] px-4 py-3 text-[16px] leading-snug text-white placeholder:text-slate-500 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || escribiendo}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
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
          <p className="mt-2 px-1 text-center text-[10px] text-slate-600">
            Enter para enviar · Shift+Enter para nueva línea
          </p>
        </form>
      </footer>
    </div>
  )
}
