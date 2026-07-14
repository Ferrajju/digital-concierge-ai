import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Bot,
  MapPin,
  MessageSquare,
  QrCode,
} from 'lucide-react'
import type { PropiedadResumen } from '../types/propiedadDashboard'
import QrPropiedadModal from './QrPropiedadModal'

type PropiedadCardProps = {
  propiedad: PropiedadResumen
}

export default function PropiedadCard({ propiedad }: PropiedadCardProps) {
  const [mostrarQr, setMostrarQr] = useState(false)

  return (
    <>
      <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 to-sky-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="flex flex-1 flex-col p-6">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-lg font-semibold text-white transition-colors group-hover:text-indigo-200">
                {propiedad.nombreApartamento}
              </h2>
              {propiedad.iaIdentidad && (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
                  <Bot className="h-3.5 w-3.5 text-indigo-400" aria-hidden />
                  Agente:{' '}
                  <span className="text-indigo-300">
                    {propiedad.iaIdentidad}
                  </span>
                </p>
              )}
            </div>
            <span
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${
                propiedad.activa
                  ? 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/30'
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  propiedad.activa ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
                aria-hidden
              />
              {propiedad.activa ? 'Activa' : 'Pendiente'}
            </span>
          </div>

          <div className="mb-6 flex flex-1 items-start gap-2 text-sm leading-relaxed text-slate-400">
            <MapPin
              className="mt-0.5 h-4 w-4 shrink-0 text-slate-600"
              aria-hidden
            />
            <span>
              {propiedad.direccionCompleta || 'Dirección no configurada'}
            </span>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setMostrarQr(true)}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-950/50 px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:border-indigo-500/40 hover:text-white"
            >
              <QrCode className="h-4 w-4" aria-hidden />
              QR
            </button>
            <Link
              to={`/propiedad/${propiedad.id}/chats`}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-950/50 px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:border-indigo-500/40 hover:text-white"
            >
              <MessageSquare className="h-4 w-4" aria-hidden />
              Chats
            </Link>
          </div>

          <Link
            to={`/propiedad/${propiedad.id}/gestionar`}
            className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-colors hover:bg-indigo-400"
          >
            Gestionar alojamiento
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
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
