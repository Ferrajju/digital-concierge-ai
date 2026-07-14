import { useRef } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import { getGuestChatUrl } from '../../../utils/appUrl'

type QrPropiedadModalProps = {
  propiedadId: string
  nombreApartamento: string
  onCerrar: () => void
}

export default function QrPropiedadModal({
  propiedadId,
  nombreApartamento,
  onCerrar,
}: QrPropiedadModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const guestUrl = getGuestChatUrl(propiedadId)
  const canvasId = `qr-canvas-${propiedadId}`

  const handleDescargar = () => {
    const canvas =
      canvasRef.current ??
      (document.getElementById(canvasId) as HTMLCanvasElement | null)
    if (!canvas) return

    const enlace = document.createElement('a')
    enlace.download = `qr-${nombreApartamento.replace(/\s+/g, '-').toLowerCase()}.png`
    enlace.href = canvas.toDataURL('image/png')
    enlace.click()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-sm"
      onClick={onCerrar}
      role="presentation"
    >
      <div
        className="w-full max-w-md animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="qr-modal-title"
      >
        <Card padding="lg" className="shadow-card-hover">
        <div className="mb-5 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-host-primary">
            Acceso huésped
          </p>
          <h2
            id="qr-modal-title"
            className="mt-1 font-display text-lg font-semibold text-host-text"
          >
            {nombreApartamento}
          </h2>
          <p className="mt-2 text-xs text-host-muted">
            Escanea para abrir el chat del conserje digital
          </p>
        </div>

        <div className="mx-auto flex w-fit rounded-2xl border border-host-border bg-white p-4">
          <QRCodeCanvas
            id={canvasId}
            ref={canvasRef}
            value={guestUrl}
            size={220}
            level="M"
            includeMargin
          />
        </div>

        <p className="mx-auto mt-4 max-w-xs break-all text-center text-[11px] text-host-muted">
          {guestUrl}
        </p>

        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          <Button type="button" variant="secondary" onClick={onCerrar}>
            Cerrar
          </Button>
          <Button type="button" onClick={handleDescargar}>
            Descargar QR (PNG)
          </Button>
        </div>

        <a
          href={guestUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 block text-center text-xs font-medium text-host-primary hover:text-teal-800"
        >
          Abrir chat en nueva pestaña →
        </a>
        </Card>
      </div>
    </div>
  )
}
