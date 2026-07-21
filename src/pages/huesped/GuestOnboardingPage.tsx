import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import UmbralBrand from '../../components/ui/UmbralBrand'
import { obtenerCopyOnboarding } from '../../config/guestOnboardingCopy'
import {
  esCodigoIdiomaValido,
  GUEST_LANGUAGES,
} from '../../config/guestLanguages'
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

export default function GuestOnboardingPage({
  propiedad,
  sessionId,
}: GuestOnboardingPageProps) {
  const navigate = useNavigate()
  const [idioma, setIdioma] = useState(detectarIdiomaInicial)
  const [nombre, setNombre] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  const copy = useMemo(() => obtenerCopyOnboarding(idioma), [idioma])

  useEffect(() => {
    document.body.classList.add('guest-chat-active')
    return () => {
      document.body.classList.remove('guest-chat-active')
    }
  }, [])

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
      setError(
        err instanceof Error ? err.message : copy.errorSave,
      )
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="guest-chat-shell items-center justify-center px-4 py-8">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <UmbralBrand subtitle="Conserje digital" />
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#111b21]/95 p-6 shadow-xl sm:p-8">
          <p className="text-center text-xs font-semibold uppercase tracking-wider text-emerald-400/90">
            {propiedad.nombreApartamento}
          </p>
          <h1 className="mt-3 text-center font-display text-2xl font-bold text-white">
            {copy.welcome}
          </h1>
          <p className="mt-2 text-center text-sm leading-relaxed text-slate-400">
            {copy.subtitle}
          </p>
          {propiedad.direccionCompleta && (
            <p className="mt-2 text-center text-xs text-slate-500">
              {propiedad.direccionCompleta}
            </p>
          )}

          <form onSubmit={(e) => void handleSubmit(e)} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="guest-idioma"
                className="mb-2 block text-sm font-semibold text-slate-200"
              >
                {copy.languageLabel}
              </label>
              <select
                id="guest-idioma"
                value={idioma}
                onChange={(e) => {
                  setIdioma(e.target.value)
                  setError('')
                }}
                disabled={guardando}
                className="w-full rounded-2xl border border-white/10 bg-[#202c33] px-4 py-3.5 text-base text-white focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                {GUEST_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.native} — {lang.label}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-xs text-slate-500">{copy.languageHint}</p>
            </div>

            <div>
              <label
                htmlFor="guest-nombre"
                className="mb-2 block text-sm font-semibold text-slate-200"
              >
                {copy.nameLabel}
              </label>
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
              <p className="mt-1.5 text-xs text-slate-500">{copy.nameHint}</p>
            </div>

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
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-4 text-base font-semibold text-white shadow-lg shadow-emerald-900/30 transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
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
            {propiedad.iaIdentidad} · Tu conserje digital para esta estancia
          </p>
        </div>
      </div>
    </div>
  )
}
