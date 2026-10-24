import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../services/api'
import { getSlug, urlDaEmpresa } from '../../services/company'
import styles from './Agendar.module.css'

function Agendar() {
  const navigate = useNavigate()
  const { slug: slugDaUrl } = useParams()
  const slug = slugDaUrl || getSlug()

  const [etapa, setEtapa] = useState(1)
  const [profissionalSelecionado, setProfissionalSelecionado] = useState(null)
  const [servicoSelecionado, setServicoSelecionado] = useState(null)
  const [dataSelecionada, setDataSelecionada] = useState(null)
  const [horarioSelecionado, setHorarioSelecionado] = useState(null)
  const [mesSelecionado, setMesSelecionado] = useState(new Date())
  const [profissionais, setProfissionais] = useState([])
  const [servicos, setServicos] = useState([])
  const [horarioEmpresa, setHorarioEmpresa] = useState({ abertura: '09:00', fechamento: '17:00', datasFechadas: [] })
  const [carregandoCatalogo, setCarregandoCatalogo] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  const carregarCatalogo = useCallback(async () => {
    setCarregandoCatalogo(true)
    setErro('')
    try {
      const { data } = await api.get(`/public/companies/${encodeURIComponent(slug)}`)
      setProfissionais((data.users || data.professionals || []).map((professional) => ({
        id: professional.id,
        nome: professional.name,
        especialidade: professional.specialty || 'Profissional',
        inicial: professional.name.charAt(0).toUpperCase(),
        schedules: professional.schedules || [],
      })))
      setServicos(data.services.map((service) => ({
        id: service.id,
        nome: service.name,
        duracao: `${service.duration} min`,
        minutos: service.duration,
        preco: Number(service.price),
        professionalId: service.professionalId,
      })))
      setHorarioEmpresa({
        abertura: data.openingTime || '09:00',
        fechamento: data.closingTime || '17:00',
        datasFechadas: data.closedDates || [],
      })
    } catch (requestError) {
      setErro(requestError.response?.data?.error || 'Não foi possível carregar os serviços desta empresa.')
    } finally {
      setCarregandoCatalogo(false)
    }
  }, [slug])

  useEffect(() => {
    carregarCatalogo()
  }, [carregarCatalogo])

  const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
  const semana = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']

  const servicosDisponiveis = profissionalSelecionado
    ? servicos.filter((service) => !service.professionalId || service.professionalId === profissionalSelecionado.id)
    : []

  const gerarDiasDoMes = (data) => {
    const ano = data.getFullYear()
    const mes = data.getMonth()
    const primeiroDia = new Date(ano, mes, 1).getDay()
    const totalDias = new Date(ano, mes + 1, 0).getDate()
    const dias = []
    for (let i = 0; i < primeiroDia; i++) dias.push(null)
    for (let i = 1; i <= totalDias; i++) dias.push(i)
    return dias
  }

  const hoje = new Date()
  const profissionalTemHorarios = Boolean(profissionalSelecionado?.schedules.length)
  const diaDaSemanaSelecionado = dataSelecionada
    ? new Date(mesSelecionado.getFullYear(), mesSelecionado.getMonth(), dataSelecionada).getDay()
    : null
  const horarioDoDia = diaDaSemanaSelecionado === null
    ? null
    : profissionalSelecionado?.schedules.find((schedule) => schedule.dayOfWeek === diaDaSemanaSelecionado)
  const diaDisponivel = !profissionalTemHorarios || Boolean(horarioDoDia?.available)
  const [aberturaHora, aberturaMinuto] = horarioEmpresa.abertura.split(':').map(Number)
  const [fechamentoHora, fechamentoMinuto] = horarioEmpresa.fechamento.split(':').map(Number)
  const inicioEmpresa = aberturaHora * 60 + aberturaMinuto
  const fimEmpresa = fechamentoHora * 60 + fechamentoMinuto
  const inicioProfissional = horarioDoDia
    ? horarioDoDia.startTime.split(':').map(Number).reduce((hours, minutes) => hours * 60 + minutes)
    : inicioEmpresa
  const fimProfissional = horarioDoDia
    ? horarioDoDia.endTime.split(':').map(Number).reduce((hours, minutes) => hours * 60 + minutes)
    : fimEmpresa
  const inicioExpediente = Math.max(inicioEmpresa, inicioProfissional)
  const fimExpediente = Math.min(fimEmpresa, fimProfissional)
  const duracaoSelecionada = servicoSelecionado?.minutos || 30
  const horarios = []
  for (let minutos = inicioExpediente; diaDisponivel && minutos + duracaoSelecionada <= fimExpediente; minutos += 30) {
    const horario = `${String(Math.floor(minutos / 60)).padStart(2, '0')}:${String(minutos % 60).padStart(2, '0')}`
    const dataHora = new Date(
      mesSelecionado.getFullYear(),
      mesSelecionado.getMonth(),
      dataSelecionada || 1,
      Math.floor(minutos / 60),
      minutos % 60,
    )
    if (!dataSelecionada || dataHora > new Date()) horarios.push(horario)
  }

  const chaveData = (ano, mes, dia) =>
    `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`

  const isDiaFechado = (dia) => Boolean(dia && horarioEmpresa.datasFechadas.includes(
    chaveData(mesSelecionado.getFullYear(), mesSelecionado.getMonth(), dia),
  ))

  const isDiaSemExpediente = (dia) => {
    if (!dia || !profissionalTemHorarios) return false
    const dayOfWeek = new Date(mesSelecionado.getFullYear(), mesSelecionado.getMonth(), dia).getDay()
    return !profissionalSelecionado.schedules.some(
      (schedule) => schedule.dayOfWeek === dayOfWeek && schedule.available,
    )
  }

  const isDiaPassado = (dia) => {
    if (!dia) return false
    const data = new Date(mesSelecionado.getFullYear(), mesSelecionado.getMonth(), dia)
    data.setHours(0,0,0,0)
    const hojeZero = new Date()
    hojeZero.setHours(0,0,0,0)
    return data < hojeZero || isDiaFechado(dia) || isDiaSemExpediente(dia)
  }

  const formatarData = (dia) => {
    if (!dia) return ''
    const data = new Date(mesSelecionado.getFullYear(), mesSelecionado.getMonth(), dia)
    return data.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
  }

  const formatarValor = (valor) =>
    valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  const handleConfirmar = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate(urlDaEmpresa('login', slug))
      return
    }

    setSalvando(true)
    setErro('')
    try {
      const dataHora = new Date(
        mesSelecionado.getFullYear(),
        mesSelecionado.getMonth(),
        dataSelecionada,
        Number(horarioSelecionado.slice(0, 2)),
        Number(horarioSelecionado.slice(3, 5)),
      )
      await api.post('/appointments', {
        serviceId: servicoSelecionado.id,
        professionalId: profissionalSelecionado.id,
        date: dataHora.toISOString(),
      })
      navigate(urlDaEmpresa('dashboard', slug))
    } catch (requestError) {
      setErro(requestError.response?.data?.error || 'Não foi possível salvar o agendamento.')
    } finally {
      setSalvando(false)
    }
  }

  const podeContinuar = () => {
    if (etapa === 1) return profissionalSelecionado !== null
    if (etapa === 2) return servicoSelecionado !== null
    if (etapa === 3) return dataSelecionada !== null
    if (etapa === 4) return horarioSelecionado !== null
    return false
  }

  return (
    <div className={styles.pagina}>

      {/* NAVBAR */}
      <nav className={styles.navbar}>
        <div className={styles.navLogo} onClick={() => navigate(urlDaEmpresa('', slug))}>
          <div className={styles.logoCirculo}>JJ</div>
          <span>JJTech</span>
        </div>
        <button className={styles.btnVoltar} onClick={() => navigate(urlDaEmpresa('', slug))}>
          ← Voltar
        </button>
      </nav>

      <div className={styles.container}>

        {/* HEADER */}
        <div className={styles.header}>
          <h1>Agendar Horário</h1>
          <p>Siga os passos abaixo para concluir seu agendamento</p>
        </div>

        {/* PROGRESSO */}
        <div className={styles.progresso}>
          {['Profissional', 'Serviço', 'Data', 'Horário'].map((label, index) => (
            <div key={index} className={styles.progressoItem}>
              <div className={`${styles.progressoCirculo} ${
                etapa > index + 1 ? styles.progressoConcluido :
                etapa === index + 1 ? styles.progressoAtivo : ''
              }`}>
                {etapa > index + 1 ? '✓' : index + 1}
              </div>
              <span className={`${styles.progressoLabel} ${
                etapa === index + 1 ? styles.progressoLabelAtivo : ''
              }`}>{label}</span>
              {index < 3 && <div className={`${styles.progressoLinha} ${
                etapa > index + 1 ? styles.progressoLinhaAtiva : ''
              }`}></div>}
            </div>
          ))}
        </div>

        <div className={styles.conteudo}>

          {/* COLUNA PRINCIPAL */}
          <div className={styles.colunaPrincipal}>
            {erro && <p className={styles.erro} role="alert">{erro}</p>}

            {/* ETAPA 1 — PROFISSIONAL */}
            {etapa === 1 && (
              <div className={styles.card}>
                <h2 className={styles.cardTitulo}>Escolha o Profissional</h2>
                <p className={styles.cardDesc}>Selecione com quem deseja realizar o atendimento</p>
                {carregandoCatalogo ? (
                  <p role="status">Carregando profissionais e serviços...</p>
                ) : profissionais.length === 0 ? (
                  <p>Nenhum profissional ativo está cadastrado nesta empresa.</p>
                ) : <div className={styles.profissionaisGrid}>
                  {profissionais.map(prof => (
                    <div
                      key={prof.id}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          setProfissionalSelecionado(prof)
                          setServicoSelecionado(null)
                        }
                      }}
                      className={`${styles.profissionalCard} ${
                        profissionalSelecionado?.id === prof.id ? styles.selecionado : ''
                      }`}
                      onClick={() => {
                        setProfissionalSelecionado(prof)
                        setServicoSelecionado(null)
                      }}
                    >
                      <div className={styles.profAvatar}>{prof.inicial}</div>
                      <h3>{prof.nome}</h3>
                      <p>{prof.especialidade}</p>
                      {profissionalSelecionado?.id === prof.id && (
                        <span className={styles.selecionadoBadge}>✓ Selecionado</span>
                      )}
                    </div>
                  ))}
                </div>}
              </div>
            )}

            {/* ETAPA 2 — SERVIÇO */}
            {etapa === 2 && (
              <div className={styles.card}>
                <h2 className={styles.cardTitulo}>Escolha o Serviço</h2>
                <p className={styles.cardDesc}>Serviços disponíveis com {profissionalSelecionado?.nome}</p>
                {servicosDisponiveis.length === 0 ? (
                  <p>Não há serviços ativos para este profissional.</p>
                ) : <div className={styles.servicosLista}>
                  {servicosDisponiveis.map(servico => (
                    <div
                      key={servico.id}
                      className={`${styles.servicoItem} ${
                        servicoSelecionado?.id === servico.id ? styles.selecionado : ''
                      }`}
                      onClick={() => setServicoSelecionado(servico)}
                    >
                      <div className={styles.servicoItemInfo}>
                        <h3>{servico.nome}</h3>
                        <span>⏱ {servico.duracao}</span>
                      </div>
                      <div className={styles.servicoItemDireita}>
                        <span className={styles.servicoPreco}>{formatarValor(servico.preco)}</span>
                        {servicoSelecionado?.id === servico.id && (
                          <span className={styles.selecionadoBadge}>✓</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                }
              </div>
            )}

            {/* ETAPA 3 — DATA */}
            {etapa === 3 && (
              <div className={styles.card}>
                <h2 className={styles.cardTitulo}>Escolha a Data</h2>
                <p className={styles.cardDesc}>Selecione o dia do seu atendimento</p>
                <div className={styles.calendarioHeader}>
                  <button
                    className={styles.btnMes}
                    onClick={() => {
                      setMesSelecionado(new Date(mesSelecionado.getFullYear(), mesSelecionado.getMonth() - 1))
                      setDataSelecionada(null)
                      setHorarioSelecionado(null)
                    }}
                  >‹</button>
                  <h3>{meses[mesSelecionado.getMonth()]} {mesSelecionado.getFullYear()}</h3>
                  <button
                    className={styles.btnMes}
                    onClick={() => {
                      setMesSelecionado(new Date(mesSelecionado.getFullYear(), mesSelecionado.getMonth() + 1))
                      setDataSelecionada(null)
                      setHorarioSelecionado(null)
                    }}
                  >›</button>
                </div>
                <div className={styles.calendarioSemana}>
                  {semana.map(d => <span key={d}>{d}</span>)}
                </div>
                <div className={styles.calendarioDias}>
                  {gerarDiasDoMes(mesSelecionado).map((dia, index) => (
                    <button
                      type="button"
                      key={index}
                      className={`
                        ${styles.dia}
                        ${!dia ? styles.diaVazio : ''}
                        ${isDiaPassado(dia) ? styles.diaPassado : ''}
                        ${dataSelecionada === dia &&
                          !isDiaPassado(dia) ? styles.diaSelecionado : ''}
                        ${dia === hoje.getDate() &&
                          mesSelecionado.getMonth() === hoje.getMonth() &&
                          mesSelecionado.getFullYear() === hoje.getFullYear()
                          ? styles.diaHoje : ''}
                      `}
                      disabled={!dia || isDiaPassado(dia)}
                      onClick={() => {
                        if (dia && !isDiaPassado(dia)) {
                          setDataSelecionada(dia)
                          setHorarioSelecionado(null)
                        }
                      }}
                    >
                      {dia}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ETAPA 4 — HORÁRIO */}
            {etapa === 4 && (
              <div className={styles.card}>
                <h2 className={styles.cardTitulo}>Escolha o Horário</h2>
                <p className={styles.cardDesc}>
                  Horários disponíveis para {formatarData(dataSelecionada)}
                </p>
                <div className={styles.horariosGrid}>
                  {horarios.map(horario => (
                    <button
                      type="button"
                      key={horario}
                      className={`${styles.horarioItem} ${
                        horarioSelecionado === horario ? styles.selecionado : ''
                      }`}
                      onClick={() => setHorarioSelecionado(horario)}
                    >
                      {horario}
                    </button>
                  ))}
                </div>
                {horarios.length === 0 && (
                  <p role="status">Não há horários disponíveis para este serviço dentro do expediente.</p>
                )}
              </div>
            )}

            {/* BOTÕES DE NAVEGAÇÃO */}
            <div className={styles.navegacao}>
              {etapa > 1 && (
                <button
                  className={styles.btnAnterior}
                  onClick={() => setEtapa(etapa - 1)}
                >
                  ← Anterior
                </button>
              )}
              {etapa < 4 ? (
                <button
                  className={styles.btnProximo}
                  onClick={() => podeContinuar() && setEtapa(etapa + 1)}
                  disabled={!podeContinuar()}
                >
                  Próximo →
                </button>
              ) : (
                <button
                  className={styles.btnConfirmar}
                  onClick={handleConfirmar}
                  disabled={!podeContinuar() || salvando}
                >
                  {salvando ? 'Salvando...' : '✓ Confirmar Agendamento'}
                </button>
              )}
            </div>

          </div>

          {/* RESUMO */}
          <div className={styles.resumo}>
            <div className={styles.resumoCard}>
              <h3>Seu Agendamento</h3>
              <div className={styles.resumoItens}>
                <div className={styles.resumoItem}>
                  <span className={styles.resumoIcone}>👤</span>
                  <div>
                    <p className={styles.resumoLabel}>Profissional</p>
                    <p className={styles.resumoValor}>
                      {profissionalSelecionado?.nome || 'Não selecionado'}
                    </p>
                  </div>
                </div>
                <div className={styles.resumoItem}>
                  <span className={styles.resumoIcone}>✂️</span>
                  <div>
                    <p className={styles.resumoLabel}>Serviço</p>
                    <p className={styles.resumoValor}>
                      {servicoSelecionado?.nome || 'Não selecionado'}
                    </p>
                  </div>
                </div>
                <div className={styles.resumoItem}>
                  <span className={styles.resumoIcone}>📅</span>
                  <div>
                    <p className={styles.resumoLabel}>Data</p>
                    <p className={styles.resumoValor}>
                      {dataSelecionada ? formatarData(dataSelecionada) : 'Não selecionado'}
                    </p>
                  </div>
                </div>
                <div className={styles.resumoItem}>
                  <span className={styles.resumoIcone}>⏰</span>
                  <div>
                    <p className={styles.resumoLabel}>Horário</p>
                    <p className={styles.resumoValor}>
                      {horarioSelecionado || 'Não selecionado'}
                    </p>
                  </div>
                </div>
                {servicoSelecionado && (
                  <div className={styles.resumoTotal}>
                    <span>Total</span>
                    <span>{formatarValor(servicoSelecionado.preco)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Agendar