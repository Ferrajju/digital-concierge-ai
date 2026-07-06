import type { BusinessProfile } from './types'

type StepSegmentationProps = {
  onSelect: (profile: BusinessProfile) => void
}

const OPTIONS: {
  profile: BusinessProfile
  title: string
  description: string
  icon: string
}[] = [
  {
    profile: 'A_1_AIRBNB',
    title: 'Tengo 1 alojamiento individual',
    description: 'Ideal para hosts que gestionan un único espacio con atención personalizada.',
    icon: '🏡',
  },
  {
    profile: 'B_2_5_AIRBNBS',
    title: 'Gestiono entre 2 y 5 propiedades',
    description: 'Para pequeños portfolios que necesitan escalar sin perder el control.',
    icon: '🏘️',
  },
  {
    profile: 'C_MAS_DE_5',
    title: 'Soy una empresa de gestión / Multi-propiedad (+5)',
    description: 'Pensado para operadores profesionales con múltiples unidades activas.',
    icon: '🏢',
  },
]

export default function StepSegmentation({ onSelect }: StepSegmentationProps) {
  return (
    <div className="animate-fade-in-up">
      <div className="mb-10 text-center">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-indigo-400">
          Paso 1 de 3
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Bienvenido a Digital Concierge AI.
        </h1>
        <p className="mt-3 text-lg text-slate-400">¿Cómo es tu negocio?</p>
      </div>

      <div className="grid gap-4 sm:gap-5">
        {OPTIONS.map(({ profile, title, description, icon }) => (
          <button
            key={profile}
            type="button"
            onClick={() => onSelect(profile)}
            className="group relative w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-left backdrop-blur-sm transition-all duration-300 hover:border-indigo-500/50 hover:bg-slate-900/90 hover:shadow-xl hover:shadow-indigo-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/0 via-indigo-600/0 to-violet-600/0 transition-all duration-300 group-hover:from-indigo-600/5 group-hover:to-violet-600/5" />
            <div className="relative flex items-start gap-5">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-800 text-2xl ring-1 ring-slate-700 transition-all duration-300 group-hover:bg-indigo-500/10 group-hover:ring-indigo-500/30">
                {icon}
              </span>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-white transition-colors group-hover:text-indigo-100">
                  {title}
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
                  {description}
                </p>
              </div>
              <span className="mt-1 text-slate-600 transition-all duration-300 group-hover:translate-x-1 group-hover:text-indigo-400">
                →
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
