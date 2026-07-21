import { useState } from 'react'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import { eliminarPropiedadPropietario } from '../../../services/propiedadService'

type PropiedadEliminarModalProps = {
  propiedadId: string
  nombreApartamento: string
  onCerrar: () => void
  onEliminada: () => void
}

export default function PropiedadEliminarModal({
  propiedadId,
  nombreApartamento,
  onCerrar,
  onEliminada,
}: PropiedadEliminarModalProps) {
  const [eliminando, setEliminando] = useState(false)
  const [error, setError] = useState('')

  const handleEliminar = async () => {
    setError('')
    setEliminando(true)

    try {
      await eliminarPropiedadPropietario(propiedadId)
      onEliminada()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo eliminar la propiedad.',
      )
    } finally {
      setEliminando(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-sm"
      onClick={onCerrar}
      role="presentation"
    >
      <div
        className="w-full max-w-md animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="eliminar-modal-title"
      >
        <Card padding="lg" className="shadow-card-hover">
          <p className="text-xs font-semibold uppercase tracking-wider text-red-600">
            Eliminar alojamiento
          </p>
          <h2
            id="eliminar-modal-title"
            className="mt-1 font-display text-lg font-semibold text-host-text"
          >
            {nombreApartamento}
          </h2>
          <p className="mt-2 text-sm text-host-muted">
            Esta acción no se puede deshacer. Se borrarán el manual, la guía
            local, los chats de huéspedes, alertas enviadas y el acceso QR de
            esta propiedad.
          </p>

          {error && (
            <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            <Button
              type="button"
              variant="secondary"
              onClick={onCerrar}
              disabled={eliminando}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleEliminar}
              disabled={eliminando}
              className="border-red-200 bg-red-50 text-red-700 hover:border-red-300 hover:bg-red-100"
            >
              {eliminando ? 'Eliminando…' : 'Eliminar definitivamente'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
