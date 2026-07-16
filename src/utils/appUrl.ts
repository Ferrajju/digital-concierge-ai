export function getAppBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_APP_URL?.trim()
  if (fromEnv) return fromEnv.replace(/\/$/, '')
  if (typeof window !== 'undefined') return window.location.origin
  return ''
}

export function getGuestChatUrl(propiedadId: string): string {
  return `${getAppBaseUrl()}/guest/${propiedadId}`
}

export function getAuthCallbackUrl(): string {
  return `${getAppBaseUrl()}/auth/callback`
}
