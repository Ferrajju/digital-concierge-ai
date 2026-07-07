import LocationSearch from '../../../components/LocationSearch'
import type { ParsedAddress } from '../../../utils/parseGooglePlace'
import type { FormularioPropiedad } from '../types/formularioPropiedad'

const inputClassName =
  'w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3.5 text-sm text-white placeholder:text-slate-600 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-50'

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
    <div className="animate-fade-in-up">
      <div className="mb-8 text-center sm:mb-10">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-400">
          Paso 2 de 6
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          ¿Dónde está <span className="text-indigo-300">{nombreVivienda}</span>?
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-slate-400">
          Indica la ubicación con precisión. Los huéspedes la usarán para llegar
          y el agente IA la tendrá como referencia.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm sm:p-8">
        <form onSubmit={onSubmit} className="space-y-8">
          <section className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 text-xl" aria-hidden>
                📍
              </span>
              <div className="flex-1">
                <h2 className="text-sm font-semibold text-indigo-300">
                  Buscador rápido
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Selecciona tu dirección en Google Maps y autorrellenaremos los
                  campos. Puedes editarlos después.
                </p>
                <div className="mt-4">
                  <LocationSearch
                    value={form.busquedaRapida}
                    onChange={(value) => onChange({ busquedaRapida: value })}
                    onPlaceSelect={handlePlaceSelect}
                    disabled={guardando}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Dirección detallada
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label
                  htmlFor="direccion-calle"
                  className="block text-sm font-medium text-slate-300"
                >
                  Calle y número
                </label>
                <input
                  id="direccion-calle"
                  type="text"
                  value={form.direccionCalle}
                  onChange={(e) =>
                    onChange({ direccionCalle: e.target.value })
                  }
                  placeholder="Ej: Carrer de Balmes, 123"
                  disabled={guardando}
                  className={`mt-2 ${inputClassName}`}
                />
              </div>

              <div>
                <label
                  htmlFor="piso-puerta"
                  className="block text-sm font-medium text-slate-300"
                >
                  Piso, puerta o bloque
                </label>
                <input
                  id="piso-puerta"
                  type="text"
                  value={form.pisoPuerta}
                  onChange={(e) => onChange({ pisoPuerta: e.target.value })}
                  placeholder="Ej: Ático B, 1ºA"
                  disabled={guardando}
                  className={`mt-2 ${inputClassName}`}
                />
              </div>

              <div>
                <label
                  htmlFor="codigo-postal"
                  className="block text-sm font-medium text-slate-300"
                >
                  Código postal
                </label>
                <input
                  id="codigo-postal"
                  type="text"
                  value={form.codigoPostal}
                  onChange={(e) =>
                    onChange({ codigoPostal: e.target.value })
                  }
                  placeholder="Ej: 08008"
                  disabled={guardando}
                  className={`mt-2 ${inputClassName}`}
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="ciudad-region"
                  className="block text-sm font-medium text-slate-300"
                >
                  Ciudad / región
                </label>
                <input
                  id="ciudad-region"
                  type="text"
                  value={form.ciudadRegion}
                  onChange={(e) =>
                    onChange({ ciudadRegion: e.target.value })
                  }
                  placeholder="Ej: Barcelona, Cataluña"
                  disabled={guardando}
                  className={`mt-2 ${inputClassName}`}
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="indicaciones-acceso"
                  className="block text-sm font-medium text-slate-300"
                >
                  Indicaciones de acceso para huéspedes
                </label>
                <textarea
                  id="indicaciones-acceso"
                  value={form.indicacionesAcceso}
                  onChange={(e) =>
                    onChange({ indicacionesAcceso: e.target.value })
                  }
                  placeholder="Ej: El portal es el de la puerta de madera al lado de la cafetería"
                  rows={3}
                  disabled={guardando}
                  className={`mt-2 resize-none ${inputClassName}`}
                />
              </div>
            </div>
          </section>

          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={onVolver}
              disabled={guardando}
              className="rounded-xl border border-slate-700 px-5 py-3.5 text-sm text-slate-400 transition-colors hover:border-slate-600 disabled:opacity-40"
            >
              ← Volver
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:from-indigo-400 hover:to-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {guardando ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Guardando...
                </>
              ) : (
                <>
                  Continuar
                  <span aria-hidden>→</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
