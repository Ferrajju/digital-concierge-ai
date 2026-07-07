import { Link, useParams } from 'react-router-dom'

export default function ChatsPropiedadPage() {
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

        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center">
          <p className="text-sm font-medium uppercase tracking-wider text-indigo-400">
            Conversaciones de huéspedes
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-white">Ver Chats</h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-slate-400">
            Listado de sesiones de{' '}
            <span className="font-mono text-slate-300">{propiedadId}</span>{' '}
            desde la tabla{' '}
            <code className="text-indigo-300">conversaciones_huesped</code>.
          </p>
          <p className="mt-6 text-xs text-indigo-300">Próximamente — Flujo 4 RAG</p>
        </div>
      </div>
    </div>
  )
}
