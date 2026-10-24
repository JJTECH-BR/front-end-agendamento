import { useCallback, useEffect, useRef, useState } from 'react'
import api from '../../services/api'
import styles from './Admin.module.css'

const formularioVazio = {
  name: '',
  specialty: '',
  biography: '',
  profilePhoto: '',
  instagram: '',
  active: true,
}

const diasDaSemana = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
]
const horarioVazio = { dayOfWeek: '1', startTime: '09:00', endTime: '18:00', available: true }
const TAMANHO_MAXIMO_FOTO = 5 * 1024 * 1024
const TIPOS_DE_IMAGEM = ['image/jpeg', 'image/png', 'image/webp']

function mensagemErro(error, fallback) {
  const response = error.response
  const apiError = response?.data?.error
  if (apiError) return apiError

  if (response?.status === 404) {
    return 'A API não encontrou a rota de profissionais. Verifique se o front-end está apontando para a versão atual do backend.'
  }
  if (response?.status === 413) {
    return 'A requisição excedeu o limite aceito pelo backend. Reduza o tamanho da foto e tente novamente.'
  }
  if (!response) {
    return 'Não foi possível conectar à API. Verifique a variável VITE_API_URL e se o backend está em execução.'
  }

  const validationDetails = response.data?.details
  if (Array.isArray(validationDetails) && validationDetails.length > 0) {
    return validationDetails.map(({ field, message }) => (
      field ? `${field}: ${message}` : message
    )).join(' ')
  }

  return `${fallback} (HTTP ${response.status}). Confira os logs do backend para ver o motivo.`
}

function ProfessionalsPanel({ onHistory }) {
  const inputFotoRef = useRef(null)
  const [professionals, setProfessionals] = useState([])
  const [form, setForm] = useState(formularioVazio)
  const [scheduleForm, setScheduleForm] = useState(horarioVazio)
  const [editingId, setEditingId] = useState(null)
  const [scheduleProfessional, setScheduleProfessional] = useState(null)
  const [scheduleError, setScheduleError] = useState('')
  const [scheduleSaving, setScheduleSaving] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const carregarProfissionais = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      const response = await api.get('/professionals')
      setProfessionals(response.data)
    } catch (requestError) {
      setLoadError(mensagemErro(requestError, 'Não foi possível carregar a equipe.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    carregarProfissionais()
  }, [carregarProfissionais])

  const abrirNovo = () => {
    setForm(formularioVazio)
    setEditingId(null)
    setError('')
    setShowModal(true)
  }

  const abrirEdicao = (professional) => {
    setForm({
      name: professional.name,
      specialty: professional.specialty || '',
      biography: professional.biography || '',
      profilePhoto: professional.profilePhoto || '',
      instagram: professional.instagram || '',
      active: professional.active,
    })
    setEditingId(professional.id)
    setError('')
    setShowModal(true)
  }

  const abrirHorarios = (professional) => {
    setScheduleProfessional(professional)
    setScheduleForm(horarioVazio)
    setScheduleError('')
  }

  const salvarHorario = async (event) => {
    event.preventDefault()
    setScheduleSaving(true)
    setScheduleError('')
    try {
      await api.post(`/professionals/${scheduleProfessional.id}/schedules`, {
        ...scheduleForm,
        dayOfWeek: Number(scheduleForm.dayOfWeek),
      })
      const { data } = await api.get('/professionals')
      setProfessionals(data)
      setScheduleProfessional(data.find((item) => item.id === scheduleProfessional.id) || null)
    } catch (requestError) {
      setScheduleError(mensagemErro(requestError, 'Não foi possível salvar o horário.'))
    } finally {
      setScheduleSaving(false)
    }
  }

  const excluirHorario = async (scheduleId) => {
    setScheduleError('')
    try {
      await api.delete(`/professionals/${scheduleProfessional.id}/schedules/${scheduleId}`)
      const { data } = await api.get('/professionals')
      setProfessionals(data)
      setScheduleProfessional(data.find((item) => item.id === scheduleProfessional.id) || null)
    } catch (requestError) {
      setScheduleError(mensagemErro(requestError, 'Não foi possível excluir o horário.'))
    }
  }

  const selecionarFoto = (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    if (!TIPOS_DE_IMAGEM.includes(file.type)) {
      setError('Escolha uma imagem JPG, PNG ou WEBP.')
      return
    }
    if (file.size > TAMANHO_MAXIMO_FOTO) {
      setError('A imagem deve ter no máximo 5 MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        setError('Não foi possível ler a imagem selecionada.')
        return
      }
      setForm((current) => ({ ...current, profilePhoto: reader.result }))
      setError('')
    }
    reader.onerror = () => setError('Não foi possível ler a imagem selecionada.')
    reader.readAsDataURL(file)
  }

  const salvar = async (event) => {
    event.preventDefault()
    if (!form.name.trim() || !form.specialty.trim()) {
      setError('Informe o nome e a especialidade do profissional.')
      return
    }
    setSaving(true)
    setError('')

    const data = {
      name: form.name,
      specialty: form.specialty,
      biography: form.biography.trim() || null,
      profilePhoto: form.profilePhoto || null,
      instagram: form.instagram.trim().replace(/^@/, '') || null,
      active: form.active,
    }

    try {
      if (editingId) {
        await api.patch(`/professionals/${editingId}`, data)
      } else {
        await api.post('/professionals', data)
      }
      setShowModal(false)
      await carregarProfissionais()
    } catch (requestError) {
      setError(mensagemErro(requestError, 'Não foi possível salvar o profissional.'))
    } finally {
      setSaving(false)
    }
  }

  const alternarAtivo = async (professional) => {
    setError('')
    try {
      await api.patch(`/professionals/${professional.id}`, { active: !professional.active })
      await carregarProfissionais()
    } catch (requestError) {
      setError(mensagemErro(requestError, 'Não foi possível alterar o status.'))
    }
  }

  const excluir = async (professional) => {
    if (!window.confirm(`Excluir o profissional "${professional.name}"?`)) return

    setError('')
    setNotice('')
    try {
      const { data } = await api.delete(`/professionals/${professional.id}`)
      setNotice(data?.archived
        ? 'O profissional foi desativado para preservar o histórico e as associações.'
        : 'Profissional excluído.')
      await carregarProfissionais()
    } catch (requestError) {
      setError(mensagemErro(requestError, 'Não foi possível excluir o profissional.'))
    }
  }

  return (
    <section className={styles.catalogo}>
      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.cardTitulo}>Profissionais</h2>
          <p className={styles.sectionDescription}>Gerencie os membros da sua equipe.</p>
        </div>
        <button type="button" className={styles.btnAdicionar} onClick={abrirNovo}>
          + Adicionar
        </button>
      </div>

      {error && !showModal && <p className={styles.feedbackErro} role="alert">{error}</p>}
      {notice && <p className={styles.feedbackSucesso} role="status">{notice}</p>}
      {loading ? (
        <p className={styles.placeholder}>Carregando equipe...</p>
      ) : loadError ? (
        <div className={styles.feedbackErro} role="alert">
          <p>{loadError}</p>
          <button type="button" className={styles.retryButton} onClick={carregarProfissionais}>
            Tentar novamente
          </button>
        </div>
      ) : professionals.length === 0 ? (
        <p className={styles.placeholder}>Nenhum profissional cadastrado. Adicione o primeiro.</p>
      ) : (
        <div className={styles.catalogoGrid}>
          {professionals.map((professional) => (
            <article className={styles.catalogoCard} key={professional.id}>
              <div className={styles.professionalHeader}>
                <div className={styles.professionalAvatar} aria-hidden="true">
                  {professional.profilePhoto ? (
                    <img className={styles.professionalAvatarImage} src={professional.profilePhoto} alt="" />
                  ) : professional.name.charAt(0).toUpperCase()}
                </div>
                <div className={styles.professionalIdentity}>
                  <h3>{professional.name}</h3>
                  <span>{professional.specialty}</span>
                </div>
                <span className={`${styles.statusTag} ${professional.active ? styles.statusAtivo : styles.statusInativo}`}>
                  {professional.active ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              <p className={styles.catalogoDescricao}>
                {professional.biography || 'Biografia não informada.'}
              </p>
              <div className={styles.cardActions}>
                <button type="button" onClick={() => abrirHorarios(professional)}>Horários</button>
                <button type="button" onClick={onHistory}>Histórico</button>
                <button type="button" onClick={() => alternarAtivo(professional)}>
                  {professional.active ? 'Ocultar' : 'Ativar'}
                </button>
                <button type="button" onClick={() => abrirEdicao(professional)}>Editar</button>
                <button
                  type="button"
                  className={styles.actionDanger}
                  onClick={() => excluir(professional)}
                >
                  Excluir
                </button>
              </div>
              {professional.instagram && (
                <a
                  className={styles.professionalInstagram}
                  href={`https://www.instagram.com/${encodeURIComponent(professional.instagram.replace(/^@/, ''))}/`}
                  target="_blank"
                  rel="noreferrer"
                >
                  @{professional.instagram.replace(/^@/, '')}
                </a>
              )}
            </article>
          ))}
        </div>
      )}

      {showModal && (
        <div className={styles.modalBackdrop} onMouseDown={(event) => {
          if (event.target === event.currentTarget) setShowModal(false)
        }}>
          <section className={`${styles.modal} ${styles.professionalModal}`} role="dialog" aria-modal="true" aria-labelledby="professional-form-title">
            <div className={styles.modalHeader}>
              <h2 id="professional-form-title">{editingId ? 'Editar profissional' : 'Novo profissional'}</h2>
              <button type="button" className={styles.modalClose} onClick={() => setShowModal(false)} aria-label="Fechar">
                ×
              </button>
            </div>
            {error && <p className={styles.feedbackErro} role="alert">{error}</p>}
            <form onSubmit={salvar} noValidate>
              <div className={styles.professionalForm}>
                <label className={`${styles.formGrupo} ${styles.professionalField}`}>
                  Nome *
                  <input
                    className={styles.input}
                    placeholder="Nome do profissional"
                    required
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                  />
                </label>
                <label className={`${styles.formGrupo} ${styles.professionalField}`}>
                  Especialidade *
                  <input
                    className={styles.input}
                    placeholder="Ex: Cabeleireira, Manicure"
                    required
                    value={form.specialty}
                    onChange={(event) => setForm({ ...form, specialty: event.target.value })}
                  />
                </label>
                <label className={`${styles.formGrupo} ${styles.professionalField}`}>
                  Descrição
                  <textarea
                    className={`${styles.input} ${styles.professionalTextarea}`}
                    rows="2"
                    placeholder="Breve descrição do profissional"
                    value={form.biography}
                    onChange={(event) => setForm({ ...form, biography: event.target.value })}
                  />
                </label>
                <div className={styles.formGrupo}>
                  <span className={styles.professionalFieldLabel}>Foto do profissional</span>
                  <input
                    ref={inputFotoRef}
                    className={styles.professionalFileInput}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={selecionarFoto}
                    aria-label="Selecionar foto do profissional"
                  />
                  <button
                    type="button"
                    className={styles.photoDropzone}
                    onClick={() => inputFotoRef.current?.click()}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault()
                      const file = event.dataTransfer.files?.[0]
                      if (file && inputFotoRef.current) {
                        const transfer = new DataTransfer()
                        transfer.items.add(file)
                        inputFotoRef.current.files = transfer.files
                        selecionarFoto({ target: inputFotoRef.current })
                      }
                    }}
                  >
                    {form.profilePhoto ? (
                      <>
                        <img src={form.profilePhoto} alt="Prévia da foto do profissional" />
                        <span>Trocar imagem</span>
                      </>
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 14v5h14v-5" />
                        </svg>
                        <span>Clique para selecionar uma imagem</span>
                        <small>JPG, PNG ou WEBP (máx. 5 MB)</small>
                      </>
                    )}
                  </button>
                  {form.profilePhoto && (
                    <button
                      type="button"
                      className={styles.removePhotoButton}
                      onClick={() => setForm({ ...form, profilePhoto: '' })}
                    >
                      Remover foto
                    </button>
                  )}
                </div>
                <label className={`${styles.formGrupo} ${styles.professionalField}`}>
                  Instagram (usuário)
                  <input
                    className={styles.input}
                    placeholder="@usuario ou usuario"
                    value={form.instagram}
                    onChange={(event) => setForm({ ...form, instagram: event.target.value })}
                  />
                  <small className={styles.fieldHint}>Digite apenas o nome de usuário, sem o link.</small>
                </label>
              </div>
              <label className={`${styles.toggleLabel} ${styles.professionalToggle}`}>
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(event) => setForm({ ...form, active: event.target.checked })}
                />
                Profissional ativo
              </label>
              <div className={`${styles.formBtns} ${styles.professionalFormActions}`}>
                <button type="button" className={styles.btnCancelarForm} onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className={styles.btnSalvar} disabled={saving}>
                  {saving ? 'Salvando...' : editingId ? 'Salvar alterações' : 'Adicionar'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {scheduleProfessional && (
        <div className={styles.modalBackdrop} onMouseDown={(event) => {
          if (event.target === event.currentTarget) setScheduleProfessional(null)
        }}>
          <section className={`${styles.modal} ${styles.scheduleModal}`} role="dialog" aria-modal="true" aria-labelledby="schedule-form-title">
            <div className={styles.modalHeader}>
              <h2 id="schedule-form-title">Horários de {scheduleProfessional.name}</h2>
              <button type="button" className={styles.modalClose} onClick={() => setScheduleProfessional(null)} aria-label="Fechar">
                ×
              </button>
            </div>
            {scheduleError && <p className={styles.feedbackErro} role="alert">{scheduleError}</p>}
            <form className={styles.scheduleForm} onSubmit={salvarHorario}>
              <label className={`${styles.formGrupo} ${styles.professionalField}`}>
                Dia da semana
                <select
                  className={styles.input}
                  value={scheduleForm.dayOfWeek}
                  onChange={(event) => setScheduleForm({ ...scheduleForm, dayOfWeek: event.target.value })}
                >
                  {diasDaSemana.map((day, index) => (
                    <option key={day} value={index}>{day}</option>
                  ))}
                </select>
              </label>
              <div className={styles.scheduleTimeFields}>
                <label className={`${styles.formGrupo} ${styles.professionalField}`}>
                  Início
                  <input
                    className={styles.input}
                    type="time"
                    required
                    value={scheduleForm.startTime}
                    onChange={(event) => setScheduleForm({ ...scheduleForm, startTime: event.target.value })}
                  />
                </label>
                <label className={`${styles.formGrupo} ${styles.professionalField}`}>
                  Fim
                  <input
                    className={styles.input}
                    type="time"
                    required
                    value={scheduleForm.endTime}
                    onChange={(event) => setScheduleForm({ ...scheduleForm, endTime: event.target.value })}
                  />
                </label>
              </div>
              <label className={`${styles.toggleLabel} ${styles.professionalToggle}`}>
                <input
                  type="checkbox"
                  checked={scheduleForm.available}
                  onChange={(event) => setScheduleForm({ ...scheduleForm, available: event.target.checked })}
                />
                Disponível
              </label>
              <button type="submit" className={`${styles.btnSalvar} ${styles.scheduleSaveButton}`} disabled={scheduleSaving}>
                {scheduleSaving ? 'Salvando...' : 'Salvar horário'}
              </button>
            </form>
            <div className={styles.scheduleList}>
              <h3>Horários cadastrados</h3>
              {scheduleProfessional.schedules?.length ? scheduleProfessional.schedules.map((schedule) => (
                <div className={`${styles.scheduleItem} ${schedule.available ? '' : styles.scheduleItemUnavailable}`} key={schedule.id}>
                  <div>
                    <strong>{diasDaSemana[schedule.dayOfWeek]}</strong>
                    <span>{schedule.startTime} – {schedule.endTime}</span>
                    <em>{schedule.available ? 'Disponível' : 'Indisponível'}</em>
                  </div>
                  <button type="button" onClick={() => excluirHorario(schedule.id)} aria-label={`Excluir horário de ${diasDaSemana[schedule.dayOfWeek]}`}>
                    ×
                  </button>
                </div>
              )) : (
                <p className={styles.scheduleEmpty}>Nenhum horário cadastrado. Enquanto isso, serão usados os horários da empresa.</p>
              )}
            </div>
          </section>
        </div>
      )}
    </section>
  )
}

export default ProfessionalsPanel
