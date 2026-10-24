import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../services/api'
import { getSlug, setSlug, urlDaEmpresa } from '../../services/company'
import styles from './Home.module.css'

function Home() {
  const navigate = useNavigate()
  const { slug: slugDaUrl } = useParams()
  const slug = slugDaUrl || getSlug()
  const [categoriaAtiva, setCategoriaAtiva] = useState('')
  const [empresa, setEmpresa] = useState(null)
  const [erroEmpresa, setErroEmpresa] = useState('')
  const [usuario, setUsuario] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('usuario') || 'null')
    } catch {
      return null
    }
  })
  const conteudo = empresa?.pageContent || {}

  useEffect(() => {
    if (slugDaUrl) setSlug(slugDaUrl)
    api.get(`/public/companies/${encodeURIComponent(slug)}`)
      .then(({ data }) => {
        setEmpresa(data)
        setErroEmpresa('')
      })
      .catch((requestError) => {
        setErroEmpresa(requestError.response?.data?.error || 'Não foi possível carregar os dados desta empresa.')
      })
  }, [slug, slugDaUrl])

  const categoriasExibidas = useMemo(() => {
    const grupos = new Map()
    for (const service of empresa?.services || []) {
      const nome = service.professional?.specialty || 'Outros serviços'
      if (!grupos.has(nome)) grupos.set(nome, [])
      grupos.get(nome).push({
        id: service.id,
        icone: '✦',
        nome: service.name,
        descricao: service.description || 'Agende este serviço com nossa equipe.',
        duracao: service.duration,
        preco: Number(service.price),
      })
    }
    return [...grupos].map(([nome, servicos]) => ({ id: nome, nome, servicos }))
  }, [empresa])
  const categoriaSelecionada = categoriasExibidas.find(
    (categoria) => categoria.id === categoriaAtiva,
  ) || categoriasExibidas[0]
  const equipeExibida = empresa
    ? empresa.users.map((professional) => ({
      id: professional.id,
      nome: professional.name,
      especialidade: professional.specialty || 'Profissional',
      descricao: professional.biography || 'Agende seu atendimento com esta profissional.',
      inicial: professional.name.charAt(0).toUpperCase(),
      foto: professional.profilePhoto,
      instagram: professional.instagram,
    }))
    : []
  const beneficios = [
    { icone: '♡', titulo: 'Atendimento Humanizado', descricao: 'Cada cliente é única. Oferecemos um atendimento personalizado e acolhedor.' },
    { icone: '♙', titulo: 'Profissionais Certificadas', descricao: 'Nossa equipe possui formação e está sempre se atualizando.' },
    { icone: '◷', titulo: 'Pontualidade', descricao: 'Respeitamos seu tempo. Agendamentos precisos e sem atrasos.' },
    { icone: '✧', titulo: 'Produtos Premium', descricao: 'Utilizamos produtos de alta qualidade e marcas reconhecidas.' },
  ]

  const formatarValor = (valor) =>
    valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  const rolarPara = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const irParaAgendamento = () => {
    if (usuario?.role === 'CLIENT') {
      navigate(urlDaEmpresa('agendar', slug))
      return
    }
    navigate(urlDaEmpresa('login', slug), {
      state: { redirectTo: urlDaEmpresa('agendar', slug) },
    })
  }

  const sair = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    setUsuario(null)
    navigate(urlDaEmpresa('', slug))
  }

  const tituloHero = empresa?.heroTitle || 'Realce sua beleza natural'
  const palavrasTitulo = tituloHero.trim().split(/\s+/)
  const tituloDestaque = palavrasTitulo.length > 1 ? palavrasTitulo.slice(-2).join(' ') : ''
  const tituloPrincipal = tituloDestaque ? palavrasTitulo.slice(0, -2).join(' ') : tituloHero

  return (
    <div className={styles.pagina}>

      {/* NAVBAR */}
      <nav className={styles.navbar}>
        <div className={styles.navLogo} onClick={() => navigate(slugDaUrl ? urlDaEmpresa('', slug) : '/')}>
          <div className={styles.logoCirculo}>JJ</div>
          <span>{empresa?.name || 'JJTech'}</span>
        </div>
        <div className={styles.navLinks}>
          <button onClick={() => rolarPara('sobre')}>Sobre</button>
          <button onClick={() => rolarPara('servicos')}>Serviços</button>
          <button onClick={() => rolarPara('equipe')}>Equipe</button>
          {usuario?.role === 'ADMIN' ? (
            <>
              <button className={styles.btnAdmin} onClick={() => navigate(urlDaEmpresa('admin', slug))}>Admin</button>
              <button className={styles.btnCliente} onClick={() => navigate(urlDaEmpresa('admin', slug), { state: { tab: 'agendamentos' } })}>Meus Agendamentos</button>
              <button onClick={() => navigate(urlDaEmpresa('admin', slug), { state: { tab: 'configuracoes' } })}>Alterar Senha</button>
              <button onClick={sair}>Sair</button>
            </>
          ) : usuario?.role === 'CLIENT' ? (
            <>
              <button className={styles.btnCliente} onClick={() => navigate(urlDaEmpresa('dashboard', slug))}>Meus Agendamentos</button>
              <button onClick={sair}>Sair</button>
            </>
          ) : (
            <>
              <button className={styles.btnAdmin} onClick={() => navigate(urlDaEmpresa('admin/login', slug))}>Admin</button>
              <button className={styles.btnCliente} onClick={() => navigate(urlDaEmpresa('login', slug))}>Entrar</button>
            </>
          )}
          <button className={styles.btnAgendar} onClick={irParaAgendamento}>Agendar Horário</button>
        </div>
      </nav>

      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroImagem}>
          <img
            src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1600&q=80"
            alt={empresa?.name ? `Ambiente do ${empresa.name}` : 'Estúdio de beleza'}
          />
          <div className={styles.heroOverlay}></div>
        </div>
        <div className={styles.heroConteudo}>
          <span className={styles.heroBadge}>✦ Beleza &amp; Bem-estar</span>
          <h1>{tituloPrincipal}{tituloDestaque && <> <span>{tituloDestaque}</span></>}</h1>
          <p>{empresa?.heroDescription || empresa?.description || 'Agende seu horário em poucos cliques e receba cuidados especiais de profissionais qualificados.'}</p>
          <div className={styles.heroBtns}>
            <button className={styles.btnPrimario} onClick={irParaAgendamento}>
              📅 Agendar Horário
            </button>
            <button className={styles.btnSecundario} onClick={() => rolarPara('servicos')}>
              Ver Serviços
            </button>
          </div>
          {empresa && (
            <div className={styles.heroStats}>
              <div className={styles.stat}>
                <span className={styles.statNum}>{empresa.services.length}</span>
                <span className={styles.statLabel}>Serviços disponíveis</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNum}>{empresa.users.length}</span>
                <span className={styles.statLabel}>Profissionais ativos</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* SOBRE */}
      <section className={styles.sobre} id="sobre">
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>{conteudo.sobre?.eyebrow || 'Sobre Nós'}</span>
            <h2>{conteudo.sobre?.title || 'O Studio'} <span>{conteudo.sobre?.subtitle || empresa?.name || 'JJTech'}</span></h2>
            <p>{conteudo.sobre?.description || empresa?.description || empresa?.heroDescription || 'Um espaço pensado para o seu bem-estar, com profissionais que cuidam de você do início ao fim.'}</p>
          </div>
          <div className={styles.especialidadesGrid}>
            {beneficios.map((item) => (
              <div key={item.titulo} className={styles.especialidadeCard}>
                <div className={styles.especialidadeIcone}>{item.icone}</div>
                <h3>{item.titulo}</h3>
                <p>{item.descricao}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVIÇOS */}
      <section className={styles.servicos} id="servicos">
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>{conteudo.servicos?.eyebrow || 'Nossos Serviços'}</span>
            <h2>{conteudo.servicos?.title || 'Serviços'} <span>{conteudo.servicos?.subtitle || 'Especializados'}</span></h2>
            <p>{conteudo.servicos?.description || 'Oferecemos uma variedade de serviços de alta qualidade para realçar sua beleza natural.'}</p>
          </div>
          {erroEmpresa && <p role="alert">{erroEmpresa}</p>}
          {!empresa && !erroEmpresa ? <p role="status">Carregando serviços da empresa...</p> : null}
          <div className={styles.servicosTabs}>
            {categoriasExibidas.map((categoria) => (
              <button
                key={categoria.id}
                type="button"
                className={
                  categoriaAtiva === categoria.id
                    ? styles.servTabAtivo
                    : styles.servTab
                }
                onClick={() => setCategoriaAtiva(categoria.id)}
              >
                {categoria.nome}
              </button>
            ))}
          </div>
          {empresa && categoriasExibidas.length === 0 && (
            <p role="status" className={styles.emptyCatalog}>Os serviços estarão disponíveis em breve.</p>
          )}
          <div className={styles.servicosGrid}>
            {categoriaSelecionada?.servicos.map((servico) => (
              <div key={servico.id} className={styles.servicoCard}>
                <div className={styles.servicoIcone} aria-hidden="true">{servico.icone}</div>
                <h3>{servico.nome}</h3>
                <p>{servico.descricao}</p>
                <div className={styles.servicoMeta}>
                  <span>⏱ {servico.duracao} min</span>
                  <strong>{formatarValor(servico.preco)}</strong>
                </div>
                <button className={styles.btnAgendarItem} onClick={irParaAgendamento}>
                  Agendar
                </button>
              </div>
            ))}
          </div>
          {categoriasExibidas.length > 0 && (
            <div className={styles.sectionCta}>
              <button className={styles.btnPrimario} onClick={irParaAgendamento}>Agendar um Serviço</button>
            </div>
          )}
        </div>
      </section>

      {/* EQUIPE */}
      <section className={styles.equipe} id="equipe">
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>{conteudo.equipe?.eyebrow || 'Nossa Equipe'}</span>
            <h2>{conteudo.equipe?.title || 'Conheça nossas'} <span>{conteudo.equipe?.subtitle || 'Especialistas'}</span></h2>
            <p>{conteudo.equipe?.description || 'Profissionais dedicadas ao seu cuidado e bem-estar'}</p>
          </div>
          <div className={styles.equipeGrid}>
            {empresa && equipeExibida.length === 0 && (
              <p role="status">Nenhum profissional ativo cadastrado.</p>
            )}
            {equipeExibida.map((membro) => (
              <div key={membro.id} className={styles.membroCard}>
                <div className={styles.membroFoto}>
                  {membro.foto ? (
                    <img className={styles.membroAvatarImage} src={membro.foto} alt={`Foto de ${membro.nome}`} />
                  ) : (
                    <div className={styles.membroAvatar}>{membro.inicial}</div>
                  )}
                  <span className={styles.membroBadge}>{membro.especialidade}</span>
                </div>
                <div className={styles.membroInfo}>
                  <h3>{membro.nome}</h3>
                  <p className={styles.membroEspecialidade}>{membro.especialidade}</p>
                  <p className={styles.membroDescricao}>{membro.descricao}</p>
                  {membro.instagram && (
                    <a
                      className={styles.membroInstagram}
                      href={`https://www.instagram.com/${encodeURIComponent(membro.instagram.replace(/^@/, ''))}/`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      @{membro.instagram.replace(/^@/, '')}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
          {equipeExibida.length > 0 && (
            <div className={styles.sectionCta}>
              <button className={styles.btnPrimario} onClick={irParaAgendamento}>Agendar com Nossas Especialistas</button>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <div className={styles.container}>
          <h2>Pronta para se sentir incrível?</h2>
          <p>Agende agora e transforme o seu dia</p>
          <button className={styles.btnPrimario} onClick={irParaAgendamento}>
            📅 Agendar Horário
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerGrid}>
            <div className={styles.footerBrand}>
              <div className={styles.footerLogo}>
                <div className={styles.logoCirculo}>JJ</div>
                <span>{empresa?.name || 'JJTech'}</span>
              </div>
              <p>{conteudo.rodape?.description || empresa?.description || 'Seu espaço de beleza e bem-estar. Especialistas em cabelos, unhas, sobrancelhas e depilação.'}</p>
            </div>
            <div className={styles.footerCol}>
              <h4>Contato</h4>
              {empresa?.phone && <a href={`tel:${empresa.phone.replace(/[^\d+]/g, '')}`}>{empresa.phone}</a>}
              {empresa?.address && <p>{empresa.address}</p>}
              {empresa?.instagramUrl && <a href={empresa.instagramUrl} target="_blank" rel="noreferrer">{empresa.instagram || 'Instagram'}</a>}
            </div>
            <div className={styles.footerCol}>
              <h4>Horário de funcionamento</h4>
              {conteudo.rodape?.weekdayHours && <p>Segunda a sexta: {conteudo.rodape.weekdayHours}</p>}
              {conteudo.rodape?.saturdayHours && <p>Sábado: {conteudo.rodape.saturdayHours}</p>}
              {conteudo.rodape?.sundayHours && <p>Domingo: {conteudo.rodape.sundayHours}</p>}
              {!conteudo.rodape?.weekdayHours && empresa && <p>Atendimento: {empresa.openingTime} às {empresa.closingTime}</p>}
            </div>
            <div className={styles.footerCol}>
              <h4>Navegação</h4>
              <a onClick={() => rolarPara('sobre')}>Sobre</a>
              <a onClick={() => rolarPara('servicos')}>Serviços</a>
              <a onClick={() => rolarPara('equipe')}>Equipe</a>
              <a onClick={() => navigate(urlDaEmpresa('login', slug))}>Área do Cliente</a>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <p>© 2026 JJTech. Todos os direitos reservados.</p>
            <p>Desenvolvido pela JJTech</p>
          </div>
        </div>
      </footer>

    </div>
  )
}

export default Home
