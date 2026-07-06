import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import OnboardingLayout from './onboarding/OnboardingLayout'
import StepPropertyChat from './onboarding/StepPropertyChat'
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

  const handleProfileSelect = (profile: BusinessProfile) => {
    setBusinessProfile(profile)
    setStep(2)
  }

  const handleTelegramContinue = () => {
    setStep(3)
  }

  const handleFinishOnboarding = () => {
    // TODO: Persistir businessProfile y telegramChatId en Supabase
    console.log('Onboarding completado:', { businessProfile, telegramChatId })
    navigate('/')
  }

  return (
    <OnboardingLayout
      step={step}
      headerAction={
        step === 3 ? undefined : (
          <button
            type="button"
            onClick={handleFinishOnboarding}
            className="text-xs font-medium text-slate-500 transition-colors hover:text-slate-300"
          >
            Saltar por ahora
          </button>
        )
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
          <StepPropertyChat onFinish={handleFinishOnboarding} />
        )}
      </div>
    </OnboardingLayout>
  )
}
