import type { ReactNode } from 'react'
import Button from './Button'

type EmptyStateProps = {
  icon: ReactNode
  title: string
  description: string
  actionLabel: string
  actionTo: string
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionTo,
}: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-stone-300 bg-host-surface px-6 py-16 text-center shadow-card">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-host-primary ring-1 ring-teal-100">
        {icon}
      </div>
      <h2 className="font-display text-lg font-semibold text-host-text">
        {title}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-host-muted">
        {description}
      </p>
      <Button to={actionTo} size="lg" className="mt-6">
        {actionLabel}
      </Button>
    </div>
  )
}
