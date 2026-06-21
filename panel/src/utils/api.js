const API_BASE = '/api'

export async function fetchFlows() {
  const res = await fetch(`${API_BASE}/flows`)
  if (!res.ok) throw new Error('Erro ao buscar fluxos')
  return res.json()
}

export async function fetchFlow(id) {
  const res = await fetch(`${API_BASE}/flows/${id}`)
  if (!res.ok) throw new Error('Erro ao buscar fluxo')
  return res.json()
}

export async function createFlow(flow) {
  const res = await fetch(`${API_BASE}/flows`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(flow)
  })
  if (!res.ok) throw new Error('Erro ao criar fluxo')
  return res.json()
}

export async function updateFlow(id, flow) {
  const res = await fetch(`${API_BASE}/flows/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(flow)
  })
  if (!res.ok) throw new Error('Erro ao atualizar fluxo')
  return res.json()
}

export async function deleteFlow(id) {
  const res = await fetch(`${API_BASE}/flows/${id}`, {
    method: 'DELETE'
  })
  if (!res.ok) throw new Error('Erro ao deletar fluxo')
  return res.json()
}

export async function fetchSettings() {
  const res = await fetch(`${API_BASE}/settings`)
  if (!res.ok) throw new Error('Erro ao buscar configuracoes')
  return res.json()
}

export async function updateSettings(settings) {
  const res = await fetch(`${API_BASE}/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings)
  })
  if (!res.ok) throw new Error('Erro ao atualizar configuracoes')
  return res.json()
}
