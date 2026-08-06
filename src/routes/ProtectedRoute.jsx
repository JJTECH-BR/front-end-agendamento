import { Navigate } from 'react-router-dom'
import { getSlug } from '../services/company'

function ProtectedRoute({ children, admin = false }) {
  const token = localStorage.getItem('token')
  const slug = getSlug()

  let usuario = null
  try {
    usuario = JSON.parse(localStorage.getItem('usuario') || 'null')
  } catch {
    usuario = null
  }

  if (!token) {
    return <Navigate to={`/e/${slug}/${admin ? 'admin/login' : 'login'}`} replace />
  }

  if (admin && usuario?.role !== 'ADMIN') {
    return <Navigate to={`/e/${slug}/admin/login`} replace />
  }

  return children
}

export default ProtectedRoute
