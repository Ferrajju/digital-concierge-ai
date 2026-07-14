import { useEffect, useRef, useState } from 'react'
import {
  crearBloqueVacio,
  guardarSoloBaseConocimiento,
  listarBloquesConocimiento,
} from '../../../services/conocimientoService'
import type { BloqueConocimiento } from '../types/gestionConocimiento'

const inputClassName =
  'w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-white placeholder:text-slate-600 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-50'

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
      await guardarSoloBaseConocimiento(propiedadId, bloques, controller.signal)
      const actualizados = await listarBloquesConocimiento(propiedadId)
      setBloques(actualizados)
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
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button
            type="button"
            onClick={onVolver}
            className="text-sm text-slate-500 transition-colors hover:text-indigo-300"
          >
            ← Volver a gestión
          </button>
          <h2 className="mt-2 text-xl font-semibold text-white">
            Base de conocimiento
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Edita los bloques indexados del manual. Al guardar se regeneran los
            embeddings vía Flujo 3.
          </p>
        </div>
        <button
          type="button"
          onClick={anadirBloque}
          disabled={guardando || cargando}
          className="rounded-xl border border-indigo-500/40 bg-indigo-500/10 px-4 py-2.5 text-sm font-medium text-indigo-200 transition-colors hover:bg-indigo-500/20 disabled:opacity-40"
        >
          + Nuevo bloque
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      {mensajeOk && (
        <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {mensajeOk}
        </div>
      )}

      {cargando ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-indigo-500/20 border-t-indigo-400" />
        </div>
      ) : bloques.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 px-6 py-12 text-center">
          <p className="text-sm text-slate-400">
            No hay bloques indexados todavía.
          </p>
          <button
            type="button"
            onClick={anadirBloque}
            className="mt-4 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-500"
          >
            Crear primer bloque
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {bloques.map((bloque, index) => (
            <article
              key={bloque.id ?? `nuevo-${index}`}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  Bloque {index + 1}
                  {bloque.esNuevo && (
                    <span className="ml-2 text-indigo-300">Nuevo</span>
                  )}
                </p>
                <button
                  type="button"
                  onClick={() => eliminarBloque(index)}
                  disabled={guardando}
                  className="text-xs text-slate-500 transition-colors hover:text-rose-400 disabled:opacity-40"
                >
                  Eliminar
                </button>
              </div>

              <div className="grid gap-4">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-slate-500">
                    Título
                  </label>
                  <input
                    type="text"
                    value={bloque.titulo}
                    onChange={(e) =>
                      actualizarBloque(index, { titulo: e.target.value })
                    }
                    placeholder="Ej: Conexión Wi-Fi"
                    disabled={guardando}
                    className={`mt-2 ${inputClassName}`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-slate-500">
                    Contenido
                  </label>
                  <textarea
                    value={bloque.contenido}
                    onChange={(e) =>
                      actualizarBloque(index, { contenido: e.target.value })
                    }
                    rows={5}
                    placeholder="Texto que usará el conserje para responder..."
                    disabled={guardando}
                    className={`mt-2 resize-y ${inputClassName}`}
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {!cargando && bloques.length > 0 && (
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleGuardar}
            disabled={guardando}
            className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:from-indigo-400 hover:to-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {guardando ? 'Guardando e indexando...' : 'Guardar y actualizar embeddings'}
          </button>
        </div>
      )}

      {guardando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md">
          <div className="mx-6 w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900/90 p-8 text-center shadow-2xl">
            <div className="mx-auto mb-6 h-14 w-14 animate-spin rounded-full border-[3px] border-indigo-500/20 border-t-indigo-400" />
            <p className="text-lg font-semibold text-white">
              Actualizando embeddings...
            </p>
            <p className="mt-2 text-sm text-slate-400">
              n8n está reindexando los bloques del apartamento.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
