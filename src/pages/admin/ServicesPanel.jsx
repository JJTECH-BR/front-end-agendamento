import { useCallback, useEffect, useState } from 'react'
import api from '../../services/api'
import styles from './Admin.module.css'

const formularioVazio = {
  name: '',
  description: '',
  price: '',
  duration: '',
  professionalId: '',
  active: true,
}

function mensagemErro(error, fallback) {
  return error.response?.data?.error || fallback
}

function ServicesPanel() {
  const [services, setServices] = useState([])
  const [professionals, setProfessionals] = useState([])
  const [form, setForm] = useState(formularioVazio)
  const [editingId, setEditingId] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const carregarDados = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      const [servicesResponse, professionalsResponse] = await Promise.all([
        api.get('/services'),
        api.get('/professionals'),
      ])
      setServices(servicesResponse.data)
      setProfessionals(professionalsResponse.data)
    } catch (requestError) {
      setLoadError(mensagemErro(requestError, 'Não foi possível carregar os serviços.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    carregarDados()
  }, [carregarDados])

  const abrirNovo = () => {
    setForm(formularioVazio)
    setEditingId(null)
    setError('')
    setShowModal(true)
  }

  const abrirEdicao = (service) => {
    setForm({
      name: service.name,
      description: service.description || '',
      price: String(service.price),
      duration: String(service.duration),
      professionalId: service.professionalId || '',
      active: service.active,
    })
    setEditingId(service.id)
    setError('')
    setShowModal(true)
  }

  const salvar = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')

    const data = {
      ...form,
      price: Number(form.price),
      duration: Number(form.duration),
      professionalId: form.professionalId || null,
      description: form.description.trim() || null,
    }

    try {
      if (editingId) {
        await api.patch(`/services/${editingId}`, data)
      } else {
        await api.post('/services', data)
      }
      setShowModal(false)
      await carregarDados()
    } catch (requestError) {
      setError(mensagemErro(requestError, 'Não foi possível salvar o serviço.'))
    } finally {
      setSaving(false)
    }
  }

  const alternarAtivo = async (service) => {
    setError('')
    try {
      await api.patch(`/services/${service.id}`, { active: !service.active })
      await carregarDados()
    } catch (requestError) {
      setError(mensagemErro(requestError, 'Não foi possível alterar o status do serviço.'))
    }
  }

  const excluir = async (service) => {
    if (!window.confirm(`Excluir o serviço "${service.name}"?`)) return

    setError('')
    setNotice('')
    try {
      const { data } = await api.delete(`/services/${service.id}`)
      setNotice(data?.archived
        ? 'O serviço foi desativado para preservar os agendamentos anteriores.'
        : 'Serviço excluído.')
      await carregarDados()
    } catch (requestError) {
      setError(mensagemErro(requestError, 'Não foi possível excluir o serviço.'))
    }
  }

  const formatarValor = (valor) =>
    Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <section className={styles.catalogo}>
      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.cardTitulo}>Serviços</h2>
          <p className={styles.sectionDescription}>Gerencie os serviços oferecidos pela sua empresa.</p>
        </div>
        <button type="button" className={styles.btnAdicionar} onClick={abrirNovo}>
          + Adicionar
        </button>
      </div>

      {error && <p className={styles.feedbackErro} role="alert">{error}</p>}
      {notice && <p className={styles.feedbackSucesso} role="status">{notice}</p>}
      {loading ? (
        <p className={styles.placeholder}>Carregando serviços...</p>
      ) : loadError ? (
        <div className={styles.feedbackErro} role="alert">
          <p>{loadError}</p>
          <button type="button" className={styles.retryButton} onClick={carregarDados}>
            Tentar novamente
          </button>
        </div>
      ) : services.length === 0 ? (
        <p className={styles.placeholder}>Nenhum serviço cadastrado. Adicione o primeiro serviço.</p>
      ) : (
        <div className={styles.catalogoGrid}>
          {services.map((service) => (
            <article className={styles.catalogoCard} key={service.id}>
              <div className={styles.catalogoCardTopo}>
                <h3>{service.name}</h3>
                <span className={`${styles.statusTag} ${service.active ? styles.statusAtivo : styles.statusInativo}`}>
                  {service.active ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              <p className={styles.catalogoDescricao}>
                {service.description || 'Sem descrição'}
              </p>
              <p className={styles.catalogoProfissional}>
                {service.professional?.name || 'Sem profissional definido'}
                {service.professional?.specialty ? ` · ${service.professional.specialty}` : ''}
              </p>
              <div className={styles.catalogoDetalhes}>
                <span>{service.duration} min</span>
                <strong>{formatarValor(service.price)}</strong>
              </div>
              <div className={styles.cardActions}>
                <button type="button" onClick={() => alternarAtivo(service)}>
                  {service.active ? 'Ocultar' : 'Ativar'}
                </button>
                <button type="button" onClick={() => abrirEdicao(service)}>Editar</button>
                <button
                  type="button"
                  className={styles.actionDanger}
                  onClick={() => excluir(service)}
                >
                  Excluir
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {showModal && (
        <div className={styles.modalBackdrop} onMouseDown={(event) => {
          if (event.target === event.currentTarget) setShowModal(false)
        }}>
          <section className={`${styles.modal} ${styles.serviceModal}`} role="dialog" aria-modal="true" aria-labelledby="service-form-title">
            <div className={styles.modalHeader}>
              <h2 id="service-form-title">{editingId ? 'Editar serviço' : 'Novo serviço'}</h2>
              <button type="button" className={styles.modalClose} onClick={() => setShowModal(false)} aria-label="Fechar">
                ×
              </button>
            </div>
            <form onSubmit={salvar}>
              <div className={styles.serviceForm}>
                <label className={`${styles.formGrupo} ${styles.professionalField}`}>
                  Nome do serviço *
                  <input
                    className={styles.input}
                    required
                    placeholder="Ex: Corte Feminino, Manicure"
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                  />
                </label>
                <label className={`${styles.formGrupo} ${styles.professionalField}`}>
                  Profissional *
                  <select
                    className={styles.input}
                    required
                    value={form.professionalId}
                    onChange={(event) => setForm({ ...form, professionalId: event.target.value })}
                  >
                    <option value="">Selecione um profissional</option>
                    {professionals
                      .filter((professional) => professional.active || professional.id === form.professionalId)
                      .map((professional) => (
                      <option key={professional.id} value={professional.id} disabled={!professional.active}>
                        {professional.name}{professional.active ? '' : ' (Inativo)'}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={`${styles.formGrupo} ${styles.professionalField}`}>
                  Duração (minutos) *
                  <input
                    className={styles.input}
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={form.duration}
                    onChange={(event) => setForm({ ...form, duration: event.target.value })}
                  />
                </label>
                <label className={`${styles.formGrupo} ${styles.professionalField}`}>
                  Preço (R$) *
                  <input
                    className={styles.input}
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={form.price}
                    onChange={(event) => setForm({ ...form, price: event.target.value })}
                  />
                </label>
                <label className={`${styles.formGrupo} ${styles.professionalField}`}>
                  Descrição
                  <textarea
                    className={`${styles.input} ${styles.professionalTextarea}`}
                    rows="2"
                    placeholder="Descrição do serviço"
                    value={form.description}
                    onChange={(event) => setForm({ ...form, description: event.target.value })}
                  />
                </label>
              </div>
              <label className={`${styles.toggleLabel} ${styles.professionalToggle}`}>
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(event) => setForm({ ...form, active: event.target.checked })}
                />
                Serviço ativo
              </label>
              <div className={`${styles.formBtns} ${styles.professionalFormActions}`}>
                <button type="button" className={styles.btnCancelarForm} onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className={styles.btnSalvar} disabled={saving}>
                  {saving ? 'Salvando...' : editingId ? 'Salvar' : 'Adicionar'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  )
}

export default ServicesPanel
