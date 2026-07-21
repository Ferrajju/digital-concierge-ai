import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ChatMarkdown from '../../components/ChatMarkdown'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import HostFeedback from '../../components/ui/HostFeedback'
import HostPageShell from '../../components/ui/HostPageShell'
import { IconMessages } from '../../components/ui/icons'
import { HostLoading } from '../../components/ui/HostShell'
import {
  activarModoAsistenciaPropietario,
  cargarConversacionHuesped,
  desactivarModoAsistenciaPropietario,
  enviarMensajePropietarioHuesped,
  listarConversacionesPropiedad,
} from '../../services/huespedService'
import {
  obtenerPropiedadBasicaPropietario,
  obtenerPropietarioId,
} from '../../services/propiedadService'
import { useHostScreen } from '../../hooks/useHostScreen'
import type { MensajeHuespedChat } from '../huesped/types/guestChat'
import type { ConversacionHuespedResumen } from './types/conversacionesHuesped'

const POLLING_MS = 3000

function acortarSessionId(sessionId: string): string {
  return sessionId.slice(0, 8)
}

function tituloConversacion(conversacion: {
  nombreHuesped?: string
  sessionId: string
}): string {
  if (conversacion.nombreHuesped?.trim()) {
    return conversacion.nombreHuesped.trim()
  }
  return `Sesión ${acortarSessionId(conversacion.sessionId)}`
}

function acortarTexto(texto: string, max = 90): string {
  const limpio = texto.replace(/\s+/g, ' ').trim()
  if (limpio.length <= max) return limpio
  return `${limpio.slice(0, max)}…`
}

function formatearFechaRelativa(iso: string): string {
  try {
    const fecha = new Date(iso)
    const ahora = new Date()
    const diffMs = ahora.getTime() - fecha.getTime()
    const diffMin = Math.floor(diffMs / 60000)

    if (diffMin < 1) return 'Ahora'
    if (diffMin < 60) return `Hace ${diffMin} min`
    const diffHoras = Math.floor(diffMin / 60)
    if (diffHoras < 24) return `Hace ${diffHoras} h`
    const diffDias = Math.floor(diffHoras / 24)
    if (diffDias < 7) return `Hace ${diffDias} d`

    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(fecha)
  } catch {
    return ''
  }
}

