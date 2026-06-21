import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchFlows, fetchSettings } from '../utils/api'

export default function Dashboard() {
  const [stats, setStats] = useState({
    flows: 0,
    activeFlows: 0,
    totalNodes: 0
  })
  const [recentFlows, setRecentFlows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const flows = await fetchFlows()
      setRecentFlows(flows.slice(0, 5))
      setStats({
        flows: flows.length,
        activeFlows: flows.filter(f => f.active).length,
        totalNodes: flows.reduce((acc, f) => acc + (f.nodes?.length || 0), 0)
      })
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner} />
        <p>Carregando...</p>
      </div>
    )
  }

  return (
    <div>
      <h1 style={styles.title}>Dashboard</h1>
      <p style={styles.subtitle}>Visao geral do seu bot de vendas</p>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <span style={styles.statIcon}>🔀</span>
          <div>
            <div style={styles.statValue}>{stats.flows}</div>
            <div style={styles.statLabel}>Fluxos Criados</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statIcon}>🟢</span>
          <div>
            <div style={styles.statValue}>{stats.activeFlows}</div>
            <div style={styles.statLabel}>Ativos</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statIcon}>📦</span>
          <div>
            <div style={styles.statValue}>{stats.totalNodes}</div>
            <div style={styles.statLabel}>Total de Nos</div>
          </div>
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Fluxos Recentes</h2>
          <Link to="/flows" style={styles.viewAll}>Ver todos →</Link>
        </div>

        {recentFlows.length === 0 ? (
          <div style={styles.emptyCard}>
            <p>Nenhum fluxo ainda. <Link to="/flows/new" style={styles.link}>Criar primeiro fluxo</Link></p>
          </div>
        ) : (
          <div style={styles.flowsList}>
            {recentFlows.map(flow => (
              <Link
                key={flow.id}
                to={`/flows/${flow.id}`}
                style={styles.flowItem}
              >
                <div>
                  <div style={styles.flowName}>{flow.name}</div>
                  <div style={styles.flowMeta}>
                    {flow.nodes?.length || 0} nos · {flow.edges?.length || 0} conexoes
                  </div>
                </div>
                <span style={styles.flowArrow}>→</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Acoes Rapidas</h2>
        <div style={styles.actionsGrid}>
          <Link to="/flows/new" style={styles.actionCard}>
            <span style={styles.actionIcon}>➕</span>
            <span style={styles.actionLabel}>Criar Fluxo</span>
          </Link>
          <Link to="/flows" style={styles.actionCard}>
            <span style={styles.actionIcon}>📋</span>
            <span style={styles.actionLabel}>Gerenciar Fluxos</span>
          </Link>
          <Link to="/settings" style={styles.actionCard}>
            <span style={styles.actionIcon}>⚙️</span>
            <span style={styles.actionLabel}>Configuracoes</span>
          </Link>
        </div>
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
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 20,
    marginBottom: 40
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    background: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: 12,
    padding: 20
  },
  statIcon: {
    fontSize: 32
  },
  statValue: {
    fontSize: 28,
    fontWeight: 700
  },
  statLabel: {
    fontSize: 13,
    color: '#a0a0a0'
  },
  section: {
    marginBottom: 30
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 600
  },
  viewAll: {
    color: '#25D366',
    textDecoration: 'none',
    fontSize: 14
  },
  flowsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8
  },
  flowItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: 8,
    padding: '14px 18px',
    textDecoration: 'none',
    color: '#fff',
    transition: 'border-color 0.2s'
  },
  flowName: {
    fontWeight: 600,
    fontSize: 14,
    marginBottom: 2
  },
  flowMeta: {
    fontSize: 12,
    color: '#666'
  },
  flowArrow: {
    color: '#666'
  },
  emptyCard: {
    background: '#1a1a1a',
    border: '1px dashed #333',
    borderRadius: 8,
    padding: 20,
    textAlign: 'center',
    color: '#a0a0a0'
  },
  link: {
    color: '#25D366'
  },
  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 16
  },
  actionCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
    background: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: 12,
    padding: 24,
    textDecoration: 'none',
    color: '#fff',
    transition: 'border-color 0.2s'
  },
  actionIcon: {
    fontSize: 28
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: 500
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
