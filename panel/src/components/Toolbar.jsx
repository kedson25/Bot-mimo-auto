import { NODE_TYPES } from '../utils/flowTypes'

export default function Toolbar({ onAddNode }) {
  const categories = [
    {
      label: 'Entrada/Saida',
      nodes: ['start', 'end', 'transfer']
    },
    {
      label: 'Mensagens',
      nodes: ['message', 'image', 'buttons']
    },
    {
      label: 'Logica',
      nodes: ['condition', 'waitInput', 'delay']
    },
    {
      label: 'Integracao',
      nodes: ['apiCall']
    }
  ]

  return (
    <div style={styles.toolbar}>
      {categories.map((cat, i) => (
        <div key={i} style={styles.category}>
          <div style={styles.categoryLabel}>{cat.label}</div>
          <div style={styles.nodes}>
            {cat.nodes.map(type => {
              const config = NODE_TYPES[type]
              return (
                <button
                  key={type}
                  style={styles.nodeBtn}
                  onClick={() => onAddNode(type)}
                  title={config.description}
                >
                  <span style={styles.nodeIcon}>{config.icon}</span>
                  <span style={styles.nodeLabel}>{config.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

const styles = {
  toolbar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 200,
    background: '#1a1a1a',
    borderRight: '1px solid #333',
    padding: 16,
    overflowY: 'auto',
    zIndex: 15
  },
  category: {
    marginBottom: 20
  },
  categoryLabel: {
    fontSize: 10,
    fontWeight: 600,
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8
  },
  nodes: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4
  },
  nodeBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 10px',
    background: '#252525',
    border: '1px solid #333',
    borderRadius: 6,
    color: '#ccc',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'left'
  },
  nodeIcon: {
    fontSize: 16
  },
  nodeLabel: {
    fontSize: 12,
    fontWeight: 500
  }
}
