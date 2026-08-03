import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Agendar.module.css'

function Agendar() {
  const navigate = useNavigate()

  const [etapa, setEtapa] = useState(1)
  const [profissionalSelecionado, setProfissionalSelecionado] = useState(null)
  const [servicoSelecionado, setServicoSelecionado] = useState(null)
  const [dataSelecionada, setDataSelecionada] = useState(null)
  const [horarioSelecionado, setHorarioSelecionado] = useState(null)
  const [mesSelecionado, setMesSelecionado] = useState(new Date())

  const profissionais = [
    { id: 1, nome: 'Ana Paula', especialidade: 'Cabelos', inicial: 'A', servicos: [1, 2, 5] },
    { id: 2, nome: 'Carla Silva', especialidade: 'Unhas & Estética', inicial: 'C', servicos: [3, 4, 6] },
    { id: 3, nome: 'Juliana Freitas', especialidade: 'Sobrancelha & Depilação', inicial: 'J', servicos: [6, 4] },
  ]

  const servicos = [
    { id: 1, nome: 'Corte de Cabelo', duracao: '60 min', preco: 80.00 },
    { id: 2, nome: 'Coloração', duracao: '120 min', preco: 150.00 },
    { id: 3, nome: 'Manicure', duracao: '45 min', preco: 45.00 },
    { id: 4, nome: 'Pedicure', duracao: '50 min', preco: 50.00 },
    { id: 5, nome: 'Escova', duracao: '60 min', preco: 60.00 },
    { id: 6, nome: 'Sobrancelha', duracao: '30 min', preco: 35.00 },
  ]

  const horarios = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
  ]

  const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
  const semana = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']

  const servicosDisponiveis = profissionalSelecionado
    ? servicos.filter(s => profissionalSelecionado.servicos.includes(s.id))
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

  const isDiaPassado = (dia) => {
    if (!dia) return false
    const data = new Date(mesSelecionado.getFullYear(), mesSelecionado.getMonth(), dia)
    data.setHours(0,0,0,0)
    const hojeZero = new Date()
    hojeZero.setHours(0,0,0,0)
    return data < hojeZero
  }

  const formatarData = (dia) => {
    if (!dia) return ''
    const data = new Date(mesSelecionado.getFullYear(), mesSelecionado.getMonth(), dia)
    return data.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
  }

  const formatarValor = (valor) =>
    valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  const handleConfirmar = () => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
    } else {
      alert('Agendamento confirmado com sucesso!')
      navigate('/dashboard')
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
        <div className={styles.navLogo} onClick={() => navigate('/')}>
          <div className={styles.logoCirculo}>JJ</div>
          <span>Studio JJ Tech</span>
        </div>
        <button className={styles.btnVoltar} onClick={() => navigate('/')}>
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

            {/* ETAPA 1 — PROFISSIONAL */}
            {etapa === 1 && (
              <div className={styles.card}>
                <h2 className={styles.cardTitulo}>Escolha o Profissional</h2>
                <p className={styles.cardDesc}>Selecione com quem deseja realizar o atendimento</p>
                <div className={styles.profissionaisGrid}>
                  {profissionais.map(prof => (
                    <div
                      key={prof.id}
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
                </div>
              </div>
            )}

            {/* ETAPA 2 — SERVIÇO */}
            {etapa === 2 && (
              <div className={styles.card}>
                <h2 className={styles.cardTitulo}>Escolha o Serviço</h2>
                <p className={styles.cardDesc}>Serviços disponíveis com {profissionalSelecionado?.nome}</p>
                <div className={styles.servicosLista}>
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
                    onClick={() => setMesSelecionado(new Date(mesSelecionado.getFullYear(), mesSelecionado.getMonth() - 1))}
                  >‹</button>
                  <h3>{meses[mesSelecionado.getMonth()]} {mesSelecionado.getFullYear()}</h3>
                  <button
                    className={styles.btnMes}
                    onClick={() => setMesSelecionado(new Date(mesSelecionado.getFullYear(), mesSelecionado.getMonth() + 1))}
                  >›</button>
                </div>
                <div className={styles.calendarioSemana}>
                  {semana.map(d => <span key={d}>{d}</span>)}
                </div>
                <div className={styles.calendarioDias}>
                  {gerarDiasDoMes(mesSelecionado).map((dia, index) => (
                    <div
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
                      onClick={() => {
                        if (dia && !isDiaPassado(dia)) setDataSelecionada(dia)
                      }}
                    >
                      {dia}
                    </div>
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
                    <div
                      key={horario}
                      className={`${styles.horarioItem} ${
                        horarioSelecionado === horario ? styles.selecionado : ''
                      }`}
                      onClick={() => setHorarioSelecionado(horario)}
                    >
                      {horario}
                    </div>
                  ))}
                </div>
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
                  disabled={!podeContinuar()}
                >
                  ✓ Confirmar Agendamento
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