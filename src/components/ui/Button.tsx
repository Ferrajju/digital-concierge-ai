import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'border border-teal-800 bg-host-primary text-white shadow-sm hover:bg-teal-800 focus-visible:ring-host-primary/30',
  secondary:
    'border border-stone-300 bg-white text-host-text shadow-sm hover:border-stone-400 hover:bg-stone-50 focus-visible:ring-stone-300',
  ghost:
    'text-host-muted hover:bg-stone-100 hover:text-host-text focus-visible:ring-stone-200',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3.5 py-2 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3.5 text-sm',
}

function cn(
  variant: ButtonVariant,
  size: ButtonSize,
  fullWidth: boolean,
  className?: string,
) {
  return [
    'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-host-bg',
    'disabled:cursor-not-allowed disabled:opacity-60',
    fullWidth ? 'w-full' : '',
    variantClasses[variant],
    sizeClasses[size],
    className,
  ]
    .filter(Boolean)
    .join(' ')
}

type ButtonProps = {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  fullWidth?: boolean
  children: ReactNode
  className?: string
  to?: string
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  children,
  className,
  to,
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  const classes = cn(variant, size, fullWidth, className)

  const content = loading ? (
    <>
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current" />
      {children}
    </>
  ) : (
    children
  )

  if (to) {
    return (
      <Link to={to} className={classes}>
        {content}
      </Link>
    )
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={classes}
      {...props}
    >
      {content}
    </button>
  )
}
