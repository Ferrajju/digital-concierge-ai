import Button from '../../../components/ui/Button'
import HostFeedback from '../../../components/ui/HostFeedback'
import { FieldGroup } from '../../../components/ui/FormSection'
import { inputClassName } from '../../../components/ui/inputClassName'
import WizardStepShell, { WizardActions } from '../../../components/ui/WizardStepShell'

const SUGERENCIAS = ['Lucas', 'Sofía', 'Marco', 'Elena', 'Alex']

type StepNombreAgenteProps = {
  valor: string
  nombreVivienda: string
  onChange: (valor: string) => void
  onContinuar: () => void
  onVolver: () => void
  guardando: boolean
  error: string
}

export default function StepNombreAgente({
  valor,
  nombreVivienda,
  onChange,
  onContinuar,
  onVolver,
  guardando,
  error,
}: StepNombreAgenteProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onContinuar()
  }

  return (
    <WizardStepShell
      paso={3}
      icon="🤖"
      title="Dale un nombre a tu agente IA"
      description={
        <>
          Cada propiedad tendrá un agente IA asignado para ayudar a los huéspedes
          de{' '}
          <span className="font-semibold text-host-primary">{nombreVivienda}</span>
          . ¿Cómo quieres llamar al tuyo?
        </>
      }
      centered
    >
      <form onSubmit={handleSubmit} className="mx-auto max-w-lg space-y-6">
        <FieldGroup label="Nombre del agente">
          <input
            type="text"
            value={valor}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Ej: Lucas"
            disabled={guardando}
            autoFocus
            className={`text-center text-base ${inputClassName}`}
          />
          <p className="mt-2 text-center text-xs text-host-muted">
            Los huéspedes verán este nombre cuando hablen con el asistente.
          </p>
        </FieldGroup>

        <div className="flex flex-wrap justify-center gap-2">
          {SUGERENCIAS.map((nombre) => (
            <button
              key={nombre}
              type="button"
              disabled={guardando}
              onClick={() => onChange(nombre)}
              className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-all ${
                valor === nombre
                  ? 'border-teal-300 bg-teal-50 text-host-primary'
                  : 'border-stone-200 bg-white text-host-muted hover:border-stone-300 hover:text-host-text'
              }`}
            >
              {nombre}
            </button>
          ))}
        </div>

        {error && <HostFeedback>{error}</HostFeedback>}

        <WizardActions>
          <Button
            type="button"
            variant="secondary"
            onClick={onVolver}
            disabled={guardando}
          >
            ← Volver
          </Button>
          <Button
            type="submit"
            size="lg"
            loading={guardando}
            disabled={!valor.trim() || guardando}
          >
            Comenzar entrevista
          </Button>
        </WizardActions>
      </form>
    </WizardStepShell>
  )
}
