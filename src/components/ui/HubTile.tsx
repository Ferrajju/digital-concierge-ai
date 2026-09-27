import type { ReactNode } from 'react'
import { IconArrowRight } from './icons'

type HubTileProps = {
  icon: ReactNode
  title: string
  description: string
  meta: string
  onClick: () => void
  accent?: 'teal' | 'emerald' | 'violet' | 'amber'
  /** `banner` destaca una acción principal a ancho completo. `card` es una celda del bloque simétrico. */
  layout?: 'card' | 'banner'
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

const surfaceClass =
  'group w-full rounded-2xl border bg-host-surface text-left shadow-card ring-1 ring-stone-900/[0.03] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-host-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-host-bg'

function IconBadge({
  icon,
  className,
}: {
  icon: ReactNode
  className: string
}) {
  return (
    <div
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${className}`}
    >
      {icon}
    </div>
  )
}

function MetaChip({ meta, className }: { meta: string; className: string }) {
  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold ${className}`}
    >
      {meta}
      <IconArrowRight className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
    </span>
  )
}

export default function HubTile({
  icon,
  title,
  description,
  meta,
  onClick,
  accent = 'teal',
  layout = 'card',
}: HubTileProps) {
  const styles = accentClasses[accent]

  if (layout === 'banner') {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${surfaceClass} grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-4 gap-y-4 border-teal-200 p-5 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:gap-x-6 sm:p-6 ${styles.hover}`}
      >
        <IconBadge icon={icon} className={styles.icon} />
        <div className="min-w-0">
          <h2 className="font-display text-lg font-bold text-host-text">
            {title}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-host-muted">
            {description}
          </p>
        </div>
        <MetaChip
          meta={meta}
          className={`${styles.meta} col-start-2 sm:col-start-auto sm:self-center`}
        />
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${surfaceClass} flex h-full items-start gap-4 border-stone-200 p-5 sm:flex-col sm:p-6 ${styles.hover}`}
    >
      <IconBadge icon={icon} className={styles.icon} />
      <div className="flex min-w-0 flex-1 flex-col self-stretch">
        <h3 className="font-display text-lg font-bold leading-snug text-host-text">
          {title}
        </h3>
        <p className="mt-1.5 flex-1 text-sm leading-relaxed text-host-muted sm:mt-2">
          {description}
        </p>
        <div className="mt-4 sm:mt-5">
          <MetaChip meta={meta} className={styles.meta} />
        </div>
      </div>
    </button>
  )
}
