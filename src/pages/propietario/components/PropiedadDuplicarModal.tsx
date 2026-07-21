import { useState } from 'react'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import { inputClassName } from '../../../components/ui/inputClassName'
import { duplicarPropiedadPropietario } from '../../../services/propiedadService'

type PropiedadDuplicarModalProps = {
  propiedadId: string
  nombreApartamento: string
  onCerrar: () => void
  onDuplicada: (nuevoId: string, nuevoNombre: string) => void
}

export default function PropiedadDuplicarModal({
  propiedadId,
  nombreApartamento,
  onCerrar,
  onDuplicada,
}: PropiedadDuplicarModalProps) {
  const [nombre, setNombre] = useState(`${nombreApartamento} (copia)`)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  const handleDuplicar = async () => {
    setError('')
    setGuardando(true)

    try {
      const nuevoId = await duplicarPropiedadPropietario(propiedadId, nombre)
      onDuplicada(nuevoId, nombre.trim())
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo duplicar la propiedad.',
      )
    } finally {
      setGuardando(false)
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
        aria-labelledby="duplicar-modal-title"
      >
        <Card padding="lg" className="shadow-card-hover">
          <p className="text-xs font-semibold uppercase tracking-wider text-host-primary">
            Duplicar alojamiento
          </p>
          <h2
            id="duplicar-modal-title"
            className="mt-1 font-display text-lg font-semibold text-host-text"
          >
            {nombreApartamento}
          </h2>
          <p className="mt-2 text-sm text-host-muted">
            Se copiarán manual, permisos, alertas, guía local y conocimiento
            vectorial. La copia tendrá un QR nuevo y sin historial de chats.
          </p>

          <label className="mt-5 block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-600">
              Nombre de la copia
            </span>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className={inputClassName}
              autoFocus
              disabled={guardando}
            />
          </label>

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
              disabled={guardando}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleDuplicar}
              disabled={guardando || !nombre.trim()}
            >
              {guardando ? 'Duplicando…' : 'Duplicar'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
