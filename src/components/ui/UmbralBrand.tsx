import { BRAND_NAME, BRAND_TAGLINE_PANEL } from '../../config/brand'

type UmbralBrandProps = {
  size?: 'sm' | 'md'
  subtitle?: string
  showSubtitle?: boolean
}

export default function UmbralBrand({
  size = 'md',
  subtitle,
  showSubtitle = true,
}: UmbralBrandProps) {
  const markClass =
    size === 'sm'
      ? 'h-9 w-9 rounded-xl text-xs'
      : 'h-10 w-10 rounded-xl text-sm'

  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex ${markClass} items-center justify-center bg-host-primary font-bold text-white shadow-sm`}
        aria-hidden
      >
        U
      </div>
      {showSubtitle && (
        <div>
          <p className="font-display text-sm font-semibold text-host-text">
            {BRAND_NAME}
          </p>
          <p className="text-xs text-host-muted">
            {subtitle ?? BRAND_TAGLINE_PANEL}
          </p>
        </div>
      )}
    </div>
  )
}
