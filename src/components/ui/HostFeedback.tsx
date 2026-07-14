import type { ReactNode } from 'react'

type HostFeedbackProps = {
  children: ReactNode
  variant?: 'error' | 'success' | 'warning'
  className?: string
}

const variantClasses = {
  error: 'border-rose-200 bg-rose-50 text-rose-700',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
}

export default function HostFeedback({
  children,
  variant = 'error',
  className = '',
}: HostFeedbackProps) {
  return (
    <div
      className={`rounded-xl border px-4 py-3 text-sm ${variantClasses[variant]} ${className}`}
      role={variant === 'error' ? 'alert' : 'status'}
    >
      {children}
    </div>
  )
}
