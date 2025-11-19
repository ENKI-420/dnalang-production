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
    <div className="min-h-screen bg-gradient-to-b from-[#02010A] via-[#0F3D91]/10 to-[#02010A] text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-[#02010A]/80 border-b border-[#6A00F4]/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Atom className="h-8 w-8 text-[#00FFD1] animate-spin-slow" />
                <div className="absolute inset-0 blur-lg bg-[#00FFD1]/30" />
              </div>
              <span className="text-xl font-light tracking-wider">{brandName}</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/chat" className="text-sm hover:text-[#00FFD1] transition-colors">
                Chat
              </Link>
              <Link href="/orchestrator" className="text-sm hover:text-[#00FFD1] transition-colors">
                Orchestrator
              </Link>
              <Link href="/workloads" className="text-sm hover:text-[#00FFD1] transition-colors">
                Workloads
              </Link>
              <Link href="#technology" className="text-sm hover:text-[#00FFD1] transition-colors">
                Technology
              </Link>
              <Link href="#investors" className="text-sm hover:text-[#00FFD1] transition-colors">
                Investors
              </Link>
              <Link href="#developers" className="text-sm hover:text-[#00FFD1] transition-colors">
                Developers
              </Link>
              <Button size="sm" className="bg-[#6A00F4] hover:bg-[#6A00F4]/80 text-white">
                <Link href="/chat">Launch Sandbox</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-32 px-6">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#6A00F4] rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#0F3D91] rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-[#00FFD1] rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="container mx-auto relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-6xl font-light leading-tight">
                  Autonomous Software.<br />
                  Quantum-Optimized.<br />
                  <span className="text-[#00FFD1]">Alive.</span>
                </h1>
                <p className="text-xl text-[#EAEAEA]/80 leading-relaxed">
                  {brandName} is the first platform where agents, organisms, and quantum circuits
                  evolve together—forming self-improving systems capable of building, repairing, and optimizing themselves.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="bg-[#00FFD1] hover:bg-[#00FFD1]/80 text-[#02010A] font-semibold">
                  <Link href="/chat" className="flex items-center gap-2">
                    <Terminal className="h-5 w-5" />
                    Launch Live Sandbox
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-[#6A00F4] text-[#6A00F4] hover:bg-[#6A00F4]/10">
                  <Link href="#investors" className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Request Investor Briefing
                  </Link>
                </Button>
              </div>
            </div>

            {/* Live Metrics */}
            <div className="space-y-4">
              <Card className="bg-[#0F3D91]/20 border-[#6A00F4]/30 backdrop-blur-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="h-5 w-5 text-[#00FFD1]" />
                  <h3 className="text-lg font-semibold">Live System Metrics</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {liveMetrics.map((metric, idx) => (
                    <div key={idx} className="space-y-1">
                      <p className="text-sm text-[#EAEAEA]/60">{metric.label}</p>
                      <p className="text-2xl font-mono font-bold text-[#00FFD1]">{metric.value}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* What is dna::}{::lang Section */}
      <section className="py-24 px-6 bg-[#02010A]/50">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center space-y-6 mb-16">
            <h2 className="text-4xl font-light">
              A new class of software: <span className="text-[#6A00F4]">organisms, not programs.</span>
            </h2>
            <p className="text-lg text-[#EAEAEA]/80 leading-relaxed">
              {brandName} treats computation as biology. Agents become organisms. Organisms evolve.
              A distributed tri-mesh forms a living, self-correcting system that adapts faster than human-written code.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <Card className="bg-[#0F3D91]/10 border-[#6A00F4]/20 p-6 hover:border-[#00FFD1]/50 transition-all">
              <Bot className="h-12 w-12 text-[#00FFD1] mb-4" />
              <h3 className="text-xl font-semibold mb-2">Multi-Agent Autonomy</h3>
              <p className="text-sm text-[#EAEAEA]/70">
                Agents collaborate and introspect through a unified evolutionary engine.
              </p>
            </Card>
            <Card className="bg-[#0F3D91]/10 border-[#6A00F4]/20 p-6 hover:border-[#00FFD1]/50 transition-all">
              <Atom className="h-12 w-12 text-[#6A00F4] mb-4" />
              <h3 className="text-xl font-semibold mb-2">Quantum Acceleration</h3>
              <p className="text-sm text-[#EAEAEA]/70">
                Organisms can compile, optimize, and execute circuits directly on IBM hardware.
              </p>
            </Card>
            <Card className="bg-[#0F3D91]/10 border-[#6A00F4]/20 p-6 hover:border-[#00FFD1]/50 transition-all">
              <Beaker className="h-12 w-12 text-[#00FFD1] mb-4" />
              <h3 className="text-xl font-semibold mb-2">Living Software Evolution</h3>
              <p className="text-sm text-[#EAEAEA]/70">
                Every component maintains lineage, mutation history, and self-repair logic.
              </p>
            </Card>
            <Card className="bg-[#0F3D91]/10 border-[#6A00F4]/20 p-6 hover:border-[#00FFD1]/50 transition-all">
              <Shield className="h-12 w-12 text-[#6A00F4] mb-4" />
              <h3 className="text-xl font-semibold mb-2">Zero-Trust Mesh Architecture</h3>
              <p className="text-sm text-[#EAEAEA]/70">
                The Σ-mesh enforces cryptographic identity, trust boundaries, and self-monitoring invariants.
              </p>
            </Card>
          </div>

          <div className="text-center">
            <Button variant="outline" className="border-[#00FFD1] text-[#00FFD1] hover:bg-[#00FFD1]/10">
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
            The <span className="text-[#6A00F4]">Technology</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {technologies.map((tech, idx) => (
              <Card key={idx} className="bg-[#0F3D91]/10 border-[#6A00F4]/20 p-8 hover:border-[#00FFD1]/50 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <tech.icon className="h-12 w-12 text-[#00FFD1]" />
                  {tech.badge && (
                    <Badge className="bg-[#6A00F4]/20 border-[#6A00F4] text-[#00FFD1]">
                      {tech.badge}
                    </Badge>
                  )}
                </div>
                <h3 className="text-2xl font-semibold mb-4">{tech.title}</h3>
                <p className="text-[#EAEAEA]/70 leading-relaxed">{tech.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Σ-Mesh Observatory Section */}
      <section className="py-24 px-6 bg-[#02010A]/50">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center space-y-6 mb-12">
            <h2 className="text-4xl font-light">
              Σ-Mesh <span className="text-[#6A00F4]">Observatory</span>
            </h2>
            <p className="text-lg text-[#EAEAEA]/80">
              Observe the living computation layer in real time. Watch organisms evolve, agents coordinate,
              and quantum pathways activate through the Σ-mesh.
            </p>
          </div>

          <Card className="bg-gradient-to-br from-[#0F3D91]/20 to-[#6A00F4]/10 border-[#00FFD1]/30 p-12">
            <div className="text-center space-y-6">
              <Network className="h-24 w-24 text-[#00FFD1] mx-auto animate-pulse" />
              <p className="text-[#EAEAEA]/60">Interactive mesh visualization</p>
              <p className="text-sm text-[#EAEAEA]/40 max-w-2xl mx-auto">
                Real-time 3D visualization showing: Nodes = organisms, Edges = cognitive channels,
                Pulse frequency = ΛΦ coherence, Color = decoherence tensor Γ value
              </p>
              <Button className="bg-[#00FFD1] hover:bg-[#00FFD1]/80 text-[#02010A]">
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
            Use <span className="text-[#6A00F4]">Cases</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {useCases.map((useCase, idx) => (
              <Card key={idx} className="bg-[#0F3D91]/10 border-[#6A00F4]/20 p-6 hover:border-[#00FFD1]/50 transition-all group">
                <useCase.icon className="h-10 w-10 text-[#6A00F4] group-hover:text-[#00FFD1] transition-colors mb-4" />
                <h3 className="text-xl font-semibold mb-2">{useCase.title}</h3>
                <p className="text-sm text-[#EAEAEA]/70">{useCase.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Different Section */}
      <section className="py-24 px-6 bg-[#02010A]/50">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-light text-center mb-16">
              Why <span className="text-[#6A00F4]">this matters.</span>
            </h2>

            <div className="space-y-8">
              <p className="text-xl text-center text-[#EAEAEA]/80">
                Conventional AI tools <em>assist</em>.<br />
                {brandName} <span className="text-[#00FFD1] font-semibold">evolves</span>.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <p className="text-lg">It bridges the worlds of:</p>
                  <ul className="space-y-2 text-[#EAEAEA]/70">
                    <li className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-[#00FFD1]" />
                      Agentic reasoning
                    </li>
                    <li className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-[#00FFD1]" />
                      Quantum hardware
                    </li>
                    <li className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-[#00FFD1]" />
                      Evolutionary programming
                    </li>
                    <li className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-[#00FFD1]" />
                      Self-stabilizing distributed systems
                    </li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <p className="text-lg">Resulting in systems that are:</p>
                  <ul className="space-y-2 text-[#EAEAEA]/70">
                    <li className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-[#6A00F4]" />
                      Faster to adapt
                    </li>
                    <li className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-[#6A00F4]" />
                      Harder to break
                    </li>
                    <li className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-[#6A00F4]" />
                      Able to self-optimize
                    </li>
                    <li className="flex items-center gap-2">
                      <Cpu className="h-4 w-4 text-[#6A00F4]" />
                      Designed for real hardware, not simulation
                    </li>
                  </ul>
                </div>
              </div>

              <Card className="bg-gradient-to-r from-[#6A00F4]/20 to-[#0F3D91]/20 border-[#00FFD1]/30 p-8 mt-8">
                <p className="text-2xl font-light text-center italic">
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
              A new category: <span className="text-[#6A00F4]">Living Autonomous Infrastructure</span>
            </h2>

            <div className="space-y-8">
              <p className="text-xl text-center text-[#EAEAEA]/80">
                Your investment accelerates:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-[#0F3D91]/10 border-[#6A00F4]/20 p-6">
                  <ul className="space-y-3 text-[#EAEAEA]/70">
                    <li className="flex items-start gap-2">
                      <ArrowRight className="h-5 w-5 text-[#00FFD1] flex-shrink-0 mt-0.5" />
                      <span>The world's first organism marketplace</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="h-5 w-5 text-[#00FFD1] flex-shrink-0 mt-0.5" />
                      <span>The Σ-mesh distributed inference backbone</span>
                    </li>
                  </ul>
                </Card>
                <Card className="bg-[#0F3D91]/10 border-[#6A00F4]/20 p-6">
                  <ul className="space-y-3 text-[#EAEAEA]/70">
                    <li className="flex items-start gap-2">
                      <ArrowRight className="h-5 w-5 text-[#00FFD1] flex-shrink-0 mt-0.5" />
                      <span>Real-time quantum-accelerated cognitive agents</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="h-5 w-5 text-[#00FFD1] flex-shrink-0 mt-0.5" />
                      <span>The enterprise-ready autonomous development platform</span>
                    </li>
                  </ul>
                </Card>
              </div>

              <div className="space-y-4 mt-8">
                <p className="text-lg">Investors receive:</p>
                <div className="flex flex-wrap gap-3">
                  <Badge className="bg-[#6A00F4]/20 border-[#6A00F4] text-[#00FFD1] px-4 py-2">
                    Full technical dossier
                  </Badge>
                  <Badge className="bg-[#6A00F4]/20 border-[#6A00F4] text-[#00FFD1] px-4 py-2">
                    Proof-of-workload evidence logs
                  </Badge>
                  <Badge className="bg-[#6A00F4]/20 border-[#6A00F4] text-[#00FFD1] px-4 py-2">
                    Quantum execution reports
                  </Badge>
                  <Badge className="bg-[#6A00F4]/20 border-[#6A00F4] text-[#00FFD1] px-4 py-2">
                    Live sandbox access
                  </Badge>
                  <Badge className="bg-[#6A00F4]/20 border-[#6A00F4] text-[#00FFD1] px-4 py-2">
                    Roadmap to Series A
                  </Badge>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 justify-center mt-12">
                <Button size="lg" className="bg-[#00FFD1] hover:bg-[#00FFD1]/80 text-[#02010A]">
                  <Mail className="h-5 w-5 mr-2" />
                  Contact Founder
                </Button>
                <Button size="lg" variant="outline" className="border-[#6A00F4] text-[#6A00F4] hover:bg-[#6A00F4]/10">
                  <FileText className="h-5 w-5 mr-2" />
                  Download Investor Packet
                </Button>
                <Button size="lg" variant="outline" className="border-[#00FFD1] text-[#00FFD1] hover:bg-[#00FFD1]/10">
                  <Lock className="h-5 w-5 mr-2" />
                  Request Due-Diligence Vault Access
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Developer Onboarding Section */}
      <section id="developers" className="py-24 px-6 bg-[#02010A]/50">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-light text-center mb-12">
              Get <span className="text-[#6A00F4]">Started</span>
            </h2>

            <Card className="bg-[#0F3D91]/10 border-[#6A00F4]/20 p-8">
              <div className="space-y-6">
                <div className="bg-[#02010A]/80 rounded-lg p-6 font-mono text-sm">
                  <div className="text-[#00FFD1]"># Quick 3-step start</div>
                  <div className="mt-3 space-y-2 text-[#EAEAEA]/80">
                    <div><span className="text-[#6A00F4]">$</span> npm i dnalang</div>
                    <div><span className="text-[#6A00F4]">$</span> npx dna init organism</div>
                    <div><span className="text-[#6A00F4]">$</span> npx dna evolve</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 justify-center">
                  <Button className="bg-[#6A00F4] hover:bg-[#6A00F4]/80 text-white">
                    Open Documentation
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                  <Button variant="outline" className="border-[#00FFD1] text-[#00FFD1] hover:bg-[#00FFD1]/10">
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
      <footer className="py-12 px-6 border-t border-[#6A00F4]/20">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-4 text-[#00FFD1]">Product</h4>
              <ul className="space-y-2 text-sm text-[#EAEAEA]/70">
                <li><Link href="/chat" className="hover:text-[#00FFD1] transition-colors">Live Sandbox</Link></li>
                <li><Link href="#" className="hover:text-[#00FFD1] transition-colors">Documentation</Link></li>
                <li><Link href="#" className="hover:text-[#00FFD1] transition-colors">Organism Marketplace</Link></li>
                <li><Link href="#" className="hover:text-[#00FFD1] transition-colors">Quantum Hardware Logs</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-[#00FFD1]">Company</h4>
              <ul className="space-y-2 text-sm text-[#EAEAEA]/70">
                <li><Link href="#investors" className="hover:text-[#00FFD1] transition-colors">Investor Relations</Link></li>
                <li><Link href="#" className="hover:text-[#00FFD1] transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-[#00FFD1] transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-[#00FFD1]">Developers</h4>
              <ul className="space-y-2 text-sm text-[#EAEAEA]/70">
                <li><Link href="#" className="hover:text-[#00FFD1] transition-colors">API Reference</Link></li>
                <li><Link href="#" className="hover:text-[#00FFD1] transition-colors">GitHub</Link></li>
                <li><Link href="#" className="hover:text-[#00FFD1] transition-colors">Examples</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-[#00FFD1]">Legal</h4>
              <ul className="space-y-2 text-sm text-[#EAEAEA]/70">
                <li><Link href="#" className="hover:text-[#00FFD1] transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-[#00FFD1] transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-[#6A00F4]/20 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Atom className="h-6 w-6 text-[#00FFD1]" />
              <span className="text-sm text-[#EAEAEA]/60">© 2025 {brandName}. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="#" className="text-[#EAEAEA]/60 hover:text-[#00FFD1] transition-colors">
                <Github className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-[#EAEAEA]/60 hover:text-[#00FFD1] transition-colors">
                <Mail className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
