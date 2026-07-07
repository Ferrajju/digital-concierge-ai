const inputClassName =
  'w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-5 py-4 text-center text-lg text-white placeholder:text-slate-600 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30'

type StepNombreViviendaProps = {
  valor: string
  onChange: (valor: string) => void
  onContinuar: () => void
  error: string
}

export default function StepNombreVivienda({
  valor,
  onChange,
  onContinuar,
  error,
}: StepNombreViviendaProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onContinuar()
  }

  return (
    <div className="animate-fade-in-up">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/15 text-3xl ring-1 ring-indigo-500/30">
          🏠
        </div>
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-indigo-400">
          Paso 1 de 6
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          ¿Cómo quieres llamar a tu apartamento?
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-slate-400">
          Un nombre memorable que tus huéspedes reconocerán. Puedes cambiarlo
          después.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mx-auto max-w-lg space-y-6">
        <div>
          <input
            type="text"
            value={valor}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Ej: Apartamento Mar Azul"
            autoFocus
            className={inputClassName}
          />
          <p className="mt-3 text-center text-xs text-slate-500">
            Aparecerá en el panel y en las conversaciones con huéspedes.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-center text-sm text-rose-300">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!valor.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:from-indigo-400 hover:to-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continuar
          <span aria-hidden>→</span>
        </button>
      </form>
    </div>
  )
}
