import type { ReactNode } from 'react'

type FormSectionProps = {
  title: string
  description?: string
  children: ReactNode
  action?: ReactNode
}

export default function FormSection({
  title,
  description,
  children,
  action,
}: FormSectionProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-stone-200 bg-host-surface shadow-card">
      <header className="flex items-start justify-between gap-4 border-b border-stone-200 bg-stone-50 px-5 py-4 sm:px-6">
        <div>
          <h3 className="font-display text-base font-semibold text-host-text sm:text-lg">
            {title}
          </h3>
          {description && (
            <p className="mt-1 text-sm leading-relaxed text-host-muted">
              {description}
            </p>
          )}
        </div>
        {action}
      </header>
      <div className="space-y-4 px-5 py-5 sm:px-6">{children}</div>
    </section>
  )
}

export function FieldGroup({
  label,
  children,
  className = '',
}: {
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <label className="mb-2 block text-sm font-semibold text-stone-800">
        {label}
      </label>
      {children}
    </div>
  )
}

export function InsetPanel({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={`rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 ${className}`}
    >
      {children}
    </div>
  )
}
