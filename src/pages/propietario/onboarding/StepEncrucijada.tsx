type StepEncrucijadaProps = {
  loading: boolean
  error: string
  onIrAlPanel: () => void
  onConfigurarVivienda: () => void
}

export default function StepEncrucijada({
  loading,
  error,
  onIrAlPanel,
  onConfigurarVivienda,
}: StepEncrucijadaProps) {
  return (
    <div className="animate-fade-in-up">
      <div className="mb-10 text-center">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-indigo-400">
          Paso 3 de 3
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          ¡Todo listo! ¿Qué quieres hacer ahora?
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-400">
          Tu cuenta está configurada. Puedes ir al panel general o empezar ya
          mismo a enseñarle a la IA todo sobre tu primera vivienda.
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
          onClick={onConfigurarVivienda}
          disabled={loading}
          className="group relative w-full overflow-hidden rounded-2xl border border-indigo-500/40 bg-gradient-to-br from-indigo-600/20 to-violet-600/20 p-6 text-left transition-all duration-300 hover:border-indigo-400/60 hover:shadow-xl hover:shadow-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <div className="relative flex items-start gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/20 text-2xl ring-1 ring-indigo-500/40">
              🚀
            </span>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-white">
                Configurar mi primera vivienda
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-indigo-200/80">
                Recomendado. Charla con la IA y deja lista la base de
                conocimiento de tu alojamiento.
              </p>
            </div>
            <span className="mt-1 text-indigo-400 transition-transform group-hover:translate-x-1">
              →
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={onIrAlPanel}
          disabled={loading}
          className="group relative w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-left backdrop-blur-sm transition-all duration-300 hover:border-slate-700 hover:bg-slate-900/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <div className="relative flex items-start gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-800 text-2xl ring-1 ring-slate-700">
              📊
            </span>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-white">
                Ir al Panel General
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
                Explora el dashboard y configura tus viviendas cuando quieras.
              </p>
            </div>
            <span className="mt-1 text-slate-600 transition-all group-hover:translate-x-1 group-hover:text-slate-400">
              →
            </span>
          </div>
        </button>
      </div>

      {loading && (
        <p className="mt-6 text-center text-sm text-slate-500">
          Guardando tu configuración...
        </p>
      )}
    </div>
  )
}
