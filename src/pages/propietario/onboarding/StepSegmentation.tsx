import { IconArrowRight } from '../../../components/ui/icons'
import WizardStepShell from '../../../components/ui/WizardStepShell'
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
    <WizardStepShell
      paso={1}
      totalPasos={3}
      icon="🏡"
      title="¿Cuántos alojamientos turísticos gestionas?"
      description="Así personalizamos tu experiencia desde el primer minuto."
      centered
    >
      <div className="grid gap-3">
        {OPTIONS.map(({ profile, title, description, icon }) => (
          <button
            key={profile}
            type="button"
            onClick={() => onSelect(profile)}
            className="group flex w-full items-start gap-4 rounded-xl border-2 border-stone-200 bg-white p-5 text-left transition-all hover:border-teal-300 hover:shadow-card-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-host-primary/30"
          >
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-teal-200 bg-teal-50 text-2xl">
              {icon}
            </span>
            <div className="flex-1">
              <h2 className="font-display text-base font-bold text-host-text">
                {title}
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-host-muted">
                {description}
              </p>
            </div>
            <IconArrowRight className="mt-1 h-5 w-5 shrink-0 text-stone-300 transition-transform group-hover:translate-x-0.5 group-hover:text-host-primary" />
          </button>
        ))}
      </div>
    </WizardStepShell>
  )
}
