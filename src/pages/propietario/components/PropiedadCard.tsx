import { useState } from 'react'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import {
  IconArrowRight,
  IconChat,
  IconCopy,
  IconMapPin,
  IconQr,
  IconTrash,
} from '../../../components/ui/icons'
import type { PropiedadResumen } from '../types/propiedadDashboard'
import QrPropiedadModal from './QrPropiedadModal'
import PropiedadDuplicarModal from './PropiedadDuplicarModal'
import PropiedadEliminarModal from './PropiedadEliminarModal'

type PropiedadCardProps = {
  propiedad: PropiedadResumen
  onActualizar?: () => void
}

export default function PropiedadCard({
  propiedad,
  onActualizar,
}: PropiedadCardProps) {
  const [mostrarQr, setMostrarQr] = useState(false)
  const [mostrarDuplicar, setMostrarDuplicar] = useState(false)
  const [mostrarEliminar, setMostrarEliminar] = useState(false)
  const [qrDuplicado, setQrDuplicado] = useState<{
    id: string
    nombre: string
  } | null>(null)

  const inactiva = !propiedad.activa

  return (
    <>
      <Card
        hover={!inactiva}
        padding="none"
        className={[
          'group flex h-full flex-col overflow-hidden transition-all',
          inactiva
            ? 'border-stone-300 bg-gradient-to-b from-stone-200/90 to-stone-300/70 shadow-none saturate-[0.65]'
            : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div
          className={[
            'border-b px-5 py-4',
            inactiva ? 'border-stone-300/80 bg-stone-300/40' : 'border-stone-200',
          ].join(' ')}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h2
                className={[
                  'truncate font-display text-lg font-bold',
                  inactiva ? 'text-stone-600' : 'text-host-text',
                ].join(' ')}
              >
                {propiedad.nombreApartamento}
              </h2>
              {propiedad.iaIdentidad && (
                <p
                  className={[
                    'mt-1.5 text-sm',
                    inactiva ? 'text-stone-500' : 'text-host-muted',
                  ].join(' ')}
                >
                  Agente{' '}
                  <span
                    className={[
                      'font-semibold',
                      inactiva ? 'text-stone-600' : 'text-host-primary',
                    ].join(' ')}
                  >
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

        <div
          className={[
            'flex flex-1 flex-col border-b px-5 py-4',
            inactiva
              ? 'border-stone-300/80 bg-stone-300/25'
              : 'border-stone-200 bg-stone-50',
          ].join(' ')}
        >
          <div className="flex items-start gap-3">
            <div
              className={[
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border shadow-sm',
                inactiva
                  ? 'border-stone-300/80 bg-stone-200/80'
                  : 'border-stone-200 bg-white',
              ].join(' ')}
            >
              <IconMapPin
                className={[
                  'h-4 w-4',
                  inactiva ? 'text-stone-500' : 'text-stone-500',
                ].join(' ')}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p
                className={[
                  'text-xs font-bold uppercase tracking-wide',
                  inactiva ? 'text-stone-500' : 'text-stone-500',
                ].join(' ')}
              >
                Ubicación
              </p>
              <p
                className={[
                  'mt-1 text-sm font-medium leading-relaxed',
                  inactiva ? 'text-stone-600' : 'text-stone-700',
                ].join(' ')}
              >
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
            variant={inactiva ? 'secondary' : 'primary'}
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

          <div className="grid grid-cols-2 gap-2.5 border-t border-stone-200/80 pt-2.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setMostrarDuplicar(true)}
              className="w-full text-stone-600"
            >
              <IconCopy className="h-4 w-4" />
              Duplicar
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setMostrarEliminar(true)}
              className="w-full text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <IconTrash className="h-4 w-4" />
              Eliminar
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

      {qrDuplicado && (
        <QrPropiedadModal
          propiedadId={qrDuplicado.id}
          nombreApartamento={qrDuplicado.nombre}
          onCerrar={() => setQrDuplicado(null)}
        />
      )}

      {mostrarDuplicar && (
        <PropiedadDuplicarModal
          propiedadId={propiedad.id}
          nombreApartamento={propiedad.nombreApartamento}
          onCerrar={() => setMostrarDuplicar(false)}
          onDuplicada={(nuevoId, nuevoNombre) => {
            setMostrarDuplicar(false)
            onActualizar?.()
            setQrDuplicado({ id: nuevoId, nombre: nuevoNombre })
          }}
        />
      )}

      {mostrarEliminar && (
        <PropiedadEliminarModal
          propiedadId={propiedad.id}
          nombreApartamento={propiedad.nombreApartamento}
          onCerrar={() => setMostrarEliminar(false)}
          onEliminada={() => {
            setMostrarEliminar(false)
            onActualizar?.()
          }}
        />
      )}
    </>
  )
}
