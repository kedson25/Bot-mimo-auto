import { useState, useCallback, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  ReactFlowProvider
} from 'reactflow'
import 'reactflow/dist/style.css'
import { nodeTypes } from '../components/FlowNodes'
import NodePanel from '../components/NodePanel'
import Toolbar from '../components/Toolbar'
import { fetchFlow, createFlow, updateFlow } from '../utils/api'

const defaultNodes = [
  {
    id: 'start-1',
    type: 'start',
    position: { x: 400, y: 50 },
    data: {}
  }
]

function FlowEditorInner() {
  const { id } = useParams()
  const navigate = useNavigate()
  const reactFlowWrapper = useRef(null)
  const [nodes, setNodes, onNodesChange] = useNodesState(defaultNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedNode, setSelectedNode] = useState(null)
  const [flowName, setFlowName] = useState('Novo Fluxo')
  const [flowDescription, setFlowDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [reactFlowInstance, setReactFlowInstance] = useState(null)

  useEffect(() => {
    if (id) {
      loadFlow(id)
    }
  }, [id])

  const loadFlow = async (flowId) => {
    try {
      const flow = await fetchFlow(flowId)
      setFlowName(flow.name || '')
      setFlowDescription(flow.description || '')
      if (flow.nodes?.length) setNodes(flow.nodes)
      if (flow.edges?.length) setEdges(flow.edges)
    } catch (err) {
      console.error('Erro ao carregar fluxo:', err)
    }
  }

  const onConnect = useCallback((params) => {
    setEdges((eds) => addEdge({ ...params, animated: true }, eds))
  }, [setEdges])

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node)
  }, [])

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
  }, [])

  const onAddNode = useCallback((type) => {
    const position = reactFlowInstance
      ? reactFlowInstance.screenToFlowPosition({ x: 300, y: 300 })
      : { x: 400, y: 300 }

    const newNode = {
      id: `${type}-${Date.now()}`,
      type,
      position,
      data: {}
    }

    setNodes((nds) => [...nds, newNode])
  }, [reactFlowInstance, setNodes])

  const onUpdateNode = useCallback((nodeId, data) => {
    setNodes((nds) =>
      nds.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n))
    )
    setSelectedNode((prev) =>
      prev?.id === nodeId ? { ...prev, data: { ...prev.data, ...data } } : prev
    )
  }, [setNodes])

  const handleSave = async () => {
    setSaving(true)
    try {
      const flow = {
        name: flowName,
        description: flowDescription,
        nodes,
        edges,
        updatedAt: new Date().toISOString()
      }

      if (id) {
        await updateFlow(id, flow)
      } else {
        const result = await createFlow(flow)
        navigate(`/flows/${result.id}`, { replace: true })
      }
    } catch (err) {
      console.error('Erro ao salvar:', err)
      alert('Erro ao salvar fluxo')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteNode = useCallback(() => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id))
      setEdges((eds) =>
        eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id)
      )
      setSelectedNode(null)
    }
  }, [selectedNode, setNodes, setEdges])

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <button onClick={() => navigate('/flows')} style={styles.backBtn}>
            ← Voltar
          </button>
          <input
            style={styles.nameInput}
            value={flowName}
            onChange={e => setFlowName(e.target.value)}
            placeholder="Nome do fluxo..."
          />
        </div>
        <div style={styles.headerRight}>
          <input
            style={styles.descInput}
            value={flowDescription}
            onChange={e => setFlowDescription(e.target.value)}
            placeholder="Descricao (opcional)..."
          />
          <button onClick={handleSave} style={styles.saveBtn} disabled={saving}>
            {saving ? 'Salvando...' : '💾 Salvar'}
          </button>
        </div>
      </div>

      <div style={styles.editor}>
        <Toolbar onAddNode={onAddNode} />

        <div style={styles.canvas} ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            onInit={setReactFlowInstance}
            nodeTypes={nodeTypes}
            fitView
            snapToGrid
            snapGrid={[15, 15]}
          >
            <Controls />
            <Background color="#333" gap={15} />
          </ReactFlow>
        </div>

        {selectedNode && (
          <NodePanel
            node={selectedNode}
            onUpdate={onUpdateNode}
            onClose={() => setSelectedNode(null)}
          />
        )}
      </div>

      <div style={styles.statusBar}>
        <span>{nodes.length} nos | {edges.length} conexoes</span>
        {selectedNode && (
          <button onClick={handleDeleteNode} style={styles.deleteBtn}>
            🗑️ Excluir no selecionado
          </button>
        )}
      </div>
    </div>
  )
}

export default function FlowEditor() {
  return (
    <ReactFlowProvider>
      <FlowEditorInner />
    </ReactFlowProvider>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100vh - 60px)',
    margin: -30
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 20px',
    background: '#1a1a1a',
    borderBottom: '1px solid #333'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 12
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 12
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: '#a0a0a0',
    cursor: 'pointer',
    fontSize: 14
  },
  nameInput: {
    background: '#252525',
    border: '1px solid #333',
    borderRadius: 6,
    padding: '8px 12px',
    color: '#fff',
    fontSize: 16,
    fontWeight: 600,
    width: 300,
    outline: 'none'
  },
  descInput: {
    background: '#252525',
    border: '1px solid #333',
    borderRadius: 6,
    padding: '8px 12px',
    color: '#ccc',
    fontSize: 13,
    width: 250,
    outline: 'none'
  },
  saveBtn: {
    background: '#25D366',
    border: 'none',
    borderRadius: 6,
    padding: '8px 20px',
    color: '#fff',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer'
  },
  editor: {
    flex: 1,
    display: 'flex',
    position: 'relative',
    overflow: 'hidden'
  },
  canvas: {
    flex: 1,
    marginLeft: 200
  },
  statusBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 20px',
    background: '#1a1a1a',
    borderTop: '1px solid #333',
    fontSize: 12,
    color: '#666'
  },
  deleteBtn: {
    background: '#e74c3c20',
    border: '1px solid #e74c3c40',
    color: '#e74c3c',
    borderRadius: 4,
    padding: '4px 10px',
    cursor: 'pointer',
    fontSize: 12
  }
}
