import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import HostHeaderActions from './HostHeaderActions'
import UmbralBrand from './UmbralBrand'

type HostPageShellProps = {
  backTo: string
  backLabel?: string
  eyebrow?: string
  title: string
  description?: string
  children: ReactNode
  width?: '4xl' | '6xl'
  headerExtra?: ReactNode
}

const widthClasses = {
  '4xl': 'max-w-4xl',
  '6xl': 'max-w-6xl',
}

export default function HostPageShell({
  backTo,
  backLabel = 'Volver al panel',
  eyebrow,
  title,
  description,
  children,
  width = '6xl',
  headerExtra,
}: HostPageShellProps) {
  return (
    <div className="min-h-screen bg-host-bg text-host-text">
      <header className="sticky top-0 z-20 border-b border-stone-200 bg-host-bg/95 backdrop-blur-md">
        <div
          className={`mx-auto flex items-center justify-between gap-4 px-4 py-4 sm:px-6 ${widthClasses[width]}`}
        >
          <UmbralBrand subtitle="Panel del propietario" />
          <HostHeaderActions />
        </div>
      </header>
      <div
        className={`mx-auto ${widthClasses[width]} px-4 py-8 sm:px-6 sm:py-10`}
      >
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4 border-b border-stone-200 pb-6">
          <div>
            <Link
              to={backTo}
              className="text-sm font-medium text-host-muted transition-colors hover:text-host-primary"
            >
              ← {backLabel}
            </Link>
            {eyebrow && (
              <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-host-primary">
                {eyebrow}
              </p>
            )}
            <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-host-text sm:text-3xl">
              {title}
            </h1>
            {description && (
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-host-muted">
                {description}
              </p>
            )}
          </div>
          {headerExtra}
        </div>
        {children}
      </div>
    </div>
  )
}

export function HostSubpageHeader({
  onBack,
  backLabel = 'Volver',
  title,
  description,
  action,
}: {
  onBack: () => void
  backLabel?: string
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-semibold text-host-muted transition-colors hover:text-host-primary"
        >
          ← {backLabel}
        </button>
        <h2 className="mt-2 font-display text-xl font-bold text-host-text sm:text-2xl">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-sm text-host-muted">{description}</p>
        )}
      </div>
      {action}
    </div>
  )
}
