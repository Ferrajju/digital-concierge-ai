import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import GuestLanguageSelect from '../../components/huesped/GuestLanguageSelect'
import {
  esCodigoIdiomaValido,
  obtenerIdiomaGuest,
} from '../../config/guestLanguages'
import { obtenerCopyGuest } from '../../config/guestOnboardingCopy'
import { guardarPerfilHuesped } from '../../services/huespedService'
import type { PropiedadGuestInfo } from './types/guestChat'

type GuestOnboardingPageProps = {
  propiedad: PropiedadGuestInfo
  sessionId: string
}

function detectarIdiomaInicial(): string {
  const candidatos = [
    navigator.language,
    ...(navigator.languages ?? []),
  ].filter(Boolean) as string[]

  for (const raw of candidatos) {
    if (esCodigoIdiomaValido(raw)) return raw
    const base = raw.split('-')[0]
    if (esCodigoIdiomaValido(base)) return base
  }

  return 'es'
}

function StepBadge({
  numero,
  titulo,
  activo,
}: {
  numero: number
  titulo: string
  activo?: boolean
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
          activo
            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
            : 'bg-white/10 text-slate-400'
        }`}
      >
        {numero}
      </span>
      <span
        className={`text-xs font-semibold uppercase tracking-wider ${
          activo ? 'text-emerald-300' : 'text-slate-500'
        }`}
      >
        {titulo}
      </span>
    </div>
  )
}

export default function GuestOnboardingPage({
  propiedad,
  sessionId,
}: GuestOnboardingPageProps) {
  const navigate = useNavigate()
  const [idioma, setIdioma] = useState(detectarIdiomaInicial)
  const [nombre, setNombre] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  const copy = useMemo(() => obtenerCopyGuest(idioma), [idioma])
  const idiomaSeleccionado = obtenerIdiomaGuest(idioma)

  useEffect(() => {
    document.body.classList.add('guest-chat-active')
    document.documentElement.lang = idioma.split('-')[0]
    return () => {
      document.body.classList.remove('guest-chat-active')
    }
  }, [idioma])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const nombreLimpio = nombre.trim()

    if (!nombreLimpio) {
      setError(copy.errorName)
      return
    }

    if (!esCodigoIdiomaValido(idioma)) {
      setError(copy.errorSave)
      return
    }

    setGuardando(true)
    setError('')

    try {
      await guardarPerfilHuesped(propiedad.id, sessionId, {
        nombreHuesped: nombreLimpio,
        idioma,
      })
      navigate(`/guest/${propiedad.id}/chat`, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.errorSave)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="guest-chat-shell items-center justify-center px-4 py-6 sm:py-10">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-xl font-bold text-white shadow-lg shadow-emerald-900/40">
            U
          </div>
          <p className="text-sm font-semibold text-white">Umbral</p>
          <p className="text-xs text-slate-500">{copy.brandSubtitle}</p>
        </div>

        <div className="relative overflow-hidden rounded-[1.75rem] border border-emerald-500/20 bg-gradient-to-b from-[#152028] to-[#0b141a] p-[1px] shadow-2xl shadow-black/40">
          <div className="rounded-[1.7rem] bg-[#111b21]/98 p-6 sm:p-8">
            <div className="text-center">
              <span className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-300">
                {propiedad.nombreApartamento}
              </span>
              <h1
                key={copy.welcome}
                className="mt-4 font-display text-[1.65rem] font-bold leading-tight text-white sm:text-3xl"
              >
                {copy.welcome}
              </h1>
              <p
                key={copy.subtitle}
                className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-slate-400"
              >
                {copy.subtitle}
              </p>
              {propiedad.direccionCompleta && (
                <p className="mt-2 text-xs text-slate-600">
                  {propiedad.direccionCompleta}
                </p>
              )}
            </div>

            <form
              onSubmit={(e) => void handleSubmit(e)}
              className="mt-8 space-y-6"
            >
              <section className="space-y-3">
                <StepBadge numero={1} titulo={copy.stepLanguage} activo />
                <GuestLanguageSelect
                  value={idioma}
                  onChange={(code) => {
                    setIdioma(code)
                    setError('')
                  }}
                  disabled={guardando}
                  searchPlaceholder={copy.languageSearch}
                  label={copy.languageLabel}
                />
                <p className="text-xs leading-relaxed text-slate-500">
                  {copy.languageHint}
                </p>
                {idiomaSeleccionado && (
                  <p className="rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2 text-xs text-slate-400">
                    <span className="font-medium text-slate-300">
                      {idiomaSeleccionado.native}
                    </span>{' '}
                    · {copy.languageHint}
                  </p>
                )}
              </section>

              <section className="space-y-3">
                <StepBadge
                  numero={2}
                  titulo={copy.stepName}
                  activo={nombre.trim().length > 0}
                />
                <input
                  id="guest-nombre"
                  type="text"
                  value={nombre}
                  onChange={(e) => {
                    setNombre(e.target.value)
                    setError('')
                  }}
                  placeholder={copy.namePlaceholder}
                  disabled={guardando}
                  autoComplete="name"
                  className="w-full rounded-2xl border border-white/10 bg-[#202c33] px-4 py-3.5 text-base text-white placeholder:text-slate-500 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                <p className="text-xs text-slate-500">{copy.nameHint}</p>
              </section>

              {error && (
                <p
                  role="alert"
                  className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={guardando}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-4 text-base font-semibold text-white shadow-lg shadow-emerald-900/35 transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {guardando ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    {copy.loading}
                  </>
                ) : (
                  copy.submit
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-[11px] leading-relaxed text-slate-600">
              {propiedad.iaIdentidad} · {copy.brandTagline}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
