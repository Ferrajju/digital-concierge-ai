import { useRef } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
      onClick={onCerrar}
      role="presentation"
    >
      <div
        className="w-full max-w-md animate-fade-in-up rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="qr-modal-title"
      >
        <div className="mb-5 text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-indigo-400">
            Acceso huésped
          </p>
          <h2 id="qr-modal-title" className="mt-1 text-lg font-semibold text-white">
            {nombreApartamento}
          </h2>
          <p className="mt-2 text-xs text-slate-500">
            Escanea para abrir el chat del conserje digital
          </p>
        </div>

        <div className="mx-auto flex w-fit rounded-2xl bg-white p-4 shadow-inner">
          <QRCodeCanvas
            id={canvasId}
            ref={canvasRef}
            value={guestUrl}
            size={220}
            level="M"
            includeMargin
          />
        </div>

        <p className="mx-auto mt-4 max-w-xs break-all text-center text-[11px] text-slate-500">
          {guestUrl}
        </p>

        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-xl border border-slate-700 px-4 py-3 text-sm text-slate-400 transition-colors hover:border-slate-600 hover:text-white"
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={handleDescargar}
            className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:from-indigo-400 hover:to-violet-500"
          >
            Descargar QR (PNG)
          </button>
        </div>

        <a
          href={guestUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 block text-center text-xs text-indigo-300 hover:text-indigo-200"
        >
          Abrir chat en nueva pestaña →
        </a>
      </div>
    </div>
  )
}
