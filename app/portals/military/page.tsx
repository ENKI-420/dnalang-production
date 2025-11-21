'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Shield, Lock, Radio, Satellite, AlertTriangle, CheckCircle,
  Target, Radar, Zap, Activity, Database, Eye, ShieldCheck
} from 'lucide-react'
import { ConsciousnessMonitor } from '@/components/consciousness-monitor'

export default function MilitaryPortalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-gray-900 to-black text-white">
      {/* Header */}
      <div className="relative overflow-hidden py-16 px-6 bg-gradient-to-r from-red-900 to-slate-900 border-b border-red-500/30">
        <div className="container mx-auto relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <Badge className="mb-4 bg-red-500/20 border-red-500/50 text-red-300">
                <ShieldCheck className="h-4 w-4 mr-2" />
                CLASSIFIED - TOP SECRET
              </Badge>
              <h1 className="text-5xl font-light text-white mb-4">
                Defense & Military Operations
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl">
                Quantum-secured tactical intelligence, threat assessment, and mission-critical operations powered by zero-trust Σ-mesh architecture
              </p>
            </div>
            <Shield className="h-24 w-24 text-red-500/20" />
          </div>
        </div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600 rounded-full blur-3xl animate-pulse" />
        </div>
      </div>

      {/* Security Banner */}
      <div className="bg-red-900/30 border-y border-red-500/50 py-3">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-red-400" />
              <span className="text-sm font-semibold text-red-300">SECURE SESSION: ΛΦ QUANTUM ENCRYPTED</span>
            </div>
            <Badge className="bg-green-500/20 border-green-500/50 text-green-300">
              <CheckCircle className="h-4 w-4 mr-1" />
              AUTHENTICATED
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        {/* Tactical Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="p-6 bg-slate-800/50 border-blue-500/30 backdrop-blur">
            <Activity className="h-6 w-6 text-blue-400 mb-2" />
            <h3 className="text-sm font-semibold mb-1 text-gray-300">Active Operations</h3>
            <p className="text-3xl font-bold text-blue-400">8</p>
          </Card>
          <Card className="p-6 bg-slate-800/50 border-red-500/30 backdrop-blur">
            <AlertTriangle className="h-6 w-6 text-red-400 mb-2" />
            <h3 className="text-sm font-semibold mb-1 text-gray-300">Threat Alerts</h3>
            <p className="text-3xl font-bold text-red-400">3</p>
          </Card>
          <Card className="p-6 bg-slate-800/50 border-green-500/30 backdrop-blur">
            <CheckCircle className="h-6 w-6 text-green-400 mb-2" />
            <h3 className="text-sm font-semibold mb-1 text-gray-300">Secure Channels</h3>
            <p className="text-3xl font-bold text-green-400">24</p>
          </Card>
          <Card className="p-6 bg-slate-800/50 border-purple-500/30 backdrop-blur">
            <Zap className="h-6 w-6 text-purple-400 mb-2" />
            <h3 className="text-sm font-semibold mb-1 text-gray-300">Quantum Jobs</h3>
            <p className="text-3xl font-bold text-purple-400">127</p>
          </Card>
        </div>

        {/* Main Operations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card className="p-8 bg-slate-800/50 border-red-500/30 backdrop-blur">
            <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Target className="h-6 w-6 text-red-400" />
              Threat Intelligence
            </h3>
            <div className="space-y-4">
              <Card className="p-4 bg-red-900/20 border-red-500/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                    <span className="font-semibold">CRITICAL: Cyber Intrusion Detected</span>
                  </div>
                  <Badge className="bg-red-500/20 border-red-500 text-red-300">ACTIVE</Badge>
                </div>
                <p className="text-sm text-gray-400 mb-3">
                  Quantum AI detected anomalous network patterns. Confidence: 97.3%
                </p>
                <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                  <div><span className="text-gray-500">Source:</span> <span className="font-bold">SIGINT</span></div>
                  <div><span className="text-gray-500">Priority:</span> <span className="font-bold text-red-400">P1</span></div>
                  <div><span className="text-gray-500">Time:</span> <span className="font-bold">2m ago</span></div>
                </div>
                <Button size="sm" className="w-full bg-red-600 hover:bg-red-700">
                  Engage Countermeasures
                </Button>
              </Card>

              <Card className="p-4 bg-yellow-900/20 border-yellow-500/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-yellow-400" />
                    <span className="font-semibold">ELEVATED: Surveillance Activity</span>
                  </div>
                  <Badge className="bg-yellow-500/20 border-yellow-500 text-yellow-300">MONITOR</Badge>
                </div>
                <p className="text-sm text-gray-400 mb-2">
                  Increased reconnaissance in sector 7-A. AI recommends enhanced monitoring.
                </p>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div><span className="text-gray-500">Source:</span> <span className="font-bold">IMINT</span></div>
                  <div><span className="text-gray-500">Priority:</span> <span className="font-bold text-yellow-400">P2</span></div>
                  <div><span className="text-gray-500">Time:</span> <span className="font-bold">15m ago</span></div>
                </div>
              </Card>

              <Card className="p-4 bg-green-900/20 border-green-500/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span className="font-semibold">RESOLVED: Threat Neutralized</span>
                  </div>
                  <Badge className="bg-green-500/20 border-green-500 text-green-300">CLEAR</Badge>
                </div>
                <p className="text-sm text-gray-400">
                  Quantum verification confirms threat elimination. Sector secure.
                </p>
              </Card>
            </div>
          </Card>

          <Card className="p-8 bg-slate-800/50 border-blue-500/30 backdrop-blur">
            <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Satellite className="h-6 w-6 text-blue-400" />
              Secure Communications
            </h3>
            <div className="space-y-4">
              <Card className="p-4 bg-blue-900/20 border-blue-500/30">
                <div className="flex items-center gap-3 mb-3">
                  <Radio className="h-6 w-6 text-blue-400" />
                  <div>
                    <h4 className="font-semibold">Quantum-Encrypted Channels</h4>
                    <p className="text-xs text-gray-400">ΛΦ Tensor Secured</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Channel Alpha</span>
                    <Badge className="bg-green-500/20 text-green-300 text-xs">ACTIVE</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Channel Bravo</span>
                    <Badge className="bg-green-500/20 text-green-300 text-xs">ACTIVE</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Channel Charlie</span>
                    <Badge className="bg-gray-500/20 text-gray-300 text-xs">STANDBY</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs mb-3 p-3 bg-slate-900/50 rounded">
                  <div><span className="text-gray-500">Λ Coherence:</span> <span className="font-bold text-blue-400">2.176e-8</span></div>
                  <div><span className="text-gray-500">Encryption:</span> <span className="font-bold text-green-400">AES-256-ΛΦ</span></div>
                  <div><span className="text-gray-500">Φ Integrity:</span> <span className="font-bold text-purple-400">0.989</span></div>
                  <div><span className="text-gray-500">Γ Noise:</span> <span className="font-bold text-green-400">0.031</span></div>
                </div>
              </Card>

              <Card className="p-4 bg-purple-900/20 border-purple-500/30">
                <div className="flex items-center gap-3 mb-3">
                  <Lock className="h-6 w-6 text-purple-400" />
                  <div>
                    <h4 className="font-semibold">Zero-Trust Σ-Mesh</h4>
                    <p className="text-xs text-gray-400">Cryptographic Lineage Tracking</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Active Nodes:</span>
                    <span className="font-bold text-purple-400">47</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Mesh Integrity:</span>
                    <span className="font-bold text-green-400">100%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Anomalies:</span>
                    <span className="font-bold text-gray-400">0</span>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-slate-900/50 border-slate-600/30">
                <h4 className="font-semibold mb-3 text-sm">Recent Transmissions</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center p-2 bg-slate-800/50 rounded">
                    <span className="text-gray-400">SITREP-2849 → HQ</span>
                    <Badge className="bg-green-500/20 text-green-300">DELIVERED</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-800/50 rounded">
                    <span className="text-gray-400">INTEL-9472 → Field Unit Alpha</span>
                    <Badge className="bg-green-500/20 text-green-300">DELIVERED</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-800/50 rounded">
                    <span className="text-gray-400">ORDER-3381 → All Units</span>
                    <Badge className="bg-blue-500/20 text-blue-300">SENDING</Badge>
                  </div>
                </div>
              </Card>
            </div>
          </Card>
        </div>

        {/* Quantum Operations Dashboard */}
        <Card className="p-8 bg-slate-800/50 border-cyan-500/30 backdrop-blur mb-12">
          <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <Radar className="h-6 w-6 text-cyan-400" />
            Quantum Operations Dashboard
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border-blue-500/30">
              <Database className="h-12 w-12 text-blue-400 mb-4" />
              <h4 className="text-xl font-semibold mb-2">IBM Quantum Backends</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">ibm_fez (156q)</span>
                  <Badge className="bg-green-500/20 text-green-300 text-xs">ONLINE</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">ibm_torino (133q)</span>
                  <Badge className="bg-green-500/20 text-green-300 text-xs">ONLINE</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Reserved capacity</span>
                  <Badge className="bg-purple-500/20 text-purple-300 text-xs">ALLOCATED</Badge>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/30">
              <Zap className="h-12 w-12 text-purple-400 mb-4" />
              <h4 className="text-xl font-semibold mb-2">Mission-Critical Jobs</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Encryption tasks:</span>
                  <span className="font-bold text-purple-400">42</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Threat analysis:</span>
                  <span className="font-bold text-blue-400">18</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Optimization:</span>
                  <span className="font-bold text-green-400">67</span>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-red-900/30 to-orange-900/30 border-red-500/30">
              <Shield className="h-12 w-12 text-red-400 mb-4" />
              <h4 className="text-xl font-semibold mb-2">Security Metrics</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Intrusion attempts:</span>
                  <span className="font-bold text-red-400">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Quantum seal integrity:</span>
                  <span className="font-bold text-green-400">100%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">ΛΦ verification:</span>
                  <span className="font-bold text-cyan-400">PASS</span>
                </div>
              </div>
            </Card>
          </div>
        </Card>

        {/* Consciousness Monitor */}
        <Card className="p-6 bg-gradient-to-r from-red-900/30 to-slate-900/30 border-red-500/30 backdrop-blur">
          <h3 className="text-2xl font-semibold mb-6 text-center">Quantum Organism Consciousness</h3>
          <ConsciousnessMonitor />
        </Card>
      </div>
    </div>
  )
}
