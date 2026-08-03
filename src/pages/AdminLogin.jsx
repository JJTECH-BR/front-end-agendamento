import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import styles from './Login.module.css'

function AdminLogin() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

  const navigate = useNavigate()

  const handleLogin = async () => {
    if (!email || !senha) {
      setErro('Preencha o email e a senha')
      return
    }

    try {
      setCarregando(true)
      setErro('')

      const resposta = await api.post('/sessions', {
        email: email,
        password: senha
      })

      const token = resposta.data.token
      const usuario = resposta.data.user

      localStorage.setItem('token', token)
      localStorage.setItem('usuario', JSON.stringify(usuario))

      if (usuario.role === 'ADMIN') {
        navigate('/admin')
      } else {
        setErro('Acesso restrito a administradores')
      }
    } catch (error) {
      setErro('Email ou senha incorretos')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className={styles.pagina}>
      <div className={styles.topo}>
        <span className={styles.voltar} onClick={() => navigate('/login')}>← Voltar para o cliente</span>
      </div>

      <div className={styles.conteudo}>
        <div className={styles.logoArea}>
          <div className={styles.logoCirculo}>JJ</div>
          <h1 className={styles.titulo}>Studio JJ Tech</h1>
          <p className={styles.subtitulo}>Painel Administrativo</p>
        </div>

        <div className={styles.card}>
          <div className={styles.cardTopo}>
            <span>🔐</span>
            <h2>Login Administrativo</h2>
            <p>Acesse o painel com seu email e senha de administrador</p>
          </div>

          <div className={styles.formulario}>
            <div className={styles.campo}>
              <label>Email</label>
              <div className={styles.inputWrapper}>
                <span>✉</span>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.campo}>
              <label>Senha</label>
              <div className={styles.inputWrapper}>
                <span>🔒</span>
                <input
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                />
              </div>
            </div>

            {erro && <p className={styles.erro}>{erro}</p>}

            <button
              className={styles.botao}
              onClick={handleLogin}
              disabled={carregando}
            >
              {carregando ? 'Aguarde...' : 'Entrar no painel'}
            </button>
          </div>

          <p className={styles.termos}>
            Acesso restrito para administradores do Studio JJ Tech
          </p>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
