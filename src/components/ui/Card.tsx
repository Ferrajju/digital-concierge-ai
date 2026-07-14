import type { ReactNode } from 'react'

type CardProps = {
  children: ReactNode
  className?: string
  hover?: boolean
  padding?: 'none' | 'md' | 'lg'
}

const paddingClasses = {
  none: '',
  md: 'p-5 sm:p-6',
  lg: 'p-6 sm:p-8',
}

export default function Card({
  children,
  className = '',
  hover = false,
  padding = 'md',
}: CardProps) {
  return (
    <div
      className={[
        'rounded-2xl border border-host-border bg-host-surface shadow-card',
        hover
          ? 'transition-all duration-200 hover:border-stone-300 hover:shadow-card-hover'
          : '',
        paddingClasses[padding],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  )
}
