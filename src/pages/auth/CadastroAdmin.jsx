import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../services/api'
import AuthLayout from './AuthLayout'
import { getSlug, setSlug, urlDaEmpresa } from '../../services/company'
import styles from './auth.module.css'

function CadastroAdmin() {
  const { slug: slugDaUrl } = useParams()
  const slug = slugDaUrl || getSlug()
  const navigate = useNavigate()

  const [nomeEmpresa, setNomeEmpresa] = useState('')
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [chaveSecreta, setChaveSecreta] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)
  const [linkPublico, setLinkPublico] = useState('')
  const [slugEmpresa, setSlugEmpresa] = useState('')
  const [linkCopiado, setLinkCopiado] = useState(false)
  const [linkStatus, setLinkStatus] = useState('')

  useEffect(() => {
    setSlug(slug)
  }, [slug])

  const gerarSlugEmpresa = () => nomeEmpresa
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')

  const handleCadastro = async (evento) => {
    evento.preventDefault()

    if (!nome || !email || !senha || !confirmarSenha || !chaveSecreta) {
      setErro('Preencha todos os campos')
      return
    }

    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem')
      return
    }

    if (senha.length < 8) {
      setErro('A senha deve ter pelo menos 8 caracteres')
      return
    }

    try {
      setCarregando(true)
      setErro('')

      const resposta = await api.post('/companies', {
        companyName: nomeEmpresa,
        userName: nome,
        email,
        password: senha,
        adminKey: chaveSecreta,
      })

      const novoSlug = resposta.data?.slug
      if (!novoSlug) {
        throw new Error('A empresa foi criada, mas o servidor não retornou o link público.')
      }

      setSlug(novoSlug)
      setSlugEmpresa(novoSlug)
      setLinkPublico(`${window.location.origin}${urlDaEmpresa('', novoSlug)}`)
      setSucesso(true)

    } catch (error) {
      const mensagemApi = error.response?.data?.error || error.response?.data?.message
      const emailJaCadastrado = /e-mail já está em uso|usuário já existe/i.test(mensagemApi || '')

      if (!error.response || emailJaCadastrado) {
        setSlugEmpresa(gerarSlugEmpresa())
        setErro(emailJaCadastrado
          ? 'Este e-mail já está cadastrado. Se o envio anterior foi interrompido, tente entrar na empresa antes de cadastrar novamente.'
          : 'A conexão foi interrompida antes da confirmação. A empresa pode ter sido criada; tente entrar antes de reenviar o cadastro.')
      } else {
        setErro(mensagemApi || error.message || 'Erro ao criar admin. Tente novamente.')
      }
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
            <div className={styles.linkPublico}>
              <label htmlFor="link-publico">Link público da empresa</label>
              <div>
                <input id="link-publico" value={linkPublico} readOnly />
                <button
                  type="button"
                  className={styles.linkBtn}
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(linkPublico)
                      setLinkCopiado(true)
                      setLinkStatus('Link copiado para a área de transferência.')
                    } catch {
                      setLinkStatus('Não foi possível copiar o link neste navegador.')
                    }
                  }}
                >
                  {linkCopiado ? 'Copiado' : 'Copiar'}
                </button>
              </div>
              {linkStatus && <span role="status">{linkStatus}</span>}
              <a href={linkPublico}>{nomeEmpresa}</a>
            </div>
            <button
              type="button"
              className={styles.botao}
              onClick={() => navigate(urlDaEmpresa('admin/login', slugEmpresa))}
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
            <label>Nome da Empresa</label>
            <div className={styles.inputWrapper}>
              <span>🏢</span>
              <input
                type="text"
                placeholder="Nome da empresa"
                value={nomeEmpresa}
                onChange={(e) => setNomeEmpresa(e.target.value)}
              />
            </div>
          </div>

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
                placeholder="Mínimo 8 caracteres"
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
          {erro && slugEmpresa && (
            <button
              type="button"
              className={styles.linkBtn}
              onClick={() => navigate(urlDaEmpresa('admin/login', slugEmpresa))}
            >
              Ir para o login da empresa
            </button>
          )}

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
            onClick={() => navigate(urlDaEmpresa('admin/login', slug))}
          >
            Fazer login
          </button>
        </div>
      </div>
    </AuthLayout>
  )
}

export default CadastroAdmin
