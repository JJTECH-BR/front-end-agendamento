import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Home.module.css'

function Home() {
  const navigate = useNavigate()
  const [categoriaAtiva, setCategoriaAtiva] = useState('unhas')

  const especialidades = [
    { id: 1, icone: '💇‍♀️', titulo: 'Cabelos', descricao: 'Cortes, coloração, escova e tratamentos capilares.' },
    { id: 2, icone: '💅', titulo: 'Unhas', descricao: 'Manicure e pedicure com acabamento impecável.' },
    { id: 3, icone: '👁️', titulo: 'Sobrancelhas', descricao: 'Design personalizado que valoriza seu olhar.' },
    { id: 4, icone: '✨', titulo: 'Depilação', descricao: 'Técnicas suaves para uma pele lisinha.' },
  ]

  const categorias = [
    {
      id: 'unhas',
      nome: 'Unhas',
      servicos: [
        { id: 1, icone: '💅', nome: 'Manicure', descricao: 'Manicure completa com esmaltação', duracao: 45, preco: 35.0 },
        { id: 2, icone: '🦶', nome: 'Pedicure', descricao: 'Pedicure completa com esmaltação', duracao: 50, preco: 45.0 },
        { id: 3, icone: '💅', nome: 'Esmaltação em Gel', descricao: 'Esmalte em gel com durabilidade de até 21 dias', duracao: 45, preco: 80.0 },
        { id: 4, icone: '🎨', nome: 'Nail Art', descricao: 'Decoração artística nas unhas', duracao: 30, preco: 50.0 },
        { id: 5, icone: '💅', nome: 'Unha em Gel', descricao: 'Alongamento com gel de alta durabilidade', duracao: 90, preco: 150.0 },
        { id: 6, icone: '💎', nome: 'Unha em Fibra de Vidro', descricao: 'Alongamento com fibra, resultado natural', duracao: 120, preco: 180.0 },
        { id: 7, icone: '🔧', nome: 'Manutenção Gel/Fibra', descricao: 'Manutenção de alongamento', duracao: 60, preco: 120.0 },
        { id: 8, icone: '💅', nome: 'Alongamento de Unhas', descricao: 'Alongamento em gel', duracao: 120, preco: 120.0 },
      ],
    },
    {
      id: 'sobrancelhas',
      nome: 'Sobrancelhas',
      servicos: [
        { id: 1, icone: '👁️', nome: 'Design de Sobrancelhas', descricao: 'Design personalizado com pinça', duracao: 30, preco: 40.0 },
        { id: 2, icone: '👁️', nome: 'Design com Henna', descricao: 'Design + aplicação de henna', duracao: 45, preco: 80.0 },
        { id: 3, icone: '👁️', nome: 'Laminação de Sobrancelhas', descricao: 'Técnica para sobrancelhas alinhadas e volumosas', duracao: 60, preco: 120.0 },
        { id: 4, icone: '✒️', nome: 'Micropigmentação Fio a Fio', descricao: 'Pigmentação semipermanente realista', duracao: 120, preco: 450.0 },
        { id: 5, icone: '👁️', nome: 'Brow Lamination + Design', descricao: 'Combo laminação e design completo', duracao: 75, preco: 150.0 },
      ],
    },
    {
      id: 'depilacao',
      nome: 'Depilação',
      servicos: [
        { id: 1, icone: '💋', nome: 'Depilação Buço', descricao: 'Depilação facial delicada', duracao: 10, preco: 20.0 },
        { id: 2, icone: '🦵', nome: 'Depilação Axilas', descricao: 'Depilação com cera morna', duracao: 15, preco: 30.0 },
        { id: 3, icone: '🦵', nome: 'Depilação Meia Perna', descricao: 'Depilação com cera morna', duracao: 25, preco: 45.0 },
        { id: 4, icone: '🦵', nome: 'Depilação Perna Inteira', descricao: 'Depilação com cera morna', duracao: 45, preco: 80.0 },
        { id: 5, icone: '✨', nome: 'Depilação Virilha Completa', descricao: 'Depilação íntima completa', duracao: 40, preco: 70.0 },
        { id: 6, icone: '🧖‍♀️', nome: 'Depilação Corpo Inteiro', descricao: 'Pacote completo de depilação', duracao: 90, preco: 200.0 },
      ],
    },
    {
      id: 'cabelos',
      nome: 'Cabelos',
      servicos: [
        { id: 1, icone: '✂️', nome: 'Corte Feminino', descricao: 'Corte moderno com lavagem e finalização', duracao: 60, preco: 80.0 },
        { id: 2, icone: '🎨', nome: 'Coloração', descricao: 'Coloração completa com produtos premium', duracao: 120, preco: 180.0 },
        { id: 3, icone: '💧', nome: 'Hidratação Capilar', descricao: 'Tratamento profundo para cabelos danificados', duracao: 45, preco: 60.0 },
      ],
    },
    {
      id: 'estetica',
      nome: 'Estética',
      servicos: [
        { id: 1, icone: '🧖‍♀️', nome: 'Limpeza de Pele', descricao: 'Limpeza facial profunda com extração', duracao: 60, preco: 90.0 },
        { id: 2, icone: '💆‍♀️', nome: 'Massagem Relaxante', descricao: 'Massagem corporal relaxante 60 minutos', duracao: 60, preco: 100.0 },
      ],
    },
  ]

  const categoriaSelecionada = categorias.find(
    (categoria) => categoria.id === categoriaAtiva
  )

  const equipe = [
    { id: 1, nome: 'Juliana Freitas', especialidade: 'Cabelos', descricao: 'Especialista em cortes e coloração.', inicial: 'J' },
    { id: 2, nome: 'Ana Paula', especialidade: 'Unhas', descricao: 'Manicure e pedicure com precisão.', inicial: 'A' },
    { id: 3, nome: 'Carla Silva', especialidade: 'Estética', descricao: 'Sobrancelhas, depilação e bem-estar.', inicial: 'C' },
  ]

  const formatarValor = (valor) =>
    valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  const rolarPara = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className={styles.pagina}>

      {/* NAVBAR */}
      <nav className={styles.navbar}>
        <div className={styles.navLogo} onClick={() => navigate('/')}>
          <div className={styles.logoCirculo}>JJ</div>
          <span>JJTech</span>
        </div>
        <div className={styles.navLinks}>
          <button onClick={() => rolarPara('sobre')}>Sobre</button>
          <button onClick={() => rolarPara('servicos')}>Serviços</button>
          <button onClick={() => rolarPara('equipe')}>Equipe</button>
          <button className={styles.btnCliente} onClick={() => navigate('/login')}>
            Cliente
          </button>
          <button className={styles.btnAdmin} onClick={() => navigate('/admin/login')}>
            Admin
          </button>
          <button className={styles.btnAgendar} onClick={() => navigate('/login')}>
            Agendar
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroImagem}>
          <img
            src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1600&q=80"
            alt="JJTech - Estúdio de beleza"
          />
          <div className={styles.heroOverlay}></div>
        </div>
        <div className={styles.heroConteudo}>
          <span className={styles.heroBadge}>✦ Beleza &amp; Bem-estar</span>
          <h1>Realce sua <span>beleza natural</span></h1>
          <p>Agende seu horário em poucos cliques e receba cuidados especiais de profissionais qualificados.</p>
          <div className={styles.heroBtns}>
            <button className={styles.btnPrimario} onClick={() => navigate('/login')}>
              📅 Agendar Horário
            </button>
            <button className={styles.btnSecundario} onClick={() => rolarPara('servicos')}>
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
              <span className={styles.statLabel}>Clientes Satisfeitas</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNum}>3</span>
              <span className={styles.statLabel}>Especialistas</span>
            </div>
          </div>
        </div>
      </section>

      {/* SOBRE */}
      <section className={styles.sobre} id="sobre">
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>Sobre Nós</span>
            <h2>O Estúdio <span>JJTech</span></h2>
            <p>Um espaço pensado para o seu bem-estar, com profissionais que cuidam de você do início ao fim.</p>
          </div>
          <div className={styles.especialidadesGrid}>
            {especialidades.map((item) => (
              <div key={item.id} className={styles.especialidadeCard}>
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
            <span className={styles.sectionLabel}>Nossos Serviços</span>
            <h2>Serviços <span>Especializados</span></h2>
            <p>Oferecemos uma variedade de serviços de alta qualidade para realçar sua beleza natural.</p>
          </div>
          <div className={styles.servicosTabs}>
            {categorias.map((categoria) => (
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
          <div className={styles.servicosGrid}>
            {categoriaSelecionada.servicos.map((servico) => (
              <div key={servico.id} className={styles.servicoCard}>
                <div className={styles.servicoIcone}>{servico.icone}</div>
                <h3>{servico.nome}</h3>
                <p>{servico.descricao}</p>
                <div className={styles.servicoMeta}>
                  <span>⏱ {servico.duracao} min</span>
                  <strong>{formatarValor(servico.preco)}</strong>
                </div>
                <button className={styles.btnAgendarItem} onClick={() => navigate('/login')}>
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
            <h2>Conheça nossas <span>Especialistas</span></h2>
            <p>Profissionais dedicadas ao seu cuidado e bem-estar</p>
          </div>
          <div className={styles.equipeGrid}>
            {equipe.map((membro) => (
              <div key={membro.id} className={styles.membroCard}>
                <div className={styles.membroFoto}>
                  <div className={styles.membroAvatar}>{membro.inicial}</div>
                  <span className={styles.membroBadge}>{membro.especialidade}</span>
                </div>
                <div className={styles.membroInfo}>
                  <h3>{membro.nome}</h3>
                  <p className={styles.membroEspecialidade}>{membro.especialidade}</p>
                  <p className={styles.membroDescricao}>{membro.descricao}</p>
                  <button className={styles.btnAgendarItem} onClick={() => navigate('/login')}>
                    Agendar com esta profissional
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <div className={styles.container}>
          <h2>Pronta para se sentir incrível?</h2>
          <p>Agende agora e transforme o seu dia</p>
          <button className={styles.btnPrimario} onClick={() => navigate('/login')}>
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
                <span>JJTech</span>
              </div>
              <p>Seu espaço de beleza e bem-estar. Especialistas em cabelos, unhas, sobrancelhas e depilação.</p>
            </div>
            <div className={styles.footerCol}>
              <h4>Navegação</h4>
              <a onClick={() => rolarPara('sobre')}>Sobre</a>
              <a onClick={() => rolarPara('servicos')}>Serviços</a>
              <a onClick={() => rolarPara('equipe')}>Equipe</a>
            </div>
            <div className={styles.footerCol}>
              <h4>Acesso</h4>
              <a onClick={() => navigate('/login')}>Área do Cliente</a>
              <a onClick={() => navigate('/admin/login')}>Área do Admin</a>
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
