import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom'
import Home from '../pages/public/Home'
import NotFound from '../pages/public/NotFound'
import Login from '../pages/auth/Login'
import AdminLogin from '../pages/auth/AdminLogin'
import CadastroAdmin from '../pages/auth/CadastroAdmin'
import Dashboard from '../pages/client/Dashboard'
import Agendar from '../pages/client/Agendar'
import Admin from '../pages/admin/Admin'
import ProtectedRoute from './ProtectedRoute'
import { urlDaEmpresa } from '../services/company'

function EmpresaParaLogin() {
  const { slug } = useParams()
  return <Navigate to={`/e/${slug}/login`} replace />
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        {/* ROTAS DA EMPRESA (compartilhadas pelos admins nas redes) */}
        <Route path="/e/:slug" element={<EmpresaParaLogin />} />
        <Route path="/e/:slug/login" element={<Login />} />
        <Route path="/e/:slug/agendar" element={<ProtectedRoute><Agendar /></ProtectedRoute>} />
        <Route path="/e/:slug/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/e/:slug/admin/login" element={<AdminLogin />} />
        <Route path="/e/:slug/admin/cadastro" element={<CadastroAdmin />} />
        <Route path="/e/:slug/admin" element={<ProtectedRoute admin><Admin /></ProtectedRoute>} />

        {/* REDIRECIONAMENTOS (mantém compatibilidade com links antigos) */}
        <Route path="/login" element={<Navigate to={urlDaEmpresa('', 'login')} replace />} />
        <Route path="/admin/login" element={<Navigate to={urlDaEmpresa('', 'admin/login')} replace />} />
        <Route path="/admin/cadastro" element={<Navigate to={urlDaEmpresa('', 'admin/cadastro')} replace />} />
        <Route path="/dashboard" element={<Navigate to={urlDaEmpresa('', 'dashboard')} replace />} />
        <Route path="/agendar" element={<Navigate to={urlDaEmpresa('', 'agendar')} replace />} />
        <Route path="/admin" element={<Navigate to={urlDaEmpresa('', 'admin')} replace />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
