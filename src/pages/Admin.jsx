import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Admin.module.css'

function Admin() {
  const navigate = useNavigate()

  const usuario = JSON.parse(localStorage.getItem('usuario') || '{"name": "Admin"}')

  const [abaAtiva, setAbaAtiva] = useState('dashboard')
  const [servicos, setServicos] = useState([
    { id: 1, nome: 'Corte de Cabelo', duracao: '60 min', preco: 80.00, ativo: true },
    { id: 2, nome: 'Coloração', duracao: '120 min', preco: 150.00, ativo: true },
    { id: 3, nome: 'Manicure', duracao: '45 min', preco: 45.00, ativo: true },
    { id: 4, nome: 'Pedicure', duracao: '50 min', preco: 50.00, ativo: true },
    { id: 5, nome: 'Escova', duracao: '60 min', preco: 60.00, ativo: true },
    { id: 6, nome: 'Sobrancelha', duracao: '30 min', preco: 35.00, ativo: false },
  ])

  const [agendamentosHoje] = useState([
    { id: 1, cliente: 'Juliana Freitas', servico: 'Corte de Cabelo', hora: '09:00', profissional: 'Ana Paula', status: 'confirmado' },
    { id: 2, cliente: 'Maria Silva', servico: 'Manicure', hora: '10:00', profissional: 'Carla Silva', status: 'confirmado' },
    { id: 3, cliente: 'Ana Costa', servico: 'Coloração', hora: '11:00', profissional: 'Ana Paula', status: 'pendente' },
    { id: 4, cliente: 'Paula Rocha', servico: 'Escova', hora: '14:00', profissional: 'Ana Paula', status: 'confirmado' },
    { id: 5, cliente: 'Carla Lima', servico: 'Pedicure', hora: '15:30', profissional: 'Carla Silva', status: 'pendente' },
  ])

  const [clientes] = useState([
    { id: 1, nome: 'Juliana Freitas', email: 'juliana@email.com', agendamentos: 5, ultimoServico: 'Corte de Cabelo' },
    { id: 2, nome: 'Maria Silva', email: 'maria@email.com', agendamentos: 3, ultimoServico: 'Manicure' },
    { id: 3, nome: 'Ana Costa', email: 'ana@email.com', agendamentos: 8, ultimoServico: 'Coloração' },
    { id: 4, nome: 'Paula Rocha', email: 'paula@email.com', agendamentos: 2, ultimoServico: 'Escova' },
  ])

  const [novoServico, setNovoServico] = useState({ nome: '', duracao: '', preco: '' })
  const [mostrarFormServico, setMostrarFormServico] = useState(false)
  const [editandoServico, setEditandoServico] = useState(null)

  const formatarValor = (valor) =>
    valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  const totalHoje = agendamentosHoje.reduce((acc, a) => {
    const servico = servicos.find(s => s.nome === a.servico)
    return acc + (servico?.preco || 0)
  }, 0)

  const handleSair = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    navigate('/')
  }

  const handleAdicionarServico = () => {
    if (!novoServico.nome || !novoServico.duracao || !novoServico.preco) return
    setServicos([...servicos, {
      id: servicos.length + 1,
      nome: novoServico.nome,
      duracao: novoServico.duracao,
      preco: parseFloat(novoServico.preco),
      ativo: true
    }])
    setNovoServico({ nome: '', duracao: '', preco: '' })
    setMostrarFormServico(false)
  }

  const handleToggleServico = (id) => {
    setServicos(servicos.map(s =>
      s.id === id ? { ...s, ativo: !s.ativo } : s
    ))
  }

  const handleRemoverServico = (id) => {
    if (window.confirm('Tem certeza que deseja remover este serviço?')) {
      setServicos(servicos.filter(s => s.id !== id))
    }
  }

  const menus = [
    { id: 'dashboard', label: 'Dashboard', icone: '📊' },
    { id: 'agendamentos', label: 'Agendamentos', icone: '📅' },
    { id: 'servicos', label: 'Serviços', icone: '✂️' },
    { id: 'clientes', label: 'Clientes', icone: '👥' },
  ]

  return (
    <div className={styles.pagina}>

      {/* SIDEBAR */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <div className={styles.logoCirculo}>JJ</div>
          <div>
            <span className={styles.sidebarNome}>Studio JJ Tech</span>
            <span className={styles.sidebarCargo}>Painel Admin</span>
          </div>
        </div>

        <nav className={styles.sidebarNav}>
          {menus.map(menu => (
            <button
              key={menu.id}
              className={`${styles.menuItem} ${abaAtiva === menu.id ? styles.menuItemAtivo : ''}`}
              onClick={() => setAbaAtiva(menu.id)}
            >
              <span>{menu.icone}</span>
              <span>{menu.label}</span>
            </button>
          ))}
        </nav>

        <div className={styles.sidebarRodape}>
          <div className={styles.adminInfo}>
            <div className={styles.adminAvatar}>
              {usuario.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className={styles.adminNome}>{usuario.name}</p>
              <p className={styles.adminRole}>Administrador</p>
            </div>
          </div>
          <button className={styles.btnSair} onClick={handleSair}>Sair</button>
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main className={styles.main}>

        {/* HEADER */}
        <div className={styles.header}>
          <div>
            <h1>{menus.find(m => m.id === abaAtiva)?.label}</h1>
            <p>
              {abaAtiva === 'dashboard' && 'Visão geral do seu negócio hoje'}
              {abaAtiva === 'agendamentos' && 'Gerencie os agendamentos do dia'}
              {abaAtiva === 'servicos' && 'Gerencie os serviços disponíveis'}
              {abaAtiva === 'clientes' && 'Visualize e gerencie seus clientes'}
            </p>
          </div>
        </div>

        {/* ABA DASHBOARD */}
        {abaAtiva === 'dashboard' && (
          <div className={styles.conteudo}>
            <div className={styles.resumoGrid}>
              <div className={styles.resumoCard}>
                <div className={styles.resumoIcone}>📅</div>
                <div>
                  <p className={styles.resumoNumero}>{agendamentosHoje.length}</p>
                  <p className={styles.resumoLabel}>Agendamentos Hoje</p>
                </div>
              </div>
              <div className={styles.resumoCard}>
                <div className={styles.resumoIcone}>✅</div>
                <div>
                  <p className={styles.resumoNumero}>
                    {agendamentosHoje.filter(a => a.status === 'confirmado').length}
                  </p>
                  <p className={styles.resumoLabel}>Confirmados</p>
                </div>
              </div>
              <div className={styles.resumoCard}>
                <div className={styles.resumoIcone}>⏳</div>
                <div>
                  <p className={styles.resumoNumero}>
                    {agendamentosHoje.filter(a => a.status === 'pendente').length}
                  </p>
                  <p className={styles.resumoLabel}>Pendentes</p>
                </div>
              </div>
              <div className={styles.resumoCard}>
                <div className={styles.resumoIcone}>💰</div>
                <div>
                  <p className={styles.resumoNumero}>{formatarValor(totalHoje)}</p>
                  <p className={styles.resumoLabel}>Faturamento Hoje</p>
                </div>
              </div>
            </div>

            <div className={styles.card}>
              <h3 className={styles.cardTitulo}>📅 Agendamentos de Hoje</h3>
              <div className={styles.tabelaWrapper}>
                <table className={styles.tabela}>
                  <thead>
                    <tr>
                      <th>Horário</th>
                      <th>Cliente</th>
                      <th>Serviço</th>
                      <th>Profissional</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agendamentosHoje.map(a => (
                      <tr key={a.id}>
                        <td><strong>{a.hora}</strong></td>
                        <td>{a.cliente}</td>
                        <td>{a.servico}</td>
                        <td>{a.profissional}</td>
                        <td>
                          <span className={`${styles.badge} ${styles[a.status]}`}>
                            {a.status === 'confirmado' ? '✅ Confirmado' : '⏳ Pendente'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ABA AGENDAMENTOS */}
        {abaAtiva === 'agendamentos' && (
          <div className={styles.conteudo}>
            <div className={styles.card}>
              <h3 className={styles.cardTitulo}>📅 Todos os Agendamentos</h3>
              <div className={styles.tabelaWrapper}>
                <table className={styles.tabela}>
                  <thead>
                    <tr>
                      <th>Horário</th>
                      <th>Cliente</th>
                      <th>Serviço</th>
                      <th>Profissional</th>
                      <th>Valor</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agendamentosHoje.map(a => (
                      <tr key={a.id}>
                        <td><strong>{a.hora}</strong></td>
                        <td>{a.cliente}</td>
                        <td>{a.servico}</td>
                        <td>{a.profissional}</td>
                        <td>{formatarValor(servicos.find(s => s.nome === a.servico)?.preco || 0)}</td>
                        <td>
                          <span className={`${styles.badge} ${styles[a.status]}`}>
                            {a.status === 'confirmado' ? '✅ Confirmado' : '⏳ Pendente'}
                          </span>
                        </td>
                        <td>
                          <div className={styles.acoes}>
                            <button className={styles.btnAcaoConfirmar}>✅</button>
                            <button className={styles.btnAcaoCancelar}>✕</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ABA SERVIÇOS */}
        {abaAtiva === 'servicos' && (
          <div className={styles.conteudo}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitulo}>✂️ Serviços Cadastrados</h3>
                <button
                  className={styles.btnAdicionar}
                  onClick={() => setMostrarFormServico(!mostrarFormServico)}
                >
                  + Novo Serviço
                </button>
              </div>

              {mostrarFormServico && (
                <div className={styles.formNovoServico}>
                  <h4>Novo Serviço</h4>
                  <div className={styles.formGrid}>
                    <div className={styles.formGrupo}>
                      <label>Nome do Serviço</label>
                      <input
                        type="text"
                        placeholder="Ex: Hidratação"
                        value={novoServico.nome}
                        onChange={(e) => setNovoServico({...novoServico, nome: e.target.value})}
                        className={styles.input}
                      />
                    </div>
                    <div className={styles.formGrupo}>
                      <label>Duração</label>
                      <input
                        type="text"
                        placeholder="Ex: 60 min"
                        value={novoServico.duracao}
                        onChange={(e) => setNovoServico({...novoServico, duracao: e.target.value})}
                        className={styles.input}
                      />
                    </div>
                    <div className={styles.formGrupo}>
                      <label>Preço (R$)</label>
                      <input
                        type="number"
                        placeholder="Ex: 80"
                        value={novoServico.preco}
                        onChange={(e) => setNovoServico({...novoServico, preco: e.target.value})}
                        className={styles.input}
                      />
                    </div>
                  </div>
                  <div className={styles.formBtns}>
                    <button className={styles.btnSalvar} onClick={handleAdicionarServico}>
                      Salvar Serviço
                    </button>
                    <button
                      className={styles.btnCancelarForm}
                      onClick={() => setMostrarFormServico(false)}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              <div className={styles.servicosLista}>
                {servicos.map(servico => (
                  <div key={servico.id} className={`${styles.servicoItem} ${!servico.ativo ? styles.servicoInativo : ''}`}>
                    <div className={styles.servicoInfo}>
                      <h4>{servico.nome}</h4>
                      <div className={styles.servicoDetalhes}>
                        <span>⏱ {servico.duracao}</span>
                        <span>{formatarValor(servico.preco)}</span>
                      </div>
                    </div>
                    <div className={styles.servicoAcoes}>
                      <button
                        className={`${styles.btnToggle} ${servico.ativo ? styles.btnToggleAtivo : styles.btnToggleInativo}`}
                        onClick={() => handleToggleServico(servico.id)}
                      >
                        {servico.ativo ? '✅ Ativo' : '❌ Inativo'}
                      </button>
                      <button
                        className={styles.btnRemover}
                        onClick={() => handleRemoverServico(servico.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ABA CLIENTES */}
        {abaAtiva === 'clientes' && (
          <div className={styles.conteudo}>
            <div className={styles.card}>
              <h3 className={styles.cardTitulo}>👥 Lista de Clientes</h3>
              <div className={styles.tabelaWrapper}>
                <table className={styles.tabela}>
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>E-mail</th>
                      <th>Total de Agendamentos</th>
                      <th>Último Serviço</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientes.map(cliente => (
                      <tr key={cliente.id}>
                        <td>
                          <div className={styles.clienteNome}>
                            <div className={styles.clienteAvatar}>
                              {cliente.nome.charAt(0)}
                            </div>
                            {cliente.nome}
                          </div>
                        </td>
                        <td>{cliente.email}</td>
                        <td>{cliente.agendamentos} agendamentos</td>
                        <td>{cliente.ultimoServico}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}

export default Admin