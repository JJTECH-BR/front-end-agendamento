import { useNavigate } from 'react-router-dom'
import { getSlug } from '../../services/company'
import styles from './auth.module.css'

function AuthLayout({ titulo, subtitulo, eyebrow, children }) {
  const navigate = useNavigate()
  const slug = getSlug()

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
            onClick={() => navigate(`/e/${slug}/login`)}
          >
            Cliente
          </button>
          <button
            type="button"
            className={styles.btnAdmin}
            onClick={() => navigate(`/e/${slug}/admin/login`)}
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
          <span className={styles.empresaBadge}>Empresa: {slug}</span>
        </div>
        {children}
      </div>
    </div>
  )
}

export default AuthLayout
