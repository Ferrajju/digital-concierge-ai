import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import WelcomePage from './pages/huesped/WelcomePage'
import AuthPage from './pages/propietario/AuthPage'
import CrearPropiedadPage from './pages/propietario/CrearPropiedadPage'
import DashboardPage from './pages/propietario/DashboardPage'
import OnboardingPage from './pages/propietario/OnboardingPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/configurar-vivienda" element={<CrearPropiedadPage />} />
        <Route path="/crear-propiedad" element={<Navigate to="/configurar-vivienda" replace />} />
        <Route path="/welcome" element={<WelcomePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
