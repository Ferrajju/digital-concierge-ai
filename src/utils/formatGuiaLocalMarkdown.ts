import type { TarjetaGuiaLocal } from '../pages/propietario/types/guiaLocal'

export function formatGuiaLocalMarkdown(tarjetas: TarjetaGuiaLocal[]): string {
  return tarjetas
    .filter(
      (tarjeta) =>
        tarjeta.activa &&
        tarjeta.nombre.trim() &&
        tarjeta.distancia.trim() &&
        tarjeta.informacion.trim(),
    )
    .map((tarjeta) => {
      const categoria = tarjeta.categoria.trim()
      const nombre = tarjeta.nombre.trim()
      const distancia = tarjeta.distancia.trim()
      const informacion = tarjeta.informacion.trim()

      return [
        `## Guia de recomendacion - ${categoria} - ${nombre}`,
        `- **Distancia:** ${distancia}`,
        `- **Información:** ${informacion}`,
      ].join('\n')
    })
    .join('\n\n')
}
