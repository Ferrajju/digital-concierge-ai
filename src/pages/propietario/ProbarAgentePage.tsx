import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ChatMarkdown from '../../components/ChatMarkdown'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import HostFeedback from '../../components/ui/HostFeedback'
import HostPageShell from '../../components/ui/HostPageShell'
import { HostLoading } from '../../components/ui/HostShell'
import { inputClassName } from '../../components/ui/inputClassName'
import { useHostScreen } from '../../hooks/useHostScreen'
import { obtenerPropiedadGuest } from '../../services/huespedService'
import { enviarMensajeFlujo4 } from '../../services/n8nService'
import { obtenerPropietarioId } from '../../services/propiedadService'
import {
  cargarHistorialPrueba,
  eliminarConversacionPrueba,
  guardarHistorialPrueba,
} from '../../services/pruebaAgenteService'
import {
  obtenerSessionIdPrueba,
  reiniciarSessionIdPrueba,
} from '../../utils/pruebaSession'
import type {
  MensajeHuespedChat,
  PropiedadGuestInfo,
} from '../huesped/types/guestChat'

const PREGUNTAS_RAPIDAS = [
  '¿Cuál es la clave del Wi-Fi?',
  'Hay una fuga de agua urgente',
  '¿Horario de check-out?',
  'La calefacción no funciona',
] as const

const MAX_TEXTAREA_ALTURA = 128

function crearMensajeBienvenida(nombreAgente: string): MensajeHuespedChat {
  return {
    rol: 'assistant',
    contenido: `**Modo simulacro** — Estás probando a **${nombreAgente}** como si fueras un huésped.\n\nLas alertas de Telegram que dispares llegarán marcadas como **SIMULACRO**. Esta conversación es temporal y **no aparece** en tus chats de huéspedes reales.\n\nPregunta lo que quieras o prueba una incidencia (fuga, avería…) para comprobar las alertas.`,
    timestamp: new Date().toISOString(),
  }
}

