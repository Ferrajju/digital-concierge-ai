import type { ReactNode } from 'react'

export type PasoCrearPropiedad = 1 | 2 | 3 | 4 | 5 | 6

type CrearPropiedadLayoutProps = {
  paso: PasoCrearPropiedad
  children: ReactNode
  anchoAmplio?: boolean
}

const PASOS = [
  { numero: 1, label: 'Nombre' },
  { numero: 2, label: 'Ubicación' },
  { numero: 3, label: 'Agente' },
  { numero: 4, label: 'Chat' },
  { numero: 5, label: 'Borrador' },
  { numero: 6, label: 'Alertas' },
] as const

export default function CrearPropiedadLayout({
  paso,
  children,
  anchoAmplio = false,
}: CrearPropiedadLayoutProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-violet-600/15 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <header className="relative z-10 mx-auto flex max-w-4xl items-center justify-between px-4 py-6 sm:px-6 sm:py-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold shadow-lg shadow-indigo-500/25">
            DC
          </div>
          <span className="text-sm font-medium tracking-wide text-slate-400">
            Nueva vivienda
          </span>
        </div>
      </header>

      <div className="relative z-10 mx-auto mb-8 flex max-w-4xl justify-center gap-1.5 overflow-x-auto px-4 sm:mb-10 sm:gap-3 sm:px-6">
        {PASOS.map(({ numero, label }) => {
          const activo = paso === numero
          const completado = paso > numero

          return (
            <div key={numero} className="flex shrink-0 items-center gap-1.5 sm:gap-3">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold transition-all duration-500 sm:h-8 sm:w-8 sm:text-xs ${
                    activo
                      ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/40'
                      : completado
                        ? 'bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/40'
                        : 'bg-slate-800 text-slate-500 ring-1 ring-slate-700'
                  }`}
                >
                  {completado ? '✓' : numero}
                </div>
                <span
                  className={`text-[9px] font-medium uppercase tracking-wider sm:text-[10px] ${
                    activo ? 'text-indigo-300' : 'text-slate-600'
                  }`}
                >
                  {label}
                </span>
              </div>
              {numero < 6 && (
                <div
                  className={`mb-4 h-px w-4 transition-colors duration-500 sm:mb-5 sm:w-8 ${
                    completado ? 'bg-indigo-500/50' : 'bg-slate-800'
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>

      <main
        className={`relative z-10 mx-auto px-4 pb-16 sm:px-6 ${
          anchoAmplio ? 'max-w-4xl' : 'max-w-2xl'
        }`}
      >
        {children}
      </main>
    </div>
  )
}
