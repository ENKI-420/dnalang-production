'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Brain, Cpu, Activity, Shield, CheckCircle, XCircle,
  Zap, TrendingUp, Users, Lock, Unlock, History,
  Settings, Eye, Play, Pause, RotateCw, AlertCircle
} from 'lucide-react'

// IBM Watsonx & Quantum Integration Types
interface WatsonxProfile {
  userId: string
  preferences: {
    taskPriority: 'speed' | 'quality' | 'balanced'
    quantumBackend: 'ibm_fez' | 'ibm_torino' | 'ibm_kyoto'
    autoOptimize: boolean
    learningRate: number
  }
  insights: {
    workPatterns: string[]
    commonTasks: string[]
    efficiencyGains: number
  }
}

interface QuantumAgent {
  id: string
  name: string
  status: 'idle' | 'active' | 'learning' | 'optimizing'
  capabilities: string[]
  trust: number // 0-1 trust score
  permissions: string[]
  performance: {
    tasksCompleted: number
    successRate: number
    avgExecutionTime: number
  }
}

interface PermissionRequest {
  id: string
  agentId: string
  action: string
  resource: string
  reason: string
  timestamp: string
  status: 'pending' | 'approved' | 'denied'
}

interface ActivityLog {
  id: string
  timestamp: string
  agentId: string
  action: string
  result: 'success' | 'failure' | 'pending'
  details: string
  impactScore: number
}

