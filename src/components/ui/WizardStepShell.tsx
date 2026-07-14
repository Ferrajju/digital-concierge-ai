import type { ReactNode } from 'react'
import Card from './Card'

type WizardStepShellProps = {
  paso: number
  totalPasos?: number
  icon?: string
  title: ReactNode
  description?: ReactNode
  children: ReactNode
  centered?: boolean
}

export default function WizardStepShell({
  paso,
  totalPasos = 7,
  icon,
  title,
  description,
  children,
  centered = false,
}: WizardStepShellProps) {
  return (
    <Card padding="lg" className="animate-fade-in-up">
      <div className={centered ? 'text-center' : ''}>
        {icon && (
          <div
            className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-teal-200 bg-teal-50 text-2xl shadow-sm ${
              centered ? 'mx-auto' : ''
            }`}
            aria-hidden
          >
            {icon}
          </div>
        )}
        <p className="text-xs font-bold uppercase tracking-wider text-host-primary">
          Paso {paso} de {totalPasos}
        </p>
        <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-host-text sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p
            className={`mt-3 text-sm leading-relaxed text-host-muted ${
              centered ? 'mx-auto max-w-lg' : 'max-w-2xl'
            }`}
          >
            {description}
          </p>
        )}
      </div>

      <div className="mt-8">{children}</div>
    </Card>
  )
}

export function WizardActions({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={`flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      {children}
    </div>
  )
}
