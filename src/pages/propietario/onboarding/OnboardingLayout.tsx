import type { ReactNode } from 'react'

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
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-violet-600/15 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <header className="relative z-10 mx-auto flex max-w-4xl items-center justify-between px-6 py-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold shadow-lg shadow-indigo-500/25">
            DC
          </div>
          <span className="text-sm font-medium tracking-wide text-slate-400">
            Digital Concierge AI
          </span>
        </div>
        {headerAction}
      </header>

      <div className="relative z-10 mx-auto mb-10 flex max-w-4xl justify-center gap-3 px-6">
        {STEPS.map(({ number, label }) => {
          const isActive = step === number
          const isCompleted = step > number

          return (
            <div key={number} className="flex items-center gap-3">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all duration-500 ${
                    isActive
                      ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/40'
                      : isCompleted
                        ? 'bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/40'
                        : 'bg-slate-800 text-slate-500 ring-1 ring-slate-700'
                  }`}
                >
                  {isCompleted ? '✓' : number}
                </div>
                <span
                  className={`text-[10px] font-medium uppercase tracking-wider ${
                    isActive ? 'text-indigo-300' : 'text-slate-600'
                  }`}
                >
                  {label}
                </span>
              </div>
              {number < 3 && (
                <div
                  className={`mb-5 h-px w-12 transition-colors duration-500 sm:w-20 ${
                    isCompleted ? 'bg-indigo-500/50' : 'bg-slate-800'
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>

      <main className="relative z-10 mx-auto max-w-4xl px-6 pb-16">{children}</main>
    </div>
  )
}
