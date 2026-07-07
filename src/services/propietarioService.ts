import { supabase } from './supabaseClient'
import type { BusinessProfile } from '../pages/propietario/onboarding/types'
import { obtenerPropietarioId } from './propiedadService'

type GuardarOnboardingParams = {
  perfil: BusinessProfile
  telegramChatId: string
  onboardingCompleted?: boolean
}

export async function guardarOnboardingPropietario({
  perfil,
  telegramChatId,
  onboardingCompleted = true,
}: GuardarOnboardingParams): Promise<void> {
  const propietarioId = await obtenerPropietarioId()
  const telegramId = Number.parseInt(telegramChatId.trim(), 10)

  if (Number.isNaN(telegramId)) {
    throw new Error('El Telegram Chat ID debe ser un número válido.')
  }

  const { error } = await supabase
    .from('propietarios')
    .update({
      perfil,
      telegram_chat_id: telegramId,
      onboarding_completed: onboardingCompleted,
    })
    .eq('id', propietarioId)

  if (error) throw error
}
