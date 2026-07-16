import UmbralBrand from '../../components/ui/UmbralBrand'
import { BRAND_TAGLINE } from '../../config/brand'

export default function WelcomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-host-bg px-6 py-12 text-center">
      <UmbralBrand />
      <h1 className="mt-8 font-display text-2xl font-bold text-host-text">
        Portal del huésped
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-host-muted">
        {BRAND_TAGLINE}. Accede al chat de tu alojamiento desde el enlace que
        te compartió tu anfitrión.
      </p>
    </div>
  )
}
