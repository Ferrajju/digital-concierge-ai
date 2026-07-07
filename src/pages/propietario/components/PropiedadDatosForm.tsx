import LocationSearch from '../../../components/LocationSearch'
import type { ParsedAddress } from '../../../utils/parseGooglePlace'
import type { FormularioPropiedad } from '../types/formularioPropiedad'

const inputClassName =
  'w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3.5 text-sm text-white placeholder:text-slate-600 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-50'

type PropiedadDatosFormProps = {
  form: FormularioPropiedad
  onChange: (updates: Partial<FormularioPropiedad>) => void
  onSubmit: (e: React.FormEvent) => void
  guardando: boolean
  error: string
}

export default function PropiedadDatosForm({
  form,
  onChange,
  onSubmit,
  guardando,
  error,
}: PropiedadDatosFormProps) {
  const handlePlaceSelect = (parsed: ParsedAddress) => {
    onChange({
      busquedaRapida: parsed.busquedaRapida,
      direccionCalle: parsed.direccionCalle,
      codigoPostal: parsed.codigoPostal,
      ciudadRegion: parsed.ciudadRegion,
    })
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {/* Buscador rápido */}
      <section className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-5 sm:p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-indigo-400">
          Buscador rápido
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Selecciona tu dirección en Google Maps y autorrellenaremos los campos
          de abajo. Puedes editarlos manualmente después.
        </p>
        <div className="mt-4">
          <LocationSearch
            value={form.busquedaRapida}
            onChange={(value) => onChange({ busquedaRapida: value })}
            onPlaceSelect={handlePlaceSelect}
            disabled={guardando}
          />
        </div>
      </section>

      {/* Ubicación detallada */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          Ubicación detallada
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="direccion-calle" className="block text-sm font-medium text-slate-300">
              Calle y Número
            </label>
            <input
              id="direccion-calle"
              type="text"
              value={form.direccionCalle}
              onChange={(e) => onChange({ direccionCalle: e.target.value })}
              placeholder="Ej: Carrer de Balmes, 123"
              disabled={guardando}
              className={`mt-2 ${inputClassName}`}
            />
          </div>

          <div>
            <label htmlFor="piso-puerta" className="block text-sm font-medium text-slate-300">
              Piso, Puerta o Bloque
            </label>
            <input
              id="piso-puerta"
              type="text"
              value={form.pisoPuerta}
              onChange={(e) => onChange({ pisoPuerta: e.target.value })}
              placeholder='Ej: Ático B, Bloque 2, 1ºA'
              disabled={guardando}
              className={`mt-2 ${inputClassName}`}
            />
          </div>

          <div>
            <label htmlFor="codigo-postal" className="block text-sm font-medium text-slate-300">
              Código Postal
            </label>
            <input
              id="codigo-postal"
              type="text"
              value={form.codigoPostal}
              onChange={(e) => onChange({ codigoPostal: e.target.value })}
              placeholder="Ej: 08008"
              disabled={guardando}
              className={`mt-2 ${inputClassName}`}
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="ciudad-region" className="block text-sm font-medium text-slate-300">
              Ciudad / Región
            </label>
            <input
              id="ciudad-region"
              type="text"
              value={form.ciudadRegion}
              onChange={(e) => onChange({ ciudadRegion: e.target.value })}
              placeholder="Ej: Barcelona, Cataluña"
              disabled={guardando}
              className={`mt-2 ${inputClassName}`}
            />
            <p className="mt-1 text-xs text-slate-500">
              Se usa para agrupar tu zona en el panel de control.
            </p>
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="indicaciones-acceso"
              className="block text-sm font-medium text-slate-300"
            >
              Indicaciones adicionales para el Huésped
            </label>
            <textarea
              id="indicaciones-acceso"
              value={form.indicacionesAcceso}
              onChange={(e) => onChange({ indicacionesAcceso: e.target.value })}
              placeholder="Ej: El portal es el de la puerta de madera al lado de la cafetería"
              rows={3}
              disabled={guardando}
              className={`mt-2 resize-none ${inputClassName}`}
            />
          </div>
        </div>
      </section>

      {/* Identidad */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          Identidad del alojamiento
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="nombre-vivienda" className="block text-sm font-medium text-slate-300">
              Nombre de la Vivienda
            </label>
            <input
              id="nombre-vivienda"
              type="text"
              value={form.nombreVivienda}
              onChange={(e) => onChange({ nombreVivienda: e.target.value })}
              placeholder="Ej: Apartamento Mar Azul"
              disabled={guardando}
              className={`mt-2 ${inputClassName}`}
            />
          </div>

          <div>
            <label htmlFor="nombre-ia" className="block text-sm font-medium text-slate-300">
              Nombre de la IA
            </label>
            <input
              id="nombre-ia"
              type="text"
              value={form.nombreIa}
              onChange={(e) => onChange({ nombreIa: e.target.value })}
              placeholder="Ej: Lucas"
              disabled={guardando}
              className={`mt-2 ${inputClassName}`}
            />
          </div>
        </div>
      </section>

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
  )
}
