import { useState } from 'react'
import { Link } from 'react-router-dom'
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
      <Card hover className="group flex h-full flex-col">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="truncate font-display text-lg font-semibold text-host-text">
              {propiedad.nombreApartamento}
            </h2>
            {propiedad.iaIdentidad && (
              <p className="mt-1 text-xs text-host-muted">
                Agente{' '}
                <span className="font-medium text-host-primary">
                  {propiedad.iaIdentidad}
                </span>
              </p>
            )}
          </div>
          <Badge variant={propiedad.activa ? 'success' : 'neutral'}>
            {propiedad.activa ? 'Activa' : 'Inactiva'}
          </Badge>
        </div>

        <p className="mb-6 flex flex-1 items-start gap-2 text-sm leading-relaxed text-host-muted">
          <IconMapPin className="mt-0.5 shrink-0 text-stone-400" />
          <span>
            {propiedad.direccionCompleta || 'Dirección no configurada'}
          </span>
        </p>

        <div className="mt-auto space-y-2">
          <Button
            to={`/propiedad/${propiedad.id}/gestionar`}
            fullWidth
            size="md"
          >
            Gestionar alojamiento
            <IconArrowRight className="transition-transform group-hover:translate-x-0.5" />
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setMostrarQr(true)}
              className="w-full"
            >
              <IconQr className="h-4 w-4" />
              QR
            </Button>
            <Link
              to={`/propiedad/${propiedad.id}/chats`}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-host-border bg-host-surface px-3.5 py-2 text-sm font-semibold text-host-text transition-all hover:border-stone-300 hover:bg-stone-50"
            >
              <IconChat className="h-4 w-4" />
              Chats
            </Link>
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
