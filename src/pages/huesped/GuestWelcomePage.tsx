import { useParams } from 'react-router-dom'

export default function GuestWelcomePage() {
  const { propiedadId } = useParams<{ propiedadId: string }>()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 text-center text-slate-100">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/15 text-3xl ring-1 ring-indigo-500/30">
        🤖
      </div>
      <h1 className="text-2xl font-semibold text-white">Tu conserje digital</h1>
      <p className="mt-3 max-w-md text-sm text-slate-400">
        Chat del huésped para la propiedad{' '}
        <span className="font-mono text-indigo-300">{propiedadId}</span>.
      </p>
      <p className="mt-6 text-xs text-slate-500">
        La sesión se identificará con un{' '}
        <code className="text-slate-400">session_id</code> en localStorage.
      </p>
      <p className="mt-2 text-xs text-indigo-300">Próximamente — Flujo 4 RAG</p>
    </div>
  )
}
