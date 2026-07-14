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
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {propiedades.map((propiedad) => (
            <PropiedadCard key={propiedad.id} propiedad={propiedad} />
          ))}
        </div>
      )}
    </HostShell>
  )
}
