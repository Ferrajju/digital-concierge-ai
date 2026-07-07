type StepEncrucijadaProps = {
  loading: boolean
  error: string
  onSi: () => void
  onNo: () => void
}

export default function StepEncrucijada({
  loading,
  error,
  onSi,
  onNo,
}: StepEncrucijadaProps) {
  return (
    <div className="animate-fade-in-up">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-3xl ring-1 ring-emerald-500/40">
          ✓
        </div>
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-indigo-400">
          Paso 3 de 3
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          ¡Configuración completada!
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-slate-300">
          ¿Quieres empezar a configurar tu primera vivienda ahora mismo?
        </p>
      </div>

      {error && (
        <div className="mx-auto mb-6 max-w-lg rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </div>
      )}

      <div className="mx-auto grid max-w-lg gap-4">
        <button
          type="button"
          onClick={onSi}
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:from-indigo-400 hover:to-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Guardando...' : 'Sí, empezar ahora'}
        </button>

        <button
          type="button"
          onClick={onNo}
          disabled={loading}
          className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-6 py-4 text-base font-medium text-slate-300 transition-colors hover:border-slate-600 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          No, ir al panel general
        </button>
      </div>
    </div>
  )
}
