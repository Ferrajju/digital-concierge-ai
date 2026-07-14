import { useEffect, useRef, useState } from 'react'
import Button from '../../../components/ui/Button'
import FormSection, { FieldGroup } from '../../../components/ui/FormSection'
import HostFeedback from '../../../components/ui/HostFeedback'
import { HostSubpageHeader } from '../../../components/ui/HostPageShell'
import { HostOverlayLoading } from '../../../components/ui/HostModal'
import { HostLoading } from '../../../components/ui/HostShell'
import {
  inputClassName,
} from '../../../components/ui/inputClassName'
import {
  crearBloqueVacio,
  guardarSoloBaseConocimiento,
  listarBloquesConocimiento,
} from '../../../services/conocimientoService'
import type { BloqueConocimiento } from '../types/gestionConocimiento'

type BaseConocimientoEditorProps = {
  propiedadId: string
  onVolver: () => void
}

export default function BaseConocimientoEditor({
  propiedadId,
  onVolver,
}: BaseConocimientoEditorProps) {
  const [bloques, setBloques] = useState<BloqueConocimiento[]>([])
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [mensajeOk, setMensajeOk] = useState('')
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    let activo = true

    const cargar = async () => {
      setCargando(true)
      setError('')
      try {
        const lista = await listarBloquesConocimiento(propiedadId)
        if (!activo) return
        setBloques(lista)
      } catch (err) {
        if (!activo) return
        setError(
          err instanceof Error
            ? err.message
            : 'No se pudieron cargar los bloques de conocimiento.',
        )
      } finally {
        if (activo) setCargando(false)
      }
    }

    cargar()
    return () => {
      activo = false
      abortRef.current?.abort()
    }
  }, [propiedadId])

  const actualizarBloque = (index: number, updates: Partial<BloqueConocimiento>) => {
    setBloques((prev) =>
      prev.map((bloque, i) => (i === index ? { ...bloque, ...updates } : bloque)),
    )
    setMensajeOk('')
  }

  const eliminarBloque = (index: number) => {
    setBloques((prev) => prev.filter((_, i) => i !== index))
    setMensajeOk('')
  }

  const anadirBloque = () => {
    setBloques((prev) => [...prev, crearBloqueVacio()])
    setMensajeOk('')
  }

  const handleGuardar = async () => {
    const invalidos = bloques.some(
      (bloque) => !bloque.titulo.trim() || !bloque.contenido.trim(),
    )
    if (invalidos) {
      setError('Cada bloque necesita título y contenido.')
      return
    }

    setGuardando(true)
    setError('')
    setMensajeOk('')
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const guardados = await guardarSoloBaseConocimiento(
        propiedadId,
        bloques,
        controller.signal,
      )
      setBloques(guardados)
      setMensajeOk('Bloques guardados y embeddings actualizados.')
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo guardar la base de conocimiento.',
      )
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div>
      <HostSubpageHeader
        onBack={onVolver}
        backLabel="Volver al hub"
        title="Base de conocimiento"
        description="Edita los bloques indexados del manual. Al guardar se regeneran los embeddings."
        action={
          <Button
            type="button"
            variant="secondary"
            onClick={anadirBloque}
            disabled={guardando || cargando}
          >
            + Nuevo bloque
          </Button>
        }
      />

      {error && <HostFeedback className="mb-4">{error}</HostFeedback>}
      {mensajeOk && (
        <HostFeedback variant="success" className="mb-4">
          {mensajeOk}
        </HostFeedback>
      )}

      {cargando ? (
        <HostLoading label="Cargando bloques..." />
      ) : bloques.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-host-surface px-6 py-12 text-center">
          <p className="text-sm text-host-muted">
            No hay bloques indexados todavía.
          </p>
          <Button type="button" onClick={anadirBloque} className="mt-4">
            Crear primer bloque
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {bloques.map((bloque, index) => (
            <FormSection
              key={bloque.id ?? `nuevo-${index}`}
              title={`Bloque ${index + 1}${bloque.esNuevo ? ' · Nuevo' : ''}`}
              action={
                <button
                  type="button"
                  onClick={() => eliminarBloque(index)}
                  disabled={guardando}
                  className="text-xs font-semibold text-host-muted transition-colors hover:text-rose-600 disabled:opacity-40"
                >
                  Eliminar
                </button>
              }
            >
              <FieldGroup label="Título">
                <input
                  type="text"
                  value={bloque.titulo}
                  onChange={(e) =>
                    actualizarBloque(index, { titulo: e.target.value })
                  }
                  placeholder="Ej: Conexión Wi-Fi"
                  disabled={guardando}
                  className={inputClassName}
                />
              </FieldGroup>
              <FieldGroup label="Contenido">
                <textarea
                  value={bloque.contenido}
                  onChange={(e) =>
                    actualizarBloque(index, { contenido: e.target.value })
                  }
                  rows={5}
                  placeholder="Texto que usará el conserje para responder..."
                  disabled={guardando}
                  className={`resize-y ${inputClassName}`}
                />
              </FieldGroup>
            </FormSection>
          ))}
        </div>
      )}

      {!cargando && bloques.length > 0 && (
        <div className="mt-6 flex justify-end">
          <Button
            type="button"
            onClick={handleGuardar}
            loading={guardando}
            disabled={guardando}
            size="lg"
          >
            Guardar y actualizar embeddings
          </Button>
        </div>
      )}

      {guardando && (
        <HostOverlayLoading
          title="Actualizando embeddings..."
          description="n8n está reindexando los bloques del apartamento."
        />
      )}
    </div>
  )
}
