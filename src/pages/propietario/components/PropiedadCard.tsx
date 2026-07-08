import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { PropiedadResumen } from '../types/propiedadDashboard'
import QrPropiedadModal from './QrPropiedadModal'

type PropiedadCardProps = {
  propiedad: PropiedadResumen
}

export default function PropiedadCard({ propiedad }: PropiedadCardProps) {
  const [mostrarQr, setMostrarQr] = useState(false)

  return (
    <>
      <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm transition-all duration-300 hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/10">
        <div className="flex flex-1 flex-col p-6">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-lg font-semibold text-white group-hover:text-indigo-100">
                {propiedad.nombreApartamento}
              </h2>
              {propiedad.iaIdentidad && (
                <p className="mt-1 text-xs text-slate-500">
                  Agente:{' '}
                  <span className="text-indigo-300">{propiedad.iaIdentidad}</span>
                </p>
              )}
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${
                propiedad.activa
                  ? 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30'
                  : 'bg-slate-800 text-slate-500 ring-1 ring-slate-700'
              }`}
            >
              {propiedad.activa ? 'Activa' : 'Inactiva'}
            </span>
          </div>

          <p className="mb-6 flex-1 text-sm leading-relaxed text-slate-400">
            {propiedad.direccionCompleta || 'Dirección no configurada'}
          </p>

          <div className="grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setMostrarQr(true)}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-950/50 px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:border-indigo-500/40 hover:text-white"
            >
              <span aria-hidden>⬚</span>
              Ver / Descargar QR
            </button>
            <Link
              to={`/propiedad/${propiedad.id}/chats`}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-950/50 px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:border-indigo-500/40 hover:text-white"
            >
              <span aria-hidden>💬</span>
              Ver Chats
            </Link>
          </div>

          <Link
            to={`/propiedad/${propiedad.id}/gestionar`}
            className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500/90 to-violet-600/90 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:from-indigo-400 hover:to-violet-500"
          >
            Gestionar alojamiento
            <span
              className="transition-transform group-hover:translate-x-0.5"
              aria-hidden
            >
              →
            </span>
          </Link>
        </div>
      </article>

      {mostrarQr && (
        <QrPropiedadModal
          propiedadId={propiedad.id}
          nombreApartamento={propiedad.nombreApartamento}
          onCerrar={() => setMostrarQr(false)}
        />
      )}
    </>
  )
}
