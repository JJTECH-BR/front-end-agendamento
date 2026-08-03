import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Dashboard.module.css'

function Dashboard() {
  const navigate = useNavigate()
  const [dataAtual, setDataAtual] = useState(new Date())
  const [mesSelecionado, setMesSelecionado] = useState(new Date())

  // Dados mockados por enquanto (depois virão da API)
  const usuario = { name: 'Juliana Freitas' }
  const [agendamentos, setAgendamentos] = useState([
    
    {
      id: 1,
      servico: 'Corte de Cabelo',
      profissional: 'Ana Paula',
      data: '2026-06-05',
      hora: '14:00',
      valor: 80.00,
      status: 'confirmado'
    },
    {
      id: 2,
      servico: 'Manicure',
      profissional: 'Carla Silva',
      data: '2026-06-10',
      hora: '10:00',
      valor: 45.00,
      status: 'pendente'
    },
    {
      id: 3,
      servico: 'Coloração',
      profissional: 'Ana Paula',
      data: '2026-06-15',
      hora: '09:00',
      valor: 150.00,
      status: 'confirmado'
    }
    
  ])
  const [editandoId, setEditandoId] = useState(null)
const [editandoDados, setEditandoDados] = useState({})

  const handleCancelar = (id) => {
    const confirmar = window.confirm('Tem certeza que deseja cancelar este agendamento?')
    if (confirmar) {
      setAgendamentos(agendamentos.filter(a => a.id !== id))
    }
  }

  const handleEditar = (agendamento) => {
  setEditandoId(agendamento.id)
  setEditandoDados({
    hora: agendamento.hora,
    data: agendamento.data
  })
}

const handleSalvar = (id) => {
  setAgendamentos(agendamentos.map(a =>
    a.id === id ? { ...a, ...editandoDados } : a
  ))
  setEditandoId(null)
  setEditandoDados({})
}

  const proximosAgendamentos = [
    {
      id: 1,
      servico: 'Corte de Cabelo',
      profissional: 'Ana Paula',
      data: '2026-06-05',
      hora: '14:00',
      valor: 80.00,
      status: 'confirmado'
    },
    {
      id: 2,
      servico: 'Manicure',
      profissional: 'Carla Silva',
      data: '2026-06-10',
      hora: '10:00',
      valor: 45.00,
      status: 'pendente'
    },
    {
      id: 3,
      servico: 'Coloração',
      profissional: 'Ana Paula',
      data: '2026-06-15',
      hora: '09:00',
      valor: 150.00,
      status: 'confirmado'
    }
  ]

  const historico = [
    {
      id: 4,
      servico: 'Escova',
      profissional: 'Ana Paula',
      data: '2026-05-20',
      hora: '11:00',
      valor: 60.00,
      status: 'concluido'
    },
    {
      id: 5,
      servico: 'Manicure',
      profissional: 'Carla Silva',
      data: '2026-05-10',
      hora: '15:00',
      valor: 45.00,
      status: 'concluido'
    }
  ]

  // Gera os dias do calendário
  const gerarDiasDoMes = (data) => {
    const ano = data.getFullYear()
    const mes = data.getMonth()
    const primeiroDia = new Date(ano, mes, 1).getDay()
    const totalDias = new Date(ano, mes + 1, 0).getDate()
    const dias = []

    for (let i = 0; i < primeiroDia; i++) {
      dias.push(null)
    }
    for (let i = 1; i <= totalDias; i++) {
      dias.push(i)
    }
    return dias
  }

  const diasComAgendamento = proximosAgendamentos.map(a => {
    const data = new Date(a.data)
    if (
      data.getMonth() === mesSelecionado.getMonth() &&
      data.getFullYear() === mesSelecionado.getFullYear()
    ) {
      return data.getDate()
    }
    return null
  }).filter(Boolean)

  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  const semana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  const mesAnterior = () => {
    setMesSelecionado(new Date(mesSelecionado.getFullYear(), mesSelecionado.getMonth() - 1))
  }

  const proximoMes = () => {
    setMesSelecionado(new Date(mesSelecionado.getFullYear(), mesSelecionado.getMonth() + 1))
  }

  const handleSair = () => {
    localStorage.removeItem('token')
    navigate('/')
  }

  const formatarData = (dataStr) => {
    const data = new Date(dataStr + 'T00:00:00')
    return data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
  }

  const formatarValor = (valor) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  return (
    <div className={styles.pagina}>

      {/* NAVBAR */}
      <nav className={styles.navbar}>
        <div className={styles.navLogo}>
          <div className={styles.logoCirculo}>JJ</div>
          <span>Studio JJ Tech</span>
        </div>
        <div className={styles.navDireita}>
          <span className={styles.navUsuario}>👤 {usuario.name}</span>
          <button className={styles.btnSair} onClick={handleSair}>Sair</button>
        </div>
      </nav>

      <div className={styles.container}>

        {/* BOAS VINDAS */}
        <div className={styles.boasVindas}>
          <div>
            <h1>Olá, {usuario.name.split(' ')[0]}! 👋</h1>
            <p>Bem-vinda ao seu painel de agendamentos</p>
          </div>
          <button
            className={styles.btnNovoAgendamento}
            onClick={() => navigate('/agendar')}
          >
            + Novo Agendamento
          </button>
        </div>

        {/* CARDS DE RESUMO */}
        <div className={styles.resumoGrid}>
          <div className={styles.resumoCard}>
            <div className={styles.resumoIcone}>📅</div>
            <div>
              <p className={styles.resumoNumero}>{agendamentos.length}</p>
              <p className={styles.resumoLabel}>Próximos Agendamentos</p>
            </div>
          </div>
          <div className={styles.resumoCard}>
            <div className={styles.resumoIcone}>✅</div>
            <div>
              <p className={styles.resumoNumero}>{historico.length}</p>
              <p className={styles.resumoLabel}>Serviços Realizados</p>
            </div>
          </div>
          <div className={styles.resumoCard}>
            <div className={styles.resumoIcone}>💰</div>
            <div>
              <p className={styles.resumoNumero}>
                {formatarValor(agendamentos.reduce((acc, a) => acc + a.valor, 0))}
              </p>
              <p className={styles.resumoLabel}>Total em Agendamentos</p>
            </div>
          </div>
        </div>

        <div className={styles.conteudoPrincipal}>

          {/* COLUNA ESQUERDA */}
          <div className={styles.colunaEsquerda}>

            {/* CALENDÁRIO */}
            <div className={styles.card}>
              <div className={styles.calendarioHeader}>
                <button onClick={mesAnterior} className={styles.btnMes}>‹</button>
                <h3>{meses[mesSelecionado.getMonth()]} {mesSelecionado.getFullYear()}</h3>
                <button onClick={proximoMes} className={styles.btnMes}>›</button>
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
                      ${dia === null ? styles.diaVazio : ''}
                      ${dia === dataAtual.getDate() &&
                        mesSelecionado.getMonth() === dataAtual.getMonth() &&
                        mesSelecionado.getFullYear() === dataAtual.getFullYear()
                        ? styles.diaHoje : ''}
                      ${diasComAgendamento.includes(dia) ? styles.diaComAgendamento : ''}
                    `}
                  >
                    {dia}
                    {diasComAgendamento.includes(dia) && (
                      <span className={styles.ponto}></span>
                    )}
                  </div>
                ))}
              </div>
              <div className={styles.legendaCalendario}>
                <span><span className={styles.legendaPonto}></span> Agendamento marcado</span>
                <span><span className={styles.legendaHoje}></span> Hoje</span>
              </div>
            </div>

          </div>

          {/* COLUNA DIREITA */}
          <div className={styles.colunaDireita}>

            {/* PRÓXIMOS AGENDAMENTOS */}
            <div className={styles.card}>
              <h3 className={styles.cardTitulo}>📅 Próximos Agendamentos</h3>
              <div className={styles.agendamentoLista}>
              {agendamentos.map(agendamento => (
  <div key={agendamento.id} className={styles.agendamentoItem}>
    <div className={styles.agendamentoIcone}>✂️</div>
    <div className={styles.agendamentoInfo}>
      <h4>{agendamento.servico}</h4>
      <p>👤 Com {agendamento.profissional}</p>
      {editandoId === agendamento.id ? (
        <div className={styles.editandocampos}>
          <div className={styles.editandoCampo}>
            <label>Data:</label>
            <input
              type="date"
              value={editandoDados.data}
              onChange={(e) => setEditandoDados({...editandoDados, data: e.target.value})}
              className={styles.editandoInput}
            />
          </div>
          <div className={styles.editandoCampo}>
            <label>Horário:</label>
            <input
              type="time"
              value={editandoDados.hora}
              onChange={(e) => setEditandoDados({...editandoDados, hora: e.target.value})}
              className={styles.editandoInput}
            />
          </div>
        </div>
      ) : (
        <>
          <p>📆 {formatarData(agendamento.data)} às {agendamento.hora}</p>
          <p>💰 {formatarValor(agendamento.valor)}</p>
        </>
      )}
    </div>
    <div className={styles.agendamentoAcoes}>
      <span className={`${styles.status} ${styles[agendamento.status]}`}>
        {agendamento.status === 'confirmado' ? '✅ Confirmado' : '⏳ Pendente'}
      </span>
      <div className={styles.botoesAcao}>
        {editandoId === agendamento.id ? (
          <button
            className={styles.btnEditar}
            onClick={() => handleSalvar(agendamento.id)}
          >
            💾 Salvar
          </button>
        ) : (
          <button
            className={styles.btnEditar}
            onClick={() => handleEditar(agendamento)}
          >
            ✏️ Editar
          </button>
        )}
        <button
          className={styles.btnCancelar}
          onClick={() => handleCancelar(agendamento.id)}
        >
          ✕ Cancelar
        </button>
      </div>
    </div>
  </div>
))}
              </div>
            </div>

            {/* HISTÓRICO */}
            <div className={styles.card}>
              <h3 className={styles.cardTitulo}>🕐 Histórico de Serviços</h3>
              <div className={styles.agendamentoLista}>
                {historico.map(item => (
                  <div key={item.id} className={`${styles.agendamentoItem} ${styles.historico}`}>
                    <div className={styles.agendamentoIcone}>✓</div>
                    <div className={styles.agendamentoInfo}>
                      <h4>{item.servico}</h4>
                      <p>👤 Com {item.profissional}</p>
                      <p>📆 {formatarData(item.data)} às {item.hora}</p>
                      <p>💰 {formatarValor(item.valor)}</p>
                    </div>
                    <span className={`${styles.status} ${styles.concluido}`}>
                      ✅ Concluído
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