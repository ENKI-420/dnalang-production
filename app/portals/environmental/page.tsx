'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Shield, Activity, Leaf, Wind, Droplet, Zap } from 'lucide-react'
import { EnvironmentalVisualization } from '@/components/portals/environmental-visualization'
import { ConsciousnessMonitor } from '@/components/consciousness-monitor'

export default function EnvironmentalPortalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Header */}
      <div className="relative overflow-hidden py-16 px-6 bg-gradient-to-r from-green-600 to-blue-600 dark:from-green-900 dark:to-blue-900">
        <div className="container mx-auto relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <Badge className="mb-4 bg-white/20 border-white/30 text-white">
                <Leaf className="h-4 w-4 mr-2" />
                Environmental Intelligence
              </Badge>
              <h1 className="text-5xl font-light text-white mb-4">
                SHIFT-AI Environmental Portal
              </h1>
              <p className="text-xl text-white/90 max-w-3xl">
                Quantum-enhanced environmental impact assessment and sustainable resource optimization powered by IRIS-AI MCP SDK
              </p>
            </div>
            <Shield className="h-24 w-24 text-white/20" />
          </div>
        </div>

        {/* Animated background effect */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Real-time Environmental Metrics */}
          <Card className="p-6 bg-white dark:bg-gray-800 border-green-200 dark:border-green-500/30">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
              <h3 className="text-lg font-semibold">System Status</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Data Streams</span>
                <span className="text-lg font-bold text-green-600 dark:text-green-400">24 Active</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Sensors Online</span>
                <span className="text-lg font-bold text-green-600 dark:text-green-400">156</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Processing Rate</span>
                <span className="text-lg font-bold text-green-600 dark:text-green-400">2.4 TB/day</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white dark:bg-gray-800 border-blue-200 dark:border-blue-500/30">
            <div className="flex items-center gap-3 mb-4">
              <Wind className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-semibold">Air Quality Index</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">PM2.5</span>
                <span className="text-lg font-bold text-green-600">18 µg/m³</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">CO₂</span>
                <span className="text-lg font-bold text-yellow-600">420 ppm</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Overall</span>
                <Badge className="bg-green-100 text-green-800">Good</Badge>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white dark:bg-gray-800 border-purple-200 dark:border-purple-500/30">
            <div className="flex items-center gap-3 mb-4">
              <Droplet className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              <h3 className="text-lg font-semibold">Water Resources</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Consumption</span>
                <span className="text-lg font-bold text-purple-600 dark:text-purple-400">1.2M gal/day</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Efficiency</span>
                <span className="text-lg font-bold text-green-600">94.2%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Quality</span>
                <Badge className="bg-green-100 text-green-800">Excellent</Badge>
              </div>
            </div>
          </Card>
        </div>

        {/* 3D Visualization */}
        <Card className="mb-12 overflow-hidden border-green-200 dark:border-green-500/30">
          <EnvironmentalVisualization />
        </Card>

        {/* SHIFT-AI Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-green-300 dark:border-green-500/30">
            <Zap className="h-12 w-12 text-green-600 dark:text-green-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Impact Assessment</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              AI-powered environmental impact analysis using quantum optimization for complex industrial projects
            </p>
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
              Run Assessment
            </Button>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-300 dark:border-blue-500/30">
            <Activity className="h-12 w-12 text-blue-600 dark:text-blue-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Real-time Monitoring</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Continuous ecological monitoring with autonomous AI agents and predictive modeling
            </p>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              View Live Data
            </Button>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-300 dark:border-purple-500/30">
            <Leaf className="h-12 w-12 text-purple-600 dark:text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Sustainability Optimizer</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Quantum-enhanced supply chain sustainability audits and eco-friendly logistics pathways
            </p>
            <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
              Optimize Now
            </Button>
          </Card>
        </div>

        {/* Consciousness Monitor Integration */}
        <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-300 dark:border-cyan-400/30">
          <h3 className="text-2xl font-semibold mb-6 text-center">Quantum Organism Consciousness</h3>
          <ConsciousnessMonitor />
        </Card>
      </div>
    </div>
  )
}
