import { useNavigate } from 'react-router-dom'
import styles from './Home.module.css'

function Home() {
  const navigate = useNavigate()

  const servicos = [
    { id: 1, nome: 'Corte de Cabelo', descricao: 'Corte moderno com lavagem e finalização', duracao: '60 min', preco: 80.00 },
    { id: 2, nome: 'Coloração', descricao: 'Coloração completa com produtos premium', duracao: '120 min', preco: 150.00 },
    { id: 3, nome: 'Manicure', descricao: 'Cuidados completos para suas unhas', duracao: '45 min', preco: 45.00 },
    { id: 4, nome: 'Pedicure', descricao: 'Tratamento completo para os pés', duracao: '50 min', preco: 50.00 },
    { id: 5, nome: 'Escova', descricao: 'Escova modeladora com brilho intenso', duracao: '60 min', preco: 60.00 },
    { id: 6, nome: 'Sobrancelha', descricao: 'Design e modelagem de sobrancelhas', duracao: '30 min', preco: 35.00 },
  ]

  const equipe = [
    { id: 1, nome: 'Juliana Freitas', especialidade: 'Cabelos', inicial: 'J' },
    { id: 2, nome: 'Ana Paula', especialidade: 'Unhas', inicial: 'A' },
    { id: 3, nome: 'Carla Silva', especialidade: 'Estética', inicial: 'C' },
  ]

  const formatarValor = (valor) =>
    valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <div className={styles.pagina}>

      {/* NAVBAR */}
      <nav className={styles.navbar}>
        <div className={styles.navLogo}>
          <div className={styles.logoCirculo}>JJ</div>
          <span>Studio JJ Tech</span>
        </div>
        <div className={styles.navLinks}>
          <a href="#sobre">Sobre</a>
          <a href="#servicos">Serviços</a>
          <a href="#equipe">Equipe</a>
          <button className={styles.btnCliente} onClick={() => navigate('/login')}>
            Cliente
          </button>
        <button className={styles.btnAdmin} onClick={() => navigate('/admin/login')}>
  Admin
</button>
        </div>
      </nav>

      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroConteudo}>
          <span className={styles.heroBadge}>✦ Tecnologia & Inovação</span>
          <h1>Agende seus serviços<br /><span>com facilidade</span></h1>
          <p>Plataforma moderna de agendamento para estúdios. Escolha seu serviço, profissional e horário em poucos cliques.</p>
          <div className={styles.heroBtns}>
            <button className={styles.btnPrimario} onClick={() => navigate('/login')}>
              📅 Agendar Horário
            </button>
            <button className={styles.btnSecundario} onClick={() => {
              document.getElementById('servicos').scrollIntoView({ behavior: 'smooth' })
            }}>
              Ver Serviços
            </button>
          </div>
          <div className={styles.heroStats}>
            <div className={styles.stat}>
              <span className={styles.statNum}>8+</span>
              <span className={styles.statLabel}>Anos de Experiência</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNum}>1500+</span>
              <span className={styles.statLabel}>Clientes Atendidos</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNum}>100%</span>
              <span className={styles.statLabel}>Satisfação</span>
            </div>
          </div>
        </div>
      </section>

      {/* SOBRE */}
      <section className={styles.sobre} id="sobre">
        <div className={styles.container}>
          <div className={styles.sobreGrid}>
            <div className={styles.sobreTexto}>
              <span className={styles.sectionLabel}>Sobre Nós</span>
              <h2>Transformamos sua experiência de agendamento</h2>
              <p>O Studio JJ Tech é uma plataforma moderna que conecta clientes aos melhores profissionais de beleza e estética. Nossa missão é tornar o agendamento simples, rápido e eficiente.</p>
              <p>Com tecnologia de ponta e uma equipe dedicada, oferecemos a melhor experiência tanto para clientes quanto para profissionais.</p>
              <div className={styles.sobreFeatures}>
                <div className={styles.feature}>
                  <span>⚡</span>
                  <div>
                    <h4>Agendamento Rápido</h4>
                    <p>Agende em menos de 2 minutos</p>
                  </div>
                </div>
                <div className={styles.feature}>
                  <span>🔔</span>
                  <div>
                    <h4>Lembretes Automáticos</h4>
                    <p>Nunca esqueça seu horário</p>
                  </div>
                </div>
                <div className={styles.feature}>
                  <span>💳</span>
                  <div>
                    <h4>Pagamento Facilitado</h4>
                    <p>Diversas formas de pagamento</p>
                  </div>
                </div>
                <div className={styles.feature}>
                  <span>⭐</span>
                  <div>
                    <h4>Avaliações</h4>
                    <p>Profissionais avaliados pelos clientes</p>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.sobreCards}>
              <div className={styles.sobreCard}>
                <span className={styles.sobreCardIcone}>🎯</span>
                <h4>Nossa Missão</h4>
                <p>Democratizar o acesso a serviços de beleza com tecnologia e praticidade.</p>
              </div>
              <div className={styles.sobreCard}>
                <span className={styles.sobreCardIcone}>👁️</span>
                <h4>Nossa Visão</h4>
                <p>Ser a plataforma de agendamento mais confiável do Brasil.</p>
              </div>
              <div className={styles.sobreCard}>
                <span className={styles.sobreCardIcone}>💎</span>
                <h4>Nossos Valores</h4>
                <p>Qualidade, inovação e comprometimento com nossos clientes.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVIÇOS */}
      <section className={styles.servicos} id="servicos">
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>Nossos Serviços</span>
            <h2>Escolha o serviço ideal para você</h2>
            <p>Oferecemos uma variedade de serviços realizados por profissionais experientes</p>
          </div>
          <div className={styles.servicosGrid}>
            {servicos.map(servico => (
              <div key={servico.id} className={styles.servicoCard}>
                <div className={styles.servicoIcone}>✦</div>
                <h3>{servico.nome}</h3>
                <p>{servico.descricao}</p>
                <div className={styles.servicoRodape}>
                  <span className={styles.servicoDuracao}>⏱ {servico.duracao}</span>
                  <span className={styles.servicoPreco}>{formatarValor(servico.preco)}</span>
                </div>
                <button
                  className={styles.btnAgendar2}
                  onClick={() => navigate('/login')}
                >
                  Agendar
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EQUIPE */}
      <section className={styles.equipe} id="equipe">
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>Nossa Equipe</span>
            <h2>Profissionais especializados</h2>
            <p>Conheça os profissionais que vão cuidar de você</p>
          </div>
          <div className={styles.equipeGrid}>
            {equipe.map(membro => (
              <div key={membro.id} className={styles.membroCard}>
                <div className={styles.membroAvatar}>{membro.inicial}</div>
                <h3>{membro.nome}</h3>
                <p>{membro.especialidade}</p>
                <button
                  className={styles.btnAgendar2}
                  onClick={() => navigate('/login')}
                >
                  Agendar com este profissional
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <div className={styles.container}>
          <h2>Pronto para agendar?</h2>
          <p>Escolha seu serviço e profissional favorito agora mesmo</p>
          <button className={styles.btnPrimario} onClick={() => navigate('/login')}>
            📅 Agendar Agora
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
                <span>Studio JJ Tech</span>
              </div>
              <p>Plataforma moderna de agendamento para estúdios de beleza e estética.</p>
            </div>
            <div className={styles.footerCol}>
              <h4>Links</h4>
              <a href="#sobre">Sobre</a>
              <a href="#servicos">Serviços</a>
              <a href="#equipe">Equipe</a>
            </div>
            <div className={styles.footerCol}>
              <h4>Acesso</h4>
              <a onClick={() => navigate('/login')}>Área do Cliente</a>
              <a>Área do Admin</a>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <p>© 2026 Studio JJ Tech. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

    </div>
  )
}

export default Home