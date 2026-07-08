const SESSION_PREFIX = 'dc_guest_session_'

export function obtenerSessionIdHuesped(propiedadId: string): string {
  const key = `${SESSION_PREFIX}${propiedadId}`
  const existente = localStorage.getItem(key)
  if (existente?.trim()) return existente.trim()

  const nuevo = crypto.randomUUID()
  localStorage.setItem(key, nuevo)
  return nuevo
}
