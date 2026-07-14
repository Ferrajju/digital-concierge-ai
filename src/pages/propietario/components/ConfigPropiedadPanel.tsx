import { useEffect, useRef, useState } from 'react'
import LocationSearch from '../../../components/LocationSearch'
import { reprocesarGuiaLocalPorUbicacion } from '../../../services/conocimientoService'
import {
  actualizarConfiguracionPropiedad,
  construirDireccionCompletaConfig,
  obtenerConfiguracionPropiedad,
  ubicacionCambioAfectaGuia,
} from '../../../services/propiedadService'
import { useGoogleMaps } from '../../../providers/GoogleMapsProvider'
import type { ParsedAddress } from '../../../utils/parseGooglePlace'
import {
  PERSONALIDADES_AGENTE,
  resolverPersonalidadAgente,
  type ConfigPropiedadForm,
  type ConfigPropiedadGuardada,
  type PersonalidadAgenteId,
} from '../types/configPropiedad'

const inputClassName =
  'w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-white placeholder:text-slate-600 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-50'

type ConfigPropiedadPanelProps = {
  propiedadId: string
  onVolver: () => void
  onActualizado?: (nombreApartamento: string) => void
}

function validarFormulario(form: ConfigPropiedadForm): string | null {
  if (!form.nombreApartamento.trim()) {
    return 'Introduce el nombre del apartamento.'
  }
  if (!form.nombreIa.trim()) {
    return 'Introduce el nombre del agente IA.'
  }
  if (!form.direccionCalle.trim()) {
    return 'Introduce la calle y número.'
  }
  if (!form.codigoPostal.trim()) {
    return 'Introduce el código postal.'
  }
  if (!form.ciudadRegion.trim()) {
    return 'Introduce la ciudad o región.'
  }
  return null
}

