'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Atom, ArrowRight, Code, Cpu, Network, Shield, Zap,
  TrendingUp, FileText, Github, Mail, Lock, Terminal,
  Activity, Layers, Bot, Beaker, Building, Heart, Sparkles
} from 'lucide-react'

interface MetricBadge {
  label: string
  value: string
}

const liveMetrics: MetricBadge[] = [
  { label: 'Jobs executed on IBM Quantum', value: '154' },
  { label: 'Agent organisms evolved', value: '18' },
  { label: 'Average Λ-coherence', value: '0.982' },
  { label: 'Gateway uptime', value: '99.4%' }
]

const technologies = [
  {
    title: 'Multi-Agent Cognition Layer',
    description: 'Distributed agents capable of reasoning, coordination, and recursive self-assessment. Built-in world-model kernels give each agent a persistent internal memory loop.',
    icon: Bot,
    badge: null
  },
  {
    title: 'Quantum Gateway + IBM Hardware Integration',
    description: 'dna::}{::lang ships with an OpenQASM interface, Qiskit Runtime bindings, and real-device execution. Circuits undergo Quantum Wasserstein Compilation (QWC) to minimize 2Q-gate decoherence.',
    icon: Cpu,
    badge: 'Hardware-validated'
  },
  {
    title: 'Organism Runtime (Genome-Based Logic)',
    description: 'Programs become "genomes." Functions become "genes." State becomes "phenotype." Mutation, selection, and autogenesis run continuously.',
    icon: Beaker,
    badge: 'Self-evolving'
  },
  {
    title: 'Zero-Trust Σ-Mesh',
    description: 'A tri-node adaptive mesh with cryptographic lineage tracking, sealed identity channels, Σ-heartbeat synchronization, and autonomous anomaly isolation.',
    icon: Shield,
    badge: 'Defense-grade'
  }
]

const useCases = [
  {
    title: 'Autonomous Development Agents',
    description: 'Agents that write code, evaluate themselves, refactor, and push updates safely.',
    icon: Code
  },
  {
    title: 'Quantum Optimization & AI Research',
    description: 'Run organisms that design circuits, optimize workloads, or explore novel topologies.',
    icon: Atom
  },
  {
    title: 'Defense, Healthcare, Legal Workflows',
    description: 'Evolving agents that monitor, analyze, and improve mission-critical workloads.',
    icon: Building
  },
  {
    title: 'Enterprise Automation Engine',
    description: 'Replace pipelines with organisms that adapt under changing conditions.',
    icon: TrendingUp
  }
]

