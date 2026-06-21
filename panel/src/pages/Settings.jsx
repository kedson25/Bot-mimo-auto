import { useState, useEffect } from 'react'
import { fetchSettings, updateSettings } from '../utils/api'

export default function Settings() {
  const [settings, setSettings] = useState({
    botName: 'Eco Bot',
    personality: 'Amigavel e prestativo',
    language: 'pt',
    workingHours: { start: '08:00', end: '22:00' },
    fallbackMessage: 'Nao entendi. Pode reformular?',
    welcomeMessage: 'Ola! Como posso ajudar?'
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const data = await fetchSettings()
      setSettings(prev => ({ ...prev, ...data }))
    } catch (err) {
      console.error('Erro ao carregar config:', err)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      await updateSettings(settings)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error('Erro ao salvar:', err)
      alert('Erro ao salvar configuracoes')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div>
      <h1 style={styles.title}>Configuracoes</h1>
      <p style={styles.subtitle}>Configure o comportamento do seu bot</p>

      <div style={styles.grid}>
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>🤖 Identidade do Bot</h2>

          <div style={styles.field}>
            <label style={styles.label}>Nome do Bot</label>
            <input
              style={styles.input}
              value={settings.botName}
              onChange={e => handleChange('botName', e.target.value)}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Personalidade</label>
            <input
              style={styles.input}
              value={settings.personality}
              onChange={e => handleChange('personality', e.target.value)}
              placeholder="Ex: Amigavel, profissional, divertido..."
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Idioma</label>
            <select
              style={styles.select}
              value={settings.language}
              onChange={e => handleChange('language', e.target.value)}
            >
              <option value="pt">Portugues</option>
              <option value="es">Espanhol</option>
              <option value="en">Ingles</option>
            </select>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>💬 Mensagens</h2>

          <div style={styles.field}>
            <label style={styles.label}>Mensagem de Boas-vindas</label>
            <textarea
              style={styles.textarea}
              value={settings.welcomeMessage}
              onChange={e => handleChange('welcomeMessage', e.target.value)}
              rows={3}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Mensagem de Fallback</label>
            <textarea
              style={styles.textarea}
              value={settings.fallbackMessage}
              onChange={e => handleChange('fallbackMessage', e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}> Horario de Funcionamento</h2>

          <div style={styles.fieldRow}>
            <div style={styles.field}>
              <label style={styles.label}>Abertura</label>
              <input
                style={styles.input}
                type="time"
                value={settings.workingHours.start}
                onChange={e => handleChange('workingHours', {
                  ...settings.workingHours,
                  start: e.target.value
                })}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Fechamento</label>
              <input
                style={styles.input}
                type="time"
                value={settings.workingHours.end}
                onChange={e => handleChange('workingHours', {
                  ...settings.workingHours,
                  end: e.target.value
                })}
              />
            </div>
          </div>
        </div>
      </div>

      <div style={styles.footer}>
        {saved && <span style={styles.savedMsg}>✅ Salvo com sucesso!</span>}
        <button onClick={handleSave} style={styles.saveBtn} disabled={saving}>
          {saving ? 'Salvando...' : '💾 Salvar Configuracoes'}
        </button>
      </div>
    </div>
  )
}

const styles = {
  title: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 4
  },
  subtitle: {
    color: '#a0a0a0',
    fontSize: 14,
    marginBottom: 30
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: 24
  },
  section: {
    background: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: 12,
    padding: 24
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 20
  },
  field: {
    marginBottom: 16
  },
  fieldRow: {
    display: 'flex',
    gap: 16
  },
  label: {
    display: 'block',
    fontSize: 12,
    fontWeight: 500,
    color: '#a0a0a0',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    background: '#252525',
    border: '1px solid #333',
    borderRadius: 6,
    color: '#fff',
    fontSize: 14,
    outline: 'none'
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    background: '#252525',
    border: '1px solid #333',
    borderRadius: 6,
    color: '#fff',
    fontSize: 14,
    outline: 'none',
    resize: 'vertical'
  },
  select: {
    width: '100%',
    padding: '10px 12px',
    background: '#252525',
    border: '1px solid #333',
    borderRadius: 6,
    color: '#fff',
    fontSize: 14,
    outline: 'none'
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 16,
    marginTop: 30,
    padding: '16px 0',
    borderTop: '1px solid #333'
  },
  saveBtn: {
    background: '#25D366',
    border: 'none',
    borderRadius: 8,
    padding: '12px 24px',
    color: '#fff',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer'
  },
  savedMsg: {
    color: '#25D366',
    fontSize: 14
  }
}
