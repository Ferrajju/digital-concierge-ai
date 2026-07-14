import type { ReactNode } from 'react'

type HostShellProps = {
  children: ReactNode
  headerAction?: ReactNode
}

export default function HostShell({ children, headerAction }: HostShellProps) {
  return (
    <div className="min-h-screen bg-host-bg text-host-text">
      <header className="sticky top-0 z-20 border-b border-host-border bg-host-bg/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-host-primary text-sm font-bold text-white shadow-sm">
              DC
            </div>
            <div>
              <p className="font-display text-sm font-semibold text-host-text">
                Digital Concierge
              </p>
              <p className="text-xs text-host-muted">Panel del propietario</p>
            </div>
          </div>
          {headerAction}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {children}
      </main>
    </div>
  )
}

export function HostAlert({
  children,
  variant = 'error',
}: {
  children: ReactNode
  variant?: 'error' | 'success'
}) {
  const classes =
    variant === 'error'
      ? 'border-rose-200 bg-rose-50 text-rose-700'
      : 'border-emerald-200 bg-emerald-50 text-emerald-800'

  return (
    <div
      className={`mb-6 rounded-xl border px-4 py-3 text-sm ${classes}`}
      role="alert"
    >
      {children}
    </div>
  )
}

export function HostLoading({ label = 'Cargando...' }: { label?: string }) {
  return (
    <div className="flex min-h-[320px] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-[3px] border-teal-100 border-t-host-primary" />
        <p className="text-sm text-host-muted">{label}</p>
      </div>
    </div>
  )
}
