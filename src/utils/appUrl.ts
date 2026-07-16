export function getAppBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin.replace(/\/$/, '')
  }
  const fromEnv = import.meta.env.VITE_APP_URL?.trim()
  if (fromEnv) return fromEnv.replace(/\/$/, '')
  return ''
}

export function getGuestChatUrl(propiedadId: string): string {
  return `${getAppBaseUrl()}/guest/${propiedadId}`
}

export function getAuthCallbackUrl(): string {
  return `${getAppBaseUrl()}/auth/callback`
}
