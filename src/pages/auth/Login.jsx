import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../services/api'
import AuthLayout from './AuthLayout'
import { getSlug, setSlug } from '../../services/company'
import styles from './auth.module.css'

function Login() {
  const { slug: slugDaUrl } = useParams()
  const slug = slugDaUrl || getSlug()
  const navigate = useNavigate()

  useEffect(() => {
    setSlug(slug)
  }, [slug])

  const [aba, setAba] = useState('entrar')

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [nome, setNome] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
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

      localStorage.setItem('token', token)
      localStorage.setItem('usuario', JSON.stringify(usuario))

      if (usuario.role === 'ADMIN') {
        navigate(`/e/${slug}/admin`)
      } else {
        navigate(`/e/${slug}/dashboard`)
      }
    } catch (error) {
      setErro(error.response?.data?.message || 'Email ou senha incorretos')
    } finally {
      setCarregando(false)
    }
  }

  const handleCadastro = async (evento) => {
    evento.preventDefault()

    if (!nome || !email || !senha || !confirmarSenha) {
      setErro('Preencha todos os campos')
      return
    }

    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem')
      return
    }

    if (senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres')
      return
    }

    try {
      setCarregando(true)
      setErro('')

      await api.post('/users', {
        name: nome,
        email: email,
        password: senha,
        confirmPassword: confirmarSenha,
        companyId: slug
      })

      setNome('')
      setEmail('')
      setSenha('')
      setConfirmarSenha('')
      setErro('')
      setAba('entrar')
      alert('Conta criada com sucesso! Faça login para continuar.')
    } catch (error) {
      setErro(error.response?.data?.message || 'Erro ao criar conta. Tente novamente.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <AuthLayout titulo="JJTech" subtitulo="Sistema de Agendamento" eyebrow="Bem-vindo">
      <div className={styles.card}>
        <div className={styles.cardTopo}>
          <span>✦</span>
          <h2>{aba === 'entrar' ? 'Entrar' : 'Criar sua conta'}</h2>
          <p>Entre ou crie sua conta para agendar seus serviços</p>
        </div>

        <div className={styles.toggle}>
          <button
            type="button"
            className={aba === 'entrar' ? styles.toggleAtivo : styles.toggleInativo}
            onClick={() => setAba('entrar')}
          >
            Entrar
          </button>
          <button
            type="button"
            className={aba === 'cadastrar' ? styles.toggleAtivo : styles.toggleInativo}
            onClick={() => setAba('cadastrar')}
          >
            Cadastrar
          </button>
        </div>

        {aba === 'entrar' ? (
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
                  placeholder="Mínimo 6 caracteres"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                />
              </div>
            </div>
            <p className={styles.esqueci}>Esqueci minha senha</p>
            {erro && <p className={styles.erro}>{erro}</p>}
            <button
              type="submit"
              className={styles.botao}
              disabled={carregando}
            >
              {carregando ? 'Aguarde...' : 'Entrar'}
            </button>
          </form>
        ) : (
          <form className={styles.formulario} onSubmit={handleCadastro}>
            <div className={styles.campo}>
              <label>Nome Completo</label>
              <div className={styles.inputWrapper}>
                <span>👤</span>
                <input
                  type="text"
                  placeholder="Seu nome completo"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
              </div>
            </div>
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
            <div className={styles.campo}>
              <label>Confirmar Senha</label>
              <div className={styles.inputWrapper}>
                <span>🔒</span>
                <input
                  type="password"
                  placeholder="Repita sua senha"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                />
              </div>
            </div>
            {erro && <p className={styles.erro}>{erro}</p>}
            <button
              type="submit"
              className={styles.botao}
              disabled={carregando}
            >
              {carregando ? 'Aguarde...' : 'Criar Minha Conta'}
            </button>
          </form>
        )}

        <p className={styles.termos}>
          Ao criar uma conta, você concorda com nossos termos de uso
        </p>
      </div>
    </AuthLayout>
  )
}

export default Login
