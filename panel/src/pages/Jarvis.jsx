import { useState, useRef, useEffect, useCallback } from 'react'

const JARVIS_CMD = `
voce e o jarvis, um assistente de IA pessoal. responda de forma direta e util em português brasileiro.
quando o usuario pedir para executar algo no bot (como enviar mensagem, limpar historico, etc), confirme a acao.
seja conciso. maximo 3 paragrafos.
`

export default function Jarvis() {
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [response, setResponse] = useState('')
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [supported, setSupported] = useState(true)
  const [volume, setVolume] = useState(0)
  const recognitionRef = useRef(null)
  const analyserRef = useRef(null)
  const audioCtxRef = useRef(null)
  const animFrameRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setSupported(false)
      return
    }
    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'pt-BR'

    recognition.onresult = (event) => {
      let finalTranscript = ''
      let interimTranscript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript
        } else {
          interimTranscript += event.results[i][0].transcript
        }
      }
      setTranscript(finalTranscript || interimTranscript)
      if (finalTranscript) {
        sendMessage(finalTranscript)
      }
    }

    recognition.onend = () => {
      setListening(false)
      stopAudioAnalysis()
    }

    recognition.onerror = (e) => {
      console.error('Speech error:', e.error)
      setListening(false)
      stopAudioAnalysis()
    }

    recognitionRef.current = recognition
  }, [])

  const startAudioAnalysis = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
      const source = audioCtx.createMediaStreamSource(stream)
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      audioCtxRef.current = audioCtx
      analyserRef.current = analyser

      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      const draw = () => {
        analyser.getByteFrequencyData(dataArray)
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length
        setVolume(avg / 255)
        drawCanvas(dataArray)
        animFrameRef.current = requestAnimationFrame(draw)
      }
      draw()
    } catch (err) {
      console.error('Audio error:', err)
    }
  }

  const drawCanvas = (dataArray) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const w = canvas.width
    const h = canvas.height
    ctx.clearRect(0, 0, w, h)

    const bars = 64
    const barW = w / bars
    for (let i = 0; i < bars; i++) {
      const val = dataArray[i] / 255
      const barH = val * h * 0.8
      const x = i * barW
      const gradient = ctx.createLinearGradient(x, h, x, h - barH)
      gradient.addColorStop(0, '#25D366')
      gradient.addColorStop(1, '#00ff88')
      ctx.fillStyle = gradient
      ctx.fillRect(x + 1, h - barH, barW - 2, barH)
    }

    ctx.strokeStyle = '#25D36640'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(w / 2, h / 2, 80 + volume * 30, 0, Math.PI * 2)
    ctx.stroke()
  }

  const stopAudioAnalysis = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    if (audioCtxRef.current) audioCtxRef.current.close()
    analyserRef.current = null
    audioCtxRef.current = null
    setVolume(0)
  }

  const toggleListening = () => {
    if (!recognitionRef.current) return
    if (listening) {
      recognitionRef.current.stop()
      setListening(false)
      stopAudioAnalysis()
    } else {
      setTranscript('')
      setResponse('')
      recognitionRef.current.start()
      setListening(true)
      startAudioAnalysis()
    }
  }

  const sendMessage = async (text) => {
    setLoading(true)
    const newHistory = [...history, { role: 'user', content: text }]
    setHistory(newHistory)

    try {
      const res = await fetch('/api/jarvis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: newHistory.slice(-10) })
      })
      const data = await res.json()
      const reply = data.reply || 'Erro ao obter resposta.'
      setResponse(reply)
      setHistory(prev => [...prev, { role: 'assistant', content: reply }])
    } catch (err) {
      setResponse('Erro de conexao com o Jarvis.')
    } finally {
      setLoading(false)
      setTranscript('')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const text = e.target.value.trim()
      if (text) {
        setTranscript(text)
        sendMessage(text)
        e.target.value = ''
      }
    }
  }

  if (!supported) {
    return (
      <div style={styles.center}>
        <h1 style={styles.title}>Jarvis</h1>
        <p style={{ color: '#a0a0a0' }}>
          Seu navegador nao suporta reconhecimento de voz.
          Use Chrome ou Edge para usar o Jarvis.
        </p>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>J.A.R.V.I.S</h1>
        <p style={styles.subtitle}>Just A Rather Very Intelligent System</p>
      </div>

      <div style={styles.visualizerArea}>
        <canvas
          ref={canvasRef}
          width={400}
          height={200}
          style={styles.canvas}
        />
        <div style={{
          ...styles.arcRing,
          borderColor: listening ? `rgba(37, 211, 102, ${0.3 + volume * 0.7})` : '#333',
          transform: `scale(${1 + volume * 0.15})`
        }} />
        <div style={{
          ...styles.arcRing2,
          borderColor: listening ? `rgba(37, 211, 102, ${0.2 + volume * 0.5})` : '#222',
          transform: `scale(${1 + volume * 0.1})`
        }} />
      </div>

      <button
        onClick={toggleListening}
        style={{
          ...styles.micBtn,
          background: listening ? '#e74c3c' : '#25D366',
          boxShadow: listening
            ? `0 0 ${30 + volume * 40}px rgba(231, 76, 60, 0.5)`
            : `0 0 20px rgba(37, 211, 102, 0.3)`
        }}
      >
        {listening ? '⏹' : '🎙️'}
      </button>

      <p style={styles.status}>
        {listening ? 'Ouvindo...' : loading ? 'Processando...' : 'Toque para falar'}
      </p>

      {transcript && (
        <div style={styles.bubble}>
          <span style={styles.bubbleLabel}>Voce:</span>
          <p style={styles.bubbleText}>{transcript}</p>
        </div>
      )}

      {response && (
        <div style={{ ...styles.bubble, ...styles.responseBubble }}>
          <span style={styles.bubbleLabel}>Jarvis:</span>
          <p style={styles.bubbleText}>{response}</p>
        </div>
      )}

      <div style={styles.inputArea}>
        <input
          type="text"
          placeholder="Ou digite sua mensagem..."
          onKeyDown={handleKeyDown}
          style={styles.input}
          disabled={loading}
        />
      </div>

      {history.length > 0 && (
        <div style={styles.historySection}>
          <h3 style={styles.historyTitle}>Conversa</h3>
          <div style={styles.historyList}>
            {history.map((msg, i) => (
              <div key={i} style={{
                ...styles.historyItem,
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                background: msg.role === 'user' ? '#25D36620' : '#1a1a1a'
              }}>
                <span style={styles.historyRole}>
                  {msg.role === 'user' ? 'Voce' : 'Jarvis'}
                </span>
                <p style={styles.historyText}>{msg.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: 'calc(100vh - 60px)',
    padding: '20px 0'
  },
  center: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '60vh',
    gap: 16
  },
  header: {
    textAlign: 'center',
    marginBottom: 20
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    letterSpacing: 6,
    color: '#25D366'
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    letterSpacing: 2,
    marginTop: 4
  },
  visualizerArea: {
    position: 'relative',
    width: 400,
    height: 200,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10
  },
  canvas: {
    borderRadius: 12,
    background: '#111'
  },
  arcRing: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: '50%',
    border: '2px solid #333',
    transition: 'all 0.1s ease-out',
    pointerEvents: 'none'
  },
  arcRing2: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: '50%',
    border: '1px solid #222',
    transition: 'all 0.15s ease-out',
    pointerEvents: 'none'
  },
  micBtn: {
    width: 72,
    height: 72,
    borderRadius: '50%',
    border: 'none',
    fontSize: 28,
    color: '#fff',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12
  },
  status: {
    fontSize: 13,
    color: '#a0a0a0',
    marginBottom: 20,
    letterSpacing: 1
  },
  bubble: {
    background: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: 12,
    padding: '14px 18px',
    maxWidth: 600,
    width: '100%',
    marginBottom: 12
  },
  responseBubble: {
    background: '#0d2818',
    borderColor: '#25D36640'
  },
  bubbleLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: '#25D366',
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 1.6,
    marginTop: 6,
    color: '#e0e0e0'
  },
  inputArea: {
    width: '100%',
    maxWidth: 600,
    marginTop: 10
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    background: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: 10,
    color: '#fff',
    fontSize: 14,
    outline: 'none'
  },
  historySection: {
    width: '100%',
    maxWidth: 600,
    marginTop: 30,
    borderTop: '1px solid #333',
    paddingTop: 20
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: '#a0a0a0',
    marginBottom: 12
  },
  historyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8
  },
  historyItem: {
    maxWidth: '80%',
    borderRadius: 10,
    padding: '10px 14px'
  },
  historyRole: {
    fontSize: 10,
    fontWeight: 600,
    color: '#25D366',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  historyText: {
    fontSize: 13,
    lineHeight: 1.5,
    marginTop: 4,
    color: '#ccc'
  }
}
