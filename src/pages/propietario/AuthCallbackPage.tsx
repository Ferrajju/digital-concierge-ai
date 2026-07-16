import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { EmailOtpType } from '@supabase/supabase-js'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import HostFeedback from '../../components/ui/HostFeedback'
import { BRAND_NAME, BRAND_TAGLINE } from '../../config/brand'
import { supabase } from '../../services/supabaseClient'

type CallbackStatus = 'loading' | 'success' | 'error'

function decodeAuthMessage(value: string): string {
  try {
    return decodeURIComponent(value.replace(/\+/g, ' '))
  } catch {
    return value
  }
}

function isEmailOtpType(value: string): value is EmailOtpType {
  return (
    value === 'signup' ||
    value === 'invite' ||
    value === 'magiclink' ||
    value === 'recovery' ||
    value === 'email_change' ||
    value === 'email'
  )
}

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const [status, setStatus] = useState<CallbackStatus>('loading')
  const [message, setMessage] = useState('')
  const [hasSession, setHasSession] = useState(false)

  useEffect(() => {
    let cancelled = false

    const finish = (next: CallbackStatus, msg = '', session = false) => {
      if (cancelled) return
      setStatus(next)
      setMessage(msg)
      setHasSession(session)
    }

    const run = async () => {
      const query = new URLSearchParams(window.location.search)
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''))

      const authError =
        query.get('error_description') ||
        query.get('error') ||
        hash.get('error_description') ||
        hash.get('error')

      if (authError) {
        finish('error', decodeAuthMessage(authError))
        return
      }

      const code = query.get('code')
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          finish('error', error.message)
          return
        }
      }

      const tokenHash = query.get('token_hash')
      const type = query.get('type')
      if (tokenHash && type && isEmailOtpType(type)) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type,
        })
        if (error) {
          finish('error', error.message)
          return
        }
      }

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError) {
        finish('error', sessionError.message)
        return
      }

      if (session) {
        finish('success', '', true)
        return
      }

      finish(
        'success',
        'Tu email ha quedado confirmado. Ya puedes iniciar sesión en Umbral.',
      )
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [])

  const continuar = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      navigate('/auth')
      return
    }

    const { data: propietario } = await supabase
      .from('propietarios')
      .select('onboarding_completed')
      .eq('id', user.id)
      .maybeSingle()

    if (!propietario) {
      await supabase.from('propietarios').insert({
        id: user.id,
        email: user.email ?? '',
        onboarding_completed: false,
      })
      navigate('/onboarding')
      return
    }

    navigate(propietario.onboarding_completed ? '/dashboard' : '/onboarding')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-host-bg px-6 py-12">
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="mb-8 text-center">
          <div
            className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-host-primary text-lg font-bold text-white shadow-sm"
            aria-hidden
          >
            U
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-host-text">
            {BRAND_NAME}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-host-muted">
            {BRAND_TAGLINE}
          </p>
        </div>

        <Card padding="lg" className="text-center">
          {status === 'loading' && (
            <>
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-[3px] border-teal-100 border-t-host-primary" />
              <h2 className="font-display text-lg font-semibold text-host-text">
                Confirmando tu email...
              </h2>
              <p className="mt-2 text-sm text-host-muted">
                Un momento, estamos validando el enlace.
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-2xl">
                ✓
              </div>
              <h2 className="font-display text-lg font-semibold text-host-text">
                ¡Email confirmado!
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-host-muted">
                {message ||
                  (hasSession
                    ? 'Tu cuenta está lista. Continúa para configurar Umbral.'
                    : 'Tu cuenta está verificada. Inicia sesión cuando quieras.')}
              </p>
              <div className="mt-6 flex flex-col gap-3">
                {hasSession ? (
                  <Button type="button" fullWidth size="lg" onClick={continuar}>
                    Continuar
                  </Button>
                ) : (
                  <Button type="button" fullWidth size="lg" to="/auth">
                    Ir a iniciar sesión
                  </Button>
                )}
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <HostFeedback className="mb-4 text-left">
                {message ||
                  'No pudimos confirmar el enlace. Puede que haya expirado.'}
              </HostFeedback>
              <p className="text-sm leading-relaxed text-host-muted">
                Vuelve a registrarte o solicita un nuevo email de confirmación
                desde iniciar sesión.
              </p>
              <div className="mt-6">
                <Button type="button" fullWidth size="lg" to="/auth">
                  Volver a iniciar sesión
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
