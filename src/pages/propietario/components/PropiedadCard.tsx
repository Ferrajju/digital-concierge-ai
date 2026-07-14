import { useState } from 'react'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import {
  IconArrowRight,
  IconChat,
  IconMapPin,
  IconQr,
} from '../../../components/ui/icons'
import type { PropiedadResumen } from '../types/propiedadDashboard'
import QrPropiedadModal from './QrPropiedadModal'

type PropiedadCardProps = {
  propiedad: PropiedadResumen
}

export default function PropiedadCard({ propiedad }: PropiedadCardProps) {
  const [mostrarQr, setMostrarQr] = useState(false)

  return (
    <>
      <Card hover padding="none" className="group flex h-full flex-col overflow-hidden">
        <div className="border-b border-stone-200 px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h2 className="truncate font-display text-lg font-bold text-host-text">
                {propiedad.nombreApartamento}
              </h2>
              {propiedad.iaIdentidad && (
                <p className="mt-1.5 text-sm text-host-muted">
                  Agente{' '}
                  <span className="font-semibold text-host-primary">
                    {propiedad.iaIdentidad}
                  </span>
                </p>
              )}
            </div>
            <Badge variant={propiedad.activa ? 'success' : 'neutral'}>
              {propiedad.activa ? 'Activa' : 'Inactiva'}
            </Badge>
          </div>
        </div>

        <div className="flex flex-1 flex-col border-b border-stone-200 bg-stone-50 px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-stone-200 bg-white shadow-sm">
              <IconMapPin className="h-4 w-4 text-stone-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-wide text-stone-500">
                Ubicación
              </p>
              <p className="mt-1 text-sm font-medium leading-relaxed text-stone-700">
                {propiedad.direccionCompleta || 'Dirección no configurada'}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-auto space-y-2.5 p-4">
          <Button
            to={`/propiedad/${propiedad.id}/gestionar`}
            fullWidth
            size="md"
          >
            Gestionar alojamiento
            <IconArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Button>

          <div className="grid grid-cols-2 gap-2.5">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setMostrarQr(true)}
              className="w-full"
            >
              <IconQr className="h-4 w-4" />
              Ver QR
            </Button>
            <Button
              to={`/propiedad/${propiedad.id}/chats`}
              variant="secondary"
              size="sm"
              className="w-full"
            >
              <IconChat className="h-4 w-4" />
              Chats
            </Button>
          </div>
        </div>
      </Card>

      {mostrarQr && (
        <QrPropiedadModal
          propiedadId={propiedad.id}
          nombreApartamento={propiedad.nombreApartamento}
          onCerrar={() => setMostrarQr(false)}
        />
      )}
    </>
  )
}
