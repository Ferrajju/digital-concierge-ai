import { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import {
  cargarPerfilHuesped,
  obtenerPropiedadGuest,
} from '../../services/huespedService'
import { obtenerSessionIdHuesped } from '../../utils/guestSession'
import GuestOnboardingPage from './GuestOnboardingPage'
import type { PropiedadGuestInfo } from './types/guestChat'

export default function GuestEntryPage() {
  const { propiedadId } = useParams<{ propiedadId: string }>()
  const [propiedad, setPropiedad] = useState<PropiedadGuestInfo | null>(null)
  const [sessionId, setSessionId] = useState('')
  const [perfilCompletado, setPerfilCompletado] = useState<boolean | null>(
    null,
  )
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!propiedadId) {
      setError('Enlace no válido.')
      setCargando(false)
      return
    }

    let activo = true

    const iniciar = async () => {
      try {
        const sid = obtenerSessionIdHuesped(propiedadId)
        const info = await obtenerPropiedadGuest(propiedadId)

        let completado = false
        try {
          const perfil = await cargarPerfilHuesped(propiedadId, sid)
          completado = perfil?.perfilCompletado === true
        } catch (perfilErr) {
          console.warn('[GuestEntry] No se pudo cargar perfil:', perfilErr)
        }

        if (!activo) return

        setSessionId(sid)
        setPropiedad(info)
        setPerfilCompletado(completado)
      } catch (err) {
        if (!activo) return
        setError(
          err instanceof Error
            ? err.message
            : 'No se pudo cargar la propiedad.',
        )
      } finally {
        if (activo) setCargando(false)
      }
    }

    void iniciar()

    return () => {
      activo = false
    }
  }, [propiedadId])

  if (cargando) {
    return (
      <div className="guest-chat-shell flex items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 h-11 w-11 animate-spin rounded-full border-[3px] border-emerald-500/20 border-t-emerald-400" />
          <p className="text-sm text-slate-400">Cargando...</p>
        </div>
      </div>
    )
  }

  if (error || !propiedad || !propiedadId) {
    return (
      <div className="guest-chat-shell flex items-center justify-center px-6 text-center">
        <div>
          <p className="text-lg font-semibold text-white">Enlace no disponible</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            {error || 'Enlace no válido.'}
          </p>
        </div>
      </div>
    )
  }

  if (perfilCompletado) {
    return <Navigate to={`/guest/${propiedadId}/chat`} replace />
  }

  return (
    <GuestOnboardingPage propiedad={propiedad} sessionId={sessionId} />
  )
}
