import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import type { GuestUiCopy } from '../../config/guestOnboardingCopy'
import { esCodigoIdiomaValido } from '../../config/guestLanguages'
import GuestLanguageSelect from './GuestLanguageSelect'

type GuestSettingsSheetProps = {
  abierto: boolean
  idiomaActual: string
  copy: GuestUiCopy
  guardando: boolean
  mensajeExito: string
  onCerrar: () => void
  onGuardarIdioma: (idioma: string) => Promise<void>
}

export default function GuestSettingsSheet({
  abierto,
  idiomaActual,
  copy,
  guardando,
  mensajeExito,
  onCerrar,
  onGuardarIdioma,
}: GuestSettingsSheetProps) {
  const [idioma, setIdioma] = useState(idiomaActual)
  const [error, setError] = useState('')

  useEffect(() => {
    if (abierto) {
      setIdioma(idiomaActual)
      setError('')
    }
  }, [abierto, idiomaActual])

  useEffect(() => {
    if (!abierto) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [abierto])

  if (!abierto || typeof document === 'undefined') return null

  const handleGuardar = async () => {
    if (!esCodigoIdiomaValido(idioma)) {
      setError(copy.errorSave)
      return
    }
    setError('')
    try {
      await onGuardarIdioma(idioma)
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.errorSave)
    }
  }

  const hayCambios = idioma !== idiomaActual

  return createPortal(
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-label={copy.settingsClose}
        onClick={onCerrar}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="guest-settings-title"
        className="relative flex max-h-[min(640px,92dvh)] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#111b21] shadow-2xl shadow-black/60"
      >
        <div className="shrink-0 border-b border-white/5 px-5 pb-4 pt-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h2
                id="guest-settings-title"
                className="text-lg font-semibold text-white"
              >
                {copy.settingsTitle}
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                {copy.settingsLanguageHint}
              </p>
            </div>
            <button
              type="button"
              onClick={onCerrar}
              className="shrink-0 rounded-full p-2 text-slate-400 hover:bg-white/5 hover:text-white"
              aria-label={copy.settingsClose}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
              >
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <p className="mb-2 text-sm font-semibold text-slate-200">
            {copy.settingsLanguage}
          </p>
          <GuestLanguageSelect
            value={idioma}
            onChange={setIdioma}
            disabled={guardando}
            searchPlaceholder={copy.languageSearch}
            label={copy.settingsLanguage}
            presentation="inline"
          />

          {mensajeExito && (
            <p className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
              {mensajeExito}
            </p>
          )}

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200"
            >
              {error}
            </p>
          )}
        </div>

        <div className="shrink-0 flex gap-2 border-t border-white/5 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={onCerrar}
            disabled={guardando}
            className="flex-1 rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-300 disabled:opacity-50"
          >
            {copy.settingsClose}
          </button>
          <button
            type="button"
            onClick={() => void handleGuardar()}
            disabled={guardando || !hayCambios}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {guardando ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                {copy.settingsSaving}
              </>
            ) : (
              copy.settingsSave
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
