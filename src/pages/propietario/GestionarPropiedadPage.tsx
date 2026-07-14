import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import HostFeedback from '../../components/ui/HostFeedback'
import HostPageShell from '../../components/ui/HostPageShell'
import HubTile from '../../components/ui/HubTile'
import { IconBook, IconMap, IconSettings } from '../../components/ui/icons'
import { HostLoading } from '../../components/ui/HostShell'
import {
  listarBloquesConocimiento,
  listarTarjetasGuiaPropiedad,
} from '../../services/conocimientoService'
import {
  obtenerPropiedadBasicaPropietario,
  obtenerPropietarioId,
} from '../../services/propiedadService'
import BaseConocimientoEditor from './components/BaseConocimientoEditor'
import ConfigPropiedadPanel from './components/ConfigPropiedadPanel'
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

  const hubDescription =
    vista === 'hub'
      ? 'Administra la base de conocimiento, las recomendaciones locales y la configuración del agente y alojamiento.'
      : undefined

  return (
    <HostPageShell
      backTo="/dashboard"
      eyebrow="Gestión de alojamiento"
      title={nombrePropiedad || 'Cargando...'}
      description={hubDescription}
      width="4xl"
    >
      {error && <HostFeedback className="mb-6">{error}</HostFeedback>}

      {cargando ? (
        <HostLoading label="Cargando propiedad..." />
      ) : vista === 'hub' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <HubTile
            accent="teal"
            icon={<IconBook />}
            title="Base de conocimiento"
            description="Bloques del manual indexados (Wi-Fi, acceso, normas...). Al guardar se actualizan los embeddings."
            meta={`${totalBloques} bloques indexados`}
            onClick={() => setVista('conocimiento')}
          />
          <HubTile
            accent="emerald"
            icon={<IconMap />}
            title="Guía local"
            description="Supermercados, farmacias y restaurantes cercanos. Añade, edita o elimina recomendaciones."
            meta={`${totalTarjetas} tarjetas indexadas`}
            onClick={() => setVista('guia')}
          />
          <HubTile
            accent="violet"
            icon={<IconSettings />}
            title="Agente y alojamiento"
            description="Nombre y personalidad del agente, datos del apartamento y ubicación."
            meta="Configuración general"
            onClick={() => setVista('config')}
          />
        </div>
      ) : vista === 'conocimiento' ? (
        <BaseConocimientoEditor
          propiedadId={propiedadId}
          onVolver={volverAlHub}
        />
      ) : vista === 'guia' ? (
        <GuiaLocalGestionPanel
          propiedadId={propiedadId}
          onVolver={volverAlHub}
        />
      ) : (
        <ConfigPropiedadPanel
          propiedadId={propiedadId}
          onVolver={volverAlHub}
          onActualizado={setNombrePropiedad}
        />
      )}
    </HostPageShell>
  )
}
