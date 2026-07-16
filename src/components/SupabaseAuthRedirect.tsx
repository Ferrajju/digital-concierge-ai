import { Navigate, useLocation } from 'react-router-dom'

/**
 * Supabase suele redirigir al Site URL con #access_token=... en la raíz.
 * Sin esto, / redirige a /dashboard y se pierde la confirmación de email.
 */
export default function RootRedirect() {
  const location = useLocation()
  const query = new URLSearchParams(location.search)
  const hash = location.hash

  const hasAuthCallback =
    hash.includes('access_token=') ||
    hash.includes('error=') ||
    hash.includes('error_description=') ||
    query.has('code') ||
    query.has('token_hash') ||
    query.has('error')

  if (hasAuthCallback) {
    return (
      <Navigate
        to={`/auth/callback${location.search}${location.hash}`}
        replace
      />
    )
  }

  return <Navigate to="/dashboard" replace />
}
