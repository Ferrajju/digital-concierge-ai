export type BusinessProfile = 'A_1_AIRBNB' | 'B_2_5_AIRBNBS' | 'C_MAS_DE_5'

export type OnboardingState = {
  step: 1 | 2 | 3
  businessProfile: BusinessProfile | null
  telegramChatId: string
}
