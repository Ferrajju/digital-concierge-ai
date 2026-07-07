const inputClassName =
  'w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-5 py-4 text-center text-lg text-white placeholder:text-slate-600 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-50'

const SUGERENCIAS = ['Lucas', 'Sofía', 'Marco', 'Elena', 'Alex']

type StepNombreAgenteProps = {
  valor: string
  nombreVivienda: string
  onChange: (valor: string) => void
  onContinuar: () => void
  onVolver: () => void
  guardando: boolean
  error: string
}

export default function StepNombreAgente({
  valor,
  nombreVivienda,
  onChange,
  onContinuar,
  onVolver,
  guardando,
  error,
}: StepNombreAgenteProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onContinuar()
  }

  return (
    <div className="animate-fade-in-up">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/15 text-3xl ring-1 ring-violet-500/30">
          🤖
        </div>
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-indigo-400">
          Paso 3 de 6
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Dale un nombre a tu agente IA
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-slate-400">
          Cada propiedad tendrá un agente IA asignado para ayudar a los huéspedes
          de <span className="text-indigo-300">{nombreVivienda}</span>. ¿Cómo
          quieres llamar al tuyo?
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mx-auto max-w-lg space-y-6">
        <div>
          <input
            type="text"
            value={valor}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Ej: Lucas"
            disabled={guardando}
            autoFocus
            className={inputClassName}
          />
          <p className="mt-3 text-center text-xs text-slate-500">
            Los huéspedes verán este nombre cuando hablen con el asistente.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {SUGERENCIAS.map((nombre) => (
            <button
              key={nombre}
              type="button"
              disabled={guardando}
              onClick={() => onChange(nombre)}
              className={`rounded-full px-4 py-1.5 text-sm transition-all ${
                valor === nombre
                  ? 'bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/50'
                  : 'bg-slate-800/80 text-slate-400 ring-1 ring-slate-700 hover:text-slate-300'
              }`}
            >
              {nombre}
            </button>
          ))}
        </div>

        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-center text-sm text-rose-300">
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
            disabled={!valor.trim() || guardando}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:from-indigo-400 hover:to-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {guardando ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Creando vivienda...
              </>
            ) : (
              <>
                Comenzar entrevista
                <span aria-hidden>→</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
