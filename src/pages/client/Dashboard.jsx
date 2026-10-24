import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../services/api'
import { getSlug, urlDaEmpresa } from '../../services/company'
import styles from './Dashboard.module.css'

function formatarDataHora(dateValue) {
  const date = new Date(dateValue)
  return {
    data: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
    hora: `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`,
  }
}

function mapearAgendamento(appointment) {
  const { data, hora } = formatarDataHora(appointment.date)
  return {
    ...appointment,
    data,
    hora,
    servico: appointment.service.name,
    profissional: appointment.professional.name,
    valor: Number(appointment.price),
    status: appointment.status.toLowerCase(),
  }
}

function Dashboard() {
  const navigate = useNavigate()
  const { slug: slugDaUrl } = useParams()
  const slug = slugDaUrl || getSlug()
  const [mesSelecionado, setMesSelecionado] = useState(new Date())
  const [agendamentos, setAgendamentos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [salvandoId, setSalvandoId] = useState(null)
  const [erro, setErro] = useState('')
  const [editandoId, setEditandoId] = useState(null)
  const [editandoDados, setEditandoDados] = useState({})
  let usuario = { name: 'Cliente' }
  try {
    usuario = JSON.parse(localStorage.getItem('usuario') || 'null') || usuario
  } catch {
    usuario = { name: 'Cliente' }
  }

  const carregarAgendamentos = useCallback(async () => {
    setCarregando(true)
    setErro('')
    try {
      const response = await api.get('/appointments')
      setAgendamentos(response.data.map(mapearAgendamento))
    } catch (requestError) {
      setErro(requestError.response?.data?.error || 'Não foi possível carregar seus agendamentos.')
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    carregarAgendamentos()
  }, [carregarAgendamentos])

  const hoje = new Date()
  const agendamentosAtivos = useMemo(
    () => agendamentos.filter((item) => item.status !== 'cancelled' && item.status !== 'completed'),
    [agendamentos],
  )
  const historico = agendamentos.filter(
    (item) => item.status === 'completed' || new Date(item.date) < hoje,
  )
  const diasComAgendamento = useMemo(
    () => agendamentosAtivos
      .map((item) => new Date(item.date))
      .filter((date) => date.getMonth() === mesSelecionado.getMonth()
        && date.getFullYear() === mesSelecionado.getFullYear())
      .map((date) => date.getDate()),
    [agendamentosAtivos, mesSelecionado],
  )

  const gerarDiasDoMes = (date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
    return [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, index) => index + 1)]
  }

  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ]
  const semana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  const alterarStatus = async (appointmentId, status) => {
    setSalvandoId(appointmentId)
    setErro('')
    try {
      await api.patch(`/appointments/${appointmentId}`, { status })
      await carregarAgendamentos()
    } catch (requestError) {
      setErro(requestError.response?.data?.error || 'Não foi possível atualizar o agendamento.')
    } finally {
      setSalvandoId(null)
    }
  }

  const handleCancelar = (id) => {
    if (window.confirm('Tem certeza que deseja cancelar este agendamento?')) {
      alterarStatus(id, 'CANCELLED')
    }
  }

  const handleEditar = (appointment) => {
    setEditandoId(appointment.id)
    setEditandoDados({ data: appointment.data, hora: appointment.hora })
    setErro('')
  }

  const handleSalvar = async (appointment) => {
    const date = new Date(`${editandoDados.data}T${editandoDados.hora}`)
    setSalvandoId(appointment.id)
    setErro('')
    try {
      await api.patch(`/appointments/${appointment.id}`, { date: date.toISOString() })
      setEditandoId(null)
      setEditandoDados({})
      await carregarAgendamentos()
    } catch (requestError) {
      setErro(requestError.response?.data?.error || 'Não foi possível salvar a alteração.')
    } finally {
      setSalvandoId(null)
    }
  }

  const handleSair = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    navigate(urlDaEmpresa('login', slug), { replace: true })
  }

  const formatarData = (dateStr) => new Date(`${dateStr}T00:00:00`)
    .toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })

  const formatarValor = (value) => Number(value)
    .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  const nomeStatus = {
    pending: 'Pendente',
    confirmed: 'Confirmado',
    cancelled: 'Cancelado',
    completed: 'Concluído',
  }

  return (
    <div className={styles.pagina}>
      <nav className={styles.navbar}>
        <div className={styles.navLogo}>
          <div className={styles.logoCirculo}>JJ</div>
          <span>JJTech</span>
        </div>
        <div className={styles.navDireita}>
          <span className={styles.navUsuario}>👤 {usuario.name}</span>
          <button className={styles.btnSair} onClick={handleSair}>Sair</button>
        </div>
      </nav>

      <div className={styles.container}>
        <div className={styles.boasVindas}>
          <div>
            <h1>Olá, {usuario.name.split(' ')[0]}! 👋</h1>
            <p>Bem-vinda ao seu painel de agendamentos</p>
          </div>
          <button
            className={styles.btnNovoAgendamento}
            onClick={() => navigate(urlDaEmpresa('agendar', slug))}
          >
            + Novo Agendamento
          </button>
        </div>

        {erro && <p className={styles.feedbackErro} role="alert">{erro}</p>}

        <div className={styles.resumoGrid}>
          <div className={styles.resumoCard}>
            <div className={styles.resumoIcone}>📅</div>
            <div>
              <p className={styles.resumoNumero}>{agendamentosAtivos.length}</p>
              <p className={styles.resumoLabel}>Agendamentos ativos</p>
            </div>
          </div>
          <div className={styles.resumoCard}>
            <div className={styles.resumoIcone}>✅</div>
            <div>
              <p className={styles.resumoNumero}>{historico.length}</p>
              <p className={styles.resumoLabel}>Serviços realizados</p>
            </div>
          </div>
          <div className={styles.resumoCard}>
            <div className={styles.resumoIcone}>💰</div>
            <div>
              <p className={styles.resumoNumero}>
                {formatarValor(agendamentosAtivos.reduce((sum, item) => sum + item.valor, 0))}
              </p>
              <p className={styles.resumoLabel}>Total em agendamentos</p>
            </div>
          </div>
        </div>

        <div className={styles.conteudoPrincipal}>
          <div className={styles.colunaEsquerda}>
            <div className={styles.card}>
              <div className={styles.calendarioHeader}>
                <button
                  onClick={() => setMesSelecionado(new Date(mesSelecionado.getFullYear(), mesSelecionado.getMonth() - 1))}
                  className={styles.btnMes}
                >‹</button>
                <h3>{meses[mesSelecionado.getMonth()]} {mesSelecionado.getFullYear()}</h3>
                <button
                  onClick={() => setMesSelecionado(new Date(mesSelecionado.getFullYear(), mesSelecionado.getMonth() + 1))}
                  className={styles.btnMes}
                >›</button>
              </div>
              <div className={styles.calendarioSemana}>
                {semana.map((day) => <span key={day}>{day}</span>)}
              </div>
              <div className={styles.calendarioDias}>
                {gerarDiasDoMes(mesSelecionado).map((day, index) => (
                  <div
                    key={index}
                    className={`${styles.dia} ${day === null ? styles.diaVazio : ''} ${
                      day === hoje.getDate()
                      && mesSelecionado.getMonth() === hoje.getMonth()
                      && mesSelecionado.getFullYear() === hoje.getFullYear()
                        ? styles.diaHoje : ''
                    } ${diasComAgendamento.includes(day) ? styles.diaComAgendamento : ''}`}
                  >
                    {day}
                    {diasComAgendamento.includes(day) && <span className={styles.ponto} />}
                  </div>
                ))}
              </div>
              <div className={styles.legendaCalendario}>
                <span><span className={styles.legendaPonto} /> Agendamento marcado</span>
                <span><span className={styles.legendaHoje} /> Hoje</span>
              </div>
            </div>
          </div>

          <div className={styles.colunaDireita}>
            <div className={styles.card}>
              <h3 className={styles.cardTitulo}>📅 Próximos Agendamentos</h3>
              <div className={styles.agendamentoLista}>
                {carregando ? <p role="status">Carregando agendamentos...</p>
                  : agendamentosAtivos.length === 0 ? <p>Você ainda não tem agendamentos ativos.</p>
                    : agendamentosAtivos.map((appointment) => (
                      <div key={appointment.id} className={styles.agendamentoItem}>
                        <div className={styles.agendamentoIcone}>✂️</div>
                        <div className={styles.agendamentoInfo}>
                          <h4>{appointment.servico}</h4>
                          <p>👤 Com {appointment.profissional}</p>
                          {editandoId === appointment.id ? (
                            <div className={styles.editandocampos}>
                              <div className={styles.editandoCampo}>
                                <label htmlFor={`date-${appointment.id}`}>Data:</label>
                                <input
                                  id={`date-${appointment.id}`}
                                  type="date"
                                  value={editandoDados.data}
                                  onChange={(event) => setEditandoDados({ ...editandoDados, data: event.target.value })}
                                  className={styles.editandoInput}
                                />
                              </div>
                              <div className={styles.editandoCampo}>
                                <label htmlFor={`time-${appointment.id}`}>Horário:</label>
                                <input
                                  id={`time-${appointment.id}`}
                                  type="time"
                                  value={editandoDados.hora}
                                  onChange={(event) => setEditandoDados({ ...editandoDados, hora: event.target.value })}
                                  className={styles.editandoInput}
                                />
                              </div>
                            </div>
                          ) : (
                            <>
                              <p>📆 {formatarData(appointment.data)} às {appointment.hora}</p>
                              <p>💰 {formatarValor(appointment.valor)}</p>
                            </>
                          )}
                        </div>
                        <div className={styles.agendamentoAcoes}>
                          <span className={`${styles.status} ${styles[appointment.status]}`}>
                            {nomeStatus[appointment.status] || appointment.status}
                          </span>
                          <div className={styles.botoesAcao}>
                            {editandoId === appointment.id ? (
                              <button
                                className={styles.btnEditar}
                                disabled={salvandoId === appointment.id}
                                onClick={() => handleSalvar(appointment)}
                              >
                                {salvandoId === appointment.id ? 'Salvando...' : '💾 Salvar'}
                              </button>
                            ) : appointment.status === 'pending' && (
                              <button className={styles.btnEditar} onClick={() => handleEditar(appointment)}>
                                ✏️ Editar
                              </button>
                            )}
                            {appointment.status !== 'cancelled' && (
                              <button
                                className={styles.btnCancelar}
                                disabled={salvandoId === appointment.id}
                                onClick={() => handleCancelar(appointment.id)}
                              >
                                ✕ Cancelar
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
              </div>
            </div>

            <div className={styles.card}>
              <h3 className={styles.cardTitulo}>🕐 Histórico de Serviços</h3>
              <div className={styles.agendamentoLista}>
                {historico.map((item) => (
                  <div key={item.id} className={`${styles.agendamentoItem} ${styles.historico}`}>
                    <div className={styles.agendamentoIcone}>✓</div>
                    <div className={styles.agendamentoInfo}>
                      <h4>{item.servico}</h4>
                      <p>👤 Com {item.profissional}</p>
                      <p>📆 {formatarData(item.data)} às {item.hora}</p>
                      <p>💰 {formatarValor(item.valor)}</p>
                    </div>
                    <span className={`${styles.status} ${styles.concluido}`}>
                      {nomeStatus[item.status] || 'Concluído'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
