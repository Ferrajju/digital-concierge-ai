import type { ReactNode } from 'react'
import { IconArrowRight } from './icons'

type HubTileProps = {
  icon: ReactNode
  title: string
  description: string
  meta: string
  onClick: () => void
  accent?: 'teal' | 'emerald' | 'violet' | 'amber'
}

const accentClasses = {
  teal: {
    icon: 'bg-teal-100 text-teal-800 border-teal-200',
    meta: 'bg-teal-50 text-teal-800 border-teal-200',
    hover: 'hover:border-teal-300 hover:shadow-card-hover',
  },
  emerald: {
    icon: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    meta: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    hover: 'hover:border-emerald-300 hover:shadow-card-hover',
  },
  violet: {
    icon: 'bg-violet-100 text-violet-800 border-violet-200',
    meta: 'bg-violet-50 text-violet-800 border-violet-200',
    hover: 'hover:border-violet-300 hover:shadow-card-hover',
  },
  amber: {
    icon: 'bg-amber-100 text-amber-900 border-amber-200',
    meta: 'bg-amber-50 text-amber-900 border-amber-200',
    hover: 'hover:border-amber-300 hover:shadow-card-hover',
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
      className={`group flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200 bg-host-surface text-left shadow-card ring-1 ring-stone-900/[0.03] transition-all ${styles.hover}`}
    >
      <div className="border-b border-stone-200 px-5 py-5">
        <div
          className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl border ${styles.icon}`}
        >
          {icon}
        </div>
        <h2 className="font-display text-lg font-bold text-host-text">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-host-muted">
          {description}
        </p>
      </div>

      <div className="mt-auto border-t border-stone-200 px-5 py-3">
        <span
          className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold ${styles.meta}`}
        >
          {meta}
          <IconArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </button>
  )
}
