export function formatConocimientoUnificado(
  manual: string,
  guiaLocal: string,
): string {
  const bloques: string[] = []

  const manualLimpio = manual.trim()
  if (manualLimpio) {
    bloques.push(`# Manual del Alojamiento\n\n${manualLimpio}`)
  }

  const guiaLimpia = guiaLocal.trim()
  if (guiaLimpia) {
    bloques.push(`# Guía Local de Recomendaciones\n\n${guiaLimpia}`)
  }

  return bloques.join('\n\n')
}
