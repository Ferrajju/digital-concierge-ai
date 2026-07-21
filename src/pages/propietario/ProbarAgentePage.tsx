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

type AtajoPrueba = {
  id: string
  emoji: string
  titulo: string
  texto: string
  tipo: 'info' | 'alerta'
}

const ATAJOS_PRUEBA: AtajoPrueba[] = [
  {
    id: 'wifi',
    emoji: '📶',
    titulo: 'Clave Wi-Fi',
    texto: '¿Cuál es la clave del Wi-Fi?',
    tipo: 'info',
  },
  {
    id: 'checkout',
    emoji: '🕐',
    titulo: 'Check-out',
    texto: '¿A qué hora es el check-out?',
    tipo: 'info',
  },
  {
    id: 'basura',
    emoji: '♻️',
    titulo: 'Basura',
    texto: '¿Cómo funciona la basura y el reciclaje?',
    tipo: 'info',
  },
  {
    id: 'super',
    emoji: '🛒',
    titulo: 'Supermercado',
    texto: '¿Hay algún supermercado recomendado cerca?',
    tipo: 'info',
  },
  {
    id: 'fuga',
    emoji: '🚨',
    titulo: 'Fuga de agua',
    texto: 'Hay una fuga de agua urgente en el baño',
    tipo: 'alerta',
  },
  {
    id: 'calefaccion',
    emoji: '🔧',
    titulo: 'Calefacción',
    texto: 'La calefacción no funciona y hace frío',
    tipo: 'alerta',
  },
  {
    id: 'checkin',
    emoji: '🗝️',
    titulo: 'Check-in anticipado',
    texto: '¿Puedo entrar antes de la hora de check-in?',
    tipo: 'alerta',
  },
  {
    id: 'agua',
    emoji: '💧',
    titulo: 'Sin agua caliente',
    texto: 'No hay agua caliente en la ducha',
    tipo: 'alerta',
  },
]

const MAX_TEXTAREA_ALTURA = 160

