import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  GUEST_LANGUAGES,
  obtenerIdiomaGuest,
} from '../../config/guestLanguages'

type GuestLanguageSelectProps = {
  id?: string
  value: string
  onChange: (code: string) => void
  disabled?: boolean
  searchPlaceholder: string
  label?: string
  /** inline = lista visible (modales); dropdown = desplegable */
  presentation?: 'dropdown' | 'inline'
}

function LanguageList({
  value,
  filtrados,
  onElegir,
}: {
  value: string
  filtrados: typeof GUEST_LANGUAGES
  onElegir: (code: string) => void
}) {
  return (
    <ul
      role="listbox"
      className="max-h-56 overflow-y-auto py-1 [-ms-overflow-style:none] [scrollbar-width:thin] sm:max-h-64"
    >
      {filtrados.length === 0 ? (
        <li className="px-4 py-3 text-sm text-slate-500">—</li>
      ) : (
        filtrados.map((lang) => {
          const activo = lang.code === value
          return (
            <li key={lang.code} role="option" aria-selected={activo}>
              <button
                type="button"
                onClick={() => onElegir(lang.code)}
                className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm transition-colors ${
                  activo
                    ? 'bg-emerald-500/15 text-emerald-100'
                    : 'text-slate-200 hover:bg-white/5'
                }`}
              >
                <span>
                  <span className="block font-medium">{lang.native}</span>
                  <span className="block text-xs text-slate-500">
                    {lang.label}
                  </span>
                </span>
                {activo && (
                  <span className="text-emerald-400" aria-hidden>
                    ✓
                  </span>
                )}
              </button>
            </li>
          )
        })
      )}
    </ul>
  )
}

export default function GuestLanguageSelect({
  id = 'guest-idioma',
  value,
  onChange,
  disabled = false,
  searchPlaceholder,
  label,
  presentation = 'dropdown',
}: GuestLanguageSelectProps) {
  const [abierto, setAbierto] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [menuPos, setMenuPos] = useState<{
    top: number
    left: number
    width: number
    maxHeight: number
  } | null>(null)
  const botonRef = useRef<HTMLButtonElement>(null)

  const seleccionado = obtenerIdiomaGuest(value)

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    if (!q) return GUEST_LANGUAGES
    return GUEST_LANGUAGES.filter(
      (lang) =>
        lang.code.toLowerCase().includes(q) ||
        lang.label.toLowerCase().includes(q) ||
        lang.native.toLowerCase().includes(q),
    )
  }, [busqueda])

  const elegir = (code: string) => {
    onChange(code)
    setAbierto(false)
    setBusqueda('')
    setMenuPos(null)
  }

  useEffect(() => {
    if (!abierto || presentation === 'inline') return

    const actualizarPos = () => {
      const el = botonRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const espacioAbajo = window.innerHeight - rect.bottom - 16
      const espacioArriba = rect.top - 16
      const abrirArriba = espacioAbajo < 220 && espacioArriba > espacioAbajo
      const maxHeight = Math.min(
        288,
        Math.max(160, abrirArriba ? espacioArriba - 8 : espacioAbajo - 8),
      )
      const top = abrirArriba
        ? rect.top - maxHeight - 8
        : rect.bottom + 8

      setMenuPos({
        top: Math.max(8, top),
        left: rect.left,
        width: rect.width,
        maxHeight,
      })
    }

    actualizarPos()
    window.addEventListener('resize', actualizarPos)
    window.addEventListener('scroll', actualizarPos, true)

    return () => {
      window.removeEventListener('resize', actualizarPos)
      window.removeEventListener('scroll', actualizarPos, true)
    }
  }, [abierto, presentation])

  if (presentation === 'inline') {
    return (
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#202c33]/60">
        {label && (
          <label htmlFor={`${id}-search`} className="sr-only">
            {label}
          </label>
        )}
        <div className="border-b border-white/5 p-3">
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-[#111b21]/80 px-3 py-2">
            <span className="text-lg" aria-hidden>
              🌐
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">
                {seleccionado?.native ?? value}
              </p>
              <p className="truncate text-xs text-slate-500">
                {seleccionado?.label ?? value}
              </p>
            </div>
          </div>
          <input
            id={`${id}-search`}
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder={searchPlaceholder}
            disabled={disabled}
            className="w-full rounded-xl border border-white/10 bg-[#111b21] px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500/50 focus:outline-none disabled:opacity-50"
          />
        </div>
        <LanguageList
          value={value}
          filtrados={filtrados}
          onElegir={(code) => onChange(code)}
        />
      </div>
    )
  }

  const dropdown =
    abierto && menuPos ? (
      <>
        <button
          type="button"
          className="fixed inset-0 z-[200] cursor-default bg-transparent"
          aria-label="Cerrar"
          onClick={() => {
            setAbierto(false)
            setBusqueda('')
            setMenuPos(null)
          }}
        />
        <div
          className="fixed z-[201] overflow-hidden rounded-2xl border border-white/10 bg-[#111b21] shadow-2xl shadow-black/50"
          style={{
            top: menuPos.top,
            left: menuPos.left,
            width: menuPos.width,
            maxHeight: menuPos.maxHeight + 56,
          }}
        >
          <div className="border-b border-white/5 p-3">
            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder={searchPlaceholder}
              autoFocus
              className="w-full rounded-xl border border-white/10 bg-[#202c33] px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500/50 focus:outline-none"
            />
          </div>
          <ul
            role="listbox"
            className="overflow-y-auto py-1 [-ms-overflow-style:none] [scrollbar-width:thin]"
            style={{ maxHeight: menuPos.maxHeight }}
          >
            {filtrados.length === 0 ? (
              <li className="px-4 py-3 text-sm text-slate-500">—</li>
            ) : (
              filtrados.map((lang) => {
                const activo = lang.code === value
                return (
                  <li key={lang.code} role="option" aria-selected={activo}>
                    <button
                      type="button"
                      onClick={() => elegir(lang.code)}
                      className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm transition-colors ${
                        activo
                          ? 'bg-emerald-500/15 text-emerald-100'
                          : 'text-slate-200 hover:bg-white/5'
                      }`}
                    >
                      <span>
                        <span className="block font-medium">{lang.native}</span>
                        <span className="block text-xs text-slate-500">
                          {lang.label}
                        </span>
                      </span>
                      {activo && (
                        <span className="text-emerald-400" aria-hidden>
                          ✓
                        </span>
                      )}
                    </button>
                  </li>
                )
              })
            )}
          </ul>
        </div>
      </>
    ) : null

  return (
    <div className="relative">
      {label && (
        <label htmlFor={id} className="sr-only">
          {label}
        </label>
      )}

      <button
        ref={botonRef}
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => {
          setAbierto((prev) => {
            const next = !prev
            if (!next) setMenuPos(null)
            return next
          })
        }}
        className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-[#202c33]/90 px-4 py-3.5 text-left transition-colors hover:border-emerald-500/30 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50"
        aria-haspopup="listbox"
        aria-expanded={abierto}
      >
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-lg"
          aria-hidden
        >
          🌐
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-base font-semibold text-white">
            {seleccionado?.native ?? value}
          </span>
          <span className="block truncate text-xs text-slate-400">
            {seleccionado?.label ?? value}
          </span>
        </span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${abierto ? 'rotate-180' : ''}`}
          aria-hidden
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {abierto && typeof document !== 'undefined'
        ? createPortal(dropdown, document.body)
        : null}
    </div>
  )
}
