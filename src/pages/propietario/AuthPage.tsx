import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../services/supabaseClient'

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

    navigate(propietario.onboarding_completed ? '/' : '/onboarding')
  }

  const handleSignUp = async () => {
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-6 py-12 text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-violet-600/15 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md animate-fade-in-up">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold shadow-lg shadow-indigo-500/30">
            DC
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Digital Concierge AI
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            {isLogin
              ? 'Accede a tu panel y gestiona la experiencia de tus huéspedes.'
              : 'Crea tu cuenta y configura tu asistente inteligente en minutos.'}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-sm sm:p-8">
          <h2 className="text-lg font-semibold text-white">
            {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {isLogin
              ? 'Introduce tus credenciales para continuar.'
              : 'Empieza tu viaje como propietario.'}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-300"
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
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3.5 text-white placeholder:text-slate-600 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-50"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-300"
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
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3.5 text-white placeholder:text-slate-600 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-50"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:from-indigo-400 hover:to-violet-500 hover:shadow-indigo-500/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Cargando...
                </>
              ) : isLogin ? (
                'Iniciar Sesión'
              ) : (
                'Crear Cuenta'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            {isLogin ? '¿Aún no tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
            <button
              type="button"
              onClick={toggleMode}
              disabled={loading}
              className="font-medium text-indigo-400 transition-colors hover:text-indigo-300 disabled:opacity-50"
            >
              {isLogin ? 'Crear Cuenta' : 'Iniciar Sesión'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
