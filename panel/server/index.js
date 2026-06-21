import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import admin from 'firebase-admin'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

const serviceAccountPath = path.join(__dirname, '..', 'firebase-service-account.json')
let db = null

try {
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'))
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    })
    db = admin.firestore()
    console.log('✅ Firebase conectado')
  } else {
    console.log('⚠️ Firebase service account nao encontrado. Usando modo local.')
  }
} catch (err) {
  console.error('Erro ao inicializar Firebase:', err.message)
}

let localFlows = []
let localSettings = {
  botName: 'Eco Bot',
  personality: 'Amigavel e prestativo',
  language: 'pt',
  workingHours: { start: '08:00', end: '22:00' },
  fallbackMessage: 'Nao entendi. Pode reformular?',
  welcomeMessage: 'Ola! Como posso ajudar?'
}

const FLOWS_COLLECTION = 'flows'
const SETTINGS_COLLECTION = 'settings'

// FLOW ROUTES
app.get('/api/flows', async (req, res) => {
  try {
    if (db) {
      const snapshot = await db.collection(FLOWS_COLLECTION).orderBy('updatedAt', 'desc').get()
      const flows = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      return res.json(flows)
    }
    res.json(localFlows.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/flows/:id', async (req, res) => {
  try {
    if (db) {
      const doc = await db.collection(FLOWS_COLLECTION).doc(req.params.id).get()
      if (!doc.exists) return res.status(404).json({ error: 'Fluxo nao encontrado' })
      return res.json({ id: doc.id, ...doc.data() })
    }
    const flow = localFlows.find(f => f.id === req.params.id)
    if (!flow) return res.status(404).json({ error: 'Fluxo nao encontrado' })
    res.json(flow)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/flows', async (req, res) => {
  try {
    const flow = {
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      active: false
    }

    if (db) {
      const docRef = await db.collection(FLOWS_COLLECTION).add(flow)
      return res.json({ id: docRef.id, ...flow })
    }

    flow.id = `local-${Date.now()}`
    localFlows.push(flow)
    res.json(flow)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.put('/api/flows/:id', async (req, res) => {
  try {
    const updates = {
      ...req.body,
      updatedAt: new Date().toISOString()
    }

    if (db) {
      await db.collection(FLOWS_COLLECTION).doc(req.params.id).update(updates)
      return res.json({ id: req.params.id, ...updates })
    }

    const index = localFlows.findIndex(f => f.id === req.params.id)
    if (index === -1) return res.status(404).json({ error: 'Fluxo nao encontrado' })
    localFlows[index] = { ...localFlows[index], ...updates }
    res.json(localFlows[index])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.delete('/api/flows/:id', async (req, res) => {
  try {
    if (db) {
      await db.collection(FLOWS_COLLECTION).doc(req.params.id).delete()
      return res.json({ success: true })
    }

    localFlows = localFlows.filter(f => f.id !== req.params.id)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// SETTINGS ROUTES
app.get('/api/settings', async (req, res) => {
  try {
    if (db) {
      const doc = await db.collection(SETTINGS_COLLECTION).doc('main').get()
      if (doc.exists) return res.json(doc.data())
      return res.json(localSettings)
    }
    res.json(localSettings)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.put('/api/settings', async (req, res) => {
  try {
    if (db) {
      await db.collection(SETTINGS_COLLECTION).doc('main').set(req.body, { merge: true })
      return res.json(req.body)
    }
    localSettings = { ...localSettings, ...req.body }
    res.json(localSettings)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Serve static files in production
const distPath = path.join(__dirname, '..', 'dist')
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath))
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`🚀 API server rodando em http://localhost:${PORT}`)
  console.log(`📡 Modo: ${db ? 'Firebase' : 'Local'}`)
})
