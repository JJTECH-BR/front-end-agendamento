import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../services/api'
import AuthLayout from './AuthLayout'
import { getSlug, setSlug, urlDaEmpresa } from '../../services/company'
import styles from './auth.module.css'

function AdminLogin() {
  const { slug: slugDaUrl } = useParams()
  const slug = slugDaUrl || getSlug()
  const navigate = useNavigate()

  useEffect(() => {
    setSlug(slug)
  }, [slug])

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

  const handleLogin = async (evento) => {
    evento.preventDefault()

    if (!email || !senha) {
      setErro('Preencha o email e a senha')
      return
    }

    try {
      setCarregando(true)
      setErro('')

      const resposta = await api.post('/sessions', {
        email: email,
        password: senha,
        companyId: slug
      })

      const token = resposta.data.token
      const usuario = resposta.data.user

      if (usuario.role !== 'ADMIN') {
        setErro('Acesso restrito a administradores')
        return
      }

      localStorage.setItem('token', token)
      localStorage.setItem('usuario', JSON.stringify(usuario))

      navigate(urlDaEmpresa('admin', slug))
    } catch (error) {
      setErro(
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Não foi possível entrar. Verifique sua conexão e tente novamente.'
      )
    } finally {
      setCarregando(false)
    }
  }

  return (
    <AuthLayout titulo="JJTech" subtitulo="Painel Administrativo" eyebrow="Acesso Profissional">
      <div className={styles.card}>
        <div className={styles.cardTopo}>
          <span>🔐</span>
          <h2>Login Administrativo</h2>
          <p>Acesse o painel com seu email e senha de administrador</p>
        </div>

        <form className={styles.formulario} onSubmit={handleLogin}>
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
                placeholder="Mínimo 8 caracteres"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
            </div>
          </div>

          {erro && <p className={styles.erro}>{erro}</p>}

          <button
            type="submit"
            className={styles.botao}
            disabled={carregando}
          >
            {carregando ? 'Aguarde...' : 'Entrar no painel'}
          </button>
        </form>

        <div className={styles.linkCentro}>
          Ainda não tem uma conta de administrador?{' '}
          <button
            type="button"
            className={styles.linkBtn}
            onClick={() => navigate(urlDaEmpresa('admin/cadastro', slug))}
          >
            Criar conta
          </button>
        </div>

        <p className={styles.termos}>
          Acesso restrito para administradores da JJTech
        </p>
      </div>
    </AuthLayout>
  )
}

export default AdminLogin
