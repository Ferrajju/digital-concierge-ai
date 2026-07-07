import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LocationSearch from '../../components/LocationSearch'
import { crearPropiedadConDatos, obtenerPropietarioId } from '../../services/propiedadService'
import PropiedadChatPanel from './components/PropiedadChatPanel'

type FaseConfiguracion = 'datos' | 'chat'

export default function CrearPropiedadPage() {
  const navigate = useNavigate()
  const [fase, setFase] = useState<FaseConfiguracion>('datos')
  const [nombreVivienda, setNombreVivienda] = useState('')
  const [ubicacion, setUbicacion] = useState('')
  const [propiedadId, setPropiedadId] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    obtenerPropietarioId().catch(() => navigate('/auth'))
  }, [navigate])

  const handleConfirmar = async (e: React.FormEvent) => {
    e.preventDefault()
    const nombre = nombreVivienda.trim()
    const direccion = ubicacion.trim()

    if (!nombre) {
      setError('Introduce el nombre de la vivienda.')
      return
    }

    if (!direccion) {
      setError('Selecciona la ubicación de tu alojamiento.')
      return
    }

    setGuardando(true)
    setError('')

    try {
      const id = await crearPropiedadConDatos({
        nombreApartamento: nombre,
        ubicacionBase: direccion,
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

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
        {fase === 'datos' ? (
          <div className="animate-fade-in-up">
            <div className="mb-8 text-center sm:mb-10">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-400">
                Nueva vivienda
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Datos básicos de tu alojamiento
              </h1>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-slate-400 sm:text-base">
                Indica el nombre y la ubicación exacta. Después la IA te hará
                preguntas para completar la configuración.
              </p>
            </div>

            <form
              onSubmit={handleConfirmar}
              className="mx-auto max-w-lg space-y-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm sm:p-8"
            >
              <div>
                <label
                  htmlFor="nombre-vivienda"
                  className="block text-sm font-medium text-slate-300"
                >
                  Nombre de la Vivienda
                </label>
                <input
                  id="nombre-vivienda"
                  type="text"
                  value={nombreVivienda}
                  onChange={(e) => setNombreVivienda(e.target.value)}
                  placeholder="Ej: Apartamento Mar Azul"
                  disabled={guardando}
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3.5 text-white placeholder:text-slate-600 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300">
                  Ubicación del alojamiento
                </label>
                <div className="mt-2">
                  <LocationSearch
                    value={ubicacion}
                    onChange={setUbicacion}
                    onPlaceSelect={setUbicacion}
                    disabled={guardando}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Busca y selecciona la dirección exacta con Google Maps.
                </p>
              </div>

              {error && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={guardando}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:from-indigo-400 hover:to-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {guardando ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Creando vivienda...
                  </>
                ) : (
                  'Confirmar y Comenzar Entrevista con la IA'
                )}
              </button>
            </form>
          </div>
        ) : (
          propiedadId && (
            <div className="animate-fade-in-up">
              <PropiedadChatPanel
                propiedadId={propiedadId}
                nombreVivienda={nombreVivienda}
              />
            </div>
          )
        )}
      </div>
    </div>
  )
}
