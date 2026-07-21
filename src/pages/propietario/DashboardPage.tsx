import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import HostShell, { HostAlert, HostLoading } from '../../components/ui/HostShell'
import { IconHome, IconPlus } from '../../components/ui/icons'
import PageHeader from '../../components/ui/PageHeader'
import {
  listarPropiedadesPropietario,
  obtenerPropietarioId,
} from '../../services/propiedadService'
import PropiedadCard from './components/PropiedadCard'
import TelegramSetupBanner from './components/TelegramSetupBanner'
import { useHostScreen } from '../../hooks/useHostScreen'
import type { PropiedadResumen } from './types/propiedadDashboard'

export default function DashboardPage() {
  const navigate = useNavigate()
  const [propiedades, setPropiedades] = useState<PropiedadResumen[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useHostScreen({
    screenId: 'dashboard',
    screenTitle: 'Panel principal',
  })

  useEffect(() => {
    let activo = true

    const cargar = async () => {
      try {
        await obtenerPropietarioId()
        const lista = await listarPropiedadesPropietario()
        if (!activo) return
        setPropiedades(lista)
        setError('')
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

  const recargarPropiedades = async () => {
    try {
      const lista = await listarPropiedadesPropietario()
      setPropiedades(lista)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudieron actualizar las propiedades.',
      )
    }
  }

  return (
    <HostShell
      headerAction={
        <Button to="/configurar-vivienda" size="sm">
          <IconPlus className="h-4 w-4" />
          <span className="hidden sm:inline">Añadir propiedad</span>
          <span className="sm:hidden">Añadir</span>
        </Button>
      }
    >
      <PageHeader
        title="Mis alojamientos"
        description="Gestiona el conocimiento, los chats de huéspedes y el acceso QR de cada propiedad."
      />

      {error && <HostAlert>{error}</HostAlert>}

      <TelegramSetupBanner />

      {cargando ? (
        <HostLoading label="Cargando propiedades..." />
      ) : propiedades.length === 0 ? (
        <EmptyState
          icon={<IconHome className="h-7 w-7" />}
          title="Aún no tienes propiedades"
          description="Configura tu primer alojamiento con el asistente: ubicación, manual del huésped, guía local y alertas."
          actionLabel="Crear primera propiedad"
          actionTo="/configurar-vivienda"
        />
      ) : (
        <>
          <div className="mb-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-stone-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-stone-500">
                Total alojamientos
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-host-text">
                {propiedades.length}
              </p>
            </div>
            <div className="rounded-xl border border-stone-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-stone-500">
                Activas
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-emerald-700">
                {propiedades.filter((p) => p.activa).length}
              </p>
            </div>
            <div className="rounded-xl border border-stone-200 bg-white px-4 py-3 shadow-sm sm:col-span-1">
              <p className="text-xs font-bold uppercase tracking-wide text-stone-500">
                Pendientes de configurar
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-stone-600">
                {propiedades.filter((p) => !p.activa).length}
              </p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {propiedades.map((propiedad) => (
              <PropiedadCard
                key={propiedad.id}
                propiedad={propiedad}
                onActualizar={recargarPropiedades}
              />
            ))}
          </div>
        </>
      )}
    </HostShell>
  )
}
