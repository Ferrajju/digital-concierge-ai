import { supabase } from './supabaseClient'
import type { BusinessProfile } from '../pages/propietario/onboarding/types'
import { obtenerPropietarioId } from './propiedadService'

type GuardarOnboardingParams = {
  perfil: BusinessProfile
  telegramChatId?: string
  onboardingCompleted?: boolean
}

export async function guardarTelegramPropietario(
  telegramChatId: string,
): Promise<void> {
  const propietarioId = await obtenerPropietarioId()
  const trimmed = telegramChatId.trim()

  if (!trimmed) {
    throw new Error('Introduce tu Chat ID de Telegram.')
  }

  const telegramId = Number.parseInt(trimmed, 10)
  if (Number.isNaN(telegramId)) {
    throw new Error('El Chat ID debe ser un número válido.')
  }

  const { error } = await supabase
    .from('propietarios')
    .update({ telegram_chat_id: telegramId })
    .eq('id', propietarioId)

  if (error) throw error
}

export async function guardarOnboardingPropietario({
  perfil,
  telegramChatId = '',
  onboardingCompleted = true,
}: GuardarOnboardingParams): Promise<void> {
  const propietarioId = await obtenerPropietarioId()

  const payload: {
    perfil: BusinessProfile
    onboarding_completed: boolean
    telegram_chat_id?: number
  } = {
    perfil,
    onboarding_completed: onboardingCompleted,
  }

  const trimmedTelegram = telegramChatId.trim()
  if (trimmedTelegram) {
    const telegramId = Number.parseInt(trimmedTelegram, 10)
    if (Number.isNaN(telegramId)) {
      throw new Error('El código de Telegram debe ser un número válido.')
    }
    payload.telegram_chat_id = telegramId
  }

  const { error } = await supabase
    .from('propietarios')
    .update(payload)
    .eq('id', propietarioId)

  if (error) throw error
}
