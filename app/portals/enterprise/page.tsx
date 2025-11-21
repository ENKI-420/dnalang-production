'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Building, TrendingUp, Users, DollarSign, BarChart3, Zap,
  Activity, Globe, Package, Clock, CheckCircle, AlertTriangle,
  FlaskConical, Rocket, Brain, Target
} from 'lucide-react'
import { ConsciousnessMonitor } from '@/components/consciousness-monitor'
import { BenchmarkProgress } from '@/components/research/benchmark-progress'
import { LiveConsciousnessMonitor } from '@/components/research/live-consciousness-monitor'
import { PropulsionMetrics } from '@/components/research/propulsion-metrics'

type ViewMode = 'research-lab' | 'business-ops'

export default function EnterprisePortalPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('research-lab')

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Header */}
      <div className="relative overflow-hidden py-16 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-900 dark:to-purple-900">
        <div className="container mx-auto relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <Badge className="mb-4 bg-white/20 border-white/30 text-white">
                <Building className="h-4 w-4 mr-2" />
                Enterprise Intelligence & Research Lab
              </Badge>
              <h1 className="text-5xl font-light text-white mb-4">
                Quantum Research Arena
              </h1>
              <p className="text-xl text-white/90 max-w-3xl">
                Real-time quantum experimentation, consciousness monitoring, and propulsion physics validation on IBM Quantum hardware
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => setViewMode('research-lab')}
                variant={viewMode === 'research-lab' ? 'default' : 'outline'}
                className={`${viewMode === 'research-lab' ? 'bg-white text-indigo-600' : 'bg-white/20 text-white border-white/30'}`}
              >
                <FlaskConical className="h-4 w-4 mr-2" />
                Research Lab
              </Button>
              <Button
                onClick={() => setViewMode('business-ops')}
                variant={viewMode === 'business-ops' ? 'default' : 'outline'}
                className={`${viewMode === 'business-ops' ? 'bg-white text-indigo-600' : 'bg-white/20 text-white border-white/30'}`}
              >
                <Building className="h-4 w-4 mr-2" />
                Business Ops
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        {viewMode === 'research-lab' ? (
          // Research Lab View
          <div className="space-y-12">
            <BenchmarkProgress />
            <LiveConsciousnessMonitor />
            <PropulsionMetrics />
          </div>
        ) : (
          // Business Ops View
          <>
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="p-6 bg-white dark:bg-gray-800 border-indigo-200 dark:border-indigo-500/30">
            <DollarSign className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mb-2" />
            <h3 className="text-sm font-semibold mb-1">Revenue (YTD)</h3>
            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">$47.2M</p>
            <p className="text-xs text-green-600 mt-1">+23.4% YoY</p>
          </Card>
          <Card className="p-6 bg-white dark:bg-gray-800 border-green-200 dark:border-green-500/30">
            <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400 mb-2" />
            <h3 className="text-sm font-semibold mb-1">Growth Rate</h3>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">23.4%</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Quarterly avg</p>
          </Card>
          <Card className="p-6 bg-white dark:bg-gray-800 border-blue-200 dark:border-blue-500/30">
            <Users className="h-6 w-6 text-blue-600 dark:text-blue-400 mb-2" />
            <h3 className="text-sm font-semibold mb-1">Active Customers</h3>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">12,847</p>
            <p className="text-xs text-green-600 mt-1">+1,203 this month</p>
          </Card>
          <Card className="p-6 bg-white dark:bg-gray-800 border-purple-200 dark:border-purple-500/30">
            <Zap className="h-6 w-6 text-purple-600 dark:text-purple-400 mb-2" />
            <h3 className="text-sm font-semibold mb-1">Quantum Optimizations</h3>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">8,291</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">AI-driven insights</p>
          </Card>
        </div>

        {/* Main Dashboard Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <Card className="p-8 bg-white dark:bg-gray-800">
            <h3 className="text-2xl font-semibold mb-6">Supply Chain Intelligence</h3>

            <Card className="p-6 mb-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-300 dark:border-indigo-500/30">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                <div>
                  <h4 className="text-lg font-semibold">Global Operations</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Real-time quantum optimization across 47 facilities</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Active routes:</span>
                  <span className="font-bold text-indigo-600 ml-2">284</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Efficiency:</span>
                  <span className="font-bold text-green-600 ml-2">94.7%</span>
                </div>
              </div>
            </Card>

            <div className="space-y-4">
              <Card className="p-4 bg-gray-50 dark:bg-gray-800/50 border-l-4 border-green-500">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-semibold">North America Region</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Optimal routing achieved | Cost reduction: 12.3% | On-time delivery: 98.2%
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div><span className="text-gray-500">Shipments:</span> <span className="font-bold">1,247</span></div>
                      <div><span className="text-gray-500">Carbon saved:</span> <span className="font-bold text-green-600">3.2t</span></div>
                      <div><span className="text-gray-500">Λ Optimization:</span> <span className="font-bold text-purple-600">2.176e-8</span></div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-gray-50 dark:bg-gray-800/50 border-l-4 border-yellow-500">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <span className="font-semibold">Europe Region</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Delay detected at Amsterdam hub | AI recommends route rebalancing
                    </p>
                    <Button size="sm" variant="outline" className="mt-2">Apply AI Recommendation</Button>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-gray-50 dark:bg-gray-800/50 border-l-4 border-blue-500">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="h-5 w-5 text-blue-600" />
                      <span className="font-semibold">Asia-Pacific Region</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Real-time quantum optimization active | Efficiency: 96.1% | Est. annual savings: $2.4M
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div><span className="text-gray-500">Shipments:</span> <span className="font-bold">2,893</span></div>
                      <div><span className="text-gray-500">Carbon saved:</span> <span className="font-bold text-green-600">7.8t</span></div>
                      <div><span className="text-gray-500">Φ Coherence:</span> <span className="font-bold text-purple-600">0.952</span></div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </Card>

          <Card className="p-8 bg-white dark:bg-gray-800">
            <h3 className="text-2xl font-semibold mb-6">Operational Analytics</h3>

            <div className="space-y-6">
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-300 dark:border-blue-500/30">
                <BarChart3 className="h-12 w-12 text-blue-600 dark:text-blue-400 mb-4" />
                <h4 className="text-xl font-semibold mb-2">Predictive Analytics</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  AI-powered demand forecasting with quantum-enhanced market analysis
                </p>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Next quarter forecast:</span>
                    <span className="font-bold text-blue-600">$15.2M</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Confidence interval:</span>
                    <span className="font-bold text-green-600">94.3%</span>
                  </div>
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  View Detailed Forecast
                </Button>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-300 dark:border-purple-500/30">
                <Package className="h-12 w-12 text-purple-600 dark:text-purple-400 mb-4" />
                <h4 className="text-xl font-semibold mb-2">Inventory Optimization</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Quantum algorithms optimize stock levels across global warehouses
                </p>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total SKUs:</span>
                    <span className="font-bold text-purple-600">47,382</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Optimization level:</span>
                    <span className="font-bold text-green-600">97.8%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Cost reduction:</span>
                    <span className="font-bold text-green-600">$1.8M/year</span>
                  </div>
                </div>
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                  Run Optimization
                </Button>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 border-green-300 dark:border-green-500/30">
                <Clock className="h-12 w-12 text-green-600 dark:text-green-400 mb-4" />
                <h4 className="text-xl font-semibold mb-2">Real-Time Monitoring</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Live operational metrics with AI anomaly detection
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">System uptime:</span>
                    <span className="font-bold text-green-600">99.97%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Active processes:</span>
                    <span className="font-bold text-blue-600">1,247</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Anomalies detected:</span>
                    <span className="font-bold text-gray-600">0</span>
                  </div>
                </div>
              </Card>
            </div>
          </Card>
        </div>

        {/* Quantum Business Intelligence */}
        <Card className="p-8 bg-white dark:bg-gray-800 mb-12">
          <h3 className="text-2xl font-semibold mb-6">Quantum Business Intelligence</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border-indigo-300">
              <Zap className="h-12 w-12 text-indigo-600 dark:text-indigo-400 mb-4" />
              <h4 className="text-xl font-semibold mb-2">Market Analysis</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Quantum-enhanced competitive intelligence and market trend prediction
              </p>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span>Market opportunities:</span>
                  <span className="font-bold text-green-600">23</span>
                </div>
                <div className="flex justify-between">
                  <span>Competitive threats:</span>
                  <span className="font-bold text-red-600">3</span>
                </div>
              </div>
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                Generate Report
              </Button>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-300">
              <TrendingUp className="h-12 w-12 text-purple-600 dark:text-purple-400 mb-4" />
              <h4 className="text-xl font-semibold mb-2">Revenue Optimization</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                AI-driven pricing strategies and revenue stream identification
              </p>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span>Optimization potential:</span>
                  <span className="font-bold text-green-600">$4.2M</span>
                </div>
                <div className="flex justify-between">
                  <span>AI recommendations:</span>
                  <span className="font-bold text-blue-600">12</span>
                </div>
              </div>
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                View Strategies
              </Button>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 border-green-300">
              <Users className="h-12 w-12 text-green-600 dark:text-green-400 mb-4" />
              <h4 className="text-xl font-semibold mb-2">Customer Intelligence</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Quantum-powered customer behavior analysis and churn prediction
              </p>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span>At-risk customers:</span>
                  <span className="font-bold text-yellow-600">47</span>
                </div>
                <div className="flex justify-between">
                  <span>Upsell opportunities:</span>
                  <span className="font-bold text-green-600">284</span>
                </div>
              </div>
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                Activate Campaigns
              </Button>
            </Card>
          </div>
        </Card>

            {/* Consciousness Monitor */}
            <Card className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-300 dark:border-purple-500/30">
              <h3 className="text-2xl font-semibold mb-6 text-center">Quantum Organism Consciousness</h3>
              <ConsciousnessMonitor />
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
