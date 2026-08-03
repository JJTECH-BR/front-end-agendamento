import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import styles from './Login.module.css'

function Login() {
  const [aba, setAba] = useState('entrar')

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [nome, setNome] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
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
        navigate('/dashboard')
      }

    } catch (error) {
      setErro('Email ou senha incorretos')
    } finally {
      setCarregando(false)
    }
  }

  const handleCadastro = async () => {
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
        companyId: 'studio-jj-tech-001'
      })

      setNome('')
      setEmail('')
      setSenha('')
      setConfirmarSenha('')
      setErro('')
      setAba('entrar')
      alert('Conta criada com sucesso! Faça login para continuar.')

    } catch (error) {
      if (error.response?.data?.message) {
        setErro(error.response.data.message)
      } else {
        setErro('Erro ao criar conta. Tente novamente.')
      }
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className={styles.pagina}>
      <div className={styles.topo}>
        <span className={styles.voltar} onClick={() => navigate('/')}>← Voltar</span>
        <button
          type="button"
          className={styles.acessoProfissional}
          onClick={() => navigate('/admin/login')}
        >
          Acesso Profissional →
        </button>
      </div>

      <div className={styles.conteudo}>
        <div className={styles.logoArea}>
          <div className={styles.logoCirculo}>JJ</div>
          <h1 className={styles.titulo}>Studio JJ Tech</h1>
          <p className={styles.subtitulo}>Sistema de Agendamento</p>
        </div>

        <div className={styles.card}>
          <div className={styles.cardTopo}>
            <span>✦</span>
            <h2>Bem-vindo</h2>
            <p>Entre ou crie sua conta para agendar seus serviços</p>
          </div>

          <div className={styles.toggle}>
            <button
              className={aba === 'entrar' ? styles.toggleAtivo : styles.toggleInativo}
              onClick={() => setAba('entrar')}
            >
              Entrar
            </button>
            <button
              className={aba === 'cadastrar' ? styles.toggleAtivo : styles.toggleInativo}
              onClick={() => setAba('cadastrar')}
            >
              Cadastrar
            </button>
          </div>

          {aba === 'entrar' ? (
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
              <p className={styles.esqueci}>Esqueci minha senha</p>
              {erro && <p className={styles.erro}>{erro}</p>}
              <button
                className={styles.botao}
                onClick={handleLogin}
                disabled={carregando}
              >
                {carregando ? 'Aguarde...' : 'Entrar'}
              </button>
            </div>
          ) : (
            <div className={styles.formulario}>
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
                className={styles.botao}
                onClick={handleCadastro}
                disabled={carregando}
              >
                {carregando ? 'Aguarde...' : 'Criar Minha Conta'}
              </button>
            </div>
          )}

          <p className={styles.termos}>
            Ao criar uma conta, você concorda com nossos termos de uso
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login