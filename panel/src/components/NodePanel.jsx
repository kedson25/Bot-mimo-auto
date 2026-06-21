import { useState, useEffect } from 'react'
import { NODE_TYPES, DEFAULT_NODE_DATA } from '../utils/flowTypes'

export default function NodePanel({ node, onUpdate, onClose }) {
  const [data, setData] = useState(node?.data || {})

  useEffect(() => {
    if (node) {
      setData({ ...DEFAULT_NODE_DATA[node.type], ...node.data })
    }
  }, [node?.id])

  const handleChange = (key, value) => {
    const newData = { ...data, [key]: value }
    setData(newData)
    onUpdate(node.id, newData)
  }

  const handleButtonAdd = () => {
    const buttons = [...(data.buttons || []), 'Nova opcao']
    handleChange('buttons', buttons)
  }

  const handleButtonChange = (index, value) => {
    const buttons = [...(data.buttons || [])]
    buttons[index] = value
    handleChange('buttons', buttons)
  }

  const handleButtonRemove = (index) => {
    const buttons = (data.buttons || []).filter((_, i) => i !== index)
    handleChange('buttons', buttons)
  }

  if (!node) return null

  const config = NODE_TYPES[node.type]

  return (
    <div style={styles.panel}>
      <div style={styles.header}>
        <span>{config.icon} {config.label}</span>
        <button onClick={onClose} style={styles.closeBtn}>✕</button>
      </div>

      <div style={styles.body}>
        {node.type === 'message' && (
          <div style={styles.field}>
            <label style={styles.label}>Mensagem</label>
            <textarea
              style={styles.textarea}
              value={data.text || ''}
              onChange={e => handleChange('text', e.target.value)}
              placeholder="Digite a mensagem..."
              rows={4}
            />
          </div>
        )}

        {node.type === 'image' && (
          <>
            <div style={styles.field}>
              <label style={styles.label}>URL da Imagem</label>
              <input
                style={styles.input}
                value={data.url || ''}
                onChange={e => handleChange('url', e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Legenda</label>
              <textarea
                style={styles.textarea}
                value={data.caption || ''}
                onChange={e => handleChange('caption', e.target.value)}
                placeholder="Legenda da imagem..."
                rows={3}
              />
            </div>
          </>
        )}

        {node.type === 'buttons' && (
          <>
            <div style={styles.field}>
              <label style={styles.label}>Mensagem</label>
              <textarea
                style={styles.textarea}
                value={data.text || ''}
                onChange={e => handleChange('text', e.target.value)}
                placeholder="Texto com as opcoes..."
                rows={3}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Botoes</label>
              {(data.buttons || []).map((btn, i) => (
                <div key={i} style={styles.buttonRow}>
                  <input
                    style={{ ...styles.input, flex: 1 }}
                    value={btn}
                    onChange={e => handleButtonChange(i, e.target.value)}
                  />
                  <button onClick={() => handleButtonRemove(i)} style={styles.removeBtn}>
                    ✕
                  </button>
                </div>
              ))}
              <button onClick={handleButtonAdd} style={styles.addBtn}>
                + Adicionar botao
              </button>
            </div>
          </>
        )}

        {node.type === 'condition' && (
          <>
            <div style={styles.field}>
              <label style={styles.label}>Variavel</label>
              <input
                style={styles.input}
                value={data.variable || ''}
                onChange={e => handleChange('variable', e.target.value)}
                placeholder="resposta_usuario"
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Operador</label>
              <select
                style={styles.select}
                value={data.operator || 'equals'}
                onChange={e => handleChange('operator', e.target.value)}
              >
                <option value="equals">Igual a</option>
                <option value="contains">Contem</option>
                <option value="startsWith">Comeca com</option>
                <option value="not">Diferente de</option>
              </select>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Valor</label>
              <input
                style={styles.input}
                value={data.value || ''}
                onChange={e => handleChange('value', e.target.value)}
                placeholder="Valor para comparar"
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Label Sim</label>
              <input
                style={styles.input}
                value={data.trueLabel || 'Sim'}
                onChange={e => handleChange('trueLabel', e.target.value)}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Label Nao</label>
              <input
                style={styles.input}
                value={data.falseLabel || 'Nao'}
                onChange={e => handleChange('falseLabel', e.target.value)}
              />
            </div>
          </>
        )}

        {node.type === 'waitInput' && (
          <>
            <div style={styles.field}>
              <label style={styles.label}>Prompt</label>
              <textarea
                style={styles.textarea}
                value={data.prompt || ''}
                onChange={e => handleChange('prompt', e.target.value)}
                placeholder="O que perguntar ao usuario..."
                rows={3}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Salvar como</label>
              <input
                style={styles.input}
                value={data.saveAs || ''}
                onChange={e => handleChange('saveAs', e.target.value)}
                placeholder="nome_variavel"
              />
            </div>
          </>
        )}

        {node.type === 'apiCall' && (
          <>
            <div style={styles.field}>
              <label style={styles.label}>URL</label>
              <input
                style={styles.input}
                value={data.url || ''}
                onChange={e => handleChange('url', e.target.value)}
                placeholder="https://api.exemplo.com/dados"
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Metodo</label>
              <select
                style={styles.select}
                value={data.method || 'GET'}
                onChange={e => handleChange('method', e.target.value)}
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Salvar resposta como</label>
              <input
                style={styles.input}
                value={data.saveAs || ''}
                onChange={e => handleChange('saveAs', e.target.value)}
                placeholder="resposta_api"
              />
            </div>
          </>
        )}

        {node.type === 'delay' && (
          <div style={styles.field}>
            <label style={styles.label}>Segundos</label>
            <input
              style={styles.input}
              type="number"
              value={data.seconds || 5}
              onChange={e => handleChange('seconds', parseInt(e.target.value) || 5)}
              min={1}
              max={300}
            />
          </div>
        )}

        {node.type === 'transfer' && (
          <div style={styles.field}>
            <label style={styles.label}>Mensagem antes de transferir</label>
            <textarea
              style={styles.textarea}
              value={data.message || ''}
              onChange={e => handleChange('message', e.target.value)}
              placeholder="Mensagem para o usuario..."
              rows={3}
            />
          </div>
        )}

        {node.type === 'end' && (
          <div style={styles.field}>
            <label style={styles.label}>Mensagem final</label>
            <textarea
              style={styles.textarea}
              value={data.message || ''}
              onChange={e => handleChange('message', e.target.value)}
              placeholder="Mensagem de despedida..."
              rows={3}
            />
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  panel: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 320,
    background: '#1a1a1a',
    borderLeft: '1px solid #333',
    zIndex: 20,
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #333',
    fontWeight: 600,
    fontSize: 14
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#a0a0a0',
    fontSize: 16,
    cursor: 'pointer',
    padding: 4
  },
  body: {
    flex: 1,
    padding: 20,
    overflowY: 'auto'
  },
  field: {
    marginBottom: 16
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
    fontSize: 13,
    outline: 'none'
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    background: '#252525',
    border: '1px solid #333',
    borderRadius: 6,
    color: '#fff',
    fontSize: 13,
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
    fontSize: 13,
    outline: 'none'
  },
  buttonRow: {
    display: 'flex',
    gap: 8,
    marginBottom: 8
  },
  removeBtn: {
    background: '#e74c3c20',
    border: '1px solid #e74c3c40',
    color: '#e74c3c',
    borderRadius: 6,
    padding: '0 10px',
    cursor: 'pointer',
    fontSize: 12
  },
  addBtn: {
    width: '100%',
    padding: '8px',
    background: '#25D36620',
    border: '1px dashed #25D36660',
    color: '#25D366',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 500
  }
}
