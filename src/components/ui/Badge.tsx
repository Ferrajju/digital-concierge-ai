type BadgeVariant = 'success' | 'neutral' | 'warning'

type BadgeProps = {
  children: string
  variant?: BadgeVariant
}

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  neutral: 'bg-stone-200 text-stone-700 border-stone-300',
  warning: 'bg-amber-100 text-amber-900 border-amber-300',
}

export default function Badge({ children, variant = 'neutral' }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex shrink-0 rounded-md border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide',
        variantClasses[variant],
      ].join(' ')}
    >
      {children}
    </span>
  )
}
