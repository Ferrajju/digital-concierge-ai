import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { guardarOnboardingPropietario } from '../../services/propietarioService'
import OnboardingLayout from './onboarding/OnboardingLayout'
import StepEncrucijada from './onboarding/StepEncrucijada'
import StepSegmentation from './onboarding/StepSegmentation'
import StepTelegram from './onboarding/StepTelegram'
import type { BusinessProfile } from './onboarding/types'

export default function OnboardingPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(
    null,
  )
  const [telegramChatId, setTelegramChatId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleProfileSelect = (profile: BusinessProfile) => {
    setBusinessProfile(profile)
    setStep(2)
  }

  const handleTelegramContinue = () => {
    setStep(3)
  }

  const finalizarOnboarding = async (destino: '/' | '/crear-propiedad') => {
    if (!businessProfile) {
      setError('Selecciona tu perfil de negocio antes de continuar.')
      setStep(1)
      return
    }

    setLoading(true)
    setError('')

    try {
      await guardarOnboardingPropietario({
        perfil: businessProfile,
        telegramChatId,
      })
      navigate(destino)
    } catch (err) {
      const mensaje =
        err instanceof Error
          ? err.message
          : 'No se pudo guardar tu configuración.'
      setError(mensaje)
    } finally {
      setLoading(false)
    }
  }

  const handleSaltar = () => {
    navigate('/')
  }

  return (
    <OnboardingLayout
      step={step}
      headerAction={
        step < 3 ? (
          <button
            type="button"
            onClick={handleSaltar}
            className="text-xs font-medium text-slate-500 transition-colors hover:text-slate-300"
          >
            Saltar por ahora
          </button>
        ) : undefined
      }
    >
      <div key={step} className="transition-all duration-500">
        {step === 1 && <StepSegmentation onSelect={handleProfileSelect} />}
        {step === 2 && (
          <StepTelegram
            telegramChatId={telegramChatId}
            onTelegramChatIdChange={setTelegramChatId}
            onContinue={handleTelegramContinue}
          />
        )}
        {step === 3 && (
          <StepEncrucijada
            loading={loading}
            error={error}
            onIrAlPanel={() => finalizarOnboarding('/')}
            onConfigurarVivienda={() => finalizarOnboarding('/crear-propiedad')}
          />
        )}
      </div>
    </OnboardingLayout>
  )
}
