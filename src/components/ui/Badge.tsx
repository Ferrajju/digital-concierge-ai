type BadgeVariant = 'success' | 'neutral' | 'warning'

type BadgeProps = {
  children: string
  variant?: BadgeVariant
}

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  neutral: 'bg-stone-100 text-stone-600 ring-stone-200',
  warning: 'bg-amber-50 text-amber-800 ring-amber-200',
}

export default function Badge({ children, variant = 'neutral' }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ring-1 ring-inset',
        variantClasses[variant],
      ].join(' ')}
    >
      {children}
    </span>
  )
}
