import { useEffect, useRef, useState } from 'react'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import HostFeedback from '../../../components/ui/HostFeedback'
import { HostLoading } from '../../../components/ui/HostShell'
import { inputClassName } from '../../../components/ui/inputClassName'
import WizardStepShell from '../../../components/ui/WizardStepShell'
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
    return <HostLoading label="Cargando conversación..." />
  }

  return (
    <WizardStepShell
      paso={4}
      fillViewport
      title={`Configura ${nombreVivienda}`}
      description={
        <>
          Entrevista con{' '}
          <span className="font-semibold text-host-primary">{nombreIa}</span>.
          Cuéntale accesos, Wi-Fi, normas y más.
        </>
      }
    >
      {error && <HostFeedback className="mb-3 shrink-0">{error}</HostFeedback>}

      <Card
        padding="none"
        className="flex min-h-0 flex-1 flex-col overflow-hidden shadow-card"
      >
        <div
          ref={chatContainerRef}
          className="min-h-0 flex-1 overflow-y-auto bg-stone-50/50 px-4 py-4 sm:px-6"
        >
          {mensajes.map((mensaje) => (
            <div
              key={mensaje.id}
              className={`mb-3 flex ${
                mensaje.remitente === 'propietario'
                  ? 'justify-end'
                  : 'justify-start'
              }`}
            >
              <div className="max-w-[85%] sm:max-w-[75%]">
                <div
                  className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                    mensaje.remitente === 'propietario'
                      ? 'rounded-br-md bg-host-primary text-white'
                      : 'rounded-bl-md border border-stone-200 bg-white text-host-text'
                  }`}
                >
                  {mensaje.remitente === 'ia' && (
                    <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-host-primary">
                      {nombreIa}
                    </p>
                  )}
                  {mensaje.texto}
                </div>
              </div>
            </div>
          ))}

          {escribiendo && (
            <div className="flex justify-start">
              <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3 shadow-sm">
                <p className="text-xs text-host-muted">
                  {nombreIa} está escribiendo y tomando notas...
                </p>
              </div>
            </div>
          )}

          <div ref={mensajesEndRef} />
        </div>

        <form
          onSubmit={handleEnviar}
          className="shrink-0 border-t border-stone-200 bg-white p-3 sm:p-4"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
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
              className={`flex-1 ${inputClassName}`}
            />
            <Button
              type="submit"
              disabled={!input.trim() || chatBloqueado}
              className="shrink-0"
            >
              Enviar
            </Button>
          </div>
        </form>
      </Card>
    </WizardStepShell>
  )
}
