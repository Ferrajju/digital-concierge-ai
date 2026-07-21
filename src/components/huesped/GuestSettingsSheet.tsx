import { useEffect, useState } from 'react'
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

  if (!abierto) return null

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

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px]"
        aria-label={copy.settingsClose}
        onClick={onCerrar}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="guest-settings-title"
        className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-lg rounded-t-3xl border border-white/10 bg-[#111b21] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-5 shadow-2xl"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/20" />
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
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
            className="rounded-full p-2 text-slate-400 hover:bg-white/5 hover:text-white"
            aria-label={copy.settingsClose}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="mb-2 text-sm font-semibold text-slate-200">
              {copy.settingsLanguage}
            </p>
            <GuestLanguageSelect
              value={idioma}
              onChange={setIdioma}
              disabled={guardando}
              searchPlaceholder={copy.languageSearch}
              label={copy.settingsLanguage}
            />
          </div>

          {mensajeExito && (
            <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
              {mensajeExito}
            </p>
          )}

          {error && (
            <p
              role="alert"
              className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200"
            >
              {error}
            </p>
          )}

          <div className="flex gap-2 pt-1">
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
      </div>
    </>
  )
}
