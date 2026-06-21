import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchFlows, deleteFlow } from '../utils/api'

export default function FlowList() {
  const [flows, setFlows] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    loadFlows()
  }, [])

  const loadFlows = async () => {
    try {
      const data = await fetchFlows()
      setFlows(data)
    } catch (err) {
      console.error('Erro ao carregar fluxos:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Deletar fluxo "${name}"?`)) return
    try {
      await deleteFlow(id)
      setFlows(flows.filter(f => f.id !== id))
    } catch (err) {
      console.error('Erro ao deletar:', err)
    }
  }

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner} />
        <p>Carregando fluxos...</p>
      </div>
    )
  }

  return (
    <div>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Fluxos de Atendimento</h1>
          <p style={styles.subtitle}>Crie e gerencie fluxos de conversa para seu bot</p>
        </div>
        <Link to="/flows/new" style={styles.newBtn}>
          + Novo Fluxo
        </Link>
      </div>

      {flows.length === 0 ? (
        <div style={styles.empty}>
          <span style={styles.emptyIcon}>🔀</span>
          <h3>Nenhum fluxo criado</h3>
          <p>Comece criando seu primeiro fluxo de atendimento</p>
          <Link to="/flows/new" style={styles.newBtn}>
            + Criar Primeiro Fluxo
          </Link>
        </div>
      ) : (
        <div style={styles.grid}>
          {flows.map(flow => (
            <div key={flow.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>{flow.name}</h3>
                <span style={styles.cardStatus}>
                  {flow.active ? '🟢 Ativo' : '⚪ Inativo'}
                </span>
              </div>
              {flow.description && (
                <p style={styles.cardDesc}>{flow.description}</p>
              )}
              <div style={styles.cardMeta}>
                <span>{flow.nodes?.length || 0} nos</span>
                <span>{flow.edges?.length || 0} conexoes</span>
              </div>
              <div style={styles.cardActions}>
                <button
                  onClick={() => navigate(`/flows/${flow.id}`)}
                  style={styles.editBtn}
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={() => handleDelete(flow.id, flow.name)}
                  style={styles.deleteBtn}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 4
  },
  subtitle: {
    color: '#a0a0a0',
    fontSize: 14
  },
  newBtn: {
    display: 'inline-block',
    background: '#25D366',
    color: '#fff',
    padding: '10px 20px',
    borderRadius: 8,
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: 14
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: 20
  },
  card: {
    background: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: 12,
    padding: 20,
    transition: 'border-color 0.2s'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 600
  },
  cardStatus: {
    fontSize: 12
  },
  cardDesc: {
    color: '#a0a0a0',
    fontSize: 13,
    marginBottom: 12,
    lineHeight: 1.4
  },
  cardMeta: {
    display: 'flex',
    gap: 16,
    fontSize: 12,
    color: '#666',
    marginBottom: 16
  },
  cardActions: {
    display: 'flex',
    gap: 8
  },
  editBtn: {
    flex: 1,
    background: '#252525',
    border: '1px solid #333',
    color: '#fff',
    padding: '8px 12px',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 500
  },
  deleteBtn: {
    background: '#e74c3c20',
    border: '1px solid #e74c3c40',
    color: '#e74c3c',
    padding: '8px 12px',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 13
  },
  empty: {
    textAlign: 'center',
    padding: '60px 20px',
    background: '#1a1a1a',
    borderRadius: 12,
    border: '1px dashed #333'
  },
  emptyIcon: {
    fontSize: 48,
    display: 'block',
    marginBottom: 16
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '50vh',
    gap: 16
  },
  spinner: {
    width: 40,
    height: 40,
    border: '3px solid #333',
    borderTopColor: '#25D366',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  }
}
