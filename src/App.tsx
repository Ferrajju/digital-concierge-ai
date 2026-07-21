import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import PropietarioAppLayout from './components/layout/PropietarioAppLayout'
import RootRedirect from './components/SupabaseAuthRedirect'
import GuestChatPage from './pages/huesped/GuestChatPage'
import GuestEntryPage from './pages/huesped/GuestEntryPage'
import WelcomePage from './pages/huesped/WelcomePage'
import AuthCallbackPage from './pages/propietario/AuthCallbackPage'
import AuthPage from './pages/propietario/AuthPage'
import ChatsPropiedadPage from './pages/propietario/ChatsPropiedadPage'
import CrearPropiedadPage from './pages/propietario/CrearPropiedadPage'
import DashboardPage from './pages/propietario/DashboardPage'
import GestionarPropiedadPage from './pages/propietario/GestionarPropiedadPage'
import OnboardingPage from './pages/propietario/OnboardingPage'
import ProbarAgentePage from './pages/propietario/ProbarAgentePage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route element={<PropietarioAppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/configurar-vivienda" element={<CrearPropiedadPage />} />
          <Route
            path="/propiedad/:propiedadId/gestionar"
            element={<GestionarPropiedadPage />}
          />
          <Route
            path="/propiedad/:propiedadId/chats"
            element={<ChatsPropiedadPage />}
          />
          <Route
            path="/propiedad/:propiedadId/probar-agente"
            element={<ProbarAgentePage />}
          />
        </Route>
        <Route
          path="/crear-propiedad"
          element={<Navigate to="/configurar-vivienda" replace />}
        />
        <Route path="/guest/:propiedadId" element={<GuestEntryPage />} />
        <Route path="/guest/:propiedadId/chat" element={<GuestChatPage />} />
        <Route path="/welcome" element={<WelcomePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