function crearMensajeBienvenida(nombreAgente: string): MensajeHuespedChat {
  return {
    rol: 'assistant',
    contenido: `**Modo simulacro** — Estás probando a **${nombreAgente}** como si fueras un huésped.\n\nUsa los **atajos de abajo** o escribe libremente. Las alertas de Telegram llegarán marcadas como **SIMULACRO** y esta conversación **no aparece** en tus chats reales.`,
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

function AtajosPruebaBar({
  deshabilitado,
  onAtajo,
}: {
  deshabilitado: boolean
  onAtajo: (texto: string) => void
}) {
  const info = ATAJOS_PRUEBA.filter((a) => a.tipo === 'info')
  const alertas = ATAJOS_PRUEBA.filter((a) => a.tipo === 'alerta')

  return (
    <div className="shrink-0 border-t border-host-border bg-stone-100/80 px-4 py-4 sm:px-6 sm:py-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-display text-base font-semibold text-host-text">
            Atajos de prueba
          </p>
          <p className="mt-0.5 text-sm text-host-muted">
            Pulsa una tarjeta para enviar la pregunta al instante
          </p>
        </div>
        <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900">
          Siempre disponibles
        </span>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-host-primary">
            Consultas habituales
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {info.map((atajo) => (
              <button
                key={atajo.id}
                type="button"
                disabled={deshabilitado}
                onClick={() => onAtajo(atajo.texto)}
                className="group flex items-center gap-3 rounded-xl border border-stone-200 bg-host-surface px-4 py-3.5 text-left shadow-sm transition-all hover:border-teal-300 hover:bg-teal-50/60 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-lg ring-1 ring-teal-100"
                  aria-hidden
                >
                  {atajo.emoji}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-host-text group-hover:text-teal-900">
                    {atajo.titulo}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-host-muted">
                    {atajo.texto}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-amber-800">
            Probar alertas Telegram
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {alertas.map((atajo) => (
              <button
                key={atajo.id}
                type="button"
                disabled={deshabilitado}
                onClick={() => onAtajo(atajo.texto)}
                className="group flex items-center gap-3 rounded-xl border border-amber-200/80 bg-amber-50/50 px-4 py-3.5 text-left shadow-sm transition-all hover:border-amber-300 hover:bg-amber-50 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-lg ring-1 ring-amber-200"
                  aria-hidden
                >
                  {atajo.emoji}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-host-text group-hover:text-amber-950">
                    {atajo.titulo}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-host-muted">
                    {atajo.texto}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
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
      description={`Prueba a ${nombreAgente} como huésped. Conversación temporal · alertas marcadas como simulacro.`}
      headerExtra={
        <Button
          type="button"
          variant="secondary"
          onClick={() => void nuevaPrueba()}
          disabled={escribiendo}
        >
          Nueva conversación
        </Button>
      }
    >
      {error && propiedad && (
        <HostFeedback className="mb-4">{error}</HostFeedback>
      )}

      <Card
        padding="none"
        className="flex min-h-[calc(100dvh-12.5rem)] flex-col overflow-hidden shadow-card-hover sm:min-h-[calc(100dvh-11rem)]"
      >
        <div className="flex shrink-0 flex-col gap-4 border-b border-host-border bg-host-surface px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
          <div className="flex min-w-0 items-center gap-4">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-host-primary text-xl font-bold text-white shadow-md"
              aria-hidden
            >
              {nombreAgente.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-display text-lg font-semibold text-host-text">
                {nombreAgente}
              </p>
              <p className="mt-0.5 truncate text-sm text-host-muted">
                {propiedad?.direccionCompleta || 'Vista huésped'}
              </p>
              <p className="mt-1 flex items-center gap-2 text-xs font-medium text-emerald-700">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                En línea · simulacro activo
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 sm:max-w-xs">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-900">
              Modo simulacro
            </p>
            <p className="mt-1 text-sm leading-relaxed text-amber-950/90">
              No contamina tus chats reales. Las alertas Telegram llevan etiqueta
              de prueba.
            </p>
          </div>
        </div>

        <div
          ref={chatRef}
          className="min-h-[240px] flex-1 overflow-y-auto bg-stone-50/70 px-4 py-5 sm:px-6 sm:py-6"
          aria-live="polite"
          aria-relevant="additions"
        >
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
            {mensajes.map((mensaje, index) => {
              const esUsuario = mensaje.rol === 'user'
              const hora = formatearHora(mensaje.timestamp)

              return (
                <div
                  key={`${mensaje.timestamp}-${index}`}
                  className={`flex ${esUsuario ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="max-w-[94%] sm:max-w-[82%] lg:max-w-[70%]">
                    <div
                      className={`rounded-2xl px-5 py-4 text-base leading-relaxed shadow-sm ${
                        esUsuario
                          ? 'rounded-br-md bg-host-primary text-white'
                          : 'rounded-bl-md border border-host-border bg-host-surface text-host-text'
                      }`}
                    >
                      {!esUsuario && (
                        <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-host-primary">
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
                        className={`mt-1.5 px-1 text-xs text-stone-400 ${
                          esUsuario ? 'text-right' : 'text-left'
                        }`}
                      >
                        {esUsuario ? 'Tú (simulando huésped)' : nombreAgente} ·{' '}
                        {hora}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}

            {escribiendo && (
              <div className="flex justify-start">
                <div className="rounded-2xl border border-host-border bg-host-surface px-5 py-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-host-primary [animation-delay:0ms]" />
                    <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-host-primary [animation-delay:150ms]" />
                    <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-host-primary [animation-delay:300ms]" />
                    <span className="text-sm text-host-muted">
                      {nombreAgente} está escribiendo...
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <AtajosPruebaBar
          deshabilitado={escribiendo}
          onAtajo={(texto) => void enviarTexto(texto)}
        />

        <form
          onSubmit={sendMessage}
          className="shrink-0 border-t border-host-border bg-host-surface px-4 py-4 sm:px-6 sm:py-5"
        >
          <label
            htmlFor="preview-chat-input"
            className="mb-2 block text-sm font-semibold text-host-text"
          >
            Escribe tu propia pregunta
          </label>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <textarea
              id="preview-chat-input"
              ref={inputRef}
              rows={2}
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                ajustarAlturaTextarea()
              }}
              onKeyDown={handleInputKeyDown}
              onFocus={() => {
                setTimeout(() => scrollAlFinal(true), 150)
              }}
              placeholder="Ej.: ¿Dónde aparco el coche? ¿Cómo abro la puerta?"
              disabled={escribiendo}
              className={`min-h-[56px] max-h-40 flex-1 resize-none text-base ${inputClassName}`}
            />
            <Button
              type="submit"
              size="lg"
              disabled={!input.trim() || escribiendo}
              className="shrink-0 lg:min-w-[9rem]"
            >
              Enviar
            </Button>
          </div>
          <p className="mt-2 text-xs text-host-muted">
            Enter para enviar · Shift+Enter para nueva línea · Los atajos de
            arriba siguen disponibles en todo momento
          </p>
        </form>
      </Card>
    </HostPageShell>
  )
}
