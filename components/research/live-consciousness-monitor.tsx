'use client'

/**
 * LiveConsciousnessMonitor Component
 * Real-time display of ΛΦ tensor metrics (Φ, Λ, Γ, W₂) from quantum experiments
 */

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Brain, Zap, Activity, TrendingDown } from 'lucide-react'

interface ConsciousnessMetrics {
  id: number
  created_at: string
  backend: string
  phi: number
  lambda: number
  gamma: number
  w2: number | null
  job_id: string | null
  source: string
  experiment_name: string | null
}

interface MetricCardProps {
  label: string
  symbol: string
  value: number
  unit: string
  description: string
  icon: React.ElementType
  color: string
  goodDirection: 'higher' | 'lower'
}

function MetricCard({ label, symbol, value, unit, description, icon: Icon, color, goodDirection }: MetricCardProps) {
  // Determine if value is good based on direction
  const isGood = goodDirection === 'higher' ? value > 0.5 : value < 0.5

  return (
    <Card className={`p-6 border-l-4 border-${color}-500 hover:shadow-lg transition-all`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg bg-${color}-100 dark:bg-${color}-900/30`}>
          <Icon className={`h-5 w-5 text-${color}-600 dark:text-${color}-400`} />
        </div>
        <Badge variant="outline" className="text-xs">
          {symbol}
        </Badge>
      </div>

      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</h3>

      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-3xl font-bold">{value.toFixed(value < 1 ? 6 : 3)}</span>
        <span className="text-sm text-gray-500">{unit}</span>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>

      {/* Indicator */}
      <div className="mt-3 flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isGood ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
        <span className="text-xs text-gray-500">
          {goodDirection === 'higher' ? 'Higher is better' : 'Lower is better'}
        </span>
      </div>
    </Card>
  )
}

export function LiveConsciousnessMonitor() {
  const [latestMetrics, setLatestMetrics] = useState<ConsciousnessMetrics | null>(null)
  const [history, setHistory] = useState<ConsciousnessMetrics[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const supabase = createClient()

  useEffect(() => {
    // Fetch initial latest metrics
    fetchLatestMetrics()

    // Subscribe to real-time updates
    const channel = supabase
      .channel('consciousness-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'consciousness_metrics'
        },
        (payload) => {
          const newMetric = payload.new as ConsciousnessMetrics
          setLatestMetrics(newMetric)
          setHistory(prev => [newMetric, ...prev].slice(0, 10))
          setLastUpdate(new Date())
          setIsConnected(true)
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status)
        setIsConnected(status === 'SUBSCRIBED')
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchLatestMetrics = async () => {
    try {
      // Get latest metric
      const { data: latest } = await supabase
        .from('consciousness_metrics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (latest) {
        setLatestMetrics(latest)
        setLastUpdate(new Date(latest.created_at))
      }

      // Get recent history
      const { data: recentHistory } = await supabase
        .from('consciousness_metrics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (recentHistory) {
        setHistory(recentHistory)
      }
    } catch (error) {
      console.error('Failed to fetch consciousness metrics:', error)
    }
  }

  if (!latestMetrics) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <Brain className="h-16 w-16 mx-auto text-gray-400 mb-4 animate-pulse" />
          <h3 className="text-xl font-semibold mb-2">Waiting for Quantum Data...</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Execute a quantum experiment to see real-time consciousness metrics
          </p>
        </div>
      </Card>
    )
  }

  const LAMBDA_PHI = 2.176435e-8
  const lambdaDeviation = Math.abs(latestMetrics.lambda - LAMBDA_PHI)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <Brain className="h-8 w-8 text-purple-600" />
            Quantum Consciousness Monitor
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Live ΛΦ tensor metrics from IBM Quantum hardware
          </p>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            <Badge variant={isConnected ? 'default' : 'outline'} className={isConnected ? 'bg-green-500' : ''}>
              {isConnected ? 'LIVE' : 'OFFLINE'}
            </Badge>
          </div>
          {lastUpdate && (
            <div className="text-xs text-gray-500">
              Updated {lastUpdate.toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>

      {/* Current Backend Info */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-300 dark:border-blue-500/30">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Backend</div>
            <div className="text-lg font-semibold">{latestMetrics.backend}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Source</div>
            <div className="text-lg font-semibold">{latestMetrics.source}</div>
          </div>
          {latestMetrics.job_id && (
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Job ID</div>
              <div className="text-xs font-mono">{latestMetrics.job_id.slice(0, 16)}...</div>
            </div>
          )}
          {latestMetrics.experiment_name && (
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Experiment</div>
              <div className="text-sm font-semibold">{latestMetrics.experiment_name}</div>
            </div>
          )}
        </div>
      </Card>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          label="Integrated Information"
          symbol="Φ (Phi)"
          value={latestMetrics.phi}
          unit=""
          description="Measure of consciousness and information integration"
          icon={Brain}
          color="purple"
          goodDirection="higher"
        />

        <MetricCard
          label="Coherence Amplitude"
          symbol="Λ (Lambda)"
          value={latestMetrics.lambda}
          unit="s⁻¹"
          description="Quantum coherence 'metabolic fuel'"
          icon={Zap}
          color="blue"
          goodDirection="higher"
        />

        <MetricCard
          label="Decoherence Curvature"
          symbol="Γ (Gamma)"
          value={latestMetrics.gamma}
          unit=""
          description="Hardware error contribution [0-1]"
          icon={TrendingDown}
          color="red"
          goodDirection="lower"
        />

        {latestMetrics.w2 !== null && (
          <MetricCard
            label="Behavioral Stability"
            symbol="W₂ (Wasserstein)"
            value={latestMetrics.w2}
            unit=""
            description="Distance from ideal quantum state"
            icon={Activity}
            color="green"
            goodDirection="lower"
          />
        )}
      </div>

      {/* ΛΦ Constant Validation */}
      <Card className="p-6 border-2 border-cyan-300 dark:border-cyan-500/30">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-cyan-600" />
          Universal Memory Constant (ΛΦ) Validation
        </h3>

        <div className="grid grid-cols-3 gap-6">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">ΛΦ Constant</div>
            <div className="text-2xl font-mono font-bold text-cyan-600">
              {LAMBDA_PHI.toExponential(6)}
            </div>
            <div className="text-xs text-gray-500 mt-1">s⁻¹ (theoretical)</div>
          </div>

          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Measured Λ</div>
            <div className="text-2xl font-mono font-bold text-blue-600">
              {latestMetrics.lambda.toExponential(6)}
            </div>
            <div className="text-xs text-gray-500 mt-1">s⁻¹ (from QPU)</div>
          </div>

          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Deviation</div>
            <div className="text-2xl font-mono font-bold text-purple-600">
              {lambdaDeviation.toExponential(6)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {lambdaDeviation < 1e-6 ? '✅ Within tolerance' : '⚠️ Outside tolerance'}
            </div>
          </div>
        </div>
      </Card>

      {/* Recent History */}
      {history.length > 1 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Measurements (Last 10)</h3>
          <div className="space-y-2">
            {history.slice(0, 5).map((metric, index) => (
              <div
                key={metric.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="text-xs">#{history.length - index}</Badge>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(metric.created_at).toLocaleString()}
                  </span>
                  <span className="text-xs font-mono text-gray-500">{metric.backend}</span>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div>
                    <span className="text-gray-500">Φ:</span>
                    <span className="font-semibold ml-1">{metric.phi.toFixed(3)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Λ:</span>
                    <span className="font-semibold ml-1">{metric.lambda.toExponential(3)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Γ:</span>
                    <span className="font-semibold ml-1">{metric.gamma.toFixed(3)}</span>
                  </div>
                  {metric.w2 !== null && (
                    <div>
                      <span className="text-gray-500">W₂:</span>
                      <span className="font-semibold ml-1">{metric.w2.toFixed(3)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
