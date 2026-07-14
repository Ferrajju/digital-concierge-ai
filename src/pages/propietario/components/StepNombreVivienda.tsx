import Button from '../../../components/ui/Button'
import HostFeedback from '../../../components/ui/HostFeedback'
import { FieldGroup } from '../../../components/ui/FormSection'
import { inputClassName } from '../../../components/ui/inputClassName'
import WizardStepShell from '../../../components/ui/WizardStepShell'

type StepNombreViviendaProps = {
  valor: string
  onChange: (valor: string) => void
  onContinuar: () => void
  error: string
}

export default function StepNombreVivienda({
  valor,
  onChange,
  onContinuar,
  error,
}: StepNombreViviendaProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onContinuar()
  }

  return (
    <WizardStepShell
      paso={1}
      icon="🏠"
      title="¿Cómo quieres llamar a tu apartamento?"
      description="Un nombre memorable que tus huéspedes reconocerán. Puedes cambiarlo después."
      centered
    >
      <form onSubmit={handleSubmit} className="mx-auto max-w-lg space-y-6">
        <FieldGroup label="Nombre del alojamiento">
          <input
            type="text"
            value={valor}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Ej: Apartamento Mar Azul"
            autoFocus
            className={`text-center text-base ${inputClassName}`}
          />
          <p className="mt-2 text-center text-xs text-host-muted">
            Aparecerá en el panel y en las conversaciones con huéspedes.
          </p>
        </FieldGroup>

        {error && <HostFeedback>{error}</HostFeedback>}

        <Button type="submit" fullWidth size="lg" disabled={!valor.trim()}>
          Continuar
        </Button>
      </form>
    </WizardStepShell>
  )
}
