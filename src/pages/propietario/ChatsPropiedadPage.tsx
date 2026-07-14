import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ChatMarkdown from '../../components/ChatMarkdown'
import { listarConversacionesPropiedad } from '../../services/huespedService'
import {
  obtenerPropiedadBasicaPropietario,
  obtenerPropietarioId,
} from '../../services/propiedadService'
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
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-800 px-4 py-4 sm:px-6">
        <div className="flex items-start gap-3">
          {onVolver && (
            <button
              type="button"
              onClick={onVolver}
              className="mt-0.5 rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 lg:hidden"
            >
              ← Volver
            </button>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white">
              Sesión {acortarSessionId(conversacion.sessionId)}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {formatearFechaCompleta(conversacion.updatedAt)}
            </p>
            <p className="mt-2 text-xs text-slate-400">
              {conversacion.totalMensajes} mensajes ·{' '}
              {conversacion.mensajesUsuario} del huésped
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-2xl flex-col gap-3">
          {conversacion.mensajes.length === 0 ? (
            <p className="text-center text-sm text-slate-500">
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
                      className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        esUsuario
                          ? 'rounded-br-md bg-indigo-600 text-white'
                          : 'rounded-bl-md bg-slate-800 text-slate-100'
                      }`}
                    >
                      {!esUsuario && (
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-indigo-300/80">
                          {nombreAgente}
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
                    <p
                      className={`mt-1 px-1 text-[10px] text-slate-600 ${
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
    <div className="relative min-h-screen bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-indigo-600/15 blur-3xl" />
      </div>

      <header className="relative z-10 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
          <div>
            <Link
              to="/dashboard"
              className="text-sm text-slate-500 transition-colors hover:text-indigo-300"
            >
              ← Volver al panel
            </Link>
            <p className="mt-2 text-xs font-medium uppercase tracking-wider text-indigo-400">
              Conversaciones de huéspedes
            </p>
            <h1 className="mt-1 text-xl font-semibold text-white sm:text-2xl">
              {nombrePropiedad || 'Cargando...'}
            </h1>
          </div>
          <div className="hidden text-right sm:block">
            <p className="text-sm text-slate-400">
              {conversaciones.length}{' '}
              {conversaciones.length === 1 ? 'sesión' : 'sesiones'}
            </p>
            <p className="mt-1 text-xs text-slate-600">
              Agente: {nombreAgente}
            </p>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {cargando && (
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-indigo-500/20 border-t-indigo-400" />
          </div>
        )}

        {!cargando && error && (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        )}

        {!cargando && !error && conversaciones.length === 0 && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-6 py-12 text-center">
            <p className="text-lg font-semibold text-white">
              Aún no hay conversaciones
            </p>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-400">
              Cuando un huésped escanee el QR y hable con el conserje, las
              sesiones aparecerán aquí automáticamente.
            </p>
          </div>
        )}

        {!cargando && !error && conversaciones.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 shadow-xl shadow-black/20">
            <div className="grid min-h-[70vh] lg:grid-cols-[320px_minmax(0,1fr)]">
              <aside
                className={`border-b border-slate-800 lg:border-b-0 lg:border-r ${
                  conversacionSeleccionada ? 'hidden lg:block' : 'block'
                }`}
              >
                <div className="border-b border-slate-800 px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
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
                        className={`w-full border-b border-slate-800/80 px-4 py-4 text-left transition-colors ${
                          activa
                            ? 'bg-indigo-500/10'
                            : 'hover:bg-slate-800/40'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-white">
                              Sesión {acortarSessionId(conversacion.sessionId)}
                            </p>
                            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-400">
                              {conversacion.ultimoMensajeRol === 'user'
                                ? 'Huésped: '
                                : `${nombreAgente}: `}
                              {acortarTexto(conversacion.ultimoMensaje)}
                            </p>
                          </div>
                          <span className="shrink-0 text-[10px] text-slate-500">
                            {formatearFechaRelativa(conversacion.updatedAt)}
                          </span>
                        </div>
                        <p className="mt-2 text-[10px] text-slate-600">
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
                  <div className="flex h-full min-h-[60vh] items-center justify-center px-6 text-center">
                    <p className="text-sm text-slate-500">
                      Selecciona una sesión para leer la conversación.
                    </p>
                  </div>
                )}
              </section>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
