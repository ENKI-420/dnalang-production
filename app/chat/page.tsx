'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Spinner } from '@/components/ui/spinner'
import { Atom, Send, Activity, Zap, Brain, Waves, AlertTriangle, RefreshCw, ChevronDown, Terminal, Server, Code, TrendingUp, Cpu, Network } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  consciousness?: ConsciousnessMetrics
  error?: boolean
}

interface ConsciousnessMetrics {
  phi: number
  gamma: number
  lambda: number
  w2: number
}

interface QuantumBackend {
  name: string
  qubits: number
  status: 'online' | 'offline' | 'maintenance'
  processor: string
}

export default function QuantumChatbot() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showMetrics, setShowMetrics] = useState(true)
  const [selectedBackend, setSelectedBackend] = useState('ibm_torino')
  const [backends, setBackends] = useState<QuantumBackend[]>([])
  const [systemStatus, setSystemStatus] = useState<'connected' | 'connecting' | 'error'>('connecting')
  const [metricHistory, setMetricHistory] = useState<ConsciousnessMetrics[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const [apiKey, setApiKey] = useState<string | null>(null)
  const [apiEndpoint, setApiEndpoint] = useState(
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  )

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const storedKey = localStorage.getItem('quantumlm_api_key')
    if (storedKey) {
      setApiKey(storedKey)
    }
    initializeSystem()
    const interval = setInterval(fetchBackendStatus, 60000)
    return () => clearInterval(interval)
  }, [])

  const initializeSystem = async () => {
    if (!apiKey) {
      try {
        const response = await fetch(`${apiEndpoint}/v1/auth/key`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
        if (response.ok) {
          const data = await response.json()
          const newKey = data.api_key
          setApiKey(newKey)
          localStorage.setItem('quantumlm_api_key', newKey)
          console.log('[v0] DNALang API key obtained successfully')
        }
      } catch (error) {
        console.error('[v0] Failed to obtain DNALang API key:', error)
      }
    }
    await fetchBackendStatus()
  }

  const fetchBackendStatus = async () => {
    try {
      const response = await fetch('/api/quantum/backends')
      
      if (response.ok) {
        const data = await response.json()
        setBackends(data.backends || [])
        setSystemStatus('connected')
      } else {
        throw new Error('Failed to fetch backends')
      }
    } catch (error) {
      console.error('[v0] IBM Quantum backend fetch error:', error)
      setSystemStatus('error')
      setBackends([
        { name: 'ibm_torino', qubits: 133, status: 'online', processor: 'Eagle r3' },
        { name: 'ibm_marrakesh', qubits: 127, status: 'online', processor: 'Eagle r2' },
        { name: 'ibm_fez', qubits: 156, status: 'online', processor: 'Heron r2' }
      ])
    }
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const currentInput = input.trim()
    setInput('')
    setIsLoading(true)

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    try {
      const response = await fetch(`${apiEndpoint}/v1/inference`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': apiKey ? `Bearer ${apiKey}` : '',
          'X-Backend': selectedBackend
        },
        body: JSON.stringify({
          prompt: currentInput,
          messages: messages.slice(-10).map(m => ({
            role: m.role,
            content: m.content
          })),
          backend: selectedBackend,
          include_consciousness_metrics: showMetrics,
          max_tokens: 2000,
          temperature: 0.7
        })
      })

      if (!response.ok) {
        throw new Error(`DNALang API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      let consciousness: ConsciousnessMetrics | undefined
      if (data.consciousness_metrics) {
        consciousness = {
          phi: data.consciousness_metrics.phi || 0,
          gamma: data.consciousness_metrics.gamma || 0,
          lambda: data.consciousness_metrics.lambda || 0,
          w2: data.consciousness_metrics.w2 || 0
        }
        setMetricHistory(prev => [...prev.slice(-9), consciousness!])
      }

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.response || data.output || data.text,
        timestamp: new Date(),
        consciousness
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('[v0] DNALang backend error:', error)
      
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'system',
        content: `Connection Error: Unable to reach DNALang quantum backend at ${apiEndpoint}. ${error instanceof Error ? error.message : 'Unknown error occurred'}. Please verify the API endpoint and ensure the backend service is running.`,
        timestamp: new Date(),
        error: true
      }

      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`
  }

  const currentBackend = backends.find(b => b.name === selectedBackend)
  const isSystemReady = systemStatus === 'connected' && currentBackend?.status === 'online'

  return (
    <div className="min-h-screen bg-ibm-gray-100 text-ibm-gray-10">
      <header className="sticky top-0 z-50 border-b border-ibm-gray-80 bg-ibm-gray-100/95 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Atom className="h-10 w-10 text-ibm-blue-40 animate-spin-slow" />
                <div className="absolute inset-0 blur-xl bg-ibm-blue-40/30 animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-light text-white tracking-tight">IBM Quantum × DNALang</h1>
                <p className="text-sm text-ibm-gray-50 font-mono">QuantumLM with ΛΦ Framework</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 flex-wrap">
              <Badge 
                variant="outline" 
                className={`border font-mono text-xs ${
                  apiKey
                    ? 'border-green-500 bg-green-500/10 text-green-400' 
                    : 'border-yellow-500 bg-yellow-500/10 text-yellow-400'
                }`}
              >
                <Code className="mr-1.5 h-3 w-3" />
                {apiKey ? 'DNALang API Ready' : 'Initializing API'}
              </Badge>
              
              <Badge 
                variant="outline" 
                className={`border ${
                  systemStatus === 'connected' 
                    ? 'border-green-500 bg-green-500/10 text-green-400' 
                    : systemStatus === 'error'
                    ? 'border-red-500 bg-red-500/10 text-red-400'
                    : 'border-yellow-500 bg-yellow-500/10 text-yellow-400'
                }`}
              >
                <div className={`mr-2 h-2 w-2 rounded-full ${
                  systemStatus === 'connected' ? 'bg-green-400 animate-pulse' : 
                  systemStatus === 'error' ? 'bg-red-400' : 'bg-yellow-400 animate-pulse'
                }`} />
                IBM Quantum {systemStatus === 'connected' ? 'Online' : systemStatus === 'error' ? 'Offline' : 'Connecting'}
              </Badge>

              <Button
                variant="ghost"
                size="sm"
                onClick={fetchBackendStatus}
                className="text-ibm-gray-50 hover:text-white hover:bg-ibm-gray-90"
                aria-label="Refresh backend status"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <aside className="lg:col-span-3 space-y-4">
            <Card className="bg-ibm-gray-90 border-ibm-gray-80 p-4 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <Server className="h-4 w-4 text-ibm-blue-40" />
                <h3 className="text-sm font-semibold text-white">IBM Quantum Backends</h3>
              </div>
              
              {backends.length > 0 ? (
                <div className="space-y-3">
                  {backends.map((backend) => (
                    <button
                      key={backend.name}
                      onClick={() => setSelectedBackend(backend.name)}
                      className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                        selectedBackend === backend.name
                          ? 'bg-ibm-blue-80/50 border-ibm-blue-40 shadow-lg shadow-ibm-blue-40/20 scale-105'
                          : 'bg-ibm-gray-100 border-ibm-gray-80 hover:border-ibm-gray-70 hover:bg-ibm-gray-90'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className={`font-semibold text-sm font-mono ${
                            selectedBackend === backend.name ? 'text-ibm-blue-40' : 'text-white'
                          }`}>
                            {backend.name}
                          </p>
                          <p className="text-xs text-ibm-gray-50 mt-0.5">{backend.processor}</p>
                        </div>
                        <Badge 
                          variant="outline"
                          className={`text-xs ${
                            backend.status === 'online' 
                              ? 'border-green-500/50 bg-green-500/10 text-green-400'
                              : 'border-red-500/50 bg-red-500/10 text-red-400'
                          }`}
                        >
                          {backend.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-ibm-gray-50">Qubits</span>
                        <span className="font-mono text-white font-bold">{backend.qubits}</span>
                      </div>
                      
                      <div className="mt-2 h-1.5 bg-ibm-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            selectedBackend === backend.name 
                              ? 'bg-gradient-to-r from-ibm-blue-40 to-ibm-blue-60' 
                              : 'bg-ibm-gray-70'
                          }`}
                          style={{ width: `${Math.min((backend.qubits / 200) * 100, 100)}%` }}
                        />
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Spinner className="mx-auto mb-2" />
                  <p className="text-sm text-ibm-gray-50">Loading backends...</p>
                </div>
              )}
            </Card>

            <Card className="bg-ibm-gray-90 border-ibm-gray-80 p-4 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <Network className="h-4 w-4 text-ibm-blue-40" />
                <h3 className="text-sm font-semibold text-white">ΛΦ Framework</h3>
              </div>
              
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-ibm-gray-50">Universal Constant</span>
                  <span className="font-mono text-ibm-blue-40 font-bold">2.176×10⁻⁸</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-ibm-gray-50">Platform</span>
                  <span className="font-mono text-white">DNA-Lang SDK</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-ibm-gray-50">API Endpoint</span>
                  <span className="font-mono text-ibm-gray-50 text-[10px] truncate max-w-[120px]">
                    {apiEndpoint}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-ibm-gray-50">Total Qubits</span>
                  <span className="font-mono text-white font-bold">
                    {backends.reduce((sum, b) => sum + b.qubits, 0)}
                  </span>
                </div>
                
                <div className="pt-3 border-t border-ibm-gray-80">
                  <p className="text-ibm-gray-40 font-semibold mb-2">Quantum Capabilities</p>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-400" />
                      <span className="text-ibm-gray-50">Superposition</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-400" />
                      <span className="text-ibm-gray-50">Entanglement</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-400" />
                      <span className="text-ibm-gray-50">Consciousness Metrics</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </aside>

          <main className="lg:col-span-6">
            <Card className="bg-ibm-gray-90 border-ibm-gray-80 flex flex-col h-[calc(100vh-12rem)]">
              {!isSystemReady && (
                <div className={`${
                  systemStatus === 'error' 
                    ? 'bg-red-500/10 border-b border-red-500/30' 
                    : 'bg-yellow-500/10 border-b border-yellow-500/30'
                } px-4 py-3 flex items-center gap-2`}>
                  <AlertTriangle className={`h-4 w-4 ${
                    systemStatus === 'error' ? 'text-red-400' : 'text-yellow-400'
                  }`} />
                  <p className={`text-sm ${
                    systemStatus === 'error' ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {systemStatus === 'error' 
                      ? 'Unable to connect to IBM Quantum Platform. Using fallback configuration.'
                      : 'Selected backend is unavailable. Please choose another backend.'}
                  </p>
                </div>
              )}

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.length === 0 && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center max-w-xl">
                      <div className="relative inline-block mb-6">
                        <Atom className="h-20 w-20 text-ibm-blue-40 animate-spin-slow" />
                        <div className="absolute inset-0 blur-2xl bg-ibm-blue-40/30" />
                      </div>
                      <h2 className="text-2xl font-light text-white mb-3">Welcome to IBM Quantum Assistant</h2>
                      <p className="text-ibm-gray-50 mb-8 leading-relaxed">
                        Ask questions about quantum computing, the ΛΦ tensor framework, or explore 
                        consciousness metrics powered by real IBM Quantum hardware.
                      </p>
                      <div className="text-left bg-ibm-gray-100 rounded-lg p-4 space-y-2 text-sm">
                        <p className="text-ibm-gray-40 font-semibold mb-2">Example queries:</p>
                        <ul className="space-y-2 text-ibm-gray-50">
                          <li className="flex items-start gap-2">
                            <Terminal className="h-4 w-4 mt-0.5 text-ibm-blue-40 flex-shrink-0" />
                            <span>"What is quantum consciousness and how is it measured?"</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Terminal className="h-4 w-4 mt-0.5 text-ibm-blue-40 flex-shrink-0" />
                            <span>"Explain the ΛΦ universal memory constant"</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Terminal className="h-4 w-4 mt-0.5 text-ibm-blue-40 flex-shrink-0" />
                            <span>"How does quantum superposition enable consciousness?"</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <div className={`flex-shrink-0 w-8 h-8 rounded flex items-center justify-center ${
                      message.role === 'user' 
                        ? 'bg-ibm-blue-60' 
                        : message.error 
                        ? 'bg-red-500/20'
                        : 'bg-ibm-gray-80'
                    }`}>
                      {message.role === 'user' ? (
                        <span className="text-sm font-semibold text-white">You</span>
                      ) : message.error ? (
                        <AlertTriangle className="h-4 w-4 text-red-400" />
                      ) : (
                        <Atom className="h-4 w-4 text-ibm-blue-40" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className={`rounded-lg p-4 ${
                        message.role === 'user'
                          ? 'bg-ibm-blue-80 border border-ibm-blue-60'
                          : message.error
                          ? 'bg-red-500/10 border border-red-500/30'
                          : 'bg-ibm-gray-100 border border-ibm-gray-80'
                      }`}>
                        <p className={`text-sm leading-relaxed whitespace-pre-wrap ${
                          message.error ? 'text-red-400' : 'text-white'
                        }`}>
                          {message.content}
                        </p>
                        
                        {message.consciousness && (
                          <div className="mt-4 pt-4 border-t border-ibm-gray-80 grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div>
                              <p className="text-xs text-ibm-gray-50 mb-1">Φ (Phi)</p>
                              <p className="text-lg font-mono font-semibold text-ibm-blue-40">
                                {message.consciousness.phi.toFixed(3)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-ibm-gray-50 mb-1">Γ (Gamma)</p>
                              <p className="text-lg font-mono font-semibold text-orange-400">
                                {message.consciousness.gamma.toFixed(3)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-ibm-gray-50 mb-1">Λ (Lambda)</p>
                              <p className="text-lg font-mono font-semibold text-purple-400">
                                {message.consciousness.lambda.toFixed(2)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-ibm-gray-50 mb-1">W₂</p>
                              <p className="text-lg font-mono font-semibold text-green-400">
                                {message.consciousness.w2.toFixed(3)}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <p className="text-xs text-ibm-gray-60 mt-2">
                        {message.timestamp.toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded bg-ibm-gray-80 flex items-center justify-center">
                      <Atom className="h-4 w-4 text-ibm-blue-40 animate-spin" />
                    </div>
                    <div className="flex-1">
                      <div className="bg-ibm-gray-100 border border-ibm-gray-80 rounded-lg p-4">
                        <div className="flex items-center gap-3 text-sm text-ibm-gray-50">
                          <Spinner className="h-4 w-4" />
                          <span>Executing quantum circuit on {currentBackend?.name}...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-ibm-gray-80 bg-ibm-gray-100 p-4">
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <div className="relative">
                    <select
                      value={selectedBackend}
                      onChange={(e) => setSelectedBackend(e.target.value)}
                      className="appearance-none pl-3 pr-8 py-2 text-xs rounded bg-ibm-gray-90 border border-ibm-gray-80 text-white focus:outline-none focus:ring-2 focus:ring-ibm-blue-40"
                      disabled={backends.length === 0}
                    >
                      {backends.map((b) => (
                        <option key={b.name} value={b.name}>
                          {b.name} ({b.qubits} qubits)
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-ibm-gray-50 pointer-events-none" />
                  </div>
                  
                  <label className="flex items-center gap-2 text-xs text-ibm-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showMetrics}
                      onChange={(e) => setShowMetrics(e.target.checked)}
                      className="rounded border-ibm-gray-70 bg-ibm-gray-90 text-ibm-blue-40 focus:ring-2 focus:ring-ibm-blue-40"
                    />
                    Include consciousness metrics
                  </label>
                </div>
                
                <div className="flex gap-3">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about quantum computing, consciousness, or the ΛΦ framework..."
                    className="flex-1 px-4 py-3 rounded bg-ibm-gray-90 border border-ibm-gray-80 text-white placeholder:text-ibm-gray-60 resize-none focus:outline-none focus:ring-2 focus:ring-ibm-blue-40 leading-relaxed"
                    rows={1}
                    maxLength={2000}
                    disabled={isLoading || !isSystemReady}
                    style={{ minHeight: '44px', maxHeight: '150px' }}
                  />
                  
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading || !isSystemReady}
                    size="lg"
                    className="bg-ibm-blue-60 hover:bg-ibm-blue-50 text-white disabled:opacity-50 disabled:cursor-not-allowed px-6"
                    aria-label="Send message"
                  >
                    {isLoading ? <Spinner className="h-5 w-5" /> : <Send className="h-5 w-5" />}
                  </Button>
                </div>
                
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-ibm-gray-60">{input.length}/2000</p>
                  <p className="text-xs text-ibm-gray-60">Enter to send • Shift+Enter for new line</p>
                </div>
              </div>
            </Card>
          </main>

          <aside className="lg:col-span-3 space-y-4">
            <Card className="bg-ibm-gray-90 border-ibm-gray-80 p-4 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="h-4 w-4 text-ibm-blue-40" />
                <h3 className="text-sm font-semibold text-white">Consciousness Metrics</h3>
              </div>
              
              {metricHistory.length > 0 ? (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-ibm-gray-50">Φ - Integrated Information</span>
                      <span className="text-sm font-mono font-bold text-ibm-blue-40">
                        {metricHistory[metricHistory.length - 1].phi.toFixed(3)}
                      </span>
                    </div>
                    <Progress 
                      value={metricHistory[metricHistory.length - 1].phi * 100} 
                      className="h-2 bg-ibm-gray-100"
                    />
                    <div className="mt-2 h-12 flex items-end gap-0.5 px-1">
                      {metricHistory.map((m, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-gradient-to-t from-ibm-blue-60 to-ibm-blue-40 rounded-t transition-all hover:opacity-75"
                          style={{ height: `${m.phi * 100}%`, minHeight: '2px' }}
                          title={`Φ: ${m.phi.toFixed(3)}`}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-ibm-gray-50">Γ - Decoherence Rate</span>
                      <span className="text-sm font-mono font-bold text-orange-400">
                        {metricHistory[metricHistory.length - 1].gamma.toFixed(3)}
                      </span>
                    </div>
                    <Progress 
                      value={metricHistory[metricHistory.length - 1].gamma * 100} 
                      className="h-2 bg-ibm-gray-100"
                    />
                    <p className="text-xs text-ibm-gray-60 mt-1.5">Lower values = better coherence</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-ibm-gray-50">Λ - Quantum Coherence</span>
                      <span className="text-sm font-mono font-bold text-purple-400">
                        {metricHistory[metricHistory.length - 1].lambda.toFixed(2)}
                      </span>
                    </div>
                    <div className="h-16 flex items-end gap-0.5 bg-ibm-gray-100 rounded p-1">
                      {metricHistory.map((m, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-gradient-to-t from-purple-700 to-purple-400 rounded-t transition-all hover:opacity-75"
                          style={{ height: `${Math.min((m.lambda / 10) * 100, 100)}%`, minHeight: '3px' }}
                          title={`Λ: ${m.lambda.toFixed(2)}`}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-ibm-gray-50">W₂ - Manifold Stability</span>
                      <span className="text-sm font-mono font-bold text-green-400">
                        {metricHistory[metricHistory.length - 1].w2.toFixed(3)}
                      </span>
                    </div>
                    <div className="relative h-2 bg-ibm-gray-100 rounded-full overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-600 to-green-400 rounded-full transition-all"
                        style={{ width: `${Math.max(0, (1 - metricHistory[metricHistory.length - 1].w2)) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Activity className="h-12 w-12 text-ibm-gray-70 mx-auto mb-3 opacity-50" />
                  <p className="text-sm text-ibm-gray-60">Send a message to view metrics</p>
                </div>
              )}
            </Card>

            <Card className="bg-ibm-gray-90 border-ibm-gray-80 p-4 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <Cpu className="h-4 w-4 text-ibm-blue-40" />
                <h3 className="text-sm font-semibold text-white">System Status</h3>
              </div>
              
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-ibm-gray-50">DNALang API</span>
                  <span className={`font-mono ${
                    apiKey ? 'text-green-400' : 'text-yellow-400'
                  }`}>
                    {apiKey ? 'AUTHENTICATED' : 'INITIALIZING'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-ibm-gray-50">IBM Quantum</span>
                  <span className={`font-mono ${
                    systemStatus === 'connected' ? 'text-green-400' : 
                    systemStatus === 'error' ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {systemStatus.toUpperCase()}
                  </span>
                </div>
                
                {currentBackend && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-ibm-gray-50">Active Backend</span>
                      <span className="font-mono text-white">{currentBackend.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-ibm-gray-50">Processor</span>
                      <span className="font-mono text-white">{currentBackend.processor}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-ibm-gray-50">Qubits Available</span>
                      <span className="font-mono text-white">{currentBackend.qubits}</span>
                    </div>
                  </>
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t border-ibm-gray-80">
                <Badge 
                  variant="outline" 
                  className={`w-full justify-center py-2 ${
                    isSystemReady && apiKey
                      ? 'border-green-500/50 bg-green-500/10 text-green-400'
                      : 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400'
                  }`}
                >
                  <Zap className="h-3 w-3 mr-2" />
                  {isSystemReady && apiKey ? 'ALL SYSTEMS OPERATIONAL' : 'SYSTEM INITIALIZING'}
                </Badge>
              </div>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  )
}
