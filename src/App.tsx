import { BrowserRouter, Routes, Route } from 'react-router-dom'
import WelcomePage from './pages/huesped/WelcomePage'
import AuthPage from './pages/propietario/AuthPage'
import DashboardPage from './pages/propietario/DashboardPage'
import OnboardingPage from './pages/propietario/OnboardingPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/welcome" element={<WelcomePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
