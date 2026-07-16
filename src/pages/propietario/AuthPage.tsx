import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import { inputClassName } from '../../components/ui/inputClassName'
import { BRAND_NAME, BRAND_TAGLINE } from '../../config/brand'
import { supabase } from '../../services/supabaseClient'
import { getAuthCallbackUrl } from '../../utils/appUrl'

const MIN_PASSWORD_LENGTH = 6

function mapAuthError(message: string): string {
  const normalized = message.toLowerCase()

  if (normalized.includes('user already registered')) {
    return 'Este email ya está registrado. Prueba a iniciar sesión.'
  }
  if (normalized.includes('invalid login credentials')) {
    return 'Email o contraseña incorrectos.'
  }
  if (normalized.includes('password') && normalized.includes('least')) {
    return `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`
  }
  if (normalized.includes('valid email')) {
    return 'Introduce un email válido.'
  }
  if (normalized.includes('email not confirmed')) {
    return 'Confirma tu email antes de iniciar sesión.'
  }

  return message
}

export default function AuthPage() {
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const redirectByOnboarding = async (userId: string) => {
    const { data: propietario, error: selectError } = await supabase
      .from('propietarios')
      .select('onboarding_completed')
      .eq('id', userId)
      .maybeSingle()

    if (selectError) throw selectError

    if (!propietario) {
      const { error: insertError } = await supabase.from('propietarios').insert({
        id: userId,
        email,
        onboarding_completed: false,
      })

      if (insertError) throw insertError
      navigate('/onboarding')
      return
    }

    navigate(propietario.onboarding_completed ? '/dashboard' : '/onboarding')
  }

  const handleSignUp = async () => {
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: getAuthCallbackUrl(),
      },
    })

    if (signUpError) throw signUpError
    if (!data.user) throw new Error('No se pudo crear la cuenta. Inténtalo de nuevo.')

    if (!data.session) {
      setSuccess(
        'Cuenta creada. Revisa tu email para confirmarla y luego inicia sesión.',
      )
      setIsLogin(true)
      return
    }

    const { error: insertError } = await supabase.from('propietarios').insert({
      id: data.user.id,
      email,
      onboarding_completed: false,
    })

    if (insertError) throw insertError
    navigate('/onboarding')
  }

  const handleSignIn = async () => {
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) throw signInError
    if (!data.user) throw new Error('No se pudo iniciar sesión. Inténtalo de nuevo.')

    await redirectByOnboarding(data.user.id)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const trimmedEmail = email.trim()

    if (!trimmedEmail) {
      setError('Introduce tu email.')
      return
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(
        `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`,
      )
      return
    }

    setLoading(true)

    try {
      if (isLogin) {
        await handleSignIn()
      } else {
        await handleSignUp()
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Ha ocurrido un error inesperado.'
      setError(mapAuthError(message))
    } finally {
      setLoading(false)
    }
  }

  const toggleMode = () => {
    setIsLogin((prev) => !prev)
    setError('')
    setSuccess('')
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
            {BRAND_TAGLINE}.
            {isLogin
              ? ' Accede a tu panel de gestión.'
              : ' Crea tu cuenta y configura tu primer alojamiento.'}
          </p>
        </div>

        <Card padding="lg">
          <h2 className="font-display text-lg font-semibold text-host-text">
            {isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
          </h2>
          <p className="mt-1 text-sm text-host-muted">
            {isLogin
              ? 'Introduce tus credenciales para continuar.'
              : 'Empieza a automatizar la atención a tus huéspedes.'}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-stone-700"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                disabled={loading}
                className={`mt-2 ${inputClassName}`}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-stone-700"
              >
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                disabled={loading}
                className={`mt-2 ${inputClassName}`}
              />
            </div>

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                {success}
              </div>
            )}

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={loading}
              disabled={loading}
            >
              {isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-host-muted">
            {isLogin ? '¿Aún no tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
            <button
              type="button"
              onClick={toggleMode}
              disabled={loading}
              className="font-semibold text-host-primary transition-colors hover:text-teal-800 disabled:opacity-50"
            >
              {isLogin ? 'Crear cuenta' : 'Iniciar sesión'}
            </button>
          </p>
        </Card>
      </div>
    </div>
  )
}
