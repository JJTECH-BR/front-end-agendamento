import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import api from '../../services/api'
import { urlDaEmpresa } from '../../services/company'
import ServicesPanel from './ServicesPanel'
import ProfessionalsPanel from './ProfessionalsPanel'
import CompanyProfilePanel from './CompanyProfilePanel'
import styles from './Admin.module.css'

const menus = [
  { id: 'dashboard', label: 'Dashboard', icone: '▦' },
  { id: 'agendamentos', label: 'Agendamentos', icone: '▣' },
  { id: 'profissionais', label: 'Profissionais', icone: '♙' },
  { id: 'servicos', label: 'Serviços', icone: '✂' },
  { id: 'conteudo', label: 'Conteúdo', icone: '▤' },
  { id: 'configuracoes', label: 'Configurações', icone: '⚙' },
  { id: 'relatorios', label: 'Relatórios', icone: '▥' },
]

const statusInfo = {
  PENDING: { label: 'Pendente', className: 'pending' },
  CONFIRMED: { label: 'Confirmado', className: 'confirmado' },
  CANCELLED: { label: 'Cancelado', className: 'cancelled' },
  COMPLETED: { label: 'Concluído', className: 'completed' },
}

function lerUsuario() {
  try {
    return JSON.parse(localStorage.getItem('usuario') || '{"name":"Admin"}')
  } catch {
    return { name: 'Admin' }
  }
}

