import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  listarBloquesConocimiento,
  listarTarjetasGuiaPropiedad,
} from '../../services/conocimientoService'
import {
  obtenerPropiedadBasicaPropietario,
  obtenerPropietarioId,
} from '../../services/propiedadService'
import BaseConocimientoEditor from './components/BaseConocimientoEditor'
import GuiaLocalGestionPanel from './components/GuiaLocalGestionPanel'
import type { VistaGestion } from './types/gestionConocimiento'

export default function GestionarPropiedadPage() {
  const { propiedadId } = useParams<{ propiedadId: string }>()
  const navigate = useNavigate()

  const [vista, setVista] = useState<VistaGestion>('hub')
  const [nombrePropiedad, setNombrePropiedad] = useState('')
  const [totalBloques, setTotalBloques] = useState(0)
  const [totalTarjetas, setTotalTarjetas] = useState(0)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

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
        const [propiedad, bloques, tarjetas] = await Promise.all([
          obtenerPropiedadBasicaPropietario(propiedadId),
          listarBloquesConocimiento(propiedadId),
          listarTarjetasGuiaPropiedad(propiedadId),
        ])

        if (!activo) return
        setNombrePropiedad(propiedad.nombreApartamento)
        setTotalBloques(bloques.length)
        setTotalTarjetas(tarjetas.length)
      } catch (err) {
        if (!activo) return
        if (err instanceof Error && err.message.includes('iniciar sesión')) {
          navigate('/auth')
          return
        }
        setError(
          err instanceof Error
            ? err.message
            : 'No se pudo cargar la propiedad.',
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

  const recargarContadores = async () => {
    if (!propiedadId) return
    const [bloques, tarjetas] = await Promise.all([
      listarBloquesConocimiento(propiedadId),
      listarTarjetasGuiaPropiedad(propiedadId),
    ])
    setTotalBloques(bloques.length)
    setTotalTarjetas(tarjetas.length)
  }

  const volverAlHub = () => {
    setVista('hub')
    void recargarContadores()
  }

  if (!propiedadId) {
    return null
  }

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-32 top-0 h-96 w-96 rounded-full bg-violet-600/15 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <Link
          to="/dashboard"
          className="text-sm text-slate-500 transition-colors hover:text-indigo-300"
        >
          ← Volver al panel
        </Link>

        <header className="mt-6 mb-8">
          <p className="text-sm font-medium uppercase tracking-wider text-indigo-400">
            Gestión de alojamiento
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
            {nombrePropiedad || 'Cargando...'}
          </h1>
          {vista === 'hub' && (
            <p className="mt-2 text-sm text-slate-400">
              Administra la base de conocimiento y las recomendaciones locales
              indexadas para el conserje.
            </p>
          )}
        </header>

        {error && (
          <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        )}

        {cargando ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-indigo-500/20 border-t-indigo-400" />
          </div>
        ) : vista === 'hub' ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setVista('conocimiento')}
              className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-left transition-all hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/10"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/15 text-2xl ring-1 ring-indigo-500/30">
                📚
              </div>
              <h2 className="text-lg font-semibold text-white group-hover:text-indigo-100">
                Base de conocimiento
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                Bloques del manual indexados (Wi-Fi, acceso, normas...). Edita
                título y texto; al guardar se actualizan los embeddings.
              </p>
              <p className="mt-4 text-xs font-medium text-indigo-300">
                {totalBloques} bloques indexados →
              </p>
            </button>

            <button
              type="button"
              onClick={() => setVista('guia')}
              className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-left transition-all hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/10"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/15 text-2xl ring-1 ring-emerald-500/30">
                🗺️
              </div>
              <h2 className="text-lg font-semibold text-white group-hover:text-emerald-100">
                Guía local
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                Tarjetas de supermercados, farmacias y restaurantes. Añade,
                edita o elimina recomendaciones cercanas.
              </p>
              <p className="mt-4 text-xs font-medium text-emerald-300">
                {totalTarjetas} tarjetas indexadas →
              </p>
            </button>
          </div>
        ) : vista === 'conocimiento' ? (
          <BaseConocimientoEditor
            propiedadId={propiedadId}
            onVolver={volverAlHub}
          />
        ) : (
          <GuiaLocalGestionPanel
            propiedadId={propiedadId}
            onVolver={volverAlHub}
          />
        )}
      </div>
    </div>
  )
}
