import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  listarPropiedadesPropietario,
  obtenerPropietarioId,
} from '../../services/propiedadService'
import PropiedadCard from './components/PropiedadCard'
import type { PropiedadResumen } from './types/propiedadDashboard'

export default function DashboardPage() {
  const navigate = useNavigate()
  const [propiedades, setPropiedades] = useState<PropiedadResumen[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let activo = true

    const cargar = async () => {
      try {
        await obtenerPropietarioId()
        const lista = await listarPropiedadesPropietario()
        if (!activo) return
        setPropiedades(lista)
      } catch (err) {
        if (!activo) return
        if (err instanceof Error && err.message.includes('iniciar sesión')) {
          navigate('/auth')
          return
        }
        setError(
          err instanceof Error
            ? err.message
            : 'No se pudieron cargar las propiedades.',
        )
      } finally {
        if (activo) setCargando(false)
      }
    }

    cargar()

    return () => {
      activo = false
    }
  }, [navigate])

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-violet-600/15 blur-3xl" />
      </div>

      <header className="relative z-10 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold shadow-lg shadow-indigo-500/25">
              DC
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Digital Concierge</p>
              <p className="text-xs text-slate-500">Panel del propietario</p>
            </div>
          </div>
          <Link
            to="/configurar-vivienda"
            className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:from-indigo-400 hover:to-violet-500"
          >
            + Añadir nueva propiedad
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Mis alojamientos
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Gestiona el conocimiento, los chats de huéspedes y el acceso QR de
            cada propiedad.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {error}
          </div>
        )}

        {cargando ? (
          <div className="flex min-h-[320px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-[3px] border-indigo-500/20 border-t-indigo-400" />
              <p className="text-sm text-slate-400">Cargando propiedades...</p>
            </div>
          </div>
        ) : propiedades.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 px-6 py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-2xl ring-1 ring-indigo-500/30">
              🏠
            </div>
            <h2 className="text-lg font-semibold text-white">
              Aún no tienes propiedades
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
              Configura tu primer alojamiento con el asistente IA: ubicación,
              manual, guía local y alertas.
            </p>
            <Link
              to="/configurar-vivienda"
              className="mt-6 inline-flex rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:from-indigo-400 hover:to-violet-500"
            >
              Crear primera propiedad
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {propiedades.map((propiedad) => (
              <PropiedadCard key={propiedad.id} propiedad={propiedad} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
