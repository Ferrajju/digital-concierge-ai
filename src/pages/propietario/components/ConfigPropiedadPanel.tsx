import { useEffect, useRef, useState } from 'react'
import LocationSearch from '../../../components/LocationSearch'
import Button from '../../../components/ui/Button'
import FormSection, { FieldGroup, InsetPanel } from '../../../components/ui/FormSection'
import HostFeedback from '../../../components/ui/HostFeedback'
import HostModal from '../../../components/ui/HostModal'
import { HostSubpageHeader } from '../../../components/ui/HostPageShell'
import { HostLoading } from '../../../components/ui/HostShell'
import {
  inputClassName,
} from '../../../components/ui/inputClassName'
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

    if (ubicacionCambioAfectaGuia(original, form)) {
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
    return <HostLoading label="Cargando configuración..." />
  }

  return (
    <div className="space-y-6">
      <HostSubpageHeader
        onBack={onVolver}
        backLabel="Volver al hub"
        title="Agente y alojamiento"
        description="Nombre y personalidad del conserje, datos del apartamento y ubicación."
      />

      <FormSection
        title="Agente IA"
        description="Nombre y personalidad que verán los huéspedes al chatear."
      >
        <FieldGroup label="Nombre del agente">
          <input
            id="nombre-agente"
            type="text"
            value={form.nombreIa}
            onChange={(e) => updateForm({ nombreIa: e.target.value })}
            disabled={guardando}
            placeholder="Ej: Marco"
            className={`max-w-md ${inputClassName}`}
          />
        </FieldGroup>

        <FieldGroup label="Personalidad del conserje">
          <p className="mb-3 text-sm text-host-muted">
            Elige el tono que mejor encaje con tu tipo de alojamiento.
          </p>

          <div className="grid gap-3 lg:grid-cols-3">
            {PERSONALIDADES_AGENTE.map((personalidad) => {
              const seleccionada = personalidadSeleccionada === personalidad.id

              return (
                <button
                  key={personalidad.id}
                  type="button"
                  disabled={guardando}
                  onClick={() => seleccionarPersonalidad(personalidad.id)}
                  className={`rounded-xl border-2 p-4 text-left transition-all disabled:opacity-60 ${
                    seleccionada
                      ? 'border-host-primary bg-teal-50 shadow-sm'
                      : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-2xl" aria-hidden>
                      {personalidad.icono}
                    </span>
                    {seleccionada && (
                      <span className="rounded-md border border-teal-300 bg-teal-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-teal-800">
                        Activa
                      </span>
                    )}
                  </div>
                  <h4 className="mt-3 text-sm font-bold text-host-text">
                    {personalidad.titulo}
                  </h4>
                  <p className="mt-1 text-xs font-semibold text-host-primary">
                    {personalidad.subtitulo}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-host-muted">
                    {personalidad.descripcion}
                  </p>
                </button>
              )
            })}
          </div>
        </FieldGroup>
      </FormSection>

      <FormSection
        title="Alojamiento"
        description="Nombre visible y ubicación de referencia para huéspedes y guía local."
      >
        <FieldGroup label="Nombre del apartamento">
          <input
            id="nombre-apartamento"
            type="text"
            value={form.nombreApartamento}
            onChange={(e) =>
              updateForm({ nombreApartamento: e.target.value })
            }
            disabled={guardando}
            className={inputClassName}
          />
        </FieldGroup>

        {apiKeyConfigured && (
          <InsetPanel>
            <p className="text-xs font-bold uppercase tracking-wide text-host-primary">
              Buscador rápido
            </p>
            <p className="mt-1 text-sm text-host-muted">
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
              <HostFeedback className="mt-3">
                No se pudo cargar Google Maps: {loadError.message}
              </HostFeedback>
            )}
          </InsetPanel>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <FieldGroup label="Calle y número" className="sm:col-span-2">
            <input
              id="config-direccion-calle"
              type="text"
              value={form.direccionCalle}
              onChange={(e) =>
                updateForm({ direccionCalle: e.target.value })
              }
              disabled={guardando}
              className={inputClassName}
            />
          </FieldGroup>
          <FieldGroup label="Piso, puerta o bloque">
            <input
              id="config-piso"
              type="text"
              value={form.pisoPuerta}
              onChange={(e) => updateForm({ pisoPuerta: e.target.value })}
              disabled={guardando}
              className={inputClassName}
            />
          </FieldGroup>
          <FieldGroup label="Código postal">
            <input
              id="config-cp"
              type="text"
              value={form.codigoPostal}
              onChange={(e) => updateForm({ codigoPostal: e.target.value })}
              disabled={guardando}
              className={inputClassName}
            />
          </FieldGroup>
          <FieldGroup label="Ciudad / región" className="sm:col-span-2">
            <input
              id="config-ciudad"
              type="text"
              value={form.ciudadRegion}
              onChange={(e) => updateForm({ ciudadRegion: e.target.value })}
              disabled={guardando}
              className={inputClassName}
            />
          </FieldGroup>
          <FieldGroup label="Indicaciones de acceso" className="sm:col-span-2">
            <textarea
              id="config-indicaciones"
              value={form.indicacionesAcceso}
              onChange={(e) =>
                updateForm({ indicacionesAcceso: e.target.value })
              }
              disabled={guardando}
              rows={3}
              className={`resize-none ${inputClassName}`}
            />
          </FieldGroup>
        </div>

        {cambioUbicacionPendiente && (
          <HostFeedback variant="warning">
            Has modificado la ubicación. Al guardar se eliminarán las
            recomendaciones locales actuales y se generará una guía nueva.
          </HostFeedback>
        )}
      </FormSection>

      {error && <HostFeedback>{error}</HostFeedback>}
      {mensajeOk && <HostFeedback variant="success">{mensajeOk}</HostFeedback>}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="secondary"
          onClick={onVolver}
          disabled={guardando}
        >
          Cancelar
        </Button>
        <Button
          type="button"
          onClick={handleGuardar}
          loading={guardando}
          disabled={guardando}
          size="lg"
        >
          Guardar cambios
        </Button>
      </div>

      {mostrarAvisoUbicacion && (
        <HostModal
          title="Reprocesar guía local"
          onClose={() => setMostrarAvisoUbicacion(false)}
          confirmLabel={
            guardando ? 'Reprocesando...' : 'Confirmar y reprocesar'
          }
          onConfirm={() => void ejecutarGuardado(true)}
          confirmLoading={guardando}
          confirmVariant="warning"
        >
          Al cambiar calle, código postal, piso o ciudad se volverá a generar la
          guía de recomendaciones desde cero. Se eliminarán las tarjetas
          actuales y se buscarán lugares cercanos a la nueva ubicación.
        </HostModal>
      )}
    </div>
  )
}