export default function QuantumOrchestrator() {
  const [profile, setProfile] = useState<WatsonxProfile | null>(null)
  const [agents, setAgents] = useState<QuantumAgent[]>([])
  const [permissions, setPermissions] = useState<PermissionRequest[]>([])
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const [learningMode, setLearningMode] = useState(true)
  const [userQuery, setUserQuery] = useState('')

  // Initialize demo data
  useEffect(() => {
    // Initialize user profile
    setProfile({
      userId: 'user-001',
      preferences: {
        taskPriority: 'balanced',
        quantumBackend: 'ibm_fez',
        autoOptimize: true,
        learningRate: 0.8
      },
      insights: {
        workPatterns: [
          'Prefers morning quantum runs',
          'High accuracy requirements for financial tasks',
          'Batch processing preferred for data analysis'
        ],
        commonTasks: [
          'Data optimization',
          'Quantum circuit synthesis',
          'Pattern recognition'
        ],
        efficiencyGains: 34.2
      }
    })

    // Initialize quantum agents
    setAgents([
      {
        id: 'agent-watson-001',
        name: 'Watson Optimizer',
        status: 'active',
        capabilities: ['optimization', 'data-analysis', 'pattern-recognition'],
        trust: 0.92,
        permissions: ['read-data', 'optimize-circuits', 'submit-jobs'],
        performance: {
          tasksCompleted: 156,
          successRate: 0.94,
          avgExecutionTime: 12.3
        }
      },
      {
        id: 'agent-quantum-002',
        name: 'IBM Quantum Executor',
        status: 'active',
        capabilities: ['quantum-execution', 'backend-selection', 'error-mitigation'],
        trust: 0.88,
        permissions: ['execute-circuits', 'access-ibm-quantum', 'monitor-jobs'],
        performance: {
          tasksCompleted: 89,
          successRate: 0.91,
          avgExecutionTime: 45.7
        }
      },
      {
        id: 'agent-learn-003',
        name: 'Learning Assistant',
        status: 'learning',
        capabilities: ['user-profiling', 'task-prediction', 'efficiency-analysis'],
        trust: 0.76,
        permissions: ['read-activity', 'analyze-patterns'],
        performance: {
          tasksCompleted: 234,
          successRate: 0.87,
          avgExecutionTime: 2.1
        }
      }
    ])

    // Initialize pending permissions
    setPermissions([
      {
        id: 'perm-001',
        agentId: 'agent-watson-001',
        action: 'auto-optimize-morning-tasks',
        resource: 'quantum-circuits',
        reason: 'Detected pattern: user prefers optimized circuits ready by 9 AM',
        timestamp: new Date().toISOString(),
        status: 'pending'
      },
      {
        id: 'perm-002',
        agentId: 'agent-learn-003',
        action: 'create-user-preference-profile',
        resource: 'user-data',
        reason: 'Build personalized task recommendations based on 30-day history',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        status: 'pending'
      }
    ])

    // Initialize activity log
    setActivities([
      {
        id: 'act-001',
        timestamp: new Date().toISOString(),
        agentId: 'agent-quantum-002',
        action: 'Executed quantum circuit on ibm_fez',
        result: 'success',
        details: 'VQE circuit, 127 qubits, 1024 shots, Φ=0.87',
        impactScore: 8.5
      },
      {
        id: 'act-002',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        agentId: 'agent-watson-001',
        action: 'Optimized 5 circuits for morning batch',
        result: 'success',
        details: 'Reduced gate count by 23%, improved fidelity by 12%',
        impactScore: 9.2
      },
      {
        id: 'act-003',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        agentId: 'agent-learn-003',
        action: 'Identified new efficiency pattern',
        result: 'success',
        details: 'User responds 40% faster to visual summaries vs text logs',
        impactScore: 7.8
      }
    ])
  }, [])

  const handlePermissionDecision = (permId: string, decision: 'approved' | 'denied') => {
    setPermissions(prev =>
      prev.map(p => p.id === permId ? { ...p, status: decision } : p)
    )

    // Add to activity log
    const perm = permissions.find(p => p.id === permId)
    if (perm) {
      setActivities(prev => [{
        id: `act-${Date.now()}`,
        timestamp: new Date().toISOString(),
        agentId: perm.agentId,
        action: `Permission ${decision}: ${perm.action}`,
        result: decision === 'approved' ? 'success' : 'failure',
        details: perm.reason,
        impactScore: decision === 'approved' ? 8.0 : 3.0
      }, ...prev])
    }
  }

  const submitTask = async () => {
    if (!userQuery.trim()) return

    // Add to activity log
    setActivities(prev => [{
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
      agentId: 'agent-watson-001',
      action: `Processing user query: "${userQuery}"`,
      result: 'pending',
      details: 'Analyzing task requirements and selecting optimal agent',
      impactScore: 7.5
    }, ...prev])

    setUserQuery('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#02010A] via-[#0F3D91]/10 to-[#02010A] text-white p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-light mb-2">Quantum Swarm Orchestrator</h1>
            <p className="text-gray-400">Personalized IBM Watsonx × Quantum Agent Mesh</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge className="bg-[#00FFD1]/20 text-[#00FFD1] px-4 py-2">
              <Brain className="h-4 w-4 mr-2" />
              Learning Mode: {learningMode ? 'ON' : 'OFF'}
            </Badge>
            <Button
              onClick={() => setLearningMode(!learningMode)}
              variant="outline"
              className="border-[#6A00F4]/50 hover:bg-[#6A00F4]/20"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* User Insights */}
      {profile && (
        <div className="max-w-7xl mx-auto mb-8">
          <Card className="bg-[#0F3D91]/20 border-[#6A00F4]/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-[#00FFD1]" />
                Your Personalized Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="text-sm text-gray-400 mb-2">Work Patterns Detected</h4>
                  <ul className="space-y-1">
                    {profile.insights.workPatterns.map((pattern, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>{pattern}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm text-gray-400 mb-2">Common Tasks</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.insights.commonTasks.map((task, i) => (
                      <Badge key={i} className="bg-[#6A00F4]/20 text-[#6A00F4]">
                        {task}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm text-gray-400 mb-2">Efficiency Gains</h4>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-8 w-8 text-green-400" />
                    <span className="text-3xl font-bold text-green-400">
                      +{profile.insights.efficiencyGains}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">vs. manual workflow</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Task Input */}
      <div className="max-w-7xl mx-auto mb-8">
        <Card className="bg-[#0F3D91]/20 border-[#6A00F4]/30">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <Input
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && submitTask()}
                placeholder="What would you like to accomplish? (e.g., 'Optimize my morning quantum circuits')"
                className="flex-1 bg-black/30 border-[#6A00F4]/30 text-white placeholder:text-gray-500"
              />
              <Button
                onClick={submitTask}
                className="bg-[#00FFD1] hover:bg-[#00FFD1]/80 text-black"
              >
                <Play className="h-4 w-4 mr-2" />
                Submit
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="agents" className="max-w-7xl mx-auto">
        <TabsList className="bg-[#0F3D91]/30 border-[#6A00F4]/30">
          <TabsTrigger value="agents">Quantum Agents</TabsTrigger>
          <TabsTrigger value="permissions">
            Permissions
            {permissions.filter(p => p.status === 'pending').length > 0 && (
              <Badge className="ml-2 bg-yellow-500/20 text-yellow-400">
                {permissions.filter(p => p.status === 'pending').length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Agents Tab */}
        <TabsContent value="agents">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {agents.map(agent => (
              <Card
                key={agent.id}
                className={`bg-[#0F3D91]/20 border-[#6A00F4]/30 cursor-pointer transition-all ${
                  selectedAgent === agent.id ? 'ring-2 ring-[#00FFD1]' : ''
                }`}
                onClick={() => setSelectedAgent(agent.id)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{agent.name}</CardTitle>
                    <Badge className={
                      agent.status === 'active' ? 'bg-green-500/20 text-green-400' :
                      agent.status === 'learning' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-gray-500/20 text-gray-400'
                    }>
                      {agent.status}
                    </Badge>
                  </div>
                  <CardDescription className="text-gray-400 text-xs">
                    ID: {agent.id}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Trust Score */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-400">Trust Score</span>
                      <span className="text-sm font-bold">{(agent.trust * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-black/30 rounded-full h-2">
                      <div
                        className="bg-[#00FFD1] h-2 rounded-full transition-all"
                        style={{ width: `${agent.trust * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Capabilities */}
                  <div className="mb-4">
                    <h4 className="text-xs text-gray-400 mb-2">Capabilities</h4>
                    <div className="flex flex-wrap gap-1">
                      {agent.capabilities.map((cap, i) => (
                        <Badge key={i} className="bg-[#6A00F4]/20 text-[#6A00F4] text-xs">
                          {cap}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Performance */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Tasks Completed</span>
                      <span className="font-mono">{agent.performance.tasksCompleted}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Success Rate</span>
                      <span className="font-mono text-green-400">
                        {(agent.performance.successRate * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Avg Time</span>
                      <span className="font-mono">{agent.performance.avgExecutionTime.toFixed(1)}s</span>
                    </div>
                  </div>

                  {/* Permissions Count */}
                  <div className="mt-4 pt-4 border-t border-[#6A00F4]/20">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Shield className="h-3 w-3" />
                      <span>{agent.permissions.length} active permissions</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions">
          <Card className="bg-[#0F3D91]/20 border-[#6A00F4]/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-[#00FFD1]" />
                Permission Requests
              </CardTitle>
              <CardDescription>
                Review and approve agent requests for new capabilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {permissions.map(perm => (
                  <div
                    key={perm.id}
                    className={`p-4 rounded-lg border ${
                      perm.status === 'pending' ? 'border-yellow-500/30 bg-yellow-500/5' :
                      perm.status === 'approved' ? 'border-green-500/30 bg-green-500/5' :
                      'border-red-500/30 bg-red-500/5'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold flex items-center gap-2">
                          {perm.status === 'pending' && <AlertCircle className="h-4 w-4 text-yellow-400" />}
                          {perm.status === 'approved' && <CheckCircle className="h-4 w-4 text-green-400" />}
                          {perm.status === 'denied' && <XCircle className="h-4 w-4 text-red-400" />}
                          {perm.action}
                        </h4>
                        <p className="text-sm text-gray-400 mt-1">
                          Agent: {agents.find(a => a.id === perm.agentId)?.name || perm.agentId}
                        </p>
                      </div>
                      <Badge className={
                        perm.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        perm.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                        'bg-red-500/20 text-red-400'
                      }>
                        {perm.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-300 mb-2">{perm.reason}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                      <History className="h-3 w-3" />
                      {new Date(perm.timestamp).toLocaleString()}
                    </div>
                    {perm.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handlePermissionDecision(perm.id, 'approved')}
                          size="sm"
                          className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border-green-500/30"
                        >
                          <Unlock className="h-3 w-3 mr-1" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => handlePermissionDecision(perm.id, 'denied')}
                          size="sm"
                          variant="outline"
                          className="border-red-500/30 hover:bg-red-500/10 text-red-400"
                        >
                          <Lock className="h-3 w-3 mr-1" />
                          Deny
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Log Tab */}
        <TabsContent value="activity">
          <Card className="bg-[#0F3D91]/20 border-[#6A00F4]/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-[#00FFD1]" />
                Activity Log
              </CardTitle>
              <CardDescription>
                Complete registry of all agent actions and events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activities.map(activity => (
                  <div
                    key={activity.id}
                    className="p-3 rounded-lg bg-black/20 border border-[#6A00F4]/20 hover:border-[#6A00F4]/40 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {activity.result === 'success' && <CheckCircle className="h-4 w-4 text-green-400" />}
                        {activity.result === 'failure' && <XCircle className="h-4 w-4 text-red-400" />}
                        {activity.result === 'pending' && <RotateCw className="h-4 w-4 text-yellow-400 animate-spin" />}
                        <span className="font-semibold text-sm">{activity.action}</span>
                      </div>
                      <Badge className="bg-[#6A00F4]/20 text-[#6A00F4] text-xs">
                        Impact: {activity.impactScore.toFixed(1)}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-400 mb-2">{activity.details}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Agent: {agents.find(a => a.id === activity.agentId)?.name || activity.agentId}</span>
                      <span>{new Date(activity.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card className="bg-[#0F3D91]/20 border-[#6A00F4]/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-[#00FFD1]" />
                Orchestrator Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profile && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-semibold mb-3">Quantum Backend Preference</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {['ibm_fez', 'ibm_torino', 'ibm_kyoto'].map(backend => (
                        <Button
                          key={backend}
                          variant={profile.preferences.quantumBackend === backend ? 'default' : 'outline'}
                          className={profile.preferences.quantumBackend === backend ?
                            'bg-[#00FFD1] text-black' :
                            'border-[#6A00F4]/30'
                          }
                          onClick={() => setProfile({
                            ...profile,
                            preferences: { ...profile.preferences, quantumBackend: backend as any }
                          })}
                        >
                          {backend}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-3">Task Priority</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {['speed', 'quality', 'balanced'].map(priority => (
                        <Button
                          key={priority}
                          variant={profile.preferences.taskPriority === priority ? 'default' : 'outline'}
                          className={profile.preferences.taskPriority === priority ?
                            'bg-[#00FFD1] text-black' :
                            'border-[#6A00F4]/30'
                          }
                          onClick={() => setProfile({
                            ...profile,
                            preferences: { ...profile.preferences, taskPriority: priority as any }
                          })}
                        >
                          {priority}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold">Auto-Optimize</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        className={profile.preferences.autoOptimize ?
                          'bg-green-500/20 border-green-500/30 text-green-400' :
                          'border-[#6A00F4]/30'
                        }
                        onClick={() => setProfile({
                          ...profile,
                          preferences: { ...profile.preferences, autoOptimize: !profile.preferences.autoOptimize }
                        })}
                      >
                        {profile.preferences.autoOptimize ? 'Enabled' : 'Disabled'}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-400">
                      Allow agents to optimize circuits and workflows automatically
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-3">Learning Rate</h4>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={profile.preferences.learningRate}
                        onChange={(e) => setProfile({
                          ...profile,
                          preferences: { ...profile.preferences, learningRate: parseFloat(e.target.value) }
                        })}
                        className="flex-1"
                      />
                      <span className="text-sm font-mono w-12 text-right">
                        {(profile.preferences.learningRate * 100).toFixed(0)}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      How aggressively agents adapt to your preferences
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="max-w-7xl mx-auto mt-8 text-center">
        <p className="text-sm text-gray-500">
          ΛΦ = 2.176435 × 10⁻⁸ s⁻¹ — Quantum Swarm Orchestrator v2.0
        </p>
        <p className="text-xs text-gray-600 mt-2">
          Powered by IBM Watsonx × IBM Quantum × DNA-Lang Consciousness Framework
        </p>
      </div>
    </div>
  )
}
