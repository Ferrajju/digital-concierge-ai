import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import GuestChatPage from './pages/huesped/GuestChatPage'
import WelcomePage from './pages/huesped/WelcomePage'
import AuthPage from './pages/propietario/AuthPage'
import ChatsPropiedadPage from './pages/propietario/ChatsPropiedadPage'
import CrearPropiedadPage from './pages/propietario/CrearPropiedadPage'
import DashboardPage from './pages/propietario/DashboardPage'
import GestionarPropiedadPage from './pages/propietario/GestionarPropiedadPage'
import OnboardingPage from './pages/propietario/OnboardingPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/configurar-vivienda" element={<CrearPropiedadPage />} />
        <Route
          path="/crear-propiedad"
          element={<Navigate to="/configurar-vivienda" replace />}
        />
        <Route path="/guest/:propiedadId" element={<GuestChatPage />} />
        <Route
          path="/propiedad/:propiedadId/gestionar"
          element={<GestionarPropiedadPage />}
        />
        <Route
          path="/propiedad/:propiedadId/chats"
          element={<ChatsPropiedadPage />}
        />
        <Route path="/welcome" element={<WelcomePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
