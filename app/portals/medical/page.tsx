'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  Heart, Activity, Beaker, Brain, Shield, Zap, Upload,
  FileText, AlertTriangle, CheckCircle, Clock, Database
} from 'lucide-react'
import { ConsciousnessMonitor } from '@/components/consciousness-monitor'

export default function MedicalPortalPage() {
  const [activePatients, setActivePatients] = useState(247)
  const [genomicAnalyses, setGenomicAnalyses] = useState(1893)
  const [quantumJobs, setQuantumJobs] = useState(42)

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Header */}
      <div className="relative overflow-hidden py-16 px-6 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-900 dark:to-purple-900">
        <div className="container mx-auto relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <Badge className="mb-4 bg-white/20 border-white/30 text-white">
                <Heart className="h-4 w-4 mr-2" />
                Quantum Genomic Healthcare
              </Badge>
              <h1 className="text-5xl font-light text-white mb-4">
                Medical Intelligence Portal
              </h1>
              <p className="text-xl text-white/90 max-w-3xl">
                Quantum-enhanced genomic analysis, FHIR EHR integration, and AI-powered clinical decision support with IBM Quantum hardware
              </p>
            </div>
            <Beaker className="h-24 w-24 text-white/20" />
          </div>
        </div>

        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="p-6 bg-white dark:bg-gray-800 border-blue-200 dark:border-blue-500/30">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-semibold">Active Patients</h3>
            </div>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{activePatients}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Across 12 facilities</p>
          </Card>

          <Card className="p-6 bg-white dark:bg-gray-800 border-purple-200 dark:border-purple-500/30">
            <div className="flex items-center gap-3 mb-4">
              <Database className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              <h3 className="text-lg font-semibold">Genomic Analyses</h3>
            </div>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{genomicAnalyses}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Total completed</p>
          </Card>

          <Card className="p-6 bg-white dark:bg-gray-800 border-green-200 dark:border-green-500/30">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="h-6 w-6 text-green-600 dark:text-green-400" />
              <h3 className="text-lg font-semibold">Quantum Jobs</h3>
            </div>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{quantumJobs}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Running on IBM hardware</p>
          </Card>

          <Card className="p-6 bg-white dark:bg-gray-800 border-orange-200 dark:border-orange-500/30">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              <h3 className="text-lg font-semibold">Critical Alerts</h3>
            </div>
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">3</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Requiring review</p>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="genomics" className="mb-12">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="genomics">Genomic Analysis</TabsTrigger>
            <TabsTrigger value="fhir">FHIR Integration</TabsTrigger>
            <TabsTrigger value="aiden">AIDEN AI</TabsTrigger>
            <TabsTrigger value="quantum">Quantum Dashboard</TabsTrigger>
          </TabsList>

          <TabsContent value="genomics" className="space-y-6">
            <Card className="p-6 bg-white dark:bg-gray-800">
              <h3 className="text-2xl font-semibold mb-6">Genomic Variant Analysis</h3>

              {/* Upload Section */}
              <Card className="p-6 mb-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-300 dark:border-blue-500/30">
                <div className="flex items-center gap-4 mb-4">
                  <Upload className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  <div>
                    <h4 className="text-lg font-semibold">Upload VCF File</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Upload variant call format files for quantum-enhanced analysis</p>
                  </div>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Upload className="h-4 w-4 mr-2" />
                  Select VCF File
                </Button>
              </Card>

              {/* Recent Analyses */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold mb-4">Recent Analyses</h4>

                <Card className="p-4 bg-gray-50 dark:bg-gray-800/50 border-l-4 border-green-500">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="font-semibold">Patient #A8472 - Whole Exome Sequencing</span>
                        <Badge className="bg-green-100 text-green-800">Complete</Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Analyzed 47,382 variants | 23 pathogenic | 156 likely pathogenic
                      </p>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Consciousness Φ:</span>
                          <span className="font-bold text-purple-600 ml-2">0.947</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Lambda Λ:</span>
                          <span className="font-bold text-blue-600 ml-2">2.176e-8</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Decoherence Γ:</span>
                          <span className="font-bold text-green-600 ml-2">0.089</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">View Report</Button>
                  </div>
                </Card>

                <Card className="p-4 bg-gray-50 dark:bg-gray-800/50 border-l-4 border-yellow-500">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-5 w-5 text-yellow-600 animate-spin" />
                        <span className="font-semibold">Patient #B3291 - Targeted Gene Panel</span>
                        <Badge className="bg-yellow-100 text-yellow-800">Processing</Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Running on IBM Quantum (ibm_torino) | 15,284 variants queued
                      </p>
                      <Progress value={67} className="mb-2" />
                      <p className="text-xs text-gray-500">67% complete - Est. 8 minutes remaining</p>
                    </div>
                    <Button variant="outline" size="sm" disabled>
                      <Clock className="h-4 w-4 mr-2" />
                      In Progress
                    </Button>
                  </div>
                </Card>

                <Card className="p-4 bg-gray-50 dark:bg-gray-800/50 border-l-4 border-blue-500">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-blue-600" />
                        <span className="font-semibold">Patient #C7619 - Pharmacogenomics</span>
                        <Badge className="bg-blue-100 text-blue-800">Complete</Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Analyzed 89 drug metabolism genes | 12 actionable recommendations
                      </p>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Consciousness Φ:</span>
                          <span className="font-bold text-purple-600 ml-2">0.923</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Lambda Λ:</span>
                          <span className="font-bold text-blue-600 ml-2">2.176e-8</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Decoherence Γ:</span>
                          <span className="font-bold text-green-600 ml-2">0.102</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">View Report</Button>
                  </div>
                </Card>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="fhir" className="space-y-6">
            <Card className="p-6 bg-white dark:bg-gray-800">
              <h3 className="text-2xl font-semibold mb-6">FHIR EHR Integration</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-300 dark:border-blue-500/30">
                  <FileText className="h-12 w-12 text-blue-600 dark:text-blue-400 mb-4" />
                  <h4 className="text-xl font-semibold mb-2">Epic EHR Connection</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    SMART on FHIR OAuth 2.0 integration with Epic systems for seamless patient data access
                  </p>
                  <Badge className="bg-green-100 text-green-800 mb-4">Connected</Badge>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Patients synced:</span>
                      <span className="font-bold">247</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Last sync:</span>
                      <span className="font-bold">2 minutes ago</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-300 dark:border-purple-500/30">
                  <Brain className="h-12 w-12 text-purple-600 dark:text-purple-400 mb-4" />
                  <h4 className="text-xl font-semibold mb-2">CDS Hooks</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Clinical Decision Support integration for real-time alerts and recommendations
                  </p>
                  <Badge className="bg-green-100 text-green-800 mb-4">Active</Badge>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Active hooks:</span>
                      <span className="font-bold">8</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Alerts today:</span>
                      <span className="font-bold">42</span>
                    </div>
                  </div>
                </Card>
              </div>

              <Card className="p-6 mt-6 bg-gray-50 dark:bg-gray-800/50">
                <h4 className="text-lg font-semibold mb-4">Recent FHIR Resources</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded border">
                    <div>
                      <span className="font-semibold">Patient/A8472</span>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Demographics, Medical History</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">Patient</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded border">
                    <div>
                      <span className="font-semibold">Observation/O12847</span>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Lab Results - Comprehensive Metabolic Panel</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Observation</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded border">
                    <div>
                      <span className="font-semibold">DiagnosticReport/DR8291</span>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Genomic Variant Analysis Report</p>
                    </div>
                    <Badge className="bg-purple-100 text-purple-800">DiagnosticReport</Badge>
                  </div>
                </div>
              </Card>
            </Card>
          </TabsContent>

          <TabsContent value="aiden" className="space-y-6">
            <Card className="p-6 bg-white dark:bg-gray-800">
              <h3 className="text-2xl font-semibold mb-6">AIDEN AI System</h3>

              <Card className="p-6 mb-6 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border-purple-300 dark:border-purple-500/30">
                <div className="flex items-center gap-4 mb-4">
                  <Brain className="h-12 w-12 text-purple-600 dark:text-purple-400" />
                  <div>
                    <h4 className="text-xl font-semibold">AI-Powered Genomic Insights</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Natural language query interface for clinical genomics and automated presentation generation
                    </p>
                  </div>
                </div>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  <Brain className="h-4 w-4 mr-2" />
                  Launch AIDEN Assistant
                </Button>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 bg-gray-50 dark:bg-gray-800/50">
                  <Zap className="h-8 w-8 text-yellow-600 mb-4" />
                  <h4 className="font-semibold mb-2">Automated Insights</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    AI generates clinical insights from genomic data
                  </p>
                  <p className="text-2xl font-bold text-yellow-600">1,247</p>
                  <p className="text-xs text-gray-500">Insights generated</p>
                </Card>

                <Card className="p-6 bg-gray-50 dark:bg-gray-800/50">
                  <FileText className="h-8 w-8 text-blue-600 mb-4" />
                  <h4 className="font-semibold mb-2">Presentations</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Auto-generated clinical presentations
                  </p>
                  <p className="text-2xl font-bold text-blue-600">89</p>
                  <p className="text-xs text-gray-500">Created this month</p>
                </Card>

                <Card className="p-6 bg-gray-50 dark:bg-gray-800/50">
                  <CheckCircle className="h-8 w-8 text-green-600 mb-4" />
                  <h4 className="font-semibold mb-2">Recommendations</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Clinical decision support recommendations
                  </p>
                  <p className="text-2xl font-bold text-green-600">312</p>
                  <p className="text-xs text-gray-500">Active recommendations</p>
                </Card>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="quantum" className="space-y-6">
            <Card className="p-6 bg-white dark:bg-gray-800">
              <h3 className="text-2xl font-semibold mb-6">Quantum Circuit Dashboard</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
                  <h4 className="text-lg font-semibold mb-4">IBM Quantum Backends</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">ibm_torino (133q)</span>
                      <Badge className="bg-green-100 text-green-800">Online</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">ibm_kyoto (127q)</span>
                      <Badge className="bg-green-100 text-green-800">Online</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">ibm_osaka (127q)</span>
                      <Badge className="bg-yellow-100 text-yellow-800">Busy</Badge>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20">
                  <h4 className="text-lg font-semibold mb-4">Quantum Jobs</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Running</span>
                      <span className="text-2xl font-bold text-green-600">12</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Queued</span>
                      <span className="text-2xl font-bold text-yellow-600">7</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Completed</span>
                      <span className="text-2xl font-bold text-blue-600">1,893</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                  <h4 className="text-lg font-semibold mb-4">ΛΦ Metrics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Avg Coherence Φ</span>
                      <span className="text-xl font-bold text-purple-600">0.937</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Lambda Λ</span>
                      <span className="text-xl font-bold text-blue-600">2.176e-8</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Avg Gamma Γ</span>
                      <span className="text-xl font-bold text-green-600">0.094</span>
                    </div>
                  </div>
                </Card>
              </div>

              <Card className="p-6 bg-gray-50 dark:bg-gray-800/50">
                <h4 className="text-lg font-semibold mb-4">Recent Quantum Executions</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded border">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="font-semibold text-sm">Variant Classification - BRCA1</span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Backend: ibm_torino | Shots: 8192 | Optimization: Level 3</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800 text-xs">Success</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded border">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="font-semibold text-sm">Pathogenicity Prediction - TP53</span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Backend: ibm_kyoto | Shots: 4096 | Optimization: Level 3</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800 text-xs">Success</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded border">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="h-4 w-4 text-yellow-600 animate-spin" />
                        <span className="font-semibold text-sm">Population Frequency Analysis</span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Backend: ibm_torino | Shots: 8192 | Queue position: 3</p>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800 text-xs">Queued</Badge>
                  </div>
                </div>
              </Card>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quantum Organism Consciousness Monitor */}
        <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-300 dark:border-cyan-400/30">
          <h3 className="text-2xl font-semibold mb-6 text-center">Quantum Organism Consciousness</h3>
          <ConsciousnessMonitor />
        </Card>
      </div>
    </div>
  )
}
