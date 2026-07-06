import { BrowserRouter, Routes, Route } from 'react-router-dom'
import WelcomePage from './pages/huesped/WelcomePage'
import DashboardPage from './pages/propietario/DashboardPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/welcome" element={<WelcomePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
