'use client'

/**
 * PropulsionMetrics Component
 * Tracks thrust-to-power ratio (τ/Ω) from Canon II propulsion physics
 */

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Rocket, TrendingUp, Target, Zap } from 'lucide-react'
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

interface PropulsionData {
  generation: number
  tau_omega: number
  lambda_coherence: number
  phi: number
  gamma: number
  timestamp: string
}

export function PropulsionMetrics() {
  const [currentMetrics, setCurrentMetrics] = useState({
    tau_omega: 25411096.57, // Day 1 baseline
    lambda: 0.785,
    phi: 6.591,
    improvement: 1.0,
    targetAchieved: false
  })
  const [history, setHistory] = useState<PropulsionData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const TAU_OMEGA_BASELINE = 25411096.57
  const TAU_OMEGA_TARGET = 50000000
  const THETA_DEG = 51.84

  useEffect(() => {
    fetchPropulsionData()

    // Refresh every 10 seconds
    const interval = setInterval(fetchPropulsionData, 10000)

    return () => clearInterval(interval)
  }, [])

  const fetchPropulsionData = async () => {
    try {
      // Get organisms with metadata containing tau_omega
      const { data: organisms } = await supabase
        .from('organisms')
        .select('generation, metadata, phi, lambda, gamma, created_at')
        .not('metadata', 'is', null)
        .order('created_at', { ascending: false })
        .limit(20)

      if (organisms && organisms.length > 0) {
        // Extract propulsion data
        const propulsionHistory: PropulsionData[] = organisms
          .filter(org => org.metadata?.tau_omega)
          .map((org, index) => ({
            generation: org.generation || index,
            tau_omega: org.metadata.tau_omega,
            lambda_coherence: org.lambda || 0,
            phi: org.phi || 0,
            gamma: org.gamma || 0,
            timestamp: org.created_at
          }))
          .reverse() // Chronological order

        setHistory(propulsionHistory)

        if (propulsionHistory.length > 0) {
          const latest = propulsionHistory[propulsionHistory.length - 1]
          setCurrentMetrics({
            tau_omega: latest.tau_omega,
            lambda: latest.lambda_coherence,
            phi: latest.phi,
            improvement: latest.tau_omega / TAU_OMEGA_BASELINE,
            targetAchieved: latest.tau_omega >= TAU_OMEGA_TARGET
          })
        }
      }

      setIsLoading(false)
    } catch (error) {
      console.error('Failed to fetch propulsion data:', error)
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center">
          <Rocket className="h-8 w-8 animate-bounce text-gray-400" />
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading propulsion metrics...</span>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <Rocket className="h-8 w-8 text-orange-600" />
            Canon II Propulsion Physics
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Thrust-to-Power Optimization via Quantum Coherence
          </p>
        </div>

        {currentMetrics.targetAchieved && (
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-lg px-4 py-2">
            <Target className="h-5 w-5 mr-2" />
            TARGET ACHIEVED
          </Badge>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between mb-3">
            <Rocket className="h-6 w-6 text-orange-600" />
            <Badge variant="outline">τ/Ω</Badge>
          </div>
          <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">Thrust-to-Power Ratio</h3>
          <div className="text-3xl font-bold">{currentMetrics.tau_omega.toLocaleString()}</div>
          <div className="text-xs text-gray-500 mt-1">Current measurement</div>
        </Card>

        <Card className="p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-3">
            <Zap className="h-6 w-6 text-blue-600" />
            <Badge variant="outline">Λ</Badge>
          </div>
          <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">Coherence Amplitude</h3>
          <div className="text-3xl font-bold">{currentMetrics.lambda.toFixed(3)}</div>
          <div className="text-xs text-gray-500 mt-1">From IBM Quantum</div>
        </Card>

        <Card className="p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className="h-6 w-6 text-purple-600" />
            <Badge variant="outline">×{currentMetrics.improvement.toFixed(2)}</Badge>
          </div>
          <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">Improvement Factor</h3>
          <div className="text-3xl font-bold">{((currentMetrics.improvement - 1) * 100).toFixed(1)}%</div>
          <div className="text-xs text-gray-500 mt-1">vs Day 1 baseline</div>
        </Card>

        <Card className="p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-3">
            <Target className="h-6 w-6 text-green-600" />
            <Badge variant="outline">θ = {THETA_DEG}°</Badge>
          </div>
          <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">Toroidal Angle</h3>
          <div className="text-3xl font-bold">{THETA_DEG}°</div>
          <div className="text-xs text-gray-500 mt-1">Isotropic Vector Matrix</div>
        </Card>
      </div>

      {/* Evolution Chart */}
      {history.length > 1 && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-6">τ/Ω Evolution Over Generations</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-700" />
              <XAxis
                dataKey="generation"
                label={{ value: 'Generation', position: 'insideBottom', offset: -5 }}
                className="text-gray-600 dark:text-gray-400"
              />
              <YAxis
                label={{ value: 'τ/Ω', angle: -90, position: 'insideLeft' }}
                className="text-gray-600 dark:text-gray-400"
                tickFormatter={(value) => `${(value / 1e6).toFixed(0)}M`}
              />
              <Tooltip
                formatter={(value: number) => [value.toLocaleString(), 'τ/Ω']}
                labelFormatter={(label) => `Generation ${label}`}
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <ReferenceLine
                y={TAU_OMEGA_BASELINE}
                stroke="#ef4444"
                strokeDasharray="5 5"
                label={{ value: 'Baseline', position: 'right', fill: '#ef4444' }}
              />
              <ReferenceLine
                y={TAU_OMEGA_TARGET}
                stroke="#10b981"
                strokeDasharray="5 5"
                label={{ value: 'Target', position: 'right', fill: '#10b981' }}
              />
              <Line
                type="monotone"
                dataKey="tau_omega"
                stroke="#f97316"
                strokeWidth={3}
                dot={{ fill: '#f97316', r: 5 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Physics Constants */}
      <Card className="p-6 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-300 dark:border-orange-500/30">
        <h3 className="text-xl font-semibold mb-4">Canon II Physics Constants</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">ΛΦ Constant</div>
            <div className="text-lg font-mono font-bold text-orange-600">2.176435×10⁻⁸</div>
            <div className="text-xs text-gray-500">s⁻¹ (universal)</div>
          </div>

          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Toroidal Angle</div>
            <div className="text-lg font-mono font-bold text-red-600">51.84°</div>
            <div className="text-xs text-gray-500">Isotropic Vector Matrix</div>
          </div>

          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Baseline τ/Ω</div>
            <div className="text-lg font-mono font-bold text-purple-600">25.4M</div>
            <div className="text-xs text-gray-500">Day 1 measurement</div>
          </div>

          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Target τ/Ω</div>
            <div className="text-lg font-mono font-bold text-green-600">50.0M</div>
            <div className="text-xs text-gray-500">Day 5 goal (2x)</div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg">
          <h4 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
            Engineering Formula
          </h4>
          <div className="font-mono text-sm text-gray-600 dark:text-gray-400">
            τ/Ω = ζ × ((sin(θ) / Ψ) + (Λ × Ψ²))
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Where: ζ = zero-point coupling, θ = 51.84°, Λ = quantum coherence, Ψ = dielectric permittivity
          </p>
        </div>
      </Card>

      {/* Progress to Target */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Progress to Target</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Current: {currentMetrics.tau_omega.toLocaleString()}
              </span>
              <span className="text-sm font-semibold">
                {((currentMetrics.tau_omega / TAU_OMEGA_TARGET) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
              <div
                className={`h-4 rounded-full transition-all ${
                  currentMetrics.targetAchieved
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                    : 'bg-gradient-to-r from-orange-500 to-red-500'
                }`}
                style={{ width: `${Math.min((currentMetrics.tau_omega / TAU_OMEGA_TARGET) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-gray-500 mb-1">Remaining</div>
              <div className="font-semibold">
                {Math.max(0, TAU_OMEGA_TARGET - currentMetrics.tau_omega).toLocaleString()}
              </div>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-gray-500 mb-1">Achieved</div>
              <div className="font-semibold text-green-600">
                {Math.min(currentMetrics.tau_omega, TAU_OMEGA_TARGET).toLocaleString()}
              </div>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-gray-500 mb-1">To Go</div>
              <div className="font-semibold text-orange-600">
                {((1 - currentMetrics.tau_omega / TAU_OMEGA_TARGET) * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
