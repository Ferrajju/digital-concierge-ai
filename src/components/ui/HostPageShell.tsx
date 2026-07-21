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
  /** Ocupa exactamente la ventana; el scroll queda dentro del contenido hijo. */
  fillViewport?: boolean
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
  fillViewport = false,
}: HostPageShellProps) {
  return (
    <div
      className={
        fillViewport
          ? 'flex h-dvh flex-col overflow-hidden bg-host-bg text-host-text'
          : 'min-h-screen bg-host-bg text-host-text'
      }
    >
      <header
        className={`z-20 shrink-0 border-b border-stone-200 bg-host-bg/95 backdrop-blur-md ${
          fillViewport ? '' : 'sticky top-0'
        }`}
      >
        <div
          className={`mx-auto flex items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4 ${widthClasses[width]}`}
        >
          <UmbralBrand subtitle="Panel del propietario" />
          <HostHeaderActions />
        </div>
      </header>
      <div
        className={`mx-auto flex w-full flex-col ${
          fillViewport
            ? 'min-h-0 flex-1 overflow-hidden px-4 py-3 sm:px-6 sm:py-4'
            : 'px-4 py-8 sm:px-6 sm:py-10'
        } ${widthClasses[width]}`}
      >
        <div
          className={`flex shrink-0 flex-wrap items-start justify-between gap-3 border-b border-stone-200 ${
            fillViewport ? 'mb-3 pb-3' : 'mb-8 pb-6'
          }`}
        >
          <div className="min-w-0">
            <Link
              to={backTo}
              className="text-sm font-medium text-host-muted transition-colors hover:text-host-primary"
            >
              ← {backLabel}
            </Link>
            {eyebrow && (
              <p
                className={`text-xs font-semibold uppercase tracking-wider text-host-primary ${
                  fillViewport ? 'mt-2' : 'mt-4'
                }`}
              >
                {eyebrow}
              </p>
            )}
            <h1
              className={`mt-1 font-display font-semibold tracking-tight text-host-text ${
                fillViewport
                  ? 'truncate text-lg sm:text-xl'
                  : 'mt-2 text-2xl sm:text-3xl'
              }`}
            >
              {title}
            </h1>
            {description && (
              <p
                className={`max-w-2xl text-host-muted ${
                  fillViewport
                    ? 'mt-1 line-clamp-1 text-xs'
                    : 'mt-2 text-sm leading-relaxed'
                }`}
              >
                {description}
              </p>
            )}
          </div>
          {headerExtra}
        </div>
        <div
          className={
            fillViewport ? 'flex min-h-0 flex-1 flex-col overflow-hidden' : ''
          }
        >
          {children}
        </div>
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
