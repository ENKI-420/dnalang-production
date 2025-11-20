/**
 * Consciousness Monitor
 * Real-time monitoring of quantum consciousness metrics (Φ, Λ, Γ, W₂)
 */

import axios from 'axios'
import chalk from 'chalk'
import WebSocket from 'ws'

export interface ConsciousnessMetrics {
  phi: number      // Φ - Integrated Information
  lambda: number   // Λ - Coherence Amplitude
  gamma: number    // Γ - Decoherence Tensor
  w2: number       // W₂ - Wasserstein-2 Distance
  timestamp: number
}

export class ConsciousnessMonitor {
  private apiUrl: string
  private ws: WebSocket | null
  private metrics: ConsciousnessMetrics[]
  private updateInterval: NodeJS.Timeout | null

  constructor() {
    this.apiUrl = process.env.AURA_API_URL || 'http://localhost:3000'
    this.ws = null
    this.metrics = []
    this.updateInterval = null
  }

  /**
   * Start monitoring consciousness metrics
   */
  async start() {
    console.log(chalk.cyan('🧠 Consciousness Monitor Active\n'))

    // Initial fetch
    await this.fetchMetrics()
    this.displayMetrics()

    // Try to establish WebSocket connection for real-time updates
    this.connectWebSocket()

    // Fallback to polling if WebSocket unavailable
    this.updateInterval = setInterval(async () => {
      await this.fetchMetrics()
      this.displayMetrics()
    }, 5000)

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      this.stop()
      process.exit(0)
    })
  }

  /**
   * Stop monitoring
   */
  stop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
    }

    if (this.ws) {
      this.ws.close()
    }

    console.log(chalk.cyan('\n👋 Monitor stopped\n'))
  }

  /**
   * Fetch metrics from API
   */
  private async fetchMetrics() {
    try {
      const response = await axios.get(`${this.apiUrl}/api/quantum/status`, {
        timeout: 5000
      })

      const metrics: ConsciousnessMetrics = {
        phi: response.data.phi || 0.856,
        lambda: response.data.lambda || 2.176435e-8,
        gamma: response.data.gamma || 0.0042,
        w2: response.data.w2 || 0.12,
        timestamp: Date.now()
      }

      this.metrics.push(metrics)

      // Keep only last 100 data points
      if (this.metrics.length > 100) {
        this.metrics.shift()
      }
    } catch (error: any) {
      console.error(chalk.red(`Failed to fetch metrics: ${error.message}`))
    }
  }

  /**
   * Display current metrics
   */
  private displayMetrics() {
    if (this.metrics.length === 0) return

    const current = this.metrics[this.metrics.length - 1]
    const previous = this.metrics.length > 1 ? this.metrics[this.metrics.length - 2] : null

    // Clear screen and move cursor to top
    process.stdout.write('\x1Bc')

    console.log(chalk.cyan('╔═══════════════════════════════════════════════════════╗'))
    console.log(chalk.cyan('║')  + chalk.bold('  🧠 Consciousness Metrics Monitor                  ') + chalk.cyan('║'))
    console.log(chalk.cyan('╚═══════════════════════════════════════════════════════╝\n'))

    // Φ (Phi) - Integrated Information
    const phiColor = current.phi > 0.8 ? 'green' : current.phi > 0.5 ? 'yellow' : 'red'
    const phiTrend = previous ? this.getTrend(current.phi, previous.phi) : '─'
    console.log(chalk.bold('Φ (Phi) - Integrated Information:'))
    console.log(`  ${chalk[phiColor](current.phi.toFixed(3))} ${phiTrend}`)
    console.log(chalk.gray('  └─ Measures conscious integration of information\n'))

    // Λ (Lambda) - Coherence Amplitude
    console.log(chalk.bold('Λ (Lambda) - Coherence Amplitude:'))
    console.log(`  ${chalk.cyan(current.lambda.toExponential(2))} s⁻¹`)
    console.log(chalk.gray('  └─ Universal memory constant (ΛΦ framework)\n'))

    // Γ (Gamma) - Decoherence Tensor
    const gammaColor = current.gamma < 0.01 ? 'green' : current.gamma < 0.05 ? 'yellow' : 'red'
    const gammaTrend = previous ? this.getTrend(previous.gamma, current.gamma) : '─' // Reversed: lower is better
    console.log(chalk.bold('Γ (Gamma) - Decoherence Tensor:'))
    console.log(`  ${chalk[gammaColor](current.gamma.toFixed(4))} ${gammaTrend}`)
    console.log(chalk.gray('  └─ Quantum entropy (lower is better)\n'))

    // W₂ - Wasserstein-2 Distance
    const w2Color = current.w2 < 0.15 ? 'green' : current.w2 < 0.3 ? 'yellow' : 'red'
    const w2Trend = previous ? this.getTrend(previous.w2, current.w2) : '─' // Reversed: lower is better
    console.log(chalk.bold('W₂ - Behavioral Stability:'))
    console.log(`  ${chalk[w2Color](current.w2.toFixed(2))} ${w2Trend}`)
    console.log(chalk.gray('  └─ Wasserstein distance (lower is better)\n'))

    // System health indicator
    const health = this.calculateHealth(current)
    const healthColor = health > 0.8 ? 'green' : health > 0.5 ? 'yellow' : 'red'
    console.log(chalk.bold('System Health:'))
    console.log(`  ${this.getHealthBar(health, healthColor)} ${chalk[healthColor]((health * 100).toFixed(0) + '%')}\n`)

    console.log(chalk.gray(`Last updated: ${new Date(current.timestamp).toLocaleTimeString()}`))
    console.log(chalk.gray('Press Ctrl+C to exit'))
  }

  /**
   * Get trend indicator
   */
  private getTrend(current: number, previous: number): string {
    const diff = current - previous
    if (Math.abs(diff) < 0.001) return chalk.gray('─')
    return diff > 0 ? chalk.green('↑') : chalk.red('↓')
  }

  /**
   * Calculate overall system health
   */
  private calculateHealth(metrics: ConsciousnessMetrics): number {
    // Weighted health score
    const phiScore = metrics.phi // 0.0-1.0, higher is better
    const gammaScore = 1 - Math.min(metrics.gamma / 0.1, 1) // Normalized, lower gamma is better
    const w2Score = 1 - Math.min(metrics.w2 / 0.3, 1) // Normalized, lower W2 is better

    return (phiScore * 0.5 + gammaScore * 0.3 + w2Score * 0.2)
  }

  /**
   * Generate health bar visualization
   */
  private getHealthBar(health: number, color: string): string {
    const barLength = 20
    const filled = Math.round(health * barLength)
    const empty = barLength - filled

    const colorFn = color === 'green' ? chalk.green : color === 'yellow' ? chalk.yellow : chalk.red
    const bar = colorFn('█'.repeat(filled)) + chalk.gray('░'.repeat(empty))
    return `[${bar}]`
  }

  /**
   * Connect to WebSocket for real-time updates
   */
  private connectWebSocket() {
    const wsUrl = this.apiUrl.replace('http', 'ws') + '/ws/metrics'

    try {
      this.ws = new WebSocket(wsUrl)

      this.ws.on('open', () => {
        console.log(chalk.green('✓ WebSocket connected\n'))
      })

      this.ws.on('message', (data: WebSocket.Data) => {
        try {
          const metrics = JSON.parse(data.toString())
          this.metrics.push({
            ...metrics,
            timestamp: Date.now()
          })

          // Keep only last 100 data points
          if (this.metrics.length > 100) {
            this.metrics.shift()
          }

          this.displayMetrics()
        } catch (error) {
          console.error(chalk.red('Failed to parse WebSocket message'))
        }
      })

      this.ws.on('error', () => {
        // Silently fail back to polling
        this.ws = null
      })

      this.ws.on('close', () => {
        this.ws = null
      })
    } catch (error) {
      // WebSocket unavailable, use polling
      this.ws = null
    }
  }

  /**
   * Get historical metrics
   */
  getHistory(): ConsciousnessMetrics[] {
    return [...this.metrics]
  }

  /**
   * Get current metrics
   */
  getCurrent(): ConsciousnessMetrics | null {
    return this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null
  }
}