export default function ConfigPropiedadPanel({
  propiedadId,
  onVolver,
  onActualizado,
}: ConfigPropiedadPanelProps) {
  const { isLoaded, loadError, apiKeyConfigured } = useGoogleMaps()

  const [original, setOriginal] = useState<ConfigPropiedadGuardada | null>(null)
  const [form, setForm] = useState<ConfigPropiedadForm | null>(null)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [mensajeOk, setMensajeOk] = useState('')
  const [mostrarAvisoUbicacion, setMostrarAvisoUbicacion] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    let activo = true

    const cargar = async () => {
      setCargando(true)
      setError('')
      try {
        const config = await obtenerConfiguracionPropiedad(propiedadId)
        if (!activo) return
        setOriginal(config)
        setForm({
          nombreApartamento: config.nombreApartamento,
          nombreIa: config.nombreIa,
          iaElegancia: config.iaElegancia,
          iaExpresividad: config.iaExpresividad,
          busquedaRapida: config.busquedaRapida,
          direccionCalle: config.direccionCalle,
          pisoPuerta: config.pisoPuerta,
          codigoPostal: config.codigoPostal,
          ciudadRegion: config.ciudadRegion,
          indicacionesAcceso: config.indicacionesAcceso,
        })
      } catch (err) {
        if (!activo) return
        setError(
          err instanceof Error
            ? err.message
            : 'No se pudo cargar la configuración.',
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

  const updateForm = (updates: Partial<ConfigPropiedadForm>) => {
    setForm((prev) => (prev ? { ...prev, ...updates } : prev))
    setMensajeOk('')
    setError('')
  }

  const handlePlaceSelect = (parsed: ParsedAddress) => {
    updateForm({
      busquedaRapida: parsed.busquedaRapida,
      direccionCalle: parsed.direccionCalle,
      codigoPostal: parsed.codigoPostal,
      ciudadRegion: parsed.ciudadRegion,
    })
  }

  const ejecutarGuardado = async (reprocesarGuia: boolean) => {
    if (!form || !original) return

    const validacion = validarFormulario(form)
    if (validacion) {
      setError(validacion)
      return
    }

    if (reprocesarGuia && !isLoaded) {
      setError('Google Maps aún no está listo para regenerar la guía local.')
      return
    }

    setGuardando(true)
    setError('')
    setMensajeOk('')
    setMostrarAvisoUbicacion(false)
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      await actualizarConfiguracionPropiedad(propiedadId, form, original.zonaId)

      if (reprocesarGuia) {
        const direccionCompleta = construirDireccionCompletaConfig(form)
        await reprocesarGuiaLocalPorUbicacion(
          propiedadId,
          direccionCompleta,
          controller.signal,
        )
        setMensajeOk(
          'Configuración guardada y guía local reprocesada con la nueva ubicación.',
        )
      } else {
        setMensajeOk('Configuración guardada correctamente.')
      }

      const configActualizada = await obtenerConfiguracionPropiedad(propiedadId)
      setOriginal(configActualizada)
      setForm({
        nombreApartamento: configActualizada.nombreApartamento,
        nombreIa: configActualizada.nombreIa,
        iaElegancia: configActualizada.iaElegancia,
        iaExpresividad: configActualizada.iaExpresividad,
        busquedaRapida: configActualizada.busquedaRapida,
        direccionCalle: configActualizada.direccionCalle,
        pisoPuerta: configActualizada.pisoPuerta,
        codigoPostal: configActualizada.codigoPostal,
        ciudadRegion: configActualizada.ciudadRegion,
        indicacionesAcceso: configActualizada.indicacionesAcceso,
      })
      onActualizado?.(configActualizada.nombreApartamento)
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo guardar la configuración.',
      )
    } finally {
      setGuardando(false)
    }
  }

  const handleGuardar = () => {
    if (!form || !original) return

    const validacion = validarFormulario(form)
    if (validacion) {
      setError(validacion)
      return
    }

    const cambioUbicacion = ubicacionCambioAfectaGuia(original, form)
    if (cambioUbicacion) {
      setMostrarAvisoUbicacion(true)
      return
    }

    void ejecutarGuardado(false)
  }

  const cambioUbicacionPendiente =
    original && form ? ubicacionCambioAfectaGuia(original, form) : false

  const personalidadSeleccionada: PersonalidadAgenteId = form
    ? resolverPersonalidadAgente(form.iaElegancia, form.iaExpresividad)
    : 'acogedor'

  const seleccionarPersonalidad = (id: PersonalidadAgenteId) => {
    const personalidad = PERSONALIDADES_AGENTE.find((item) => item.id === id)
    if (!personalidad) return

    updateForm({
      iaElegancia: personalidad.iaElegancia,
      iaExpresividad: personalidad.iaExpresividad,
    })
  }

  if (cargando || !form) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-indigo-500/20 border-t-indigo-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onVolver}
          disabled={guardando}
          className="text-sm text-slate-500 transition-colors hover:text-indigo-300 disabled:opacity-40"
        >
          ← Volver al hub
        </button>
      </div>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6">
        <div className="mb-6 flex items-start gap-3">
          <span className="text-2xl" aria-hidden>
            🤖
          </span>
          <div>
            <h2 className="text-lg font-semibold text-white">Agente IA</h2>
            <p className="mt-1 text-sm text-slate-400">
              Nombre y personalidad que verán los huéspedes al chatear.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label
              htmlFor="nombre-agente"
              className="block text-sm font-medium text-slate-300"
            >
              Nombre del agente
            </label>
            <input
              id="nombre-agente"
              type="text"
              value={form.nombreIa}
              onChange={(e) => updateForm({ nombreIa: e.target.value })}
              disabled={guardando}
              placeholder="Ej: Marco"
              className={`mt-2 max-w-md ${inputClassName}`}
            />
          </div>

          <div>
            <p className="text-sm font-medium text-slate-300">
              Personalidad del conserje
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Elige el tono que mejor encaje con tu tipo de alojamiento y
              propietario.
            </p>

            <div className="mt-4 grid gap-3 lg:grid-cols-3">
              {PERSONALIDADES_AGENTE.map((personalidad) => {
                const seleccionada = personalidadSeleccionada === personalidad.id

                return (
                  <button
                    key={personalidad.id}
                    type="button"
                    disabled={guardando}
                    onClick={() => seleccionarPersonalidad(personalidad.id)}
                    className={`rounded-2xl border p-4 text-left transition-all disabled:opacity-60 ${
                      seleccionada
                        ? 'border-indigo-500/60 bg-indigo-500/10 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/40'
                        : 'border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-2xl" aria-hidden>
                        {personalidad.icono}
                      </span>
                      {seleccionada && (
                        <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-indigo-300">
                          Activa
                        </span>
                      )}
                    </div>
                    <h3 className="mt-3 text-sm font-semibold text-white">
                      {personalidad.titulo}
                    </h3>
                    <p className="mt-1 text-xs font-medium text-indigo-300/90">
                      {personalidad.subtitulo}
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-slate-400">
                      {personalidad.descripcion}
                    </p>
                    <p className="mt-3 text-[11px] text-slate-500">
                      {personalidad.perfilPropietario}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6">
        <div className="mb-6 flex items-start gap-3">
          <span className="text-2xl" aria-hidden>
            🏠
          </span>
          <div>
            <h2 className="text-lg font-semibold text-white">Alojamiento</h2>
            <p className="mt-1 text-sm text-slate-400">
              Nombre visible y ubicación de referencia para huéspedes y guía
              local.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="nombre-apartamento"
              className="block text-sm font-medium text-slate-300"
            >
              Nombre del apartamento
            </label>
            <input
              id="nombre-apartamento"
              type="text"
              value={form.nombreApartamento}
              onChange={(e) =>
                updateForm({ nombreApartamento: e.target.value })
              }
              disabled={guardando}
              placeholder="Ej: Apartamento 5"
              className={`mt-2 ${inputClassName}`}
            />
          </div>

          {apiKeyConfigured && (
            <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
                Buscador rápido
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Selecciona la dirección en Google Maps para autorrellenar.
              </p>
              <div className="mt-3">
                <LocationSearch
                  value={form.busquedaRapida}
                  onChange={(value) => updateForm({ busquedaRapida: value })}
                  onPlaceSelect={handlePlaceSelect}
                  disabled={guardando || !isLoaded}
                />
              </div>
              {loadError && (
                <p className="mt-2 text-xs text-rose-300">
                  No se pudo cargar Google Maps: {loadError.message}
                </p>
              )}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label
                htmlFor="config-direccion-calle"
                className="block text-sm font-medium text-slate-300"
              >
                Calle y número
              </label>
              <input
                id="config-direccion-calle"
                type="text"
                value={form.direccionCalle}
                onChange={(e) =>
                  updateForm({ direccionCalle: e.target.value })
                }
                disabled={guardando}
                className={`mt-2 ${inputClassName}`}
              />
            </div>

            <div>
              <label
                htmlFor="config-piso"
                className="block text-sm font-medium text-slate-300"
              >
                Piso, puerta o bloque
              </label>
              <input
                id="config-piso"
                type="text"
                value={form.pisoPuerta}
                onChange={(e) => updateForm({ pisoPuerta: e.target.value })}
                disabled={guardando}
                className={`mt-2 ${inputClassName}`}
              />
            </div>

            <div>
              <label
                htmlFor="config-cp"
                className="block text-sm font-medium text-slate-300"
              >
                Código postal
              </label>
              <input
                id="config-cp"
                type="text"
                value={form.codigoPostal}
                onChange={(e) => updateForm({ codigoPostal: e.target.value })}
                disabled={guardando}
                className={`mt-2 ${inputClassName}`}
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="config-ciudad"
                className="block text-sm font-medium text-slate-300"
              >
                Ciudad / región
              </label>
              <input
                id="config-ciudad"
                type="text"
                value={form.ciudadRegion}
                onChange={(e) => updateForm({ ciudadRegion: e.target.value })}
                disabled={guardando}
                className={`mt-2 ${inputClassName}`}
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="config-indicaciones"
                className="block text-sm font-medium text-slate-300"
              >
                Indicaciones de acceso
              </label>
              <textarea
                id="config-indicaciones"
                value={form.indicacionesAcceso}
                onChange={(e) =>
                  updateForm({ indicacionesAcceso: e.target.value })
                }
                disabled={guardando}
                rows={3}
                className={`mt-2 resize-none ${inputClassName}`}
              />
            </div>
          </div>

          {cambioUbicacionPendiente && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
              Has modificado la ubicación. Al guardar se eliminarán las
              recomendaciones locales actuales y se generará una guía nueva
              según la dirección actualizada.
            </div>
          )}
        </div>
      </section>

      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      {mensajeOk && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {mensajeOk}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onVolver}
          disabled={guardando}
          className="rounded-xl border border-slate-700 px-5 py-3 text-sm text-slate-400 transition-colors hover:border-slate-600 disabled:opacity-40"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleGuardar}
          disabled={guardando}
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:from-indigo-400 hover:to-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {guardando ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Guardando...
            </>
          ) : (
            'Guardar cambios'
          )}
        </button>
      </div>

      {mostrarAvisoUbicacion && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="aviso-ubicacion-titulo"
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h3
              id="aviso-ubicacion-titulo"
              className="text-lg font-semibold text-white"
            >
              Reprocesar guía local
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              Al cambiar calle, código postal, piso o ciudad se volverá a
              generar la guía de recomendaciones desde cero. Se eliminarán las
              tarjetas actuales y se buscarán lugares cercanos a la nueva
              ubicación, igual que en la configuración inicial.
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setMostrarAvisoUbicacion(false)}
                disabled={guardando}
                className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm text-slate-400 transition-colors hover:border-slate-600 disabled:opacity-40"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void ejecutarGuardado(true)}
                disabled={guardando}
                className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:from-amber-400 hover:to-orange-500 disabled:opacity-60"
              >
                {guardando ? 'Reprocesando...' : 'Confirmar y reprocesar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