function formatearHora(iso: string): string {
  try {
    return new Intl.DateTimeFormat('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso))
  } catch {
    return ''
  }
}

export default function ProbarAgentePage() {
  const { propiedadId } = useParams<{ propiedadId: string }>()
  const navigate = useNavigate()

  const [propiedad, setPropiedad] = useState<PropiedadGuestInfo | null>(null)
  const [sessionId, setSessionId] = useState('')
  const [mensajes, setMensajes] = useState<MensajeHuespedChat[]>([])
  const [input, setInput] = useState('')
  const [cargando, setCargando] = useState(true)
  const [escribiendo, setEscribiendo] = useState(false)
  const [error, setError] = useState('')

  const chatRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const mensajesRef = useRef(mensajes)
  const sessionIdRef = useRef(sessionId)

  mensajesRef.current = mensajes
  sessionIdRef.current = sessionId

  useHostScreen({
    screenId: 'probar-agente',
    screenTitle: 'Probar conserje (simulacro)',
    propiedadId,
  })

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

  const limpiarSesionActual = useCallback(async () => {
    if (!propiedadId || !sessionIdRef.current) return
    try {
      await eliminarConversacionPrueba(propiedadId, sessionIdRef.current)
    } catch (err) {
      console.warn('[ProbarAgente] No se pudo borrar conversación:', err)
    }
  }, [propiedadId])

  useEffect(() => {
    if (!propiedadId) {
      setError('Propiedad no válida.')
      setCargando(false)
      return
    }

    let activo = true

    const iniciar = async () => {
      try {
        await obtenerPropietarioId()
        const sid = obtenerSessionIdPrueba(propiedadId)
        const info = await obtenerPropiedadGuest(propiedadId)

        let historial: MensajeHuespedChat[] = []
        try {
          historial = await cargarHistorialPrueba(propiedadId, sid)
        } catch (historialErr) {
          console.warn('[ProbarAgente] No se pudo cargar historial:', historialErr)
        }

        if (!activo) return

        setSessionId(sid)
        setPropiedad(info)
        setMensajes(
          historial.length > 0
            ? historial
            : [crearMensajeBienvenida(info.iaIdentidad)],
        )
      } catch (err) {
        if (!activo) return
        if (err instanceof Error && err.message.includes('iniciar sesión')) {
          navigate('/auth')
          return
        }
        setError(
          err instanceof Error
            ? err.message
            : 'No se pudo cargar el simulacro del conserje.',
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
  }, [propiedadId, navigate])

  useEffect(() => {
    scrollAlFinal(!cargando)
  }, [mensajes, escribiendo, cargando, scrollAlFinal])

  const persistirMensajes = async (lista: MensajeHuespedChat[]) => {
    if (!propiedadId || !sessionId) return
    await guardarHistorialPrueba(propiedadId, sessionId, lista)
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
        console.warn('[ProbarAgente] No se pudo guardar antes de n8n:', persistErr)
      }

      const historialParaN8n = conUsuario.map(({ rol, contenido }) => ({
        rol,
        contenido,
      }))

      const data = await enviarMensajeFlujo4(
        {
          propiedad_id: propiedadId,
          session_id: sessionId,
          mensaje: mensaje,
          historial: historialParaN8n,
          modo_prueba: true,
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
        console.warn('[ProbarAgente] No se pudo guardar respuesta:', persistErr)
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

  const nuevaPrueba = async () => {
    if (!propiedadId || !propiedad) return

    abortRef.current?.abort()
    setEscribiendo(false)
    setError('')
    setInput('')

    await limpiarSesionActual()
    const sid = reiniciarSessionIdPrueba(propiedadId)
    setSessionId(sid)
    setMensajes([crearMensajeBienvenida(propiedad.iaIdentidad)])
    requestAnimationFrame(ajustarAlturaTextarea)
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

  const nombreAgente = propiedad?.iaIdentidad ?? 'Conserje'
  const hubPath = `/propiedad/${propiedadId}/gestionar`

  if (!propiedadId) {
    return null
  }

  if (cargando) {
    return (
      <HostPageShell
        backTo={hubPath}
        backLabel="Volver al hub"
        eyebrow="Simulacro del conserje"
        title="Preparando simulacro..."
      >
        <HostLoading label="Cargando chat de prueba..." />
      </HostPageShell>
    )
  }

  if (error && !propiedad) {
    return (
      <HostPageShell
        backTo={hubPath}
        backLabel="Volver al hub"
        eyebrow="Simulacro del conserje"
        title="Simulacro no disponible"
      >
        <HostFeedback>{error}</HostFeedback>
        <div className="mt-6">
          <Button to={hubPath} variant="secondary">
            Volver al hub
          </Button>
        </div>
      </HostPageShell>
    )
  }

  return (
    <HostPageShell
      backTo={hubPath}
      backLabel="Volver al hub"
      eyebrow="Simulacro del conserje"
      title={propiedad?.nombreApartamento ?? 'Probar conserje'}
      description={`Prueba a ${nombreAgente} como un huésped real. Las alertas Telegram llegan marcadas como simulacro y esta conversación no aparece en tus chats.`}
      headerExtra={
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => void nuevaPrueba()}
          disabled={escribiendo}
        >
          Nueva conversación
        </Button>
      }
    >
      <HostFeedback variant="warning" className="mb-6">
        <strong>Modo simulacro.</strong> Lo que escribas aquí no contamina el
        listado de huéspedes. Si disparas una incidencia, la alerta en Telegram
        irá precedida de «SIMULACRO — Prueba del propietario».
      </HostFeedback>

      {error && propiedad && (
        <HostFeedback className="mb-6">{error}</HostFeedback>
      )}

      <Card padding="none" className="overflow-hidden shadow-card-hover">
        <div className="grid min-h-[min(72vh,820px)] lg:grid-cols-[minmax(260px,300px)_minmax(0,1fr)]">
          <aside className="border-b border-host-border bg-teal-50/50 px-4 py-5 sm:px-5 lg:border-b-0 lg:border-r">
            <div className="flex items-center gap-3">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-host-primary text-base font-bold text-white shadow-sm"
                aria-hidden
              >
                {nombreAgente.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-host-text">
                  {nombreAgente}
                </p>
                <p className="mt-0.5 text-xs text-host-muted">
                  Vista huésped · en línea
                </p>
              </div>
            </div>

            {propiedad?.direccionCompleta && (
              <p className="mt-4 text-xs leading-relaxed text-host-muted">
                {propiedad.direccionCompleta}
              </p>
            )}

            <div className="mt-5 rounded-xl border border-teal-200 bg-white/80 px-3 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-host-primary">
                Qué ocurre en el simulacro
              </p>
              <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-host-muted">
                <li>· Respuestas reales del Flujo 4</li>
                <li>· Alertas Telegram con etiqueta de prueba</li>
                <li>· Conversación temporal al salir</li>
              </ul>
            </div>

            {mostrarSugerencias && (
              <div className="mt-5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-host-muted">
                  Prueba rápida
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {PREGUNTAS_RAPIDAS.map((pregunta) => (
                    <button
                      key={pregunta}
                      type="button"
                      onClick={() => void enviarTexto(pregunta)}
                      className="rounded-full border border-teal-200 bg-white px-3 py-2 text-left text-xs font-medium text-host-text transition-colors hover:border-teal-300 hover:bg-teal-50"
                    >
                      {pregunta}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </aside>

          <div className="flex min-h-[55vh] flex-col lg:min-h-0">
            <div className="border-b border-host-border bg-host-surface px-4 py-3 sm:px-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-host-muted">
                Conversación de prueba
              </p>
              <p className="mt-1 text-sm text-host-text">
                Escribe como un huésped para comprobar respuestas y alertas.
              </p>
            </div>

            <div
              ref={chatRef}
              className="flex-1 overflow-y-auto bg-stone-50/50 px-4 py-4 sm:px-6"
              aria-live="polite"
              aria-relevant="additions"
            >
              <div className="mx-auto flex max-w-3xl flex-col gap-3 pb-2">
                {mensajes.map((mensaje, index) => {
                  const esUsuario = mensaje.rol === 'user'
                  const hora = formatearHora(mensaje.timestamp)

                  return (
                    <div
                      key={`${mensaje.timestamp}-${index}`}
                      className={`flex ${esUsuario ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className="max-w-[92%] sm:max-w-[85%] lg:max-w-[75%]">
                        <div
                          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                            esUsuario
                              ? 'rounded-br-md bg-host-primary text-white'
                              : 'rounded-bl-md border border-host-border bg-host-surface text-host-text'
                          }`}
                        >
                          {!esUsuario && (
                            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-host-primary">
                              {nombreAgente}
                            </p>
                          )}
                          {esUsuario ? (
                            <p className="whitespace-pre-wrap break-words">
                              {mensaje.contenido}
                            </p>
                          ) : (
                            <ChatMarkdown
                              contenido={mensaje.contenido}
                              variant="light"
                            />
                          )}
                        </div>
                        {hora && (
                          <p
                            className={`mt-1 px-1 text-[10px] text-stone-400 ${
                              esUsuario ? 'text-right' : 'text-left'
                            }`}
                          >
                            {esUsuario ? 'Tú (simulando huésped)' : nombreAgente}{' '}
                            · {hora}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}

                {escribiendo && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl border border-host-border bg-host-surface px-4 py-3 shadow-sm">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-host-primary/70 [animation-delay:0ms]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-host-primary/70 [animation-delay:150ms]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-host-primary/70 [animation-delay:300ms]" />
                        <span className="text-xs text-host-muted">
                          {nombreAgente} está escribiendo...
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <form
              onSubmit={sendMessage}
              className="border-t border-host-border bg-host-surface p-4 sm:p-5"
            >
              <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-end">
                <label htmlFor="preview-chat-input" className="sr-only">
                  Escribe como huésped de prueba
                </label>
                <textarea
                  id="preview-chat-input"
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
                  placeholder="Escribe como un huésped..."
                  disabled={escribiendo}
                  className={`min-h-[48px] max-h-32 flex-1 resize-none ${inputClassName}`}
                />
                <Button
                  type="submit"
                  disabled={!input.trim() || escribiendo}
                  className="shrink-0 sm:min-w-[7.5rem]"
                >
                  Enviar
                </Button>
              </div>
              <p className="mx-auto mt-2 max-w-3xl text-center text-[11px] text-host-muted sm:text-left">
                Enter para enviar · Shift+Enter para nueva línea
              </p>
            </form>
          </div>
        </div>
      </Card>
    </HostPageShell>
  )
}
