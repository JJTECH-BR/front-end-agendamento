import { useNavigate, useParams } from 'react-router-dom'
import { getSlug, urlDaEmpresa } from '../../services/company'
import styles from './auth.module.css'

function AuthLayout({ titulo, subtitulo, eyebrow, children }) {
  const navigate = useNavigate()
  const { slug: slugDaUrl } = useParams()
  const slug = slugDaUrl || getSlug()

  return (
    <div className={styles.pagina}>
      <nav className={styles.navbar}>
        <div className={styles.navLogo} onClick={() => navigate('/')}>
          <div className={styles.logoCirculo}>JJ</div>
          <span>JJTech</span>
        </div>
        <div className={styles.navBtns}>
          <button
            type="button"
            className={styles.btnCliente}
            onClick={() => navigate(urlDaEmpresa('login', slug))}
          >
            Cliente
          </button>
          <button
            type="button"
            className={styles.btnAdmin}
            onClick={() => navigate(urlDaEmpresa('admin/login', slug))}
          >
            Admin
          </button>
        </div>
      </nav>

      <div className={styles.conteudo}>
        <div className={styles.logoArea}>
          <div className={styles.logoCirculoGrande}>JJ</div>
          {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
          <h1 className={styles.titulo}>{titulo}</h1>
          <p className={styles.subtitulo}>{subtitulo}</p>
        </div>
        {children}
      </div>
    </div>
  )
}

export default AuthLayout