function formatearFechaCompleta(iso: string): string {
  try {
    return new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso))
  } catch {
    return ''
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

type DetalleConversacionProps = {
  conversacion: ConversacionHuespedResumen
  propiedadId: string
  nombreAgente: string
  onVolver?: () => void
  onActualizar: (cambios: Partial<ConversacionHuespedResumen> & { id: string }) => void
}

function etiquetaRemitente(
  mensaje: MensajeHuespedChat,
  nombreAgente: string,
): string {
  if (mensaje.rol === 'user') return 'Huésped'
  if (mensaje.rol === 'propietario') return 'Tú (propietario)'
  return nombreAgente
}

function DetalleConversacion({
  conversacion,
  propiedadId,
  nombreAgente,
  onVolver,
  onActualizar,
}: DetalleConversacionProps) {
  const [mensajes, setMensajes] = useState(conversacion.mensajes)
  const [modoAsistencia, setModoAsistencia] = useState(
    conversacion.modoAsistenciaPropietario,
  )
  const [input, setInput] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [saliendo, setSaliendo] = useState(false)

  const chatRef = useRef<HTMLDivElement>(null)
  const mensajesRef = useRef(mensajes)
  mensajesRef.current = mensajes

  const scrollAlFinal = useCallback(() => {
    const el = chatRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [])

  useEffect(() => {
    setMensajes(conversacion.mensajes)
    setModoAsistencia(conversacion.modoAsistenciaPropietario)
  }, [conversacion])

  useEffect(() => {
    scrollAlFinal()
  }, [mensajes, scrollAlFinal])

  useEffect(() => {
    let activo = true

    const activar = async () => {
      try {
        await activarModoAsistenciaPropietario(conversacion.id)
        if (!activo) return
        setModoAsistencia(true)
        onActualizar({ id: conversacion.id, modoAsistenciaPropietario: true })
      } catch (err) {
        if (!activo) return
        setError(
          err instanceof Error
            ? err.message
            : 'No se pudo activar el modo asistencia.',
        )
      }
    }

    void activar()

    return () => {
      activo = false
      void desactivarModoAsistenciaPropietario(conversacion.id).catch(() => {})
    }
  }, [conversacion.id])

  useEffect(() => {
    if (!propiedadId) return

    let activo = true

    const sincronizar = async () => {
      try {
        const estado = await cargarConversacionHuesped(
          propiedadId,
          conversacion.sessionId,
        )
        if (!activo) return

        setMensajes(estado.mensajes)
        setModoAsistencia(estado.modoAsistenciaPropietario)
        onActualizar({
          id: conversacion.id,
          mensajes: estado.mensajes,
          modoAsistenciaPropietario: estado.modoAsistenciaPropietario,
          totalMensajes: estado.mensajes.length,
          mensajesUsuario: estado.mensajes.filter((m) => m.rol === 'user')
            .length,
          ultimoMensaje:
            estado.mensajes[estado.mensajes.length - 1]?.contenido ??
            'Sin mensajes',
          ultimoMensajeRol:
            estado.mensajes[estado.mensajes.length - 1]?.rol ?? 'assistant',
        })
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
  }, [propiedadId, conversacion.sessionId, conversacion.id])

  const salirModoAsistencia = async () => {
    setSaliendo(true)
    setError('')
    try {
      await desactivarModoAsistenciaPropietario(conversacion.id)
      setModoAsistencia(false)
      onActualizar({ id: conversacion.id, modoAsistenciaPropietario: false })
      onVolver?.()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo reactivar el conserje automático.',
      )
    } finally {
      setSaliendo(false)
    }
  }

  const enviarRespuesta = async (e: React.FormEvent) => {
    e.preventDefault()
    const texto = input.trim()
    if (!texto || enviando) return

    setEnviando(true)
    setError('')

    try {
      const actualizados = await enviarMensajePropietarioHuesped(
        conversacion.id,
        propiedadId,
        conversacion.sessionId,
        texto,
        mensajesRef.current,
      )
      setMensajes(actualizados)
      setInput('')
      onActualizar({
        id: conversacion.id,
        mensajes: actualizados,
        totalMensajes: actualizados.length,
        mensajesUsuario: actualizados.filter((m) => m.rol === 'user').length,
        ultimoMensaje: texto,
        ultimoMensajeRol: 'propietario',
      })
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudo enviar el mensaje.',
      )
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="flex h-full flex-col bg-stone-50/50">
      <div className="border-b border-host-border bg-host-surface px-4 py-4 sm:px-6">
        <div className="flex items-start gap-3">
          {onVolver && (
            <button
              type="button"
              onClick={() => void salirModoAsistencia()}
              disabled={saliendo}
              className="mt-0.5 rounded-lg border border-host-border bg-host-surface px-3 py-1.5 text-sm font-medium text-host-muted lg:hidden disabled:opacity-50"
            >
              ← Salir
            </button>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-host-text">
                {tituloConversacion(conversacion)}
              </p>
              {modoAsistencia && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800">
                  Modo asistencia
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-host-muted">
              {formatearFechaCompleta(conversacion.updatedAt)}
            </p>
            <p className="mt-2 text-xs text-host-muted">
              {conversacion.totalMensajes} mensajes ·{' '}
              {conversacion.mensajesUsuario} del huésped
            </p>
          </div>
          <button
            type="button"
            onClick={() => void salirModoAsistencia()}
            disabled={saliendo || !modoAsistencia}
            className="hidden shrink-0 rounded-xl border border-host-border bg-host-surface px-3 py-2 text-xs font-semibold text-host-text transition-colors hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40 lg:inline-flex"
          >
            {saliendo ? 'Saliendo…' : 'Reactivar conserje'}
          </button>
        </div>

        {modoAsistencia && (
          <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-relaxed text-amber-900">
            Estás atendiendo esta conversación. El conserje automático está{' '}
            <strong>pausado</strong> hasta que pulses «Reactivar conserje» o
            salgas del chat.
          </div>
        )}
      </div>

      <div
        ref={chatRef}
        className="flex-1 overflow-y-auto px-4 py-4 sm:px-6"
      >
        <div className="mx-auto flex max-w-2xl flex-col gap-3">
          {mensajes.length === 0 ? (
            <p className="text-center text-sm text-host-muted">
              Esta sesión no tiene mensajes guardados.
            </p>
          ) : (
            mensajes.map((mensaje, index) => {
              const esHuésped = mensaje.rol === 'user'
              const esPropietario = mensaje.rol === 'propietario'
              return (
                <div
                  key={`${mensaje.timestamp}-${index}`}
                  className={`flex ${esHuésped ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="max-w-[90%]">
                    <div
                      className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                        esHuésped
                          ? 'rounded-br-md bg-host-primary text-white'
                          : esPropietario
                            ? 'rounded-bl-md border border-teal-200 bg-teal-50 text-host-text'
                            : 'rounded-bl-md border border-host-border bg-host-surface text-host-text'
                      }`}
                    >
                      {!esHuésped && (
                        <p
                          className={`mb-1 text-[10px] font-semibold uppercase tracking-wider ${
                            esPropietario ? 'text-teal-700' : 'text-host-primary'
                          }`}
                        >
                          {etiquetaRemitente(mensaje, nombreAgente)}
                        </p>
                      )}
                      {esHuésped ? (
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
                    <p
                      className={`mt-1 px-1 text-[10px] text-stone-400 ${
                        esHuésped ? 'text-right' : 'text-left'
                      }`}
                    >
                      {etiquetaRemitente(mensaje, nombreAgente)} ·{' '}
                      {formatearHora(mensaje.timestamp)}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      <div className="border-t border-host-border bg-host-surface px-4 py-3 sm:px-6">
        {error && (
          <p
            role="alert"
            className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700"
          >
            {error}
          </p>
        )}
        <form onSubmit={(e) => void enviarRespuesta(e)} className="mx-auto max-w-2xl">
          <div className="flex items-end gap-2">
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu respuesta al huésped…"
              disabled={enviando || !modoAsistencia}
              className="min-h-[44px] flex-1 resize-none rounded-2xl border border-host-border bg-white px-4 py-3 text-sm text-host-text placeholder:text-host-muted focus:border-host-primary focus:outline-none focus:ring-2 focus:ring-host-primary/20 disabled:opacity-50"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  void enviarRespuesta(e)
                }
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || enviando || !modoAsistencia}
              className="flex h-11 shrink-0 items-center justify-center rounded-2xl bg-host-primary px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Enviar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ChatsPropiedadPage() {
  const { propiedadId } = useParams<{ propiedadId: string }>()
  const navigate = useNavigate()

  const [nombrePropiedad, setNombrePropiedad] = useState('')
  const [nombreAgente, setNombreAgente] = useState('Conserje')
  const [conversaciones, setConversaciones] = useState<
    ConversacionHuespedResumen[]
  >([])
  const [seleccionadaId, setSeleccionadaId] = useState<string | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const conversacionSeleccionada =
    conversaciones.find((c) => c.id === seleccionadaId) ?? null

  const actualizarConversacion = (
    cambios: Partial<ConversacionHuespedResumen> & { id: string },
  ) => {
    setConversaciones((prev) =>
      prev.map((c) => (c.id === cambios.id ? { ...c, ...cambios } : c)),
    )
  }

  useHostScreen({
    screenId: conversacionSeleccionada ? 'chats-detalle' : 'chats-lista',
    screenTitle: conversacionSeleccionada
      ? 'Detalle de conversación'
      : 'Chats de huéspedes',
    propiedadId,
  })

  useEffect(() => {
    if (!propiedadId) {
      setError('Propiedad no válida.')
      setCargando(false)
      return
    }

    let activo = true

    const cargar = async () => {
      try {
        await obtenerPropietarioId()
        const [propiedad, lista] = await Promise.all([
          obtenerPropiedadBasicaPropietario(propiedadId),
          listarConversacionesPropiedad(propiedadId),
        ])

        if (!activo) return

        setNombrePropiedad(propiedad.nombreApartamento)
        setNombreAgente(propiedad.iaIdentidad)
        setConversaciones(lista)
        setSeleccionadaId(
          window.matchMedia('(min-width: 1024px)').matches
            ? (lista[0]?.id ?? null)
            : null,
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
            : 'No se pudieron cargar las conversaciones.',
        )
      } finally {
        if (activo) setCargando(false)
      }
    }

    cargar()

    return () => {
      activo = false
    }
  }, [propiedadId, navigate])

  return (
    <HostPageShell
      backTo="/dashboard"
      eyebrow="Conversaciones de huéspedes"
      title={nombrePropiedad || 'Cargando...'}
      description={
        conversaciones.length > 0
          ? `${conversaciones.length} ${conversaciones.length === 1 ? 'sesión' : 'sesiones'} · Agente ${nombreAgente}`
          : `Agente ${nombreAgente}`
      }
    >
      {cargando && <HostLoading label="Cargando conversaciones..." />}

      {!cargando && error && <HostFeedback>{error}</HostFeedback>}

      {!cargando && !error && conversaciones.length === 0 && (
        <EmptyState
          icon={<IconMessages />}
          title="Aún no hay conversaciones"
          description="Cuando un huésped escanee el QR y hable con el conserje, las sesiones aparecerán aquí automáticamente."
          actionLabel="Volver al panel"
          actionTo="/dashboard"
        />
      )}

      {!cargando && !error && conversaciones.length > 0 && (
        <Card padding="none" className="overflow-hidden shadow-card-hover">
          <div className="grid min-h-[70vh] lg:grid-cols-[320px_minmax(0,1fr)]">
            <aside
              className={`border-b border-host-border bg-host-surface lg:border-b-0 lg:border-r ${
                conversacionSeleccionada ? 'hidden lg:block' : 'block'
              }`}
            >
              <div className="border-b border-host-border px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-host-muted">
                  Sesiones recientes
                </p>
              </div>
              <div className="max-h-[70vh] overflow-y-auto">
                {conversaciones.map((conversacion) => {
                  const activa = conversacion.id === seleccionadaId
                  return (
                    <button
                      key={conversacion.id}
                      type="button"
                      onClick={() => setSeleccionadaId(conversacion.id)}
                      className={`w-full border-b border-host-border px-4 py-4 text-left transition-colors ${
                        activa
                          ? 'bg-teal-50'
                          : 'hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-host-text">
                            {tituloConversacion(conversacion)}
                          </p>
                          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-host-muted">
                            {conversacion.ultimoMensajeRol === 'user'
                              ? 'Huésped: '
                              : conversacion.ultimoMensajeRol === 'propietario'
                                ? 'Tú: '
                                : `${nombreAgente}: `}
                            {acortarTexto(conversacion.ultimoMensaje)}
                          </p>
                        </div>
                        <span className="shrink-0 text-[10px] text-stone-400">
                          {formatearFechaRelativa(conversacion.updatedAt)}
                        </span>
                      </div>
                      <p className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-stone-400">
                        <span>
                          {conversacion.totalMensajes} mensajes ·{' '}
                          {conversacion.mensajesUsuario} del huésped
                        </span>
                        {conversacion.modoAsistenciaPropietario && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-800">
                            Asistencia activa
                          </span>
                        )}
                      </p>
                    </button>
                  )
                })}
              </div>
            </aside>

            <section
              className={`min-h-[60vh] ${
                conversacionSeleccionada ? 'block' : 'hidden lg:block'
              }`}
            >
              {conversacionSeleccionada && propiedadId ? (
                <DetalleConversacion
                  conversacion={conversacionSeleccionada}
                  propiedadId={propiedadId}
                  nombreAgente={nombreAgente}
                  onVolver={() => setSeleccionadaId(null)}
                  onActualizar={actualizarConversacion}
                />
              ) : (
                <div className="flex h-full min-h-[60vh] items-center justify-center bg-stone-50/50 px-6 text-center">
                  <p className="text-sm text-host-muted">
                    Selecciona una sesión para leer la conversación.
                  </p>
                </div>
              )}
            </section>
          </div>
        </Card>
      )}
    </HostPageShell>
  )
}
