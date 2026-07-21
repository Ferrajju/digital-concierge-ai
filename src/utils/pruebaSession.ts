const SESSION_PREFIX = 'umbral_preview_session_'

function storageKey(propiedadId: string): string {
  return `${SESSION_PREFIX}${propiedadId}`
}

export function obtenerSessionIdPrueba(propiedadId: string): string {
  const key = storageKey(propiedadId)
  const existente = sessionStorage.getItem(key)
  if (existente?.trim()) return existente.trim()

  const nuevo = `preview_${crypto.randomUUID()}`
  sessionStorage.setItem(key, nuevo)
  return nuevo
}

export function reiniciarSessionIdPrueba(propiedadId: string): string {
  const key = storageKey(propiedadId)
  const nuevo = `preview_${crypto.randomUUID()}`
  sessionStorage.setItem(key, nuevo)
  return nuevo
}

export function limpiarSessionIdPrueba(propiedadId: string): void {
  sessionStorage.removeItem(storageKey(propiedadId))
}
