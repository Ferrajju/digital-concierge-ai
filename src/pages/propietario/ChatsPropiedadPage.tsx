import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ChatMarkdown from '../../components/ChatMarkdown'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import HostFeedback from '../../components/ui/HostFeedback'
import HostPageShell from '../../components/ui/HostPageShell'
import { IconMessages } from '../../components/ui/icons'
import { HostLoading } from '../../components/ui/HostShell'
import { listarConversacionesPropiedad } from '../../services/huespedService'
import {
  obtenerPropiedadBasicaPropietario,
  obtenerPropietarioId,
} from '../../services/propiedadService'
import { useHostScreen } from '../../hooks/useHostScreen'
import type { ConversacionHuespedResumen } from './types/conversacionesHuesped'

function acortarSessionId(sessionId: string): string {
  return sessionId.slice(0, 8)
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
  nombreAgente: string
  onVolver?: () => void
}

function DetalleConversacion({
  conversacion,
  nombreAgente,
  onVolver,
}: DetalleConversacionProps) {
  return (
    <div className="flex h-full flex-col bg-stone-50/50">
      <div className="border-b border-host-border bg-host-surface px-4 py-4 sm:px-6">
        <div className="flex items-start gap-3">
          {onVolver && (
            <button
              type="button"
              onClick={onVolver}
              className="mt-0.5 rounded-lg border border-host-border bg-host-surface px-3 py-1.5 text-sm font-medium text-host-muted lg:hidden"
            >
              ← Volver
            </button>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-host-text">
              Sesión {acortarSessionId(conversacion.sessionId)}
            </p>
            <p className="mt-1 text-xs text-host-muted">
              {formatearFechaCompleta(conversacion.updatedAt)}
            </p>
            <p className="mt-2 text-xs text-host-muted">
              {conversacion.totalMensajes} mensajes ·{' '}
              {conversacion.mensajesUsuario} del huésped
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-2xl flex-col gap-3">
          {conversacion.mensajes.length === 0 ? (
            <p className="text-center text-sm text-host-muted">
              Esta sesión no tiene mensajes guardados.
            </p>
          ) : (
            conversacion.mensajes.map((mensaje, index) => {
              const esUsuario = mensaje.rol === 'user'
              return (
                <div
                  key={`${mensaje.timestamp}-${index}`}
                  className={`flex ${esUsuario ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="max-w-[90%]">
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
                        <ChatMarkdown contenido={mensaje.contenido} variant="light" />
                      )}
                    </div>
                    <p
                      className={`mt-1 px-1 text-[10px] text-stone-400 ${
                        esUsuario ? 'text-right' : 'text-left'
                      }`}
                    >
                      {esUsuario ? 'Huésped' : nombreAgente} ·{' '}
                      {formatearHora(mensaje.timestamp)}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>
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
                            Sesión {acortarSessionId(conversacion.sessionId)}
                          </p>
                          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-host-muted">
                            {conversacion.ultimoMensajeRol === 'user'
                              ? 'Huésped: '
                              : `${nombreAgente}: `}
                            {acortarTexto(conversacion.ultimoMensaje)}
                          </p>
                        </div>
                        <span className="shrink-0 text-[10px] text-stone-400">
                          {formatearFechaRelativa(conversacion.updatedAt)}
                        </span>
                      </div>
                      <p className="mt-2 text-[10px] text-stone-400">
                        {conversacion.totalMensajes} mensajes ·{' '}
                        {conversacion.mensajesUsuario} del huésped
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
              {conversacionSeleccionada ? (
                <DetalleConversacion
                  conversacion={conversacionSeleccionada}
                  nombreAgente={nombreAgente}
                  onVolver={() => setSeleccionadaId(null)}
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
