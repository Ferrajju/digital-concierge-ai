import type { ReactNode } from 'react'
import UmbralBrand from '../../../components/ui/UmbralBrand'

type OnboardingLayoutProps = {
  step: 1 | 2 | 3
  children: ReactNode
  headerAction?: ReactNode
}

const STEPS = [
  { number: 1, label: 'Perfil' },
  { number: 2, label: 'Telegram' },
  { number: 3, label: 'Decisión' },
] as const

export default function OnboardingLayout({
  step,
  children,
  headerAction,
}: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen bg-host-bg text-host-text">
      <header className="sticky top-0 z-20 border-b border-stone-200 bg-host-bg/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <UmbralBrand subtitle="Primeros pasos" />
          {headerAction}
        </div>
      </header>

      <div className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-5 sm:px-6">
          <nav
            aria-label="Progreso de onboarding"
            className="flex items-center justify-center gap-1 sm:gap-2"
          >
            {STEPS.map(({ number, label }) => {
              const activo = step === number
              const completado = step > number

              return (
                <div
                  key={number}
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
                      {completado ? '✓' : number}
                    </div>
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wide ${
                        activo ? 'text-host-primary' : 'text-stone-400'
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                  {number < 3 && (
                    <div
                      className={`mb-5 h-0.5 w-8 sm:w-12 ${
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

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
        {children}
      </main>
    </div>
  )
}