function dataLocal(date) {
  const value = new Date(date)
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`
}

function formatarValor(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatarData(date, options = { day: '2-digit', month: '2-digit', year: 'numeric' }) {
  return new Date(date).toLocaleDateString('pt-BR', options)
}

function formatarHorario(date) {
  return new Date(date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function Admin() {
  const navigate = useNavigate()
  const location = useLocation()
  const { slug: slugDaUrl } = useParams()
  const [abaAtiva, setAbaAtiva] = useState(location.state?.tab || 'dashboard')
  const [linkStatus, setLinkStatus] = useState('')
  const [agendamentos, setAgendamentos] = useState([])
  const [carregandoAgendamentos, setCarregandoAgendamentos] = useState(true)
  const [erroAgendamentos, setErroAgendamentos] = useState('')
  const [salvandoId, setSalvandoId] = useState(null)
  const [statusFiltro, setStatusFiltro] = useState('TODOS')
  const [dataFiltro, setDataFiltro] = useState('')
  const [mesRelatorio, setMesRelatorio] = useState(() => {
    const today = new Date()
    return new Date(today.getFullYear(), today.getMonth(), 1)
  })
  const usuario = lerUsuario()
  const linkAgendamento = `${window.location.origin}${urlDaEmpresa('', slugDaUrl)}`

  const carregarAgendamentos = useCallback(async () => {
    setCarregandoAgendamentos(true)
    setErroAgendamentos('')
    try {
      const { data } = await api.get('/appointments')
      setAgendamentos(data)
    } catch (requestError) {
      setErroAgendamentos(requestError.response?.data?.error || 'Não foi possível carregar os agendamentos.')
    } finally {
      setCarregandoAgendamentos(false)
    }
  }, [])

  useEffect(() => {
    carregarAgendamentos()
  }, [carregarAgendamentos])

  const copiarLink = async () => {
    try {
      await navigator.clipboard.writeText(linkAgendamento)
      setLinkStatus('Link copiado.')
    } catch {
      setLinkStatus('Não foi possível copiar o link neste navegador.')
    }
  }

  const handleSair = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    navigate(urlDaEmpresa('admin/login', slugDaUrl), { replace: true })
  }

  const alterarStatus = async (id, status) => {
    setSalvandoId(id)
    setErroAgendamentos('')
    try {
      await api.patch(`/appointments/${id}`, { status })
      await carregarAgendamentos()
    } catch (requestError) {
      setErroAgendamentos(requestError.response?.data?.error || 'Não foi possível atualizar o agendamento.')
    } finally {
      setSalvandoId(null)
    }
  }

  const hoje = new Date()
  const hojeKey = dataLocal(hoje)
  const agendamentosHoje = agendamentos.filter((item) => dataLocal(item.date) === hojeKey)
  const mesKey = `${mesRelatorio.getFullYear()}-${String(mesRelatorio.getMonth() + 1).padStart(2, '0')}`
  const agendamentosDoMes = agendamentos.filter((item) => dataLocal(item.date).startsWith(mesKey))
  const concluidosDoMes = agendamentosDoMes.filter((item) => item.status === 'COMPLETED')
  const faturamentoMes = concluidosDoMes.reduce(
    (sum, item) => sum + Number(item.price ?? item.service?.price ?? 0),
    0,
  )

  const filtrados = useMemo(() => agendamentos
    .filter((item) => statusFiltro === 'TODOS' || item.status === statusFiltro)
    .filter((item) => !dataFiltro || dataLocal(item.date) === dataFiltro)
    .sort((a, b) => new Date(a.date) - new Date(b.date)), [agendamentos, statusFiltro, dataFiltro])

  const statusBadge = (status) => {
    const info = statusInfo[status] || { label: status, className: '' }
    return <span className={`${styles.statusTag} ${styles[info.className] || ''}`}>{info.label}</span>
  }

  const renderAcoes = (item) => (
    <div className={styles.acoes}>
      {item.status === 'PENDING' && (
        <button
          type="button"
          className={styles.btnAcaoConfirmar}
          disabled={salvandoId === item.id}
          aria-label={`Confirmar agendamento de ${item.client.name}`}
          onClick={() => alterarStatus(item.id, 'CONFIRMED')}
        >✓</button>
      )}
      {(item.status === 'PENDING' || item.status === 'CONFIRMED') && (
        <>
          <button
            type="button"
            className={styles.btnAcaoConcluir}
            disabled={salvandoId === item.id}
            aria-label={`Concluir agendamento de ${item.client.name}`}
            onClick={() => alterarStatus(item.id, 'COMPLETED')}
          >●</button>
          <button
            type="button"
            className={styles.btnAcaoCancelar}
            disabled={salvandoId === item.id}
            aria-label={`Cancelar agendamento de ${item.client.name}`}
            onClick={() => alterarStatus(item.id, 'CANCELLED')}
          >×</button>
        </>
      )}
    </div>
  )

  const renderTabelaAgendamentos = (lista) => (
    carregandoAgendamentos ? (
      <p className={styles.placeholder} role="status">Carregando agendamentos...</p>
    ) : lista.length === 0 ? (
      <p className={styles.placeholder}>Nenhum agendamento encontrado.</p>
    ) : (
      <div className={styles.tabelaWrapper}>
        <table className={styles.tabela}>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Serviço</th>
              <th>Profissional</th>
              <th>Data e horário</th>
              <th>Status</th>
              <th>Valor</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((item) => (
              <tr key={item.id}>
                <td>{item.client?.name || 'Cliente'}</td>
                <td>{item.service?.name || 'Serviço'}</td>
                <td>{item.professional?.name || '—'}</td>
                <td>{formatarData(item.date)} às {formatarHorario(item.date)}</td>
                <td>{statusBadge(item.status)}</td>
                <td>{formatarValor(item.price ?? item.service?.price)}</td>
                <td>{renderAcoes(item)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  )

  const somaPor = (lista, obterNome) => {
    const agrupado = new Map()
    lista.forEach((item) => {
      const nome = obterNome(item) || 'Sem identificação'
      agrupado.set(nome, (agrupado.get(nome) || 0) + 1)
    })
    return [...agrupado.entries()].sort((a, b) => b[1] - a[1])
  }

  const porServico = somaPor(agendamentosDoMes, (item) => item.service?.name)
  const porProfissional = somaPor(agendamentosDoMes, (item) => item.professional?.name)
  const porDia = [...agendamentosDoMes.reduce((acc, item) => {
    const key = dataLocal(item.date)
    const atual = acc.get(key) || { total: 0, valor: 0 }
    atual.total += 1
    if (item.status === 'COMPLETED') atual.valor += Number(item.price ?? item.service?.price ?? 0)
    acc.set(key, atual)
    return acc
  }, new Map()).entries()].sort(([a], [b]) => a.localeCompare(b))

  return (
    <div className={styles.pagina}>
      <header className={styles.topbar}>
        <button
          type="button"
          className={styles.brand}
          onClick={() => navigate(urlDaEmpresa('', slugDaUrl))}
          aria-label="Ir para a página inicial"
        >
          <span className={styles.logoCirculo}>JJ</span>
          <span>JJTech</span>
        </button>
        <nav className={styles.topLinks} aria-label="Links da conta">
          <button type="button" onClick={() => navigate(urlDaEmpresa('', slugDaUrl))}>Sobre</button>
          <button type="button" onClick={() => setAbaAtiva('servicos')}>Serviços</button>
          <button type="button" onClick={() => setAbaAtiva('profissionais')}>Equipe</button>
          <button type="button" className={styles.topLinkAtivo} onClick={() => setAbaAtiva('dashboard')}>Admin</button>
          <button type="button" onClick={() => navigate(urlDaEmpresa('dashboard', slugDaUrl))}>Meus Agendamentos</button>
          <button type="button" onClick={() => setAbaAtiva('configuracoes')}>Configurações</button>
          <button type="button" className={styles.topSair} onClick={handleSair}>Sair</button>
        </nav>
      </header>

      <main className={styles.main}>
        <div className={styles.header}>
          <div>
            <button type="button" className={styles.backButton} onClick={() => navigate(urlDaEmpresa('', slugDaUrl))}>
              ← Voltar
            </button>
            <h1>Painel Administrativo</h1>
            <p>Olá, {usuario.name}. Gerencie seu espaço em um só lugar.</p>
          </div>
          <div className={styles.adminAvatar} aria-hidden="true">
            {usuario.name?.charAt(0).toUpperCase() || 'A'}
          </div>
        </div>

        <nav className={styles.tabs} aria-label="Navegação do painel">
          {menus.map((menu) => (
            <button
              key={menu.id}
              type="button"
              className={`${styles.tab} ${abaAtiva === menu.id ? styles.tabAtiva : ''}`}
              onClick={() => setAbaAtiva(menu.id)}
              aria-current={abaAtiva === menu.id ? 'page' : undefined}
            >
              <span aria-hidden="true">{menu.icone}</span>{menu.label}
            </button>
          ))}
        </nav>

        {erroAgendamentos && <p className={styles.feedbackErro} role="alert">{erroAgendamentos}</p>}
        {abaAtiva === 'servicos' && <ServicesPanel />}
        {abaAtiva === 'profissionais' && (
          <ProfessionalsPanel onHistory={() => setAbaAtiva('agendamentos')} />
        )}
        {abaAtiva === 'conteudo' && <CompanyProfilePanel mode="content" />}
        {abaAtiva === 'configuracoes' && <CompanyProfilePanel mode="settings" />}

        {abaAtiva === 'dashboard' && (
          <div className={styles.conteudo}>
            <section className={styles.linkEmpresa}>
              <div>
                <h2>Link de agendamento</h2>
                <p>Compartilhe o endereço com seus clientes.</p>
              </div>
              <div className={styles.linkEmpresaAcoes}>
                <input aria-label="Link de agendamento" value={linkAgendamento} readOnly />
                <button type="button" className={styles.btnSalvar} onClick={copiarLink}>Copiar link</button>
              </div>
              {linkStatus && <p className={styles.linkStatus} role="status">{linkStatus}</p>}
            </section>

            <section className={styles.dashboardSection}>
              <div className={styles.sectionHeader}>
                <div>
                  <h2 className={styles.cardTitulo}>Resumo de hoje</h2>
                  <p className={styles.sectionDescription}>{formatarData(hoje, { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                </div>
              </div>
              <div className={styles.resumoGrid}>
                <article className={styles.resumoCard}>
                  <span className={styles.resumoIcone}>▣</span>
                  <div><span className={styles.resumoLabel}>Agendamentos hoje</span>
                    <strong className={styles.resumoNumero}>{carregandoAgendamentos ? '—' : agendamentosHoje.length}</strong></div>
                </article>
                <article className={styles.resumoCard}>
                  <span className={`${styles.resumoIcone} ${styles.iconeVerde}`}>✓</span>
                  <div><span className={styles.resumoLabel}>Confirmados</span>
                    <strong className={styles.resumoNumero}>{agendamentosHoje.filter((item) => item.status === 'CONFIRMED').length}</strong></div>
                </article>
                <article className={styles.resumoCard}>
                  <span className={`${styles.resumoIcone} ${styles.iconeDourado}`}>$</span>
                  <div><span className={styles.resumoLabel}>Valor previsto hoje</span>
                    <strong className={styles.resumoNumero}>{formatarValor(agendamentosHoje
                      .filter((item) => item.status !== 'CANCELLED')
                      .reduce((sum, item) => sum + Number(item.price ?? item.service?.price ?? 0), 0))}</strong></div>
                </article>
                <article className={styles.resumoCard}>
                  <span className={`${styles.resumoIcone} ${styles.iconeVermelho}`}>↗</span>
                  <div><span className={styles.resumoLabel}>Faturamento do mês</span>
                    <strong className={styles.resumoNumero}>{formatarValor(faturamentoMes)}</strong></div>
                </article>
              </div>
            </section>

            <section className={styles.dashboardDuasColunas}>
              <article className={styles.card}>
                <h2 className={styles.cardTitulo}>Agendamentos por serviço</h2>
                {porServico.length ? porServico.slice(0, 5).map(([label, count]) => (
                  <div className={styles.miniBarra} key={label}>
                    <span>{label}</span><strong>{count}</strong>
                    <div><i style={{ width: `${Math.max(8, count / Math.max(...porServico.map((item) => item[1])) * 100)}%` }} /></div>
                  </div>
                )) : <p className={styles.placeholder}>Nenhum agendamento neste mês.</p>}
              </article>
              <article className={styles.card}>
                <h2 className={styles.cardTitulo}>Agendamentos por profissional</h2>
                {porProfissional.length ? porProfissional.slice(0, 5).map(([label, count]) => (
                  <div className={styles.miniBarra} key={label}>
                    <span>{label}</span><strong>{count}</strong>
                    <div><i style={{ width: `${Math.max(8, count / Math.max(...porProfissional.map((item) => item[1])) * 100)}%` }} /></div>
                  </div>
                )) : <p className={styles.placeholder}>Nenhum agendamento neste mês.</p>}
              </article>
            </section>

            <section className={styles.card}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.cardTitulo}>Agenda de hoje</h2>
                <button type="button" className={styles.textButton} onClick={() => setAbaAtiva('agendamentos')}>
                  Ver todos
                </button>
              </div>
              {renderTabelaAgendamentos(agendamentosHoje)}
            </section>
          </div>
        )}

        {abaAtiva === 'agendamentos' && (
          <section className={`${styles.card} ${styles.appointmentsPanel}`}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.cardTitulo}>Todos os agendamentos</h2>
                <p className={styles.sectionDescription}>{filtrados.length} registro(s)</p>
              </div>
              <div className={styles.filtrosAgenda}>
                <label>
                  <span className={styles.srOnly}>Filtrar por status</span>
                  <select className={styles.input} value={statusFiltro} onChange={(event) => setStatusFiltro(event.target.value)}>
                    <option value="TODOS">Todos os status</option>
                    {Object.entries(statusInfo).map(([value, info]) => <option key={value} value={value}>{info.label}</option>)}
                  </select>
                </label>
                <label>
                  <span className={styles.srOnly}>Filtrar por data</span>
                  <input className={styles.input} type="date" value={dataFiltro} onChange={(event) => setDataFiltro(event.target.value)} />
                </label>
                {(statusFiltro !== 'TODOS' || dataFiltro) && (
                  <button type="button" className={styles.textButton} onClick={() => { setStatusFiltro('TODOS'); setDataFiltro('') }}>
                    Limpar
                  </button>
                )}
              </div>
            </div>
            {renderTabelaAgendamentos(filtrados)}
          </section>
        )}

        {abaAtiva === 'relatorios' && (
          <div className={styles.conteudo}>
            <section className={styles.card}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.cardTitulo}>
                  Relatório — {mesRelatorio.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </h2>
                <div className={styles.filtrosAgenda}>
                  <button type="button" className={styles.btnSecundario} onClick={() => setMesRelatorio(new Date(mesRelatorio.getFullYear(), mesRelatorio.getMonth() - 1, 1))}>
                    Mês anterior
                  </button>
                  <button type="button" className={styles.btnSecundario} onClick={() => setMesRelatorio(new Date(mesRelatorio.getFullYear(), mesRelatorio.getMonth() + 1, 1))}>
                    Próximo mês
                  </button>
                </div>
              </div>
              <div className={styles.resumoGrid}>
                <article className={styles.relatorioCard}>
                  <span className={styles.resumoLabel}>Agendamentos</span>
                  <strong className={styles.resumoNumero}>{agendamentosDoMes.length}</strong>
                </article>
                <article className={styles.relatorioCard}>
                  <span className={styles.resumoLabel}>Faturamento concluído</span>
                  <strong className={`${styles.resumoNumero} ${styles.valorDestaque}`}>{formatarValor(faturamentoMes)}</strong>
                </article>
                <article className={styles.relatorioCard}>
                  <span className={styles.resumoLabel}>Ticket médio</span>
                  <strong className={styles.resumoNumero}>{formatarValor(concluidosDoMes.length ? faturamentoMes / concluidosDoMes.length : 0)}</strong>
                </article>
              </div>
            </section>

            <section className={styles.dashboardDuasColunas}>
              {[[porServico, 'Por serviço'], [porProfissional, 'Por profissional']].map(([groups, title]) => (
                <article className={styles.card} key={title}>
                  <h2 className={styles.cardTitulo}>{title}</h2>
                  {groups.length ? groups.map(([label, count]) => (
                    <div className={styles.reportRow} key={label}><span>{label}</span><strong>{count} agendamento(s)</strong></div>
                  )) : <p className={styles.placeholder}>Sem dados para este mês.</p>}
                </article>
              ))}
            </section>

            <section className={styles.card}>
              <h2 className={styles.cardTitulo}>Detalhamento por dia</h2>
              {porDia.length ? (
                <div className={styles.tabelaWrapper}>
                  <table className={styles.tabela}>
                    <thead><tr><th>Data</th><th>Agendamentos</th><th>Faturamento concluído</th></tr></thead>
                    <tbody>{porDia.map(([date, summary]) => (
                      <tr key={date}><td>{formatarData(`${date}T12:00:00`)}</td><td>{summary.total}</td><td>{formatarValor(summary.valor)}</td></tr>
                    ))}</tbody>
                  </table>
                </div>
              ) : <p className={styles.placeholder}>Sem dados para este mês.</p>}
            </section>
          </div>
        )}
      </main>
    </div>
  )
}

export default Admin
