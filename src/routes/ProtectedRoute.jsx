import { Navigate, useParams } from 'react-router-dom'
import { getSlug } from '../services/company'

function ProtectedRoute({ children, admin = false, client = false }) {
  const { slug: slugDaUrl } = useParams()
  const slug = slugDaUrl || getSlug()
  const token = localStorage.getItem('token')

  let usuario = null
  try {
    usuario = JSON.parse(localStorage.getItem('usuario') || 'null')
  } catch {
    usuario = null
  }

  if (!token) {
    return <Navigate to={admin ? `/e/${slug}/admin/login` : `/e/${slug}/login`} replace />
  }

  if (admin && usuario?.role !== 'ADMIN') {
    return <Navigate to={`/e/${slug}/admin/login`} replace />
  }

  if (client && usuario?.role !== 'CLIENT') {
    return <Navigate to={usuario?.role === 'ADMIN' ? `/e/${slug}/admin` : `/e/${slug}/login`} replace />
  }

  return children
}

export default ProtectedRoute
