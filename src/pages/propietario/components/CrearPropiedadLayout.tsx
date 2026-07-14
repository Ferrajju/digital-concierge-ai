import type { ReactNode } from 'react'
import Button from '../../../components/ui/Button'

export type PasoCrearPropiedad = 1 | 2 | 3 | 4 | 5 | 6 | 7

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
  { numero: 6, label: 'Guía' },
  { numero: 7, label: 'Alertas' },
] as const

export default function CrearPropiedadLayout({
  paso,
  children,
  anchoAmplio = false,
}: CrearPropiedadLayoutProps) {
  return (
    <div className="min-h-screen bg-host-bg text-host-text">
      <header className="sticky top-0 z-20 border-b border-stone-200 bg-host-bg/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-host-primary text-sm font-bold text-white shadow-sm">
              DC
            </div>
            <div>
              <p className="font-display text-sm font-semibold text-host-text">
                Nueva vivienda
              </p>
              <p className="text-xs text-host-muted">Configuración guiada</p>
            </div>
          </div>
          <Button to="/dashboard" variant="secondary" size="sm">
            Salir al panel
          </Button>
        </div>
      </header>

      <div className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-5xl overflow-x-auto px-4 py-5 sm:px-6">
          <nav
            aria-label="Progreso de configuración"
            className="flex min-w-max items-center justify-center gap-1 sm:gap-2"
          >
            {PASOS.map(({ numero, label }) => {
              const activo = paso === numero
              const completado = paso > numero

              return (
                <div
                  key={numero}
                  className="flex shrink-0 items-center gap-1 sm:gap-2"
                >
                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                        activo
                          ? 'bg-host-primary text-white shadow-sm ring-2 ring-teal-200'
                          : completado
                            ? 'bg-teal-50 text-host-primary ring-2 ring-teal-200'
                            : 'bg-stone-100 text-stone-400 ring-1 ring-stone-200'
                      }`}
                    >
                      {completado ? '✓' : numero}
                    </div>
                    <span
                      className={`hidden text-[10px] font-semibold uppercase tracking-wide sm:block ${
                        activo ? 'text-host-primary' : 'text-stone-400'
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                  {numero < 7 && (
                    <div
                      className={`mb-5 h-0.5 w-4 sm:w-6 ${
                        completado ? 'bg-teal-300' : 'bg-stone-200'
                      }`}
                      aria-hidden
                    />
                  )}
                </div>
              )
            })}
          </nav>
        </div>
      </div>

      <main
        className={`mx-auto px-4 py-8 sm:px-6 sm:py-10 ${
          anchoAmplio ? 'max-w-5xl' : 'max-w-2xl'
        }`}
      >
        {children}
      </main>
    </div>
  )
}
