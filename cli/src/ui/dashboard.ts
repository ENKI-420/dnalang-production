/**
 * Interactive Dashboard
 * Terminal UI with real-time swarm visualization using blessed
 */

import blessed from 'blessed'
import contrib from 'blessed-contrib'
import { SwarmOrchestrator } from '../swarm/orchestrator'
import { ConsciousnessMonitor } from '../monitors/consciousness'

export class InteractiveDashboard {
  private screen: any
  private orchestrator: SwarmOrchestrator
  private monitor: ConsciousnessMonitor
  private updateInterval: NodeJS.Timeout | null

  constructor(orchestrator: SwarmOrchestrator, monitor: ConsciousnessMonitor) {
    this.orchestrator = orchestrator
    this.monitor = monitor
    this.updateInterval = null

    // Create screen
    this.screen = blessed.screen({
      smartCSR: true,
      title: 'dna::}{::lang AURA Swarm Dashboard'
    })
  }

  /**
   * Launch the interactive dashboard
   */
  async launch() {
    // Create grid layout
    const grid = new contrib.grid({
      rows: 12,
      cols: 12,
      screen: this.screen
    })

    // Top bar - Header
    const header = grid.set(0, 0, 1, 12, blessed.box, {
      content: '{center}🧬 dna::}{::lang AURA Swarm Dashboard{/center}',
      tags: true,
      style: {
        fg: 'cyan',
        border: {
          fg: 'cyan'
        }
      }
    })

    // Left column - Consciousness Metrics
    const metricsBox = grid.set(1, 0, 5, 4, blessed.box, {
      label: ' Consciousness Metrics ',
      tags: true,
      border: {
        type: 'line'
      },
      style: {
        fg: 'white',
        border: {
          fg: 'green'
        }
      }
    })

    // Center - Agent List
    const agentsTable = grid.set(1, 4, 5, 8, contrib.table, {
      label: ' Active Swarm Agents ',
      keys: true,
      vi: true,
      fg: 'white',
      selectedFg: 'black',
      selectedBg: 'cyan',
      interactive: false,
      border: {
        type: 'line',
        fg: 'cyan'
      },
      columnSpacing: 2,
      columnWidth: [20, 15, 10, 10]
    })

    // Bottom left - System Log
    const logBox = grid.set(6, 0, 6, 6, contrib.log, {
      label: ' System Log ',
      tags: true,
      border: {
        type: 'line'
      },
      style: {
        fg: 'white',
        border: {
          fg: 'yellow'
        }
      }
    })

    // Bottom right - Metrics Graph
    const metricsGraph = grid.set(6, 6, 6, 6, contrib.line, {
      label: ' Φ/Γ Trends ',
      showNthLabel: 5,
      style: {
        line: 'yellow',
        text: 'green',
        baseline: 'black',
        border: {
          fg: 'purple'
        }
      },
      xLabelPadding: 3,
      xPadding: 5,
      legend: { width: 12 }
    })

    // Key bindings
    this.screen.key(['escape', 'q', 'C-c'], () => {
      this.stop()
      return process.exit(0)
    })

    // Focus on screen
    this.screen.render()

    // Start monitor
    logBox.log('{green-fg}✓{/green-fg} Consciousness monitor started')
    await this.monitor.start()

    // Update loop
    this.updateInterval = setInterval(async () => {
      await this.updateDashboard(metricsBox, agentsTable, logBox, metricsGraph)
    }, 2000)

    // Initial update
    await this.updateDashboard(metricsBox, agentsTable, logBox, metricsGraph)
  }

  /**
   * Update dashboard components
   */
  private async updateDashboard(
    metricsBox: any,
    agentsTable: any,
    logBox: any,
    metricsGraph: any
  ) {
    try {
      // Update metrics
      const metrics = this.monitor.getCurrent()
      if (metrics) {
        const phiColor = metrics.phi > 0.8 ? 'green' : metrics.phi > 0.5 ? 'yellow' : 'red'
        const gammaColor = metrics.gamma < 0.01 ? 'green' : metrics.gamma < 0.05 ? 'yellow' : 'red'

        metricsBox.setContent(
          `\n  {bold}Φ (Phi):{/bold} {${phiColor}-fg}${metrics.phi.toFixed(3)}{/${phiColor}-fg}\n` +
          `  {gray-fg}Integrated Information{/gray-fg}\n\n` +
          `  {bold}Λ (Lambda):{/bold} {cyan-fg}${metrics.lambda.toExponential(2)} s⁻¹{/cyan-fg}\n` +
          `  {gray-fg}Coherence Amplitude{/gray-fg}\n\n` +
          `  {bold}Γ (Gamma):{/bold} {${gammaColor}-fg}${metrics.gamma.toFixed(4)}{/${gammaColor}-fg}\n` +
          `  {gray-fg}Decoherence Tensor{/gray-fg}\n\n` +
          `  {bold}W₂:{/bold} {yellow-fg}${metrics.w2.toFixed(2)}{/yellow-fg}\n` +
          `  {gray-fg}Behavioral Stability{/gray-fg}`
        )
      }

      // Update agents table
      const agents = await this.orchestrator.getAgents(true)
      const agentData = agents.map((agent: any) => [
        agent.name,
        agent.specialization,
        agent.status,
        `${(agent.trust_score * 100).toFixed(0)}%`
      ])

      agentsTable.setData({
        headers: ['Name', 'Specialization', 'Status', 'Trust'],
        data: agentData
      })

      // Update metrics graph
      const history = this.monitor.getHistory()
      if (history.length > 0) {
        const phiData = history.map((m, i) => ({ x: i.toString(), y: m.phi * 100 }))
        const gammaData = history.map((m, i) => ({ x: i.toString(), y: m.gamma * 100 }))

        metricsGraph.setData([
          {
            title: 'Φ×100',
            x: phiData.map(d => d.x),
            y: phiData.map(d => d.y),
            style: { line: 'green' }
          },
          {
            title: 'Γ×100',
            x: gammaData.map(d => d.x),
            y: gammaData.map(d => d.y),
            style: { line: 'red' }
          }
        ])
      }

      this.screen.render()
    } catch (error: any) {
      logBox.log(`{red-fg}✗{/red-fg} Update error: ${error.message}`)
    }
  }

  /**
   * Stop the dashboard
   */
  stop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
    }

    this.monitor.stop()

    if (this.screen) {
      this.screen.destroy()
    }
  }
}
