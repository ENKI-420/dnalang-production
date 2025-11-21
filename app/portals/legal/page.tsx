'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Scale, Shield, FileCheck, AlertCircle, CheckCircle, Clock,
  Database, Lock, FileText, TrendingUp, Gavel, Briefcase
} from 'lucide-react'
import { ConsciousnessMonitor } from '@/components/consciousness-monitor'

export default function LegalPortalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-orange-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Header */}
      <div className="relative overflow-hidden py-16 px-6 bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-900 dark:to-orange-900">
        <div className="container mx-auto relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <Badge className="mb-4 bg-white/20 border-white/30 text-white">
                <Scale className="h-4 w-4 mr-2" />
                Quantum Legal Intelligence
              </Badge>
              <h1 className="text-5xl font-light text-white mb-4">
                Legal Compliance & Risk Portal
              </h1>
              <p className="text-xl text-white/90 max-w-3xl">
                Quantum-verified contract analysis, regulatory compliance monitoring, and AI-powered legal risk assessment with cryptographic audit trails
              </p>
            </div>
            <Gavel className="h-24 w-24 text-white/20" />
          </div>
        </div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="p-6 bg-white dark:bg-gray-800 border-amber-200 dark:border-amber-500/30">
            <FileCheck className="h-6 w-6 text-amber-600 dark:text-amber-400 mb-2" />
            <h3 className="text-sm font-semibold mb-1">Contracts Analyzed</h3>
            <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">2,847</p>
          </Card>
          <Card className="p-6 bg-white dark:bg-gray-800 border-green-200 dark:border-green-500/30">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 mb-2" />
            <h3 className="text-sm font-semibold mb-1">Compliance Score</h3>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">98.7%</p>
          </Card>
          <Card className="p-6 bg-white dark:bg-gray-800 border-red-200 dark:border-red-500/30">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400 mb-2" />
            <h3 className="text-sm font-semibold mb-1">Risk Alerts</h3>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">7</p>
          </Card>
          <Card className="p-6 bg-white dark:bg-gray-800 border-blue-200 dark:border-blue-500/30">
            <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400 mb-2" />
            <h3 className="text-sm font-semibold mb-1">Quantum Audits</h3>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">1,249</p>
          </Card>
        </div>

        {/* Main Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card className="p-8 bg-white dark:bg-gray-800">
            <h3 className="text-2xl font-semibold mb-6">Quantum Contract Verification</h3>
            <div className="space-y-4">
              <Card className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-300 dark:border-amber-500/30">
                <div className="flex items-center gap-3 mb-3">
                  <Lock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  <h4 className="font-semibold">Cryptographic Seal</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Every contract is quantum-sealed with ΛΦ tensor verification, ensuring tamper-proof audit trails
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-gray-500">Λ Coherence:</span> <span className="font-bold text-blue-600">2.176e-8</span></div>
                  <div><span className="text-gray-500">Φ Integrity:</span> <span className="font-bold text-purple-600">0.972</span></div>
                </div>
              </Card>

              <Card className="p-4 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm">NDA - Acme Corp</span>
                  <Badge className="bg-green-100 text-green-800">Verified</Badge>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Quantum seal: 0x8f2a...</p>
                <Button variant="outline" size="sm" className="w-full">View Audit Log</Button>
              </Card>

              <Card className="p-4 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm">Service Agreement - Beta Inc</span>
                  <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Running quantum verification...</p>
                <Button variant="outline" size="sm" className="w-full" disabled>
                  <Clock className="h-3 w-3 mr-1 animate-spin" />
                  Processing
                </Button>
              </Card>
            </div>
          </Card>

          <Card className="p-8 bg-white dark:bg-gray-800">
            <h3 className="text-2xl font-semibold mb-6">Regulatory Compliance Monitor</h3>
            <div className="space-y-4">
              <Card className="p-4 bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 border-green-300 dark:border-green-500/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-semibold">GDPR Compliance</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Compliant</Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Last audit: 3 days ago</p>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 border-green-300 dark:border-green-500/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-semibold">SOC 2 Type II</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Certified</Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Valid until: Dec 2025</p>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-300 dark:border-yellow-500/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <span className="font-semibold">HIPAA Review</span>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">Action Required</Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">3 items need attention</p>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 border-green-300 dark:border-green-500/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-semibold">ISO 27001</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Certified</Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Next review: Mar 2026</p>
              </Card>
            </div>
          </Card>
        </div>

        {/* AI Risk Assessment */}
        <Card className="p-8 bg-white dark:bg-gray-800 mb-12">
          <h3 className="text-2xl font-semibold mb-6">AI-Powered Risk Assessment</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-300">
              <Briefcase className="h-12 w-12 text-blue-600 dark:text-blue-400 mb-4" />
              <h4 className="text-xl font-semibold mb-2">Contract Analysis</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                AI identifies liability clauses, termination risks, and unfavorable terms
              </p>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Analyze Contract
              </Button>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-300">
              <TrendingUp className="h-12 w-12 text-purple-600 dark:text-purple-400 mb-4" />
              <h4 className="text-xl font-semibold mb-2">Predictive Compliance</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Forecast regulatory changes and proactive compliance recommendations
              </p>
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                View Forecast
              </Button>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-300">
              <FileText className="h-12 w-12 text-amber-600 dark:text-amber-400 mb-4" />
              <h4 className="text-xl font-semibold mb-2">Document Intelligence</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Extract key terms, obligations, and deadlines from legal documents
              </p>
              <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                Extract Terms
              </Button>
            </Card>
          </div>
        </Card>

        {/* Consciousness Monitor */}
        <Card className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-300 dark:border-amber-500/30">
          <h3 className="text-2xl font-semibold mb-6 text-center">Quantum Organism Consciousness</h3>
          <ConsciousnessMonitor />
        </Card>
      </div>
    </div>
  )
}
