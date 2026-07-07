import { Link, useParams } from 'react-router-dom'

export default function GestionarPropiedadPage() {
  const { propiedadId } = useParams<{ propiedadId: string }>()

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <Link
          to="/dashboard"
          className="text-sm text-slate-500 transition-colors hover:text-indigo-300"
        >
          ← Volver al panel
        </Link>

        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-8">
          <p className="text-sm font-medium uppercase tracking-wider text-indigo-400">
            Gestión de conocimiento
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-white">
            Editar Manual y Guía Local
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            Propiedad:{' '}
            <span className="font-mono text-slate-300">{propiedadId}</span>
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <section className="rounded-xl border border-slate-800 bg-slate-950/50 p-5">
              <h2 className="text-sm font-semibold text-white">Manual</h2>
              <p className="mt-2 text-xs text-slate-500">
                Editor del borrador del alojamiento (Wi-Fi, accesos, normas).
              </p>
              <p className="mt-4 text-xs text-indigo-300">Próximamente</p>
            </section>
            <section className="rounded-xl border border-slate-800 bg-slate-950/50 p-5">
              <h2 className="text-sm font-semibold text-white">Guía Local</h2>
              <p className="mt-2 text-xs text-slate-500">
                Tarjetas de recomendaciones cercanas editables.
              </p>
              <p className="mt-4 text-xs text-indigo-300">Próximamente</p>
            </section>
          </div>

          <p className="mt-6 rounded-xl border border-indigo-500/20 bg-indigo-500/5 px-4 py-3 text-xs text-slate-400">
            Al guardar, se unificará Manual + Guía en Markdown y se enviará al
            Flujo 3 de n8n para reindexar{' '}
            <code className="text-indigo-300">documentos_vectores</code>.
          </p>
        </div>
      </div>
    </div>
  )
}
