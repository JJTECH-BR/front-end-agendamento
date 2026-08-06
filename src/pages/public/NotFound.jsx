import { useNavigate } from 'react-router-dom'
import styles from './NotFound.module.css'

function NotFound() {
  const navigate = useNavigate()

  return (
    <div className={styles.pagina}>
      <div className={styles.card}>
        <span className={styles.eyebrow}>Erro 404</span>
        <h1 className={styles.titulo}>Página não encontrada</h1>
        <p className={styles.descricao}>
          O endereço que você tentou acessar não existe ou foi movido.
        </p>
        <button className={styles.botao} onClick={() => navigate('/')}>
          ← Voltar para o início
        </button>
      </div>
    </div>
  )
}

export default NotFound
