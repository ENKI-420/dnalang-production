'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Terminal, Cpu, Code, Send, Play, Save, GitBranch, Activity, Layers, Zap, Shield, Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'

type Message = {
  id: string
  role: 'user' | 'aura' | 'agent'
  agentType?: 'architect' | 'coder' | 'quantum' | 'admin'
  content: string
  timestamp: number
}

type AgentStatus = {
  id: string
  name: string
  role: string
  status: 'idle' | 'coding' | 'optimizing' | 'active' | 'error'
  coherence: number
}

export default function ArenaPage() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      role: 'aura',
      agentType: 'admin',
      content: 'dna::}{::lang v3.1.0 initialized. Quantum Swarm ready. \n\nmetrics: { ΛΦ: 2.176435e-8, Φ: 0.856, Γ: 0.0042 }',
      timestamp: Date.now()
    }
  ])
  const [agents, setAgents] = useState<AgentStatus[]>([])
  const [activeFile, setActiveFile] = useState('aura_orchestrator.py')
  const [codeContent, setCodeContent] = useState('# AURA Self-Correction Loop\n# ΛΦ = 2.176435 × 10⁻⁸ s⁻¹\n\ndef optimize_quantum_state(circuit):\n    """\n    Applies phase-conjugate mutation for drift correction.\n    Target Hardware: ibm_fez (156q)\n    """\n    qwc = QuantumWassersteinCompiler()\n    optimized_circuit = qwc.compile(circuit, target="ibm_fez")\n    \n    return optimized_circuit\n')
  const [loading, setLoading] = useState(false)

  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    // Load real swarm agents
    const loadAgents = async () => {
      try {
        const res = await fetch('/api/swarm/agents')
        if (res.ok) {
          const data = await res.json()
          const arenaAgents = data.slice(0, 4).map((agent: any) => ({
            id: agent.id,
            name: `@Aura-${agent.name}`,
            role: agent.specialization || 'Agent',
            status: agent.status === 'active' ? 'coding' : 'idle',
            coherence: agent.trust_score || 0.85
          }))
          setAgents(arenaAgents)
        }
      } catch (error) {
        console.error('Failed to load agents:', error)
        // Fallback to default agents
        setAgents([
          { id: '1', name: '@Aura-Orchestrator', role: 'Cortex', status: 'idle', coherence: 0.99 },
          { id: '2', name: '@Aura-Architect', role: 'Design', status: 'idle', coherence: 0.95 },
          { id: '3', name: '@Aura-Coder', role: 'Implementation', status: 'coding', coherence: 0.92 },
          { id: '4', name: '@Aura-Quantum', role: 'Optimization', status: 'optimizing', coherence: 0.98 },
        ])
      }
    }

    loadAgents()
    const interval = setInterval(loadAgents, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      // Call real NLP2 orchestrator API
      const res = await fetch('/api/nlp2/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: userMsg.content })
      })

      if (res.ok) {
        const data = await res.json()

        // Add AURA response with proper execution plan parsing
        const executionSteps = data.execution_plan?.steps || data.execution_plan || []
        const stepsText = Array.isArray(executionSteps)
          ? executionSteps.map((step: string, i: number) => `${i + 1}. ${step}`).join('\n')
          : 'Execution plan processing...'

        const agentCount = data.result?.agents_assigned || data.execution_plan?.agents?.length || 0
        const estimatedTime = data.execution_plan?.estimated_time
          ? `\nEstimated time: ${Math.round(data.execution_plan.estimated_time / 60)} min`
          : ''

        const auraMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'agent',
          agentType: 'coder',
          content: `✅ Analyzed via Neural Cortex\n\nIntent: ${data.intent?.action || 'unknown'}\nTarget: ${data.intent?.target || 'unknown'}\nConfidence: ${data.intent?.confidence ? Math.round(data.intent.confidence * 100) : 0}%\n\nExecution Plan:\n${stepsText}\n\nAgents assigned: ${agentCount}${estimatedTime}\n\nΛΦ = ${data.lambda_phi || '2.176435e-8'}`,
          timestamp: Date.now()
        }

        setMessages(prev => [...prev, auraMsg])

        // Update code editor if code was generated
        if (data.generated_code) {
          setCodeContent(data.generated_code)
        }
      } else {
        throw new Error('API call failed')
      }
    } catch (error: any) {
      const errorMsg: Message = {
        id: (Date.now() + 2).toString(),
        role: 'aura',
        agentType: 'admin',
        content: `❌ Error: ${error.message}\n\nFalling back to local processing...`,
        timestamp: Date.now()
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-black text-green-400 font-mono overflow-hidden selection:bg-green-900 selection:text-white">
      <header className="h-12 border-b border-green-900/50 flex items-center justify-between px-4 bg-gray-950/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-purple-400 animate-pulse" />
          <span className="font-bold text-lg tracking-wider">AURA <span className="text-green-600">ARENA</span></span>
        </div>
        <div className="flex items-center gap-6 text-xs">
          <div className="flex items-center gap-2"><Zap className="w-3 h-3 text-yellow-400" /> <span className="text-green-400 font-bold">ΛΦ: 0.982</span></div>
          <Button variant="ghost" size="sm" className="h-7 text-red-400 border border-red-900/30"><Shield className="w-3 h-3 mr-1" /> ADMIN ACCESS</Button>
        </div>
      </header>
      <div className="flex-1 flex overflow-hidden">
        <div className="w-64 border-r border-green-900/30 bg-gray-950/50 flex flex-col p-2 gap-2">
          <div className="text-xs uppercase text-gray-500 font-bold p-2 border-b border-green-900/30">Active Swarm {agents.length > 0 && `(${agents.length})`}</div>
          {agents.length === 0 && (
            <div className="p-3 text-center text-gray-600 text-xs">Loading agents...</div>
          )}
          {agents.map(agent => (
            <div key={agent.id} className="p-3 rounded bg-gray-900/50 border border-green-900/20">
              <div className="flex justify-between mb-1">
                <span className="font-bold text-sm text-green-300">{agent.name}</span>
                {agent.status === 'coding' && (
                  <span className="text-[8px] text-cyan-400 animate-pulse">● LIVE</span>
                )}
              </div>
              <div className="text-[10px] text-gray-500 mb-2">{agent.role}</div>
              <div className="h-0.5 w-full bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: `${agent.coherence * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="flex-1 flex flex-col border-r border-green-900/30 bg-black relative">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-6">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`p-3 rounded text-sm border max-w-[80%] ${msg.role === 'user' ? 'bg-green-950/30 border-green-900/50' : 'bg-gray-900/50 border-gray-800'}`}>
                    <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          </ScrollArea>
          <div className="p-4 border-t border-green-900/30 bg-gray-900/10 flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !loading && handleSendMessage()}
              className="bg-gray-950 border-green-900/50 text-green-300 font-mono"
              placeholder={loading ? "Processing..." : "Command the swarm..."}
              disabled={loading}
            />
            <Button onClick={handleSendMessage} disabled={loading} className="bg-green-800 hover:bg-green-700">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="w-[45%] flex flex-col bg-[#0d0d0d]">
          <div className="h-10 border-b border-green-900/30 flex items-center justify-between px-3 bg-gray-900/20">
            <div className="flex items-center gap-1"><Code className="w-3 h-3" /><span className="text-xs text-gray-300">{activeFile}</span></div>
            <Button size="sm" className="h-6 bg-green-800 text-[10px]"><Save className="w-3 h-3 mr-1" /> Commit</Button>
          </div>
          <textarea value={codeContent} onChange={(e) => setCodeContent(e.target.value)} className="flex-1 bg-transparent text-gray-300 p-4 font-mono text-sm resize-none focus:outline-none" spellCheck={false} />
        </div>
      </div>
    </div>
  )
}
