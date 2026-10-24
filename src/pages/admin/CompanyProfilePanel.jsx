import { useCallback, useEffect, useState } from 'react'
import api from '../../services/api'
import styles from './Admin.module.css'

const conteudoInicial = {
  sobre: { eyebrow: 'Sobre Nós', title: '', subtitle: '', description: '' },
  servicos: { eyebrow: 'Nossos Serviços', title: '', subtitle: '', description: '' },
  equipe: { eyebrow: 'Nossa Equipe', title: '', subtitle: '', description: '' },
  rodape: { description: '', weekdayHours: '', saturdayHours: '', sundayHours: '' },
}

const formularioInicial = {
  name: '',
  description: '',
  heroTitle: '',
  heroDescription: '',
  phone: '',
  address: '',
  openingTime: '09:00',
  closingTime: '17:00',
  closedDates: [],
  instagram: '',
  instagramUrl: '',
  pageContent: conteudoInicial,
}

function mensagemErro(error, fallback) {
  return error.response?.data?.error || fallback
}

function CompanyProfilePanel({ mode }) {
  const [form, setForm] = useState(formularioInicial)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [novaData, setNovaData] = useState('')
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const carregarEmpresa = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get('/company')
      setForm({
        ...formularioInicial,
        ...data,
        closedDates: data.closedDates || [],
        pageContent: {
          ...conteudoInicial,
          ...(data.pageContent || {}),
        },
      })
    } catch (requestError) {
      setError(mensagemErro(requestError, 'Não foi possível carregar os dados da empresa.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    carregarEmpresa()
  }, [carregarEmpresa])

  const updateContent = (section, field, value) => {
    setForm((current) => ({
      ...current,
      pageContent: {
        ...current.pageContent,
        [section]: {
          ...current.pageContent[section],
          [field]: value,
        },
      },
    }))
  }

  const salvar = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    const data = mode === 'content'
      ? {
          heroTitle: form.heroTitle.trim() || null,
          heroDescription: form.heroDescription.trim() || null,
          description: form.description.trim() || null,
          pageContent: form.pageContent,
        }
      : {
          name: form.name.trim(),
          phone: form.phone.trim() || null,
          address: form.address.trim() || null,
          openingTime: form.openingTime,
          closingTime: form.closingTime,
          closedDates: form.closedDates,
          instagram: form.instagram.trim() || null,
          instagramUrl: form.instagramUrl.trim() || null,
        }

    try {
      const { data: saved } = await api.patch('/company', data)
      setForm((current) => ({ ...current, ...saved }))
      setSuccess('Informações salvas no banco de dados.')
    } catch (requestError) {
      setError(mensagemErro(requestError, 'Não foi possível salvar as informações.'))
    } finally {
      setSaving(false)
    }
  }

  const adicionarData = () => {
    if (!novaData || form.closedDates.includes(novaData)) return
    setForm((current) => ({
      ...current,
      closedDates: [...current.closedDates, novaData].sort(),
    }))
    setNovaData('')
  }

  const alterarSenha = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('A confirmação da nova senha não corresponde.')
      return
    }

    setSaving(true)
    try {
      await api.patch('/company/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setSuccess('Senha alterada com sucesso.')
    } catch (requestError) {
      setError(mensagemErro(requestError, 'Não foi possível alterar a senha.'))
    } finally {
      setSaving(false)
    }
  }

  const isContent = mode === 'content'
  const sectionField = (section, field, label, multiline = false) => (
    <label className={`${styles.formGrupo} ${multiline ? styles.formGrupoLargo : ''}`} key={`${section}-${field}`}>
      {label}
      {multiline ? (
        <textarea
          className={styles.input}
          rows="3"
          maxLength="2000"
          value={form.pageContent[section]?.[field] || ''}
          onChange={(event) => updateContent(section, field, event.target.value)}
        />
      ) : (
        <input
          className={styles.input}
          maxLength="160"
          value={form.pageContent[section]?.[field] || ''}
          onChange={(event) => updateContent(section, field, event.target.value)}
        />
      )}
    </label>
  )

  const input = (field, label, options = {}) => (
    <label className={`${styles.formGrupo} ${options.wide ? styles.formGrupoLargo : ''}`} key={field}>
      {label}
      <input
        className={styles.input}
        type={options.type || 'text'}
        maxLength={options.maxLength || 500}
        required={options.required}
        value={form[field] || ''}
        onChange={(event) => setForm((current) => ({ ...current, [field]: event.target.value }))}
      />
    </label>
  )

  if (loading) {
    return <section className={styles.catalogo}><p className={styles.placeholder}>Carregando dados...</p></section>
  }

  return (
    <section className={styles.catalogo}>
      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.cardTitulo}>{isContent ? 'Conteúdo da página' : 'Configurações da empresa'}</h2>
          <p className={styles.sectionDescription}>
            {isContent
              ? 'Edite textos e títulos exibidos na página pública da empresa.'
              : 'Gerencie os dados de contato, funcionamento e segurança da conta.'}
          </p>
        </div>
      </div>

      {error && <p className={styles.feedbackErro} role="alert">{error}</p>}
      {success && <p className={styles.feedbackSucesso} role="status">{success}</p>}

      {isContent ? (
        <form className={styles.formCards} onSubmit={salvar}>
          <section className={styles.card}>
            <h3 className={styles.cardTitulo}>Página inicial</h3>
            <div className={styles.formGrid}>
              {input('heroTitle', 'Título principal', { wide: true, maxLength: 120 })}
              <label className={`${styles.formGrupo} ${styles.formGrupoLargo}`}>
                Apresentação
                <textarea className={styles.input} rows="3" maxLength="500" value={form.heroDescription}
                  onChange={(event) => setForm((current) => ({ ...current, heroDescription: event.target.value }))} />
              </label>
            </div>
          </section>

          <section className={styles.card}>
            <h3 className={styles.cardTitulo}>Sobre nós</h3>
            <div className={styles.formGrid}>
              {sectionField('sobre', 'eyebrow', 'Subtítulo da seção')}
              {sectionField('sobre', 'title', 'Título da seção')}
              {sectionField('sobre', 'subtitle', 'Frase de destaque')}
              {sectionField('sobre', 'description', 'Descrição', true)}
            </div>
          </section>

          <section className={styles.card}>
            <h3 className={styles.cardTitulo}>Serviços</h3>
            <div className={styles.formGrid}>
              {sectionField('servicos', 'eyebrow', 'Subtítulo da seção')}
              {sectionField('servicos', 'title', 'Título da seção')}
              {sectionField('servicos', 'subtitle', 'Frase de destaque')}
              {sectionField('servicos', 'description', 'Descrição', true)}
            </div>
          </section>

          <section className={styles.card}>
            <h3 className={styles.cardTitulo}>Equipe</h3>
            <div className={styles.formGrid}>
              {sectionField('equipe', 'eyebrow', 'Subtítulo da seção')}
              {sectionField('equipe', 'title', 'Título da seção')}
              {sectionField('equipe', 'subtitle', 'Frase de destaque')}
              {sectionField('equipe', 'description', 'Descrição', true)}
            </div>
          </section>

          <section className={styles.card}>
            <h3 className={styles.cardTitulo}>Rodapé</h3>
            <div className={styles.formGrid}>
              {sectionField('rodape', 'description', 'Descrição da marca', true)}
              {sectionField('rodape', 'weekdayHours', 'Horário durante a semana')}
              {sectionField('rodape', 'saturdayHours', 'Horário de sábado')}
              {sectionField('rodape', 'sundayHours', 'Horário de domingo/feriados')}
            </div>
          </section>
          <div className={styles.formBtns}>
            <button type="submit" className={styles.btnSalvar} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar conteúdo'}
            </button>
          </div>
        </form>
      ) : (
        <>
          <form className={styles.card} onSubmit={salvar}>
            <h3 className={styles.cardTitulo}>Dados da empresa</h3>
            <div className={styles.formGrid}>
              {input('name', 'Nome da empresa', { required: true, maxLength: 120 })}
              {input('phone', 'Telefone', { type: 'tel', maxLength: 40 })}
              {input('address', 'Endereço', { wide: true, maxLength: 300 })}
              {input('instagram', 'Usuário do Instagram')}
              {input('instagramUrl', 'Link do Instagram', { type: 'url' })}
            </div>
            <div className={styles.horariosConfig}>
              <h3 className={styles.cardTitulo}>Horário de funcionamento</h3>
              <p className={styles.sectionDescription}>Horários usados na página pública e para os novos agendamentos.</p>
              <div className={styles.formGrid}>
                <label className={styles.formGrupo}>
                  Abertura
                  <input className={styles.input} type="time" required value={form.openingTime}
                    onChange={(event) => setForm((current) => ({ ...current, openingTime: event.target.value }))} />
                </label>
                <label className={styles.formGrupo}>
                  Fechamento
                  <input className={styles.input} type="time" required value={form.closingTime}
                    onChange={(event) => setForm((current) => ({ ...current, closingTime: event.target.value }))} />
                </label>
              </div>
            </div>
            <div className={styles.closedDates}>
              <h3 className={styles.cardTitulo}>Dias fechados</h3>
              <p className={styles.sectionDescription}>Cadastre feriados e outras datas em que não haverá atendimento.</p>
              <div className={styles.addClosedDate}>
                <input className={styles.input} aria-label="Nova data fechada" type="date" value={novaData}
                  onChange={(event) => setNovaData(event.target.value)} />
                <button type="button" className={styles.btnSecundario} onClick={adicionarData} disabled={!novaData}>
                  + Adicionar data
                </button>
              </div>
              {form.closedDates.length ? (
                <ul className={styles.closedDateList}>
                  {form.closedDates.map((date) => (
                    <li key={date}>
                      <span>{new Date(`${date}T12:00:00`).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      <button type="button" aria-label={`Remover ${date}`} onClick={() => setForm((current) => ({
                        ...current,
                        closedDates: current.closedDates.filter((item) => item !== date),
                      }))}>Remover</button>
                    </li>
                  ))}
                </ul>
              ) : <p className={styles.placeholder}>Nenhuma data fechada cadastrada.</p>}
            </div>
            <div className={styles.formBtns}>
              <button type="submit" className={styles.btnSalvar} disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar configurações'}
              </button>
            </div>
          </form>

          <form className={styles.card} onSubmit={alterarSenha}>
            <h3 className={styles.cardTitulo}>Segurança da conta</h3>
            <p className={styles.sectionDescription}>Altere a senha usada para acessar o painel administrativo.</p>
            <div className={styles.formGrid}>
              <label className={styles.formGrupo}>
                Senha atual
                <input className={styles.input} type="password" autoComplete="current-password" required
                  value={passwordForm.currentPassword}
                  onChange={(event) => setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))} />
              </label>
              <label className={styles.formGrupo}>
                Nova senha
                <input className={styles.input} type="password" minLength="8" autoComplete="new-password" required
                  value={passwordForm.newPassword}
                  onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))} />
              </label>
              <label className={styles.formGrupo}>
                Confirmar nova senha
                <input className={styles.input} type="password" minLength="8" autoComplete="new-password" required
                  value={passwordForm.confirmPassword}
                  onChange={(event) => setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))} />
              </label>
            </div>
            <div className={styles.formBtns}>
              <button type="submit" className={styles.btnSalvar} disabled={saving}>
                {saving ? 'Salvando...' : 'Alterar senha'}
              </button>
            </div>
          </form>
        </>
      )}
    </section>
  )
}

export default CompanyProfilePanel
