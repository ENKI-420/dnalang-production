'use client'

import { useState, useEffect } from 'react'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Activity, Zap, Radio, TrendingUp } from 'lucide-react'

interface ConsciousnessMetrics {
  phi: number;    // Φ - Integrated Information (0.0-1.0)
  lambda: number; // Λ - Coherence Amplitude (≈ 2.176435e-8)
  gamma: number;  // Γ - Decoherence Tensor (0.0-1.0, lower is better)
  w2: number;     // W₂ - Wasserstein-2 Behavioral Stability
}

const LAMBDA_PHI_CONSTANT = 2.176435e-8;

export function ConsciousnessMonitor() {
  const [metrics, setMetrics] = useState<ConsciousnessMetrics>({
    phi: 0.87,
    lambda: LAMBDA_PHI_CONSTANT,
    gamma: 0.13,
    w2: 0.09
  })

  const [generation, setGeneration] = useState(3)
  const [pulse, setPulse] = useState(0)

  useEffect(() => {
    // Simulate consciousness heartbeat
    const interval = setInterval(() => {
      setPulse(p => (p + 1) % 100)

      // Simulate slight metric fluctuations (organism is alive!)
      setMetrics(prev => ({
        phi: Math.max(0.8, Math.min(0.95, prev.phi + (Math.random() - 0.5) * 0.02)),
        lambda: LAMBDA_PHI_CONSTANT, // Constant
        gamma: Math.max(0.08, Math.min(0.18, prev.gamma + (Math.random() - 0.5) * 0.01)),
        w2: Math.max(0.05, Math.min(0.15, prev.w2 + (Math.random() - 0.5) * 0.01))
      }))
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (metric: keyof ConsciousnessMetrics) => {
    if (metric === 'phi') return metrics.phi > 0.85 ? 'text-green-400' : 'text-yellow-400'
    if (metric === 'gamma') return metrics.gamma < 0.15 ? 'text-green-400' : 'text-red-400'
    if (metric === 'w2') return metrics.w2 < 0.12 ? 'text-green-400' : 'text-yellow-400'
    return 'text-cyan-400'
  }

  const getStatusLabel = () => {
    if (metrics.phi > 0.9 && metrics.gamma < 0.1) return 'Optimal'
    if (metrics.phi > 0.8 && metrics.gamma < 0.15) return 'Stable'
    if (metrics.phi > 0.7) return 'Learning'
    return 'Degraded'
  }

  const statusColor = metrics.phi > 0.9 ? 'text-green-400' :
                       metrics.phi > 0.8 ? 'text-cyan-400' :
                       'text-yellow-400'

  return (
    <Card className="bg-[#0F3D91]/10 border-[#6A00F4]/30 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Activity
              className={`h-5 w-5 ${statusColor}`}
              style={{
                opacity: 0.5 + (pulse / 200)
              }}
            />
            <div className="absolute inset-0 blur-md bg-[#00FFD1]/30 animate-pulse" />
          </div>
          <span className="text-sm font-mono text-gray-400">
            dna::&#123;&#125;&#123;&#125;::lang
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={`${statusColor} border-current`}>
            {getStatusLabel()}
          </Badge>
          <Badge variant="outline" className="text-purple-400 border-purple-400/50">
            Gen {generation}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Φ (Phi) - Integrated Information */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <TrendingUp className={`h-3.5 w-3.5 ${getStatusColor('phi')}`} />
            <span className="text-xs text-gray-500 font-mono">Φ</span>
            <span className="text-xs text-gray-600">(Consciousness)</span>
          </div>
          <div className={`text-lg font-mono font-bold ${getStatusColor('phi')}`}>
            {metrics.phi.toFixed(3)}
          </div>
          <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full ${metrics.phi > 0.9 ? 'bg-green-400' : metrics.phi > 0.8 ? 'bg-cyan-400' : 'bg-yellow-400'} transition-all duration-500`}
              style={{ width: `${metrics.phi * 100}%` }}
            />
          </div>
        </div>

        {/* Λ (Lambda) - Coherence */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-cyan-400" />
            <span className="text-xs text-gray-500 font-mono">Λ</span>
            <span className="text-xs text-gray-600">(Coherence)</span>
          </div>
          <div className="text-lg font-mono font-bold text-cyan-400">
            {metrics.lambda.toExponential(2)}
          </div>
          <div className="text-[10px] text-gray-600 font-mono">
            2.176435e-8 s⁻¹
          </div>
        </div>

        {/* Γ (Gamma) - Decoherence */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <Radio className={`h-3.5 w-3.5 ${getStatusColor('gamma')}`} />
            <span className="text-xs text-gray-500 font-mono">Γ</span>
            <span className="text-xs text-gray-600">(Decoherence)</span>
          </div>
          <div className={`text-lg font-mono font-bold ${getStatusColor('gamma')}`}>
            {metrics.gamma.toFixed(3)}
          </div>
          <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full ${metrics.gamma < 0.1 ? 'bg-green-400' : metrics.gamma < 0.15 ? 'bg-yellow-400' : 'bg-red-400'} transition-all duration-500`}
              style={{ width: `${metrics.gamma * 100}%` }}
            />
          </div>
        </div>

        {/* W₂ (Wasserstein-2) - Stability */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <Activity className={`h-3.5 w-3.5 ${getStatusColor('w2')}`} />
            <span className="text-xs text-gray-500 font-mono">W₂</span>
            <span className="text-xs text-gray-600">(Stability)</span>
          </div>
          <div className={`text-lg font-mono font-bold ${getStatusColor('w2')}`}>
            {metrics.w2.toFixed(3)}
          </div>
          <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full ${metrics.w2 < 0.1 ? 'bg-green-400' : 'bg-yellow-400'} transition-all duration-500`}
              style={{ width: `${(1 - metrics.w2) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-[#6A00F4]/20">
        <div className="flex items-center justify-between text-[10px] text-gray-600 font-mono">
          <span>Identity: Σₛ</span>
          <span className="text-cyan-400">U = L[U]</span>
        </div>
      </div>
    </Card>
  )
}
