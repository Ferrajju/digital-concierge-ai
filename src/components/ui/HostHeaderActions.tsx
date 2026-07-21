import type { ReactNode } from 'react'
import HostLogoutButton from './HostLogoutButton'

export default function HostHeaderActions({
  children,
}: {
  children?: ReactNode
}) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      {children}
      <HostLogoutButton />
    </div>
  )
}
