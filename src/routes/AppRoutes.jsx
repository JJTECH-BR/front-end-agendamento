import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from '../pages/public/Home'
import NotFound from '../pages/public/NotFound'
import Login from '../pages/auth/Login'
import AdminLogin from '../pages/auth/AdminLogin'
import CadastroAdmin from '../pages/auth/CadastroAdmin'
import Dashboard from '../pages/client/Dashboard'
import Agendar from '../pages/client/Agendar'
import Admin from '../pages/admin/Admin'
import ProtectedRoute from './ProtectedRoute'

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        {/* Rotas diretas para a empresa selecionada neste navegador */}
        <Route path="/login" element={<Login />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/cadastro" element={<CadastroAdmin />} />
        <Route path="/dashboard" element={<ProtectedRoute client><Dashboard /></ProtectedRoute>} />
        <Route path="/agendar" element={<ProtectedRoute client><Agendar /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute admin><Admin /></ProtectedRoute>} />

        {/* Links públicos compartilháveis, identificados pelo slug da empresa */}
        <Route path="/e/:slug" element={<Home />} />
        <Route path="/e/:slug/login" element={<Login />} />
        <Route path="/e/:slug/agendar" element={<ProtectedRoute client><Agendar /></ProtectedRoute>} />
        <Route path="/e/:slug/dashboard" element={<ProtectedRoute client><Dashboard /></ProtectedRoute>} />
        <Route path="/e/:slug/admin/login" element={<AdminLogin />} />
        <Route path="/e/:slug/admin/cadastro" element={<CadastroAdmin />} />
        <Route path="/e/:slug/admin" element={<ProtectedRoute admin><Admin /></ProtectedRoute>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
