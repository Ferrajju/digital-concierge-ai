import type { ReactNode } from 'react'
import { IconArrowRight } from './icons'

type HubTileProps = {
  icon: ReactNode
  title: string
  description: string
  meta: string
  onClick: () => void
  accent?: 'teal' | 'emerald' | 'violet'
}

const accentClasses = {
  teal: {
    icon: 'bg-teal-50 text-host-primary ring-teal-100',
    meta: 'text-host-primary',
    hover: 'hover:border-teal-200 hover:shadow-card-hover',
  },
  emerald: {
    icon: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    meta: 'text-emerald-700',
    hover: 'hover:border-emerald-200 hover:shadow-card-hover',
  },
  violet: {
    icon: 'bg-violet-50 text-violet-700 ring-violet-100',
    meta: 'text-violet-700',
    hover: 'hover:border-violet-200 hover:shadow-card-hover',
  },
}

export default function HubTile({
  icon,
  title,
  description,
  meta,
  onClick,
  accent = 'teal',
}: HubTileProps) {
  const styles = accentClasses[accent]

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group rounded-2xl border border-host-border bg-host-surface p-6 text-left shadow-card transition-all ${styles.hover}`}
    >
      <div
        className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ring-1 ${styles.icon}`}
      >
        {icon}
      </div>
      <h2 className="font-display text-lg font-semibold text-host-text">
        {title}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-host-muted">
        {description}
      </p>
      <p
        className={`mt-4 flex items-center gap-1 text-xs font-semibold ${styles.meta}`}
      >
        {meta}
        <IconArrowRight className="transition-transform group-hover:translate-x-0.5" />
      </p>
    </button>
  )
}
