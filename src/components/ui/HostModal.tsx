import type { ReactNode } from 'react'
import Button from './Button'
import Card from './Card'

type HostModalProps = {
  title: string
  children: ReactNode
  onClose: () => void
  confirmLabel?: string
  onConfirm?: () => void
  confirmLoading?: boolean
  confirmVariant?: 'primary' | 'warning'
}

export default function HostModal({
  title,
  children,
  onClose,
  confirmLabel,
  onConfirm,
  confirmLoading = false,
  confirmVariant = 'primary',
}: HostModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="host-modal-title"
    >
      <Card padding="lg" className="w-full max-w-md shadow-card-hover">
        <h3
          id="host-modal-title"
          className="font-display text-lg font-semibold text-host-text"
        >
          {title}
        </h3>
        <div className="mt-3 text-sm leading-relaxed text-host-muted">
          {children}
        </div>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={confirmLoading}
          >
            Cancelar
          </Button>
          {onConfirm && confirmLabel && (
            <Button
              type="button"
              onClick={onConfirm}
              loading={confirmLoading}
              disabled={confirmLoading}
              className={
                confirmVariant === 'warning'
                  ? 'bg-amber-600 hover:bg-amber-700 focus-visible:ring-amber-300'
                  : undefined
              }
            >
              {confirmLabel}
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}

export function HostOverlayLoading({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-sm">
      <Card padding="lg" className="w-full max-w-lg text-center shadow-card-hover">
        <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-[3px] border-teal-100 border-t-host-primary" />
        <p className="font-display text-lg font-semibold text-host-text">
          {title}
        </p>
        <p className="mt-2 text-sm text-host-muted">{description}</p>
      </Card>
    </div>
  )
}
