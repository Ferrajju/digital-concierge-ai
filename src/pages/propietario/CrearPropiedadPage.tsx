import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { crearPropiedadConDatos, obtenerPropietarioId } from '../../services/propiedadService'
import PropiedadChatPanel from './components/PropiedadChatPanel'
import PropiedadDatosForm from './components/PropiedadDatosForm'
import ValidacionWizard from './components/ValidacionWizard'
import {
  FORMULARIO_INICIAL,
  type FormularioPropiedad,
} from './types/formularioPropiedad'

type FaseConfiguracion = 'datos' | 'chat' | 'validacion'

export default function CrearPropiedadPage() {
  const navigate = useNavigate()
  const [fase, setFase] = useState<FaseConfiguracion>('datos')
  const [form, setForm] = useState<FormularioPropiedad>(FORMULARIO_INICIAL)
  const [propiedadId, setPropiedadId] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    obtenerPropietarioId().catch(() => navigate('/auth'))
  }, [navigate])

  const updateForm = (updates: Partial<FormularioPropiedad>) => {
    setForm((prev) => ({ ...prev, ...updates }))
  }

  const handleConfirmar = async (e: React.FormEvent) => {
    e.preventDefault()

    const nombreVivienda = form.nombreVivienda.trim()
    const nombreIa = form.nombreIa.trim()
    const direccionCalle = form.direccionCalle.trim()
    const codigoPostal = form.codigoPostal.trim()
    const ciudadRegion = form.ciudadRegion.trim()

    if (!direccionCalle) {
      setError('Introduce la calle y número de la vivienda.')
      return
    }
    if (!codigoPostal) {
      setError('Introduce el código postal.')
      return
    }
    if (!ciudadRegion) {
      setError('Introduce la ciudad o región.')
      return
    }
    if (!nombreVivienda) {
      setError('Introduce el nombre de la vivienda.')
      return
    }
    if (!nombreIa) {
      setError('Introduce el nombre de la IA.')
      return
    }

    setGuardando(true)
    setError('')

    try {
      const id = await crearPropiedadConDatos({
        nombreApartamento: nombreVivienda,
        nombreIa,
        ciudadRegion,
        direccionCalle,
        pisoPuerta: form.pisoPuerta.trim(),
        codigoPostal,
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

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-violet-600/15 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        {fase === 'datos' && (
          <div className="animate-fade-in-up">
            <div className="mb-8 sm:mb-10">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-400">
                Nueva vivienda
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Ubicación e identidad de tu alojamiento
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-400 sm:text-base">
                Especifica dónde está tu casa con precisión. Después la IA te
                hará preguntas para completar la configuración.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm sm:p-8">
              <PropiedadDatosForm
                form={form}
                onChange={updateForm}
                onSubmit={handleConfirmar}
                guardando={guardando}
                error={error}
              />
            </div>
          </div>
        )}

        {fase === 'chat' && propiedadId && (
          <div className="animate-fade-in-up">
            <PropiedadChatPanel
              propiedadId={propiedadId}
              nombreVivienda={form.nombreVivienda}
              onEntrevistaCompletada={() => setFase('validacion')}
            />
          </div>
        )}

        {fase === 'validacion' && propiedadId && (
          <ValidacionWizard
            propiedadId={propiedadId}
            nombreVivienda={form.nombreVivienda}
          />
        )}
      </div>
    </div>
  )
}
