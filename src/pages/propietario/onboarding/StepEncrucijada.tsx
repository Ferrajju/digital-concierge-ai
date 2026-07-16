import Button from '../../../components/ui/Button'
import HostFeedback from '../../../components/ui/HostFeedback'
import WizardStepShell from '../../../components/ui/WizardStepShell'

type StepEncrucijadaProps = {
  loading: boolean
  error: string
  onSi: () => void
  onNo: () => void
}

export default function StepEncrucijada({
  loading,
  error,
  onSi,
  onNo,
}: StepEncrucijadaProps) {
  return (
    <WizardStepShell
      paso={3}
      totalPasos={3}
      icon="✓"
      title="¡Configuración completada!"
      description="¿Quieres empezar a configurar tu primera vivienda ahora mismo?"
      centered
    >
      {error && <HostFeedback className="mb-6">{error}</HostFeedback>}

      <div className="grid gap-3">
        <Button
          type="button"
          size="lg"
          fullWidth
          loading={loading}
          disabled={loading}
          onClick={onSi}
        >
          Sí, empezar ahora
        </Button>

        <Button
          type="button"
          variant="secondary"
          size="lg"
          fullWidth
          disabled={loading}
          onClick={onNo}
        >
          No, ir al panel general
        </Button>
      </div>
    </WizardStepShell>
  )
}
