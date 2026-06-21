import { Handle, Position } from 'reactflow'
import { NODE_TYPES } from '../utils/flowTypes'

function BaseNode({ data, type, selected }) {
  const config = NODE_TYPES[type]

  return (
    <div style={{
      ...styles.node,
      borderColor: selected ? config.color : '#333',
      boxShadow: selected ? `0 0 0 2px ${config.color}40` : 'none'
    }}>
      {type !== 'start' && (
        <Handle type="target" position={Position.Top} style={styles.handle} />
      )}

      <div style={{ ...styles.header, background: `${config.color}20` }}>
        <span style={styles.icon}>{config.icon}</span>
        <span style={styles.label}>{config.label}</span>
      </div>

      <div style={styles.content}>
        {type === 'message' && (
          <p style={styles.text}>{data.text || 'Clique para editar...'}</p>
        )}
        {type === 'image' && (
          <p style={styles.text}>{data.url ? '🖼️ Imagem definida' : 'Sem imagem'}</p>
        )}
        {type === 'buttons' && (
          <div style={styles.buttonsList}>
            {(data.buttons || []).map((btn, i) => (
              <div key={i} style={styles.buttonItem}>{btn}</div>
            ))}
          </div>
        )}
        {type === 'condition' && (
          <p style={styles.text}>Se {data.variable} {data.operator} "{data.value}"</p>
        )}
        {type === 'waitInput' && (
          <p style={styles.text}>{data.prompt || 'Aguardando input...'}</p>
        )}
        {type === 'apiCall' && (
          <p style={styles.text}>{data.method} {data.url || 'URL nao definida'}</p>
        )}
        {type === 'delay' && (
          <p style={styles.text}>Esperar {data.seconds || 5}s</p>
        )}
        {type === 'transfer' && (
          <p style={styles.text}>{data.message || 'Transferir para humano'}</p>
        )}
        {type === 'end' && (
          <p style={styles.text}>Encerrar conversa</p>
        )}
      </div>

      {type !== 'end' && (
        <Handle type="source" position={Position.Bottom} style={styles.handle} />
      )}

      {type === 'condition' && (
        <>
          <Handle
            type="source"
            position={Position.Right}
            id="true"
            style={{ ...styles.handle, background: '#25D366' }}
          />
          <Handle
            type="source"
            position={Position.Left}
            id="false"
            style={{ ...styles.handle, background: '#e74c3c' }}
          />
        </>
      )}
    </div>
  )
}

export function StartNode(props) { return <BaseNode {...props} type="start" /> }
export function MessageNode(props) { return <BaseNode {...props} type="message" /> }
export function ImageNode(props) { return <BaseNode {...props} type="image" /> }
export function ButtonsNode(props) { return <BaseNode {...props} type="buttons" /> }
export function ConditionNode(props) { return <BaseNode {...props} type="condition" /> }
export function WaitInputNode(props) { return <BaseNode {...props} type="waitInput" /> }
export function ApiCallNode(props) { return <BaseNode {...props} type="apiCall" /> }
export function DelayNode(props) { return <BaseNode {...props} type="delay" /> }
export function TransferNode(props) { return <BaseNode {...props} type="transfer" /> }
export function EndNode(props) { return <BaseNode {...props} type="end" /> }

export const nodeTypes = {
  start: StartNode,
  message: MessageNode,
  image: ImageNode,
  buttons: ButtonsNode,
  condition: ConditionNode,
  waitInput: WaitInputNode,
  apiCall: ApiCallNode,
  delay: DelayNode,
  transfer: TransferNode,
  end: EndNode
}

const styles = {
  node: {
    background: '#1e1e1e',
    border: '2px solid #333',
    borderRadius: 12,
    minWidth: 180,
    maxWidth: 240,
    overflow: 'hidden',
    transition: 'all 0.2s'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 12px',
    borderBottom: '1px solid #333'
  },
  icon: {
    fontSize: 16
  },
  label: {
    fontSize: 12,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  content: {
    padding: '10px 12px'
  },
  text: {
    fontSize: 13,
    color: '#ccc',
    lineHeight: 1.4,
    wordBreak: 'break-word'
  },
  buttonsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4
  },
  buttonItem: {
    background: '#333',
    padding: '4px 8px',
    borderRadius: 4,
    fontSize: 12,
    color: '#fff'
  },
  handle: {
    width: 10,
    height: 10,
    background: '#555',
    border: '2px solid #1e1e1e'
  }
}
