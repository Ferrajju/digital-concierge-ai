export function formatConocimientoUnificado(
  manual: string,
  guiaLocal: string,
): string {
  const partes: string[] = []

  const manualLimpio = manual.trim()
  if (manualLimpio) {
    partes.push(manualLimpio)
  }

  const guiaLimpia = guiaLocal.trim()
  if (guiaLimpia) {
    partes.push(`# Guía Local de Recomendaciones\n\n${guiaLimpia}`)
  }

  return partes.join('\n\n')
}
