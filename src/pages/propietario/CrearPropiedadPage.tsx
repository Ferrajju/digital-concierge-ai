import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { crearPropiedadConDatos, obtenerPropietarioId } from '../../services/propiedadService'
import AlertasConfigPanel from './components/AlertasConfigPanel'
import CrearPropiedadLayout, {
  type PasoCrearPropiedad,
} from './components/CrearPropiedadLayout'
import GuiaLocalPanel from './components/GuiaLocalPanel'
import PropiedadChatPanel from './components/PropiedadChatPanel'
import PropiedadUbicacionForm from './components/PropiedadUbicacionForm'
import StepNombreAgente from './components/StepNombreAgente'
import StepNombreVivienda from './components/StepNombreVivienda'
import ValidacionWizard from './components/ValidacionWizard'
import {
  FORMULARIO_INICIAL,
  type FormularioPropiedad,
} from './types/formularioPropiedad'

type FaseConfiguracion =
  | 'nombre'
  | 'ubicacion'
  | 'agente'
  | 'chat'
  | 'validacion'
  | 'guiaLocal'
  | 'alertas'

const FASE_A_PASO: Record<FaseConfiguracion, PasoCrearPropiedad> = {
  nombre: 1,
  ubicacion: 2,
  agente: 3,
  chat: 4,
  validacion: 5,
  guiaLocal: 6,
  alertas: 7,
}

function construirDireccionCompleta(form: FormularioPropiedad): string {
  const partes = [
    form.direccionCalle.trim(),
    form.pisoPuerta.trim(),
    form.codigoPostal.trim(),
    form.ciudadRegion.trim(),
  ].filter(Boolean)

  return partes.join(', ')
}

export default function CrearPropiedadPage() {
  const navigate = useNavigate()
  const [fase, setFase] = useState<FaseConfiguracion>('nombre')
  const [form, setForm] = useState<FormularioPropiedad>(FORMULARIO_INICIAL)
  const [propiedadId, setPropiedadId] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    obtenerPropietarioId().catch(() => navigate('/auth'))
  }, [navigate])

  const updateForm = (updates: Partial<FormularioPropiedad>) => {
    setForm((prev) => ({ ...prev, ...updates }))
    setError('')
  }

  const handleContinuarNombre = () => {
    const nombre = form.nombreVivienda.trim()
    if (!nombre) {
      setError('Introduce un nombre para tu apartamento.')
      return
    }
    setFase('ubicacion')
  }

  const handleContinuarUbicacion = (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.direccionCalle.trim()) {
      setError('Introduce la calle y número de la vivienda.')
      return
    }
    if (!form.codigoPostal.trim()) {
      setError('Introduce el código postal.')
      return
    }
    if (!form.ciudadRegion.trim()) {
      setError('Introduce la ciudad o región.')
      return
    }

    setError('')
    setFase('agente')
  }

  const handleCrearYComenzarChat = async () => {
    const nombreIa = form.nombreIa.trim()
    if (!nombreIa) {
      setError('Introduce un nombre para tu agente IA.')
      return
    }

    setGuardando(true)
    setError('')

    try {
      const id = await crearPropiedadConDatos({
        nombreApartamento: form.nombreVivienda.trim(),
        nombreIa,
        ciudadRegion: form.ciudadRegion.trim(),
        direccionCalle: form.direccionCalle.trim(),
        pisoPuerta: form.pisoPuerta.trim(),
        codigoPostal: form.codigoPostal.trim(),
        indicacionesAcceso: form.indicacionesAcceso.trim(),
      })
      setPropiedadId(id)
      setFase('chat')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo crear la vivienda en Supabase.',
      )
    } finally {
      setGuardando(false)
    }
  }

  const paso = FASE_A_PASO[fase]
  const anchoAmplio =
    fase === 'chat' || fase === 'validacion' || fase === 'guiaLocal'

  return (
    <CrearPropiedadLayout paso={paso} anchoAmplio={anchoAmplio}>
      {fase === 'nombre' && (
        <StepNombreVivienda
          valor={form.nombreVivienda}
          onChange={(nombreVivienda) => updateForm({ nombreVivienda })}
          onContinuar={handleContinuarNombre}
          error={error}
        />
      )}

      {fase === 'ubicacion' && (
        <PropiedadUbicacionForm
          form={form}
          nombreVivienda={form.nombreVivienda}
          onChange={updateForm}
          onSubmit={handleContinuarUbicacion}
          onVolver={() => setFase('nombre')}
          guardando={false}
          error={error}
        />
      )}

      {fase === 'agente' && (
        <StepNombreAgente
          valor={form.nombreIa}
          nombreVivienda={form.nombreVivienda}
          onChange={(nombreIa) => updateForm({ nombreIa })}
          onContinuar={handleCrearYComenzarChat}
          onVolver={() => setFase('ubicacion')}
          guardando={guardando}
          error={error}
        />
      )}

      {fase === 'chat' && propiedadId && (
        <PropiedadChatPanel
          propiedadId={propiedadId}
          nombreVivienda={form.nombreVivienda}
          nombreIa={form.nombreIa}
          onEntrevistaCompletada={() => setFase('validacion')}
        />
      )}

      {fase === 'validacion' && propiedadId && (
        <ValidacionWizard
          propiedadId={propiedadId}
          nombreVivienda={form.nombreVivienda}
          onIndexacionCompleta={() => setFase('guiaLocal')}
        />
      )}

      {fase === 'guiaLocal' && propiedadId && (
        <GuiaLocalPanel
          propiedadId={propiedadId}
          nombreVivienda={form.nombreVivienda}
          direccionCompleta={construirDireccionCompleta(form)}
          onCompleta={() => setFase('alertas')}
        />
      )}

      {fase === 'alertas' && propiedadId && (
        <AlertasConfigPanel
          propiedadId={propiedadId}
          nombreVivienda={form.nombreVivienda}
        />
      )}
    </CrearPropiedadLayout>
  )
}
