export const NODE_TYPES = {
  start: {
    label: 'Inicio',
    icon: '▶️',
    color: '#25D366',
    description: 'Ponto de entrada do fluxo'
  },
  message: {
    label: 'Mensagem',
    icon: '💬',
    color: '#3498db',
    description: 'Enviar mensagem de texto'
  },
  image: {
    label: 'Imagem',
    icon: '🖼️',
    color: '#9b59b6',
    description: 'Enviar imagem com legenda'
  },
  buttons: {
    label: 'Botoes',
    icon: '🔘',
    color: '#e67e22',
    description: 'Menu de botoes para o usuario'
  },
  condition: {
    label: 'Condicao',
    icon: '❓',
    color: '#f1c40f',
    description: 'Verificar resposta do usuario'
  },
  waitInput: {
    label: 'Aguardar Input',
    icon: '⏳',
    color: '#1abc9c',
    description: 'Aguardar resposta do usuario'
  },
  apiCall: {
    label: 'API',
    icon: '🌐',
    color: '#e74c3c',
    description: 'Chamar API externa'
  },
  delay: {
    label: 'Espera',
    icon: '⏱️',
    color: '#95a5a6',
    description: 'Aguardar tempo antes de continuar'
  },
  transfer: {
    label: 'Transferir',
    icon: '👤',
    color: '#e91e63',
    description: 'Transferir para atendente humano'
  },
  end: {
    label: 'Fim',
    icon: '⏹️',
    color: '#7f8c8d',
    description: 'Encerrar conversa'
  }
}

export const DEFAULT_NODE_DATA = {
  start: {},
  message: { text: '' },
  image: { url: '', caption: '' },
  buttons: { text: '', buttons: [] },
  condition: { variable: '', operator: 'equals', value: '', trueLabel: 'Sim', falseLabel: 'Nao' },
  waitInput: { prompt: '', saveAs: '' },
  apiCall: { url: '', method: 'GET', headers: {}, body: '', saveAs: '' },
  delay: { seconds: 5 },
  transfer: { message: 'Transferindo para atendente...' },
  end: { message: '' }
}
