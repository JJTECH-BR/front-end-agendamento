import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../services/api'
import AuthLayout from './AuthLayout'
import { getSlug, setSlug } from '../../services/company'
import styles from './auth.module.css'

function CadastroAdmin() {
  const { slug: slugDaUrl } = useParams()
  const slug = slugDaUrl || getSlug()
  const navigate = useNavigate()

  useEffect(() => {
    setSlug(slug)
  }, [slug])

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [chaveSecreta, setChaveSecreta] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)

  // Chave secreta para proteger o cadastro de admin
  const CHAVE_ADMIN = 'jjtech@admin2026'

  const handleCadastro = async (evento) => {
    evento.preventDefault()

    if (!nome || !email || !senha || !confirmarSenha || !chaveSecreta) {
      setErro('Preencha todos os campos')
      return
    }

    if (chaveSecreta !== CHAVE_ADMIN) {
      setErro('Chave secreta incorreta')
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
        companyId: slug,
        role: 'ADMIN',
        adminKey: chaveSecreta
      })

      setSucesso(true)

    } catch (error) {
      setErro(error.response?.data?.error || error.response?.data?.message || 'Erro ao criar admin. Tente novamente.')
    } finally {
      setCarregando(false)
    }
  }

  if (sucesso) {
    return (
      <AuthLayout titulo="JJTech" subtitulo="Cadastro de Administrador" eyebrow="Conta criada">
        <div className={styles.card}>
          <div className={styles.sucesso}>
            <span className={styles.sucessoIcone}>✅</span>
            <h2>Admin criado com sucesso!</h2>
            <p>Agora você pode fazer login com as credenciais cadastradas.</p>
            <button
              type="button"
              className={styles.botao}
              onClick={() => navigate(`/e/${slug}/admin/login`)}
            >
              Ir para o Login
            </button>
          </div>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout titulo="JJTech" subtitulo="Cadastro de Administrador" eyebrow="Área restrita">
      <div className={styles.card}>
        <div className={styles.cardTopo}>
          <span>🔐</span>
          <h2>Criar Conta Admin</h2>
          <p>Preencha os dados para criar uma conta de administrador</p>
        </div>

        <form className={styles.formulario} onSubmit={handleCadastro}>
          <div className={styles.campo}>
            <label>Nome Completo</label>
            <div className={styles.inputWrapper}>
              <span>👤</span>
              <input
                type="text"
                placeholder="Nome do administrador"
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

          <div className={styles.campo}>
            <label>Chave Secreta</label>
            <div className={styles.inputWrapper}>
              <span>🗝️</span>
              <input
                type="password"
                placeholder="Chave de acesso admin"
                value={chaveSecreta}
                onChange={(e) => setChaveSecreta(e.target.value)}
              />
            </div>
            <p className={styles.dica}>
              ⚠️ Solicite a chave secreta ao responsável pelo sistema
            </p>
          </div>

          {erro && <p className={styles.erro}>{erro}</p>}

          <button
            type="submit"
            className={styles.botao}
            disabled={carregando}
          >
            {carregando ? 'Criando conta...' : 'Criar Conta Admin'}
          </button>
        </form>

        <div className={styles.linkCentro}>
          Já possui uma conta?{' '}
          <button
            type="button"
            className={styles.linkBtn}
            onClick={() => navigate(`/e/${slug}/admin/login`)}
          >
            Fazer login
          </button>
        </div>
      </div>
    </AuthLayout>
  )
}

export default CadastroAdmin
