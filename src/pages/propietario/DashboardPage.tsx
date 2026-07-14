import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Building2,
  CircleCheck,
  LogOut,
  MessagesSquare,
  Plus,
  Search,
  Sparkles,
} from 'lucide-react'
import { supabase } from '../../services/supabaseClient'
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
  const [busqueda, setBusqueda] = useState('')
  const [cerrando, setCerrando] = useState(false)

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

  const cerrarSesion = async () => {
    setCerrando(true)
    try {
      await supabase.auth.signOut()
    } finally {
      navigate('/auth')
    }
  }

  const propiedadesFiltradas = useMemo(() => {
    const termino = busqueda.trim().toLowerCase()
    if (!termino) return propiedades
    return propiedades.filter((propiedad) =>
      [
        propiedad.nombreApartamento,
        propiedad.direccionCompleta,
        propiedad.iaIdentidad,
      ]
        .join(' ')
        .toLowerCase()
        .includes(termino),
    )
  }, [busqueda, propiedades])

  const stats = useMemo(() => {
    const total = propiedades.length
    const activas = propiedades.filter((p) => p.activa).length
    const agentes = propiedades.filter((p) => p.iaIdentidad).length
    return { total, activas, pendientes: total - activas, agentes }
  }, [propiedades])

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-24 h-[28rem] w-[28rem] rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute right-[-10rem] top-1/3 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
            backgroundSize: '56px 56px',
          }}
        />
      </div>

      <header className="sticky top-0 z-20 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-sm font-bold text-white shadow-lg shadow-indigo-500/30">
              DC
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                Digital Concierge
              </p>
              <p className="text-xs text-slate-500">Panel del propietario</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/configurar-vivienda"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-colors hover:bg-indigo-400"
            >
              <Plus className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">Añadir propiedad</span>
              <span className="sm:hidden">Añadir</span>
            </Link>
            <button
              type="button"
              onClick={cerrarSesion}
              disabled={cerrando}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:border-slate-600 hover:text-white disabled:opacity-60"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              <span className="sr-only sm:not-sr-only">Salir</span>
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8 flex flex-col gap-2">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Asistente IA activo
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Mis alojamientos
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-slate-400">
            Gestiona el conocimiento, los chats de huéspedes y el acceso QR de
            cada propiedad desde un único lugar.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatCard
            label="Propiedades"
            value={stats.total}
            icon={<Building2 className="h-5 w-5" aria-hidden />}
            accent="text-indigo-300 bg-indigo-500/10 ring-indigo-500/30"
            loading={cargando}
          />
          <StatCard
            label="Activas"
            value={stats.activas}
            icon={<CircleCheck className="h-5 w-5" aria-hidden />}
            accent="text-emerald-300 bg-emerald-500/10 ring-emerald-500/30"
            loading={cargando}
          />
          <StatCard
            label="Por configurar"
            value={stats.pendientes}
            icon={<Sparkles className="h-5 w-5" aria-hidden />}
            accent="text-amber-300 bg-amber-500/10 ring-amber-500/30"
            loading={cargando}
          />
          <StatCard
            label="Agentes IA"
            value={stats.agentes}
            icon={<MessagesSquare className="h-5 w-5" aria-hidden />}
            accent="text-sky-300 bg-sky-500/10 ring-sky-500/30"
            loading={cargando}
          />
        </div>

        {/* Search */}
        {!cargando && propiedades.length > 0 && (
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="relative w-full max-w-sm">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                aria-hidden
              />
              <input
                type="search"
                value={busqueda}
                onChange={(event) => setBusqueda(event.target.value)}
                placeholder="Buscar por nombre, dirección o agente..."
                aria-label="Buscar propiedades"
                className="w-full rounded-xl border border-slate-800 bg-slate-900/60 py-2.5 pl-9 pr-3 text-sm text-slate-200 placeholder:text-slate-500 outline-none transition-colors focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <p className="hidden shrink-0 text-xs text-slate-500 sm:block">
              {propiedadesFiltradas.length} de {propiedades.length}
            </p>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {error}
          </div>
        )}

        {cargando ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : propiedades.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 px-6 py-16 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-300 ring-1 ring-indigo-500/30">
              <Building2 className="h-7 w-7" aria-hidden />
            </div>
            <h2 className="text-lg font-semibold text-white">
              Aún no tienes propiedades
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-400">
              Configura tu primer alojamiento con el asistente IA: ubicación,
              manual, guía local y alertas.
            </p>
            <Link
              to="/configurar-vivienda"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-colors hover:bg-indigo-400"
            >
              <Plus className="h-4 w-4" aria-hidden />
              Crear primera propiedad
            </Link>
          </div>
        ) : propiedadesFiltradas.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 px-6 py-14 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 text-slate-400">
              <Search className="h-5 w-5" aria-hidden />
            </div>
            <p className="text-sm text-slate-400">
              No hay propiedades que coincidan con{' '}
              <span className="font-medium text-slate-200">
                &ldquo;{busqueda}&rdquo;
              </span>
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {propiedadesFiltradas.map((propiedad) => (
              <PropiedadCard key={propiedad.id} propiedad={propiedad} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

type StatCardProps = {
  label: string
  value: number
  icon: React.ReactNode
  accent: string
  loading: boolean
}

function StatCard({ label, value, icon, accent, loading }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 backdrop-blur-sm sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
          {label}
        </p>
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-xl ring-1 ${accent}`}
        >
          {icon}
        </span>
      </div>
      {loading ? (
        <div className="mt-3 h-8 w-12 animate-pulse rounded-md bg-slate-800" />
      ) : (
        <p className="mt-3 text-3xl font-semibold tabular-nums text-white">
          {value}
        </p>
      )}
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="h-5 w-3/4 animate-pulse rounded bg-slate-800" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-slate-800" />
        </div>
        <div className="h-6 w-16 animate-pulse rounded-full bg-slate-800" />
      </div>
      <div className="h-4 w-full animate-pulse rounded bg-slate-800" />
      <div className="mt-2 grid grid-cols-2 gap-2">
        <div className="h-10 animate-pulse rounded-xl bg-slate-800" />
        <div className="h-10 animate-pulse rounded-xl bg-slate-800" />
      </div>
      <div className="h-11 animate-pulse rounded-xl bg-slate-800" />
    </div>
  )
}
