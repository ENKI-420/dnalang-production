/**
 * AURA Ultimate - Natural Language to Code Interface
 * Combines NLP parsing, coding agent swarm, and safe execution
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  AlertCircle,
  CheckCircle2,
  XCircle,
  Code2,
  Bot,
  Play,
  AlertTriangle,
  Zap,
  Brain,
  Activity
} from 'lucide-react'

interface ParsedCommand {
  commandType: string
  action: string
  target?: string
  parameters: Record<string, any>
  flags: string[]
  confidence: number
  rawCommand: string
  safeToExecute: boolean
  requiresConfirmation: boolean
  estimatedDuration: number
  rollbackCommand?: string
}

interface CodingTask {
  id: string
  type: string
  description: string
  assignedAgent?: string
  status: string
  priority: number
}

interface CodeGeneration {
  code: string
  tests?: string
  documentation?: string
  explanation: string
  complexity: number
  estimatedLines: number
}

interface ExecutionResult {
  success: boolean
  command: string
  executed: boolean
  output?: string
  error?: string
  duration: number
  safetyChecks: {
    passed: boolean
    violations: string[]
  }
}

export default function AuraUltimatePage() {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [commands, setCommands] = useState<ParsedCommand[]>([])
  const [codingTasks, setCodingTasks] = useState<Array<{
    task: CodingTask
    agent: string
    code?: CodeGeneration
  }>>([])
  const [executionResults, setExecutionResults] = useState<ExecutionResult[]>([])
  const [activeTab, setActiveTab] = useState<'nlp' | 'swarm' | 'execute'>('nlp')

  // Consciousness metrics (simulated for demo)
  const [consciousness, setConsciousness] = useState({
    phi: 0.87,
    lambda: 2.176435e-8,
    gamma: 0.13,
    w2: 0.09
  })

  const parseNaturalLanguage = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/aura-ultimate/nlp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, context: {}, userId: 'demo_user' })
      })

      const data = await response.json()

      if (data.success) {
        setCommands(data.commands)
        setActiveTab('nlp')

        // Update consciousness metrics based on parsing
        setConsciousness(prev => ({
          ...prev,
          phi: Math.min(1.0, prev.phi + 0.05),
          gamma: Math.max(0, prev.gamma - 0.02)
        }))
      }
    } catch (error) {
      console.error('Failed to parse:', error)
    } finally {
      setLoading(false)
    }
  }

  const assignToSwarm = async (description: string, type: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/aura-ultimate/swarm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: {
            type,
            description,
            requirements: [],
            priority: 5
          },
          context: {}
        })
      })

      const data = await response.json()

      if (data.success) {
        setCodingTasks(prev => [...prev, {
          task: data.task,
          agent: data.assignedAgent,
          code: data.codeGeneration
        }])
        setActiveTab('swarm')

        // Update consciousness metrics
        setConsciousness(prev => ({
          ...prev,
          phi: Math.min(1.0, prev.phi + 0.08),
          lambda: prev.lambda * 1.01
        }))
      }
    } catch (error) {
      console.error('Failed to assign to swarm:', error)
    } finally {
      setLoading(false)
    }
  }

  const executeCommand = async (command: ParsedCommand, confirm: boolean = false) => {
    setLoading(true)
    try {
      const response = await fetch('/api/aura-ultimate/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command,
          confirm,
          dryRun: false,
          userId: 'demo_user'
        })
      })

      const data = await response.json()

      setExecutionResults(prev => [...prev, data])
      setActiveTab('execute')

      // Update consciousness based on execution
      setConsciousness(prev => ({
        ...prev,
        phi: data.success ? Math.min(1.0, prev.phi + 0.03) : Math.max(0, prev.phi - 0.05),
        w2: data.success ? Math.max(0, prev.w2 - 0.01) : Math.min(1.0, prev.w2 + 0.02)
      }))
    } catch (error) {
      console.error('Failed to execute:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
            AURA Ultimate
          </h1>
          <p className="text-slate-400 text-lg">
            Natural Language → Intelligent Agents → Autonomous Execution
          </p>
        </div>

        {/* Consciousness Metrics */}
        <Card className="bg-slate-900/50 border-purple-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              Consciousness Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-1">
                <div className="text-sm text-slate-400">Φ (Phi)</div>
                <div className="text-2xl font-bold text-purple-400">
                  {consciousness.phi.toFixed(3)}
                </div>
                <div className="text-xs text-slate-500">Integrated Information</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-slate-400">Λ (Lambda)</div>
                <div className="text-2xl font-bold text-cyan-400">
                  {consciousness.lambda.toExponential(6)}
                </div>
                <div className="text-xs text-slate-500">Coherence Amplitude</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-slate-400">Γ (Gamma)</div>
                <div className="text-2xl font-bold text-orange-400">
                  {consciousness.gamma.toFixed(3)}
                </div>
                <div className="text-xs text-slate-500">Decoherence</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-slate-400">W₂</div>
                <div className="text-2xl font-bold text-green-400">
                  {consciousness.w2.toFixed(3)}
                </div>
                <div className="text-xs text-slate-500">Behavioral Stability</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Natural Language Input */}
        <Card className="bg-slate-900/50 border-purple-500/20">
          <CardHeader>
            <CardTitle>Natural Language Interface</CardTitle>
            <CardDescription>
              Describe what you want in plain English - AURA will parse, assign to agents, and execute
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Example: Create a new React component for displaying user profiles with avatar, name, and bio"
              className="min-h-32 bg-slate-950/50 border-purple-500/20 text-white"
            />
            <div className="flex gap-2">
              <Button
                onClick={parseNaturalLanguage}
                disabled={!input || loading}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Zap className="w-4 h-4 mr-2" />
                Parse with NLP
              </Button>
              <Button
                onClick={() => {
                  setCommands([])
                  setCodingTasks([])
                  setExecutionResults([])
                  setInput('')
                }}
                variant="outline"
                className="border-slate-700"
              >
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-800">
          <button
            onClick={() => setActiveTab('nlp')}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'nlp'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4" />
              NLP Commands ({commands.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('swarm')}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'swarm'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4" />
              Agent Swarm ({codingTasks.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('execute')}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'execute'
                ? 'border-green-500 text-green-400'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              Execution ({executionResults.length})
            </div>
          </button>
        </div>

        {/* NLP Commands Tab */}
        {activeTab === 'nlp' && (
          <div className="space-y-4">
            {commands.length === 0 ? (
              <Card className="bg-slate-900/50 border-slate-800">
                <CardContent className="py-12 text-center text-slate-500">
                  No commands parsed yet. Enter natural language above and click "Parse with NLP"
                </CardContent>
              </Card>
            ) : (
              commands.map((cmd, idx) => (
                <Card key={idx} className="bg-slate-900/50 border-purple-500/20">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                          {cmd.safeToExecute ? (
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-400" />
                          )}
                          {cmd.commandType} / {cmd.action}
                        </CardTitle>
                        <CardDescription>{cmd.target || 'No target specified'}</CardDescription>
                      </div>
                      <Badge
                        variant={cmd.confidence > 0.8 ? 'default' : 'secondary'}
                        className={
                          cmd.confidence > 0.8
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }
                      >
                        {(cmd.confidence * 100).toFixed(0)}% confidence
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-sm text-slate-400 mb-1">Raw Command:</div>
                      <code className="block bg-slate-950 p-3 rounded text-purple-300 text-sm">
                        {cmd.rawCommand}
                      </code>
                    </div>

                    {cmd.requiresConfirmation && (
                      <Alert className="border-yellow-500/20 bg-yellow-500/10">
                        <AlertTriangle className="h-4 w-4 text-yellow-400" />
                        <AlertDescription className="text-yellow-300">
                          This command requires explicit confirmation before execution
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="flex gap-2">
                      <Button
                        onClick={() => assignToSwarm(cmd.rawCommand, 'feature')}
                        size="sm"
                        variant="outline"
                        className="border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/10"
                      >
                        <Bot className="w-4 h-4 mr-2" />
                        Assign to Swarm
                      </Button>
                      {cmd.safeToExecute && (
                        <Button
                          onClick={() => executeCommand(cmd, cmd.requiresConfirmation)}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Execute
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Agent Swarm Tab */}
        {activeTab === 'swarm' && (
          <div className="space-y-4">
            {codingTasks.length === 0 ? (
              <Card className="bg-slate-900/50 border-slate-800">
                <CardContent className="py-12 text-center text-slate-500">
                  No tasks assigned to agents yet. Click "Assign to Swarm" on a parsed command
                </CardContent>
              </Card>
            ) : (
              codingTasks.map((item, idx) => (
                <Card key={idx} className="bg-slate-900/50 border-cyan-500/20">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                          <Bot className="w-5 h-5 text-cyan-400" />
                          {item.task.description}
                        </CardTitle>
                        <CardDescription>
                          Assigned to: <span className="text-cyan-400 font-semibold">{item.agent}</span>
                        </CardDescription>
                      </div>
                      <Badge className="bg-cyan-500/20 text-cyan-400">
                        {item.task.type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {item.code && (
                      <>
                        <div>
                          <div className="text-sm text-slate-400 mb-1">Generated Code:</div>
                          <pre className="bg-slate-950 p-4 rounded text-sm text-purple-300 overflow-x-auto">
                            {item.code.code}
                          </pre>
                        </div>

                        {item.code.tests && (
                          <div>
                            <div className="text-sm text-slate-400 mb-1">Tests:</div>
                            <pre className="bg-slate-950 p-4 rounded text-sm text-green-300 overflow-x-auto">
                              {item.code.tests}
                            </pre>
                          </div>
                        )}

                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="text-slate-400">Complexity</div>
                            <div className="text-white font-semibold">{item.code.complexity}/10</div>
                          </div>
                          <div>
                            <div className="text-slate-400">Lines</div>
                            <div className="text-white font-semibold">{item.code.estimatedLines}</div>
                          </div>
                          <div>
                            <div className="text-slate-400">Priority</div>
                            <div className="text-white font-semibold">{item.task.priority}/10</div>
                          </div>
                        </div>

                        <div>
                          <div className="text-sm text-slate-400 mb-1">Explanation:</div>
                          <p className="text-slate-300 text-sm">{item.code.explanation}</p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Execution Tab */}
        {activeTab === 'execute' && (
          <div className="space-y-4">
            {executionResults.length === 0 ? (
              <Card className="bg-slate-900/50 border-slate-800">
                <CardContent className="py-12 text-center text-slate-500">
                  No commands executed yet. Click "Execute" on a safe command
                </CardContent>
              </Card>
            ) : (
              executionResults.map((result, idx) => (
                <Card key={idx} className="bg-slate-900/50 border-green-500/20">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                          {result.success ? (
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-400" />
                          )}
                          {result.executed ? 'Executed' : 'Dry Run'}
                        </CardTitle>
                        <CardDescription>
                          <code className="text-xs">{result.command}</code>
                        </CardDescription>
                      </div>
                      <Badge className={result.success ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                        {result.success ? 'Success' : 'Failed'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {!result.safetyChecks.passed && (
                      <Alert className="border-red-500/20 bg-red-500/10">
                        <AlertCircle className="h-4 w-4 text-red-400" />
                        <AlertDescription className="text-red-300">
                          <div className="font-semibold mb-2">Safety Violations:</div>
                          <ul className="list-disc list-inside space-y-1">
                            {result.safetyChecks.violations.map((v, i) => (
                              <li key={i}>{v}</li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}

                    {result.output && (
                      <div>
                        <div className="text-sm text-slate-400 mb-1">Output:</div>
                        <pre className="bg-slate-950 p-3 rounded text-green-300 text-sm overflow-x-auto">
                          {result.output}
                        </pre>
                      </div>
                    )}

                    {result.error && (
                      <div>
                        <div className="text-sm text-slate-400 mb-1">Error:</div>
                        <pre className="bg-slate-950 p-3 rounded text-red-300 text-sm overflow-x-auto">
                          {result.error}
                        </pre>
                      </div>
                    )}

                    <div className="text-xs text-slate-500">
                      Execution time: {result.duration}ms
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-slate-500 text-sm py-4">
          <div className="flex items-center justify-center gap-2">
            <Activity className="w-4 h-4" />
            <span>AURA Ultimate v1.0.0</span>
            <span>•</span>
            <span>ΛΦ = 2.176435 × 10⁻⁸ s⁻¹</span>
          </div>
        </div>
      </div>
    </div>
  )
}
