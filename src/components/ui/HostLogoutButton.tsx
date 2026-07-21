import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from './Button'
import { IconLogout } from './icons'
import { cerrarSesionPropietario } from '../../services/authService'

export default function HostLogoutButton() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    try {
      await cerrarSesionPropietario()
      navigate('/auth')
    } catch {
      setLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      loading={loading}
      disabled={loading}
      onClick={handleLogout}
    >
      <IconLogout className="h-4 w-4" />
      <span className="hidden sm:inline">Cerrar sesión</span>
    </Button>
  )
}