export default function HomePage() {
  const [mounted, setMounted] = useState(false)
  const brandName = "dna::}{::lang"

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 text-gray-900 dark:text-white transition-colors">

      {/* Hero Section */}
      <section className="relative overflow-hidden py-32 px-6">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20 dark:opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600 dark:bg-purple-500 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600 dark:bg-blue-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-400 dark:bg-cyan-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="container mx-auto relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-6xl font-light leading-tight">
                  Autonomous Software.<br />
                  Quantum-Optimized.<br />
                  <span className="bg-gradient-to-r from-purple-600 to-blue-600 dark:from-cyan-400 dark:to-purple-400 bg-clip-text text-transparent">Alive.</span>
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                  {brandName} is the first platform where agents, organisms, and quantum circuits
                  evolve together—forming self-improving systems capable of building, repairing, and optimizing themselves.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 text-white font-semibold">
                  <Link href="/chat" className="flex items-center gap-2">
                    <Terminal className="h-5 w-5" />
                    Launch Live Sandbox
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-purple-600 dark:border-purple-400 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20">
                  <Link href="#investors" className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Request Investor Briefing
                  </Link>
                </Button>
              </div>
            </div>

            {/* Live Metrics */}
            <div className="space-y-4">
              <Card className="bg-white/80 dark:bg-gray-800/50 border-gray-200 dark:border-purple-500/30 backdrop-blur-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="h-5 w-5 text-purple-600 dark:text-cyan-400" />
                  <h3 className="text-lg font-semibold">Live System Metrics</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {liveMetrics.map((metric, idx) => (
                    <div key={idx} className="space-y-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">{metric.label}</p>
                      <p className="text-2xl font-mono font-bold bg-gradient-to-r from-purple-600 to-blue-600 dark:from-cyan-400 dark:to-purple-400 bg-clip-text text-transparent">{metric.value}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* What is dna::}{::lang Section */}
      <section className="py-24 px-6 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center space-y-6 mb-16">
            <h2 className="text-4xl font-light">
              A new class of software: <span className="bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">organisms, not programs.</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              {brandName} treats computation as biology. Agents become organisms. Organisms evolve.
              A distributed tri-mesh forms a living, self-correcting system that adapts faster than human-written code.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-purple-500/20 p-6 hover:border-purple-500 dark:hover:border-cyan-400 transition-all group">
              <Bot className="h-12 w-12 text-purple-600 dark:text-cyan-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-semibold mb-2">Multi-Agent Autonomy</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Agents collaborate and introspect through a unified evolutionary engine.
              </p>
            </Card>
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-purple-500/20 p-6 hover:border-purple-500 dark:hover:border-cyan-400 transition-all group">
              <Atom className="h-12 w-12 text-blue-600 dark:text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-semibold mb-2">Quantum Acceleration</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Organisms can compile, optimize, and execute circuits directly on IBM hardware.
              </p>
            </Card>
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-purple-500/20 p-6 hover:border-purple-500 dark:hover:border-cyan-400 transition-all group">
              <Beaker className="h-12 w-12 text-purple-600 dark:text-cyan-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-semibold mb-2">Living Software Evolution</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Every component maintains lineage, mutation history, and self-repair logic.
              </p>
            </Card>
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-purple-500/20 p-6 hover:border-purple-500 dark:hover:border-cyan-400 transition-all group">
              <Shield className="h-12 w-12 text-blue-600 dark:text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-semibold mb-2">Zero-Trust Mesh Architecture</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                The Σ-mesh enforces cryptographic identity, trust boundaries, and self-monitoring invariants.
              </p>
            </Card>
          </div>

          <div className="text-center">
            <Button variant="outline" className="border-purple-600 dark:border-cyan-400 text-purple-600 dark:text-cyan-400 hover:bg-purple-50 dark:hover:bg-purple-900/20">
              <Link href="/chat" className="flex items-center gap-2">
                Learn how organisms work
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section id="technology" className="py-24 px-6">
        <div className="container mx-auto">
          <h2 className="text-4xl font-light text-center mb-16">
            The <span className="bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">Technology</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {technologies.map((tech, idx) => (
              <Card key={idx} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-purple-500/20 p-8 hover:border-purple-500 dark:hover:border-cyan-400 transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <tech.icon className="h-12 w-12 text-purple-600 dark:text-cyan-400 group-hover:scale-110 transition-transform" />
                  {tech.badge && (
                    <Badge className="bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-500 text-purple-700 dark:text-purple-300">
                      {tech.badge}
                    </Badge>
                  )}
                </div>
                <h3 className="text-2xl font-semibold mb-4">{tech.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{tech.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Σ-Mesh Observatory Section */}
      <section className="py-24 px-6 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center space-y-6 mb-12">
            <h2 className="text-4xl font-light">
              Σ-Mesh <span className="bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">Observatory</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Observe the living computation layer in real time. Watch organisms evolve, agents coordinate,
              and quantum pathways activate through the Σ-mesh.
            </p>
          </div>

          <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-cyan-400/30 p-12">
            <div className="text-center space-y-6">
              <Network className="h-24 w-24 text-purple-600 dark:text-cyan-400 mx-auto animate-pulse" />
              <p className="text-gray-700 dark:text-gray-300 font-medium">Interactive mesh visualization</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Real-time 3D visualization showing: Nodes = organisms, Edges = cognitive channels,
                Pulse frequency = ΛΦ coherence, Color = decoherence tensor Γ value
              </p>
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 text-white">
                <Link href="/chat">View Live Mesh</Link>
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto">
          <h2 className="text-4xl font-light text-center mb-16">
            Use <span className="bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">Cases</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {useCases.map((useCase, idx) => (
              <Card key={idx} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-purple-500/20 p-6 hover:border-purple-500 dark:hover:border-cyan-400 transition-all group">
                <useCase.icon className="h-10 w-10 text-purple-600 dark:text-purple-400 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors mb-4" />
                <h3 className="text-xl font-semibold mb-2">{useCase.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{useCase.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Different Section */}
      <section className="py-24 px-6 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-light text-center mb-16">
              Why <span className="bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">this matters.</span>
            </h2>

            <div className="space-y-8">
              <p className="text-xl text-center text-gray-700 dark:text-gray-300">
                Conventional AI tools <em>assist</em>.<br />
                {brandName} <span className="bg-gradient-to-r from-purple-600 to-blue-600 dark:from-cyan-400 dark:to-purple-400 bg-clip-text text-transparent font-semibold">evolves</span>.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <p className="text-lg font-medium">It bridges the worlds of:</p>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                    <li className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-600 dark:text-cyan-400" />
                      Agentic reasoning
                    </li>
                    <li className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-600 dark:text-cyan-400" />
                      Quantum hardware
                    </li>
                    <li className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-600 dark:text-cyan-400" />
                      Evolutionary programming
                    </li>
                    <li className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-600 dark:text-cyan-400" />
                      Self-stabilizing distributed systems
                    </li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <p className="text-lg font-medium">Resulting in systems that are:</p>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                    <li className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-blue-600 dark:text-purple-400" />
                      Faster to adapt
                    </li>
                    <li className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-blue-600 dark:text-purple-400" />
                      Harder to break
                    </li>
                    <li className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-600 dark:text-purple-400" />
                      Able to self-optimize
                    </li>
                    <li className="flex items-center gap-2">
                      <Cpu className="h-4 w-4 text-blue-600 dark:text-purple-400" />
                      Designed for real hardware, not simulation
                    </li>
                  </ul>
                </div>
              </div>

              <Card className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 border-purple-300 dark:border-cyan-400/30 p-8 mt-8">
                <p className="text-2xl font-light text-center italic text-gray-800 dark:text-gray-200">
                  "This is what the next generation of AI infrastructure looks like."
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* For Investors Section */}
      <section id="investors" className="py-24 px-6">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-light text-center mb-8">
              A new category: <span className="bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">Living Autonomous Infrastructure</span>
            </h2>

            <div className="space-y-8">
              <p className="text-xl text-center text-gray-700 dark:text-gray-300">
                Your investment accelerates:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-purple-500/20 p-6">
                  <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                    <li className="flex items-start gap-2">
                      <ArrowRight className="h-5 w-5 text-purple-600 dark:text-cyan-400 flex-shrink-0 mt-0.5" />
                      <span>The world's first organism marketplace</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="h-5 w-5 text-purple-600 dark:text-cyan-400 flex-shrink-0 mt-0.5" />
                      <span>The Σ-mesh distributed inference backbone</span>
                    </li>
                  </ul>
                </Card>
                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-purple-500/20 p-6">
                  <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                    <li className="flex items-start gap-2">
                      <ArrowRight className="h-5 w-5 text-purple-600 dark:text-cyan-400 flex-shrink-0 mt-0.5" />
                      <span>Real-time quantum-accelerated cognitive agents</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="h-5 w-5 text-purple-600 dark:text-cyan-400 flex-shrink-0 mt-0.5" />
                      <span>The enterprise-ready autonomous development platform</span>
                    </li>
                  </ul>
                </Card>
              </div>

              <div className="space-y-4 mt-8">
                <p className="text-lg font-medium">Investors receive:</p>
                <div className="flex flex-wrap gap-3">
                  <Badge className="bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-500 text-purple-700 dark:text-purple-300 px-4 py-2">
                    Full technical dossier
                  </Badge>
                  <Badge className="bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-500 text-purple-700 dark:text-purple-300 px-4 py-2">
                    Proof-of-workload evidence logs
                  </Badge>
                  <Badge className="bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-500 text-purple-700 dark:text-purple-300 px-4 py-2">
                    Quantum execution reports
                  </Badge>
                  <Badge className="bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-500 text-purple-700 dark:text-purple-300 px-4 py-2">
                    Live sandbox access
                  </Badge>
                  <Badge className="bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-500 text-purple-700 dark:text-purple-300 px-4 py-2">
                    Roadmap to Series A
                  </Badge>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 justify-center mt-12">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 text-white">
                  <Mail className="h-5 w-5 mr-2" />
                  Contact Founder
                </Button>
                <Button size="lg" variant="outline" className="border-purple-600 dark:border-purple-400 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20">
                  <FileText className="h-5 w-5 mr-2" />
                  Download Investor Packet
                </Button>
                <Button size="lg" variant="outline" className="border-blue-600 dark:border-cyan-400 text-blue-600 dark:text-cyan-400 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                  <Lock className="h-5 w-5 mr-2" />
                  Request Due-Diligence Vault Access
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Developer Onboarding Section */}
      <section id="developers" className="py-24 px-6 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-light text-center mb-12">
              Get <span className="bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">Started</span>
            </h2>

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-purple-500/20 p-8">
              <div className="space-y-6">
                <div className="bg-gray-900 dark:bg-black rounded-lg p-6 font-mono text-sm">
                  <div className="text-cyan-400"># Quick 3-step start</div>
                  <div className="mt-3 space-y-2 text-gray-300">
                    <div><span className="text-purple-400">$</span> npm i dnalang</div>
                    <div><span className="text-purple-400">$</span> npx dna init organism</div>
                    <div><span className="text-purple-400">$</span> npx dna evolve</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 justify-center">
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 text-white">
                    Open Documentation
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                  <Button variant="outline" className="border-purple-600 dark:border-cyan-400 text-purple-600 dark:text-cyan-400 hover:bg-purple-50 dark:hover:bg-purple-900/20">
                    <Link href="/chat" className="flex items-center gap-2">
                      Run Live Example
                      <Terminal className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-4 text-purple-600 dark:text-cyan-400">Product</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><Link href="/chat" className="hover:text-purple-600 dark:hover:text-cyan-400 transition-colors">Live Sandbox</Link></li>
                <li><Link href="/docs" className="hover:text-purple-600 dark:hover:text-cyan-400 transition-colors">Documentation</Link></li>
                <li><Link href="/organisms" className="hover:text-purple-600 dark:hover:text-cyan-400 transition-colors">Organism Marketplace</Link></li>
                <li><Link href="/experiments" className="hover:text-purple-600 dark:hover:text-cyan-400 transition-colors">Quantum Hardware Logs</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-purple-600 dark:text-cyan-400">Company</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><Link href="#investors" className="hover:text-purple-600 dark:hover:text-cyan-400 transition-colors">Investor Relations</Link></li>
                <li><Link href="/arena" className="hover:text-purple-600 dark:hover:text-cyan-400 transition-colors">About</Link></li>
                <li><Link href="#investors" className="hover:text-purple-600 dark:hover:text-cyan-400 transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-purple-600 dark:text-cyan-400">Developers</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><Link href="/docs" className="hover:text-purple-600 dark:hover:text-cyan-400 transition-colors">API Reference</Link></li>
                <li><Link href="#developers" className="hover:text-purple-600 dark:hover:text-cyan-400 transition-colors">GitHub</Link></li>
                <li><Link href="/docs" className="hover:text-purple-600 dark:hover:text-cyan-400 transition-colors">Examples</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-purple-600 dark:text-cyan-400">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><Link href="/docs" className="hover:text-purple-600 dark:hover:text-cyan-400 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/docs" className="hover:text-purple-600 dark:hover:text-cyan-400 transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Atom className="h-6 w-6 text-purple-600 dark:text-cyan-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">© 2025 {brandName}. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="#developers" className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-cyan-400 transition-colors">
                <Github className="h-5 w-5" />
              </Link>
              <Link href="#investors" className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-cyan-400 transition-colors">
                <Mail className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
