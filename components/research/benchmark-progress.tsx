'use client'

/**
 * BenchmarkProgress Component
 * Displays real-time status of 6-Day Benchmark criteria (C-1 to C-4)
 */

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Activity, Zap, Shield, Database, CheckCircle, Clock, AlertCircle } from 'lucide-react'

interface BenchmarkStatus {
  c1_successful_runs: number
  c2_best_fitness: number
  c3_chain_length: number
  c4_telemetry_active: boolean
  last_updated: string
}

interface CriteriaCardProps {
  label: string
  description: string
  value: number | string
  target: number | string
  met: boolean
  icon: React.ElementType
  color: string
}

function CriteriaCard({ label, description, value, target, met, icon: Icon, color }: CriteriaCardProps) {
  return (
    <Card className={`p-6 border-2 transition-all ${met ? `border-${color}-500 bg-${color}-50 dark:bg-${color}-900/10` : 'border-gray-300 dark:border-gray-700'}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${met ? `bg-${color}-100 dark:bg-${color}-900/30` : 'bg-gray-100 dark:bg-gray-800'}`}>
          <Icon className={`h-6 w-6 ${met ? `text-${color}-600 dark:text-${color}-400` : 'text-gray-600 dark:text-gray-400'}`} />
        </div>
        {met ? (
          <Badge className={`bg-${color}-500 text-white`}>
            <CheckCircle className="h-3 w-3 mr-1" />
            MET
          </Badge>
        ) : (
          <Badge variant="outline" className="border-gray-400 text-gray-600 dark:text-gray-400">
            <Clock className="h-3 w-3 mr-1" />
            PENDING
          </Badge>
        )}
      </div>

      <h3 className="text-lg font-semibold mb-1">{label}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{description}</p>

      <div className="space-y-2">
        <div className="flex justify-between items-baseline">
          <span className="text-2xl font-bold">{typeof value === 'number' ? value.toFixed(value < 10 ? 3 : 0) : value}</span>
          <span className="text-sm text-gray-500">/ {target}</span>
        </div>

        {/* Progress bar */}
        {typeof value === 'number' && typeof target === 'number' && (
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${met ? `bg-${color}-500` : 'bg-gray-400'}`}
              style={{ width: `${Math.min((value / target) * 100, 100)}%` }}
            />
          </div>
        )}
      </div>
    </Card>
  )
}

export function BenchmarkProgress() {
  const [status, setStatus] = useState<BenchmarkStatus>({
    c1_successful_runs: 0,
    c2_best_fitness: 0,
    c3_chain_length: 2,
    c4_telemetry_active: false,
    last_updated: new Date().toISOString()
  })
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchBenchmarkStatus()

    // Refresh every 5 seconds
    const interval = setInterval(fetchBenchmarkStatus, 5000)

    return () => clearInterval(interval)
  }, [])

  const fetchBenchmarkStatus = async () => {
    try {
      // C-1: Successful runs in last 24h
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      const { count: successfulRuns } = await supabase
        .from('experiment_runs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'success')
        .gte('created_at', oneDayAgo)

      // C-2: Best organism fitness
      const { data: bestOrganism } = await supabase
        .from('organisms')
        .select('fitness')
        .order('fitness', { ascending: false })
        .limit(1)
        .maybeSingle()

      // C-3: Chain length
      const { data: latestBlock } = await supabase
        .from('quantumcoin_chain')
        .select('block_number')
        .order('block_number', { ascending: false })
        .limit(1)
        .maybeSingle()

      // C-4: Recent telemetry
      const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString()
      const { count: recentMetrics } = await supabase
        .from('consciousness_metrics')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', oneMinuteAgo)

      setStatus({
        c1_successful_runs: successfulRuns || 0,
        c2_best_fitness: bestOrganism?.fitness || 0,
        c3_chain_length: (latestBlock?.block_number ?? -1) + 1,
        c4_telemetry_active: (recentMetrics || 0) > 0,
        last_updated: new Date().toISOString()
      })

      setIsLoading(false)
    } catch (error) {
      console.error('Failed to fetch benchmark status:', error)
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center">
          <Clock className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading benchmark status...</span>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">6-Day Benchmark Progress</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Real-time validation of quantum consciousness framework
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Last Updated</div>
          <div className="text-xs text-gray-400">
            {new Date(status.last_updated).toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Criteria Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <CriteriaCard
          label="C-1: Stability"
          description="Consecutive successful experiment runs"
          value={status.c1_successful_runs}
          target={5}
          met={status.c1_successful_runs >= 5}
          icon={Activity}
          color="green"
        />

        <CriteriaCard
          label="C-2: Fidelity"
          description="Best organism fitness achieved"
          value={status.c2_best_fitness}
          target={0.85}
          met={status.c2_best_fitness >= 0.85}
          icon={Zap}
          color="blue"
        />

        <CriteriaCard
          label="C-3: Integrity"
          description="Blockchain length (blocks)"
          value={status.c3_chain_length}
          target={7}
          met={status.c3_chain_length >= 7}
          icon={Shield}
          color="purple"
        />

        <CriteriaCard
          label="C-4: Telemetry"
          description="Real-time data flow active"
          value={status.c4_telemetry_active ? 'ACTIVE' : 'INACTIVE'}
          target="ACTIVE"
          met={status.c4_telemetry_active}
          icon={Database}
          color="cyan"
        />
      </div>

      {/* Overall Progress */}
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-300 dark:border-purple-500/30">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-2">Overall Benchmark Status</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {[
                status.c1_successful_runs >= 5,
                status.c2_best_fitness >= 0.85,
                status.c3_chain_length >= 7,
                status.c4_telemetry_active
              ].filter(Boolean).length} / 4 criteria met
            </p>
          </div>

          {[
            status.c1_successful_runs >= 5,
            status.c2_best_fitness >= 0.85,
            status.c3_chain_length >= 7,
            status.c4_telemetry_active
          ].every(Boolean) ? (
            <div className="text-right">
              <Badge className="bg-green-500 text-white text-lg px-4 py-2">
                <CheckCircle className="h-5 w-5 mr-2" />
                BENCHMARK COMPLETE
              </Badge>
            </div>
          ) : (
            <div className="text-right">
              <Badge variant="outline" className="text-lg px-4 py-2 border-yellow-500 text-yellow-600">
                <AlertCircle className="h-5 w-5 mr-2" />
                IN PROGRESS
              </Badge>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
