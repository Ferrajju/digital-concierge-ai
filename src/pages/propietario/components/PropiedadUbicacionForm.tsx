import LocationSearch from '../../../components/LocationSearch'
import Button from '../../../components/ui/Button'
import FormSection, { FieldGroup, InsetPanel } from '../../../components/ui/FormSection'
import HostFeedback from '../../../components/ui/HostFeedback'
import { inputClassName } from '../../../components/ui/inputClassName'
import WizardStepShell, { WizardActions } from '../../../components/ui/WizardStepShell'
import type { ParsedAddress } from '../../../utils/parseGooglePlace'
import type { FormularioPropiedad } from '../types/formularioPropiedad'

type PropiedadUbicacionFormProps = {
  form: FormularioPropiedad
  nombreVivienda: string
  onChange: (updates: Partial<FormularioPropiedad>) => void
  onSubmit: (e: React.FormEvent) => void
  onVolver: () => void
  guardando: boolean
  error: string
}

export default function PropiedadUbicacionForm({
  form,
  nombreVivienda,
  onChange,
  onSubmit,
  onVolver,
  guardando,
  error,
}: PropiedadUbicacionFormProps) {
  const handlePlaceSelect = (parsed: ParsedAddress) => {
    onChange({
      busquedaRapida: parsed.busquedaRapida,
      direccionCalle: parsed.direccionCalle,
      codigoPostal: parsed.codigoPostal,
      ciudadRegion: parsed.ciudadRegion,
    })
  }

  return (
    <WizardStepShell
      paso={2}
      title={
        <>
          ¿Dónde está{' '}
          <span className="text-host-primary">{nombreVivienda}</span>?
        </>
      }
      description="Indica la ubicación con precisión. Los huéspedes la usarán para llegar y el agente IA la tendrá como referencia."
    >
      <form onSubmit={onSubmit} className="space-y-6">
        <FormSection
          title="Buscador rápido"
          description="Selecciona tu dirección en Google Maps y autorrellenaremos los campos. Puedes editarlos después."
        >
          <InsetPanel>
            <LocationSearch
              value={form.busquedaRapida}
              onChange={(value) => onChange({ busquedaRapida: value })}
              onPlaceSelect={handlePlaceSelect}
              disabled={guardando}
            />
          </InsetPanel>
        </FormSection>

        <FormSection title="Dirección detallada">
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldGroup label="Calle y número" className="sm:col-span-2">
              <input
                id="direccion-calle"
                type="text"
                value={form.direccionCalle}
                onChange={(e) => onChange({ direccionCalle: e.target.value })}
                placeholder="Ej: Carrer de Balmes, 123"
                disabled={guardando}
                className={inputClassName}
              />
            </FieldGroup>

            <FieldGroup label="Piso, puerta o bloque">
              <input
                id="piso-puerta"
                type="text"
                value={form.pisoPuerta}
                onChange={(e) => onChange({ pisoPuerta: e.target.value })}
                placeholder="Ej: Ático B, 1ºA"
                disabled={guardando}
                className={inputClassName}
              />
            </FieldGroup>

            <FieldGroup label="Código postal">
              <input
                id="codigo-postal"
                type="text"
                value={form.codigoPostal}
                onChange={(e) => onChange({ codigoPostal: e.target.value })}
                placeholder="Ej: 08008"
                disabled={guardando}
                className={inputClassName}
              />
            </FieldGroup>

            <FieldGroup label="Ciudad / región" className="sm:col-span-2">
              <input
                id="ciudad-region"
                type="text"
                value={form.ciudadRegion}
                onChange={(e) => onChange({ ciudadRegion: e.target.value })}
                placeholder="Ej: Barcelona, Cataluña"
                disabled={guardando}
                className={inputClassName}
              />
            </FieldGroup>

            <FieldGroup
              label="Indicaciones de acceso para huéspedes"
              className="sm:col-span-2"
            >
              <textarea
                id="indicaciones-acceso"
                value={form.indicacionesAcceso}
                onChange={(e) =>
                  onChange({ indicacionesAcceso: e.target.value })
                }
                placeholder="Ej: El portal es el de la puerta de madera al lado de la cafetería"
                rows={3}
                disabled={guardando}
                className={`resize-none ${inputClassName}`}
              />
            </FieldGroup>
          </div>
        </FormSection>

        {error && <HostFeedback>{error}</HostFeedback>}

        <WizardActions>
          <Button
            type="button"
            variant="secondary"
            onClick={onVolver}
            disabled={guardando}
          >
            ← Volver
          </Button>
          <Button type="submit" size="lg" loading={guardando} disabled={guardando}>
            Continuar
          </Button>
        </WizardActions>
      </form>
    </WizardStepShell>
  )
}
