import LandingPage from './pages/Landing'
import './App.css'
import { Routes, Route } from "react-router-dom"
// import Page from './app/dashboard/page'
import LoginPage from './pages/Login'
import SignupPage from './pages/Register'
import DashboardPage from './pages/Dashboard'

function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      {/* <Route path="/home" element={<Page />} /> */}
      {/* <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<SignupPage />} />
      <Route path="/dashboard" element={<DashboardPage />} /> */}
    </Routes>
  )
}

export default App
