import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  obtenerAyudaPantalla,
  type HostScreenId,
} from '../../config/hostHelpContent'
import { useHostScreenContext } from '../../context/HostScreenContext'
import { enviarFeedbackPropietario } from '../../services/feedbackService'
import Button from './Button'
import Card from './Card'
import HostFeedback from './HostFeedback'
import { IconHelp } from './icons'
import { inputClassName } from './inputClassName'

type ModalStep = 'menu' | 'help' | 'feedback' | 'success'

export default function HostHelpWidget() {
  const location = useLocation()
  const { screen } = useHostScreenContext()
  const [abierto, setAbierto] = useState(false)
  const [paso, setPaso] = useState<ModalStep>('menu')
  const [tipoFeedback, setTipoFeedback] = useState<'comentario' | 'error'>(
    'comentario',
  )
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  const ayuda = obtenerAyudaPantalla(screen.screenId as HostScreenId)

  const cerrar = () => {
    setAbierto(false)
    setPaso('menu')
    setMensaje('')
    setError('')
    setTipoFeedback('comentario')
  }

  const abrirFeedback = (tipo: 'comentario' | 'error') => {
    setTipoFeedback(tipo)
    setPaso('feedback')
    setError('')
  }

  const enviarFeedback = async () => {
    setEnviando(true)
    setError('')

    try {
      await enviarFeedbackPropietario({
        tipo: tipoFeedback,
        pantalla: screen.screenTitle,
        ruta: location.pathname,
        mensaje,
        propiedadId: screen.propiedadId,
        contexto: {
          screenId: screen.screenId,
        },
      })
      setPaso('success')
      setMensaje('')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo enviar tu comentario.',
      )
    } finally {
      setEnviando(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full border border-teal-700 bg-host-primary px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-900/20 transition-transform hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-host-primary/40 focus-visible:ring-offset-2"
        aria-label="Ayuda y comentarios"
      >
        <IconHelp className="h-5 w-5" />
        Ayuda
      </button>

      {abierto && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-stone-900/40 p-4 backdrop-blur-sm sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="host-help-title"
        >
          <Card padding="lg" className="w-full max-w-md shadow-card-hover">
            {paso === 'menu' && (
              <>
                <h3
                  id="host-help-title"
                  className="font-display text-lg font-semibold text-host-text"
                >
                  ¿En qué te ayudamos?
                </h3>
                <p className="mt-2 text-sm text-host-muted">
                  Pantalla actual:{' '}
                  <span className="font-medium text-host-text">
                    {screen.screenTitle}
                  </span>
                </p>
                <div className="mt-6 grid gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    fullWidth
                    onClick={() => setPaso('help')}
                  >
                    Qué se hace en esta pantalla
                  </Button>
                  <Button
                    type="button"
                    fullWidth
                    onClick={() => abrirFeedback('comentario')}
                  >
                    Enviar mejora o sugerencia
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    fullWidth
                    onClick={() => abrirFeedback('error')}
                  >
                    Reportar un error
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  fullWidth
                  className="mt-3"
                  onClick={cerrar}
                >
                  Cerrar
                </Button>
              </>
            )}

            {paso === 'help' && (
              <>
                <h3 className="font-display text-lg font-semibold text-host-text">
                  {ayuda.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-host-muted">
                  {ayuda.intro}
                </p>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-host-text">
                  {ayuda.bullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <div className="mt-6 flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setPaso('menu')}
                  >
                    Volver
                  </Button>
                  <Button type="button" onClick={cerrar}>
                    Entendido
                  </Button>
                </div>
              </>
            )}

            {paso === 'feedback' && (
              <>
                <h3 className="font-display text-lg font-semibold text-host-text">
                  {tipoFeedback === 'error'
                    ? 'Reportar un error'
                    : 'Enviar mejora o sugerencia'}
                </h3>
                <p className="mt-2 text-sm text-host-muted">
                  Lo recibiremos con el contexto de esta pantalla (
                  {screen.screenTitle}).
                </p>
                <textarea
                  value={mensaje}
                  onChange={(e) => {
                    setMensaje(e.target.value)
                    setError('')
                  }}
                  rows={5}
                  placeholder={
                    tipoFeedback === 'error'
                      ? 'Describe qué pasó, qué esperabas y cómo reproducirlo…'
                      : 'Cuéntanos qué mejorarías o qué te gustaría ver…'
                  }
                  className={`mt-4 resize-none ${inputClassName}`}
                />
                {error && (
                  <HostFeedback className="mt-3">{error}</HostFeedback>
                )}
                <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setPaso('menu')}
                    disabled={enviando}
                  >
                    Volver
                  </Button>
                  <Button
                    type="button"
                    loading={enviando}
                    disabled={enviando || mensaje.trim().length < 10}
                    onClick={enviarFeedback}
                  >
                    Enviar
                  </Button>
                </div>
              </>
            )}

            {paso === 'success' && (
              <>
                <HostFeedback variant="success">
                  Gracias. Hemos recibido tu{' '}
                  {tipoFeedback === 'error' ? 'reporte' : 'comentario'}.
                </HostFeedback>
                <Button type="button" fullWidth className="mt-4" onClick={cerrar}>
                  Cerrar
                </Button>
              </>
            )}
          </Card>
        </div>
      )}
    </>
  )
}
