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
    title: '1 alojamiento',
    description: 'Gestiono un único alojamiento turístico de forma personal.',
    icon: '🏡',
  },
  {
    profile: 'B_2_5_AIRBNBS',
    title: 'Entre 2 y 5 alojamientos',
    description: 'Tengo un pequeño portfolio que quiero escalar con control.',
    icon: '🏘️',
  },
  {
    profile: 'C_MAS_DE_5',
    title: 'Más de 5 alojamientos',
    description: 'Soy empresa de gestión o operador multi-propiedad.',
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
          ¿Cuántos alojamientos turísticos gestionas?
        </h1>
        <p className="mt-3 text-lg text-slate-400">
          Así personalizamos tu experiencia desde el primer minuto.
        </p>
      </div>

      <div className="grid gap-4 sm:gap-5">
        {OPTIONS.map(({ profile, title, description, icon }) => (
          <button
            key={profile}
            type="button"
            onClick={() => onSelect(profile)}
            className="group relative w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-left backdrop-blur-sm transition-all duration-300 hover:border-indigo-500/50 hover:bg-slate-900/90 hover:shadow-xl hover:shadow-indigo-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
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
