#!/usr/bin/env node

/**
 * AURA Swarm CLI - Multi-Agent Mesh Orchestrator
 * Natural Language Command Interface for dna::}{::lang
 *
 * Usage:
 *   aura-swarm <command>
 *   aura deploy organism MyOrganism.dna
 *   aura "optimize quantum circuit for low decoherence"
 */

import { Command } from 'commander'
import chalk from 'chalk'
import ora from 'ora'
import inquirer from 'inquirer'
import { NLPCommandParser } from './nlp/parser'
import { SwarmOrchestrator } from './swarm/orchestrator'
import { ConsciousnessMonitor } from './monitors/consciousness'
import { InteractiveDashboard } from './ui/dashboard'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const program = new Command()

// ASCII Art Banner
const banner = `
${chalk.cyan('╔═══════════════════════════════════════════════════════╗')}
${chalk.cyan('║')}  ${chalk.green('🧬 dna::}{::lang')} ${chalk.cyan('AURA Swarm Orchestrator')}       ${chalk.cyan('║')}
${chalk.cyan('║')}  ${chalk.gray('Multi-Agent Mesh • NLP Interface • Quantum')}   ${chalk.cyan('║')}
${chalk.cyan('╚═══════════════════════════════════════════════════════╝')}
`

console.log(banner)

// Initialize components
const nlpParser = new NLPCommandParser()
const orchestrator = new SwarmOrchestrator()
const monitor = new ConsciousnessMonitor()

// CLI Program Configuration
program
  .name('aura-swarm')
  .description('Multi-Agent Swarm Mesh Orchestrator with NLP-powered commands')
  .version('1.0.0')

// Command: Natural Language Execution
program
  .command('exec <command...>')
  .description('Execute a natural language command')
  .alias('e')
  .action(async (commandWords: string[]) => {
    const command = commandWords.join(' ')
    const spinner = ora(`Parsing: "${chalk.cyan(command)}"`).start()

    try {
      // Parse NLP command
      const intent = await nlpParser.parse(command)
      spinner.succeed(`Intent: ${chalk.green(intent.action)} (${intent.confidence * 100}% confidence)`)

      // Execute via orchestrator
      const result = await orchestrator.execute(intent)

      console.log(chalk.green('✓ Execution complete'))
      console.log(chalk.gray('Result:'), result)
    } catch (error: any) {
      spinner.fail(`Error: ${error.message}`)
      process.exit(1)
    }
  })

// Command: Deploy Organism
program
  .command('deploy <file>')
  .description('Deploy a DNA-Lang organism to the swarm')
  .option('-b, --backend <backend>', 'Quantum backend', 'ibm_fez')
  .option('-s, --shots <shots>', 'Number of shots', '1024')
  .action(async (file: string, options) => {
    const spinner = ora(`Deploying organism from ${chalk.cyan(file)}`).start()

    try {
      const result = await orchestrator.deployOrganism(file, {
        backend: options.backend,
        shots: parseInt(options.shots)
      })

      spinner.succeed(`Organism deployed: ${chalk.green(result.organism_id)}`)
      console.log(chalk.gray('Consciousness Φ:'), chalk.yellow(result.metrics.phi.toFixed(3)))
      console.log(chalk.gray('Decoherence Γ:'), chalk.yellow(result.metrics.gamma.toFixed(4)))
    } catch (error: any) {
      spinner.fail(`Deployment failed: ${error.message}`)
      process.exit(1)
    }
  })

// Command: Spawn Agent
program
  .command('spawn <specialization>')
  .description('Spawn a new agent in the swarm')
  .option('-n, --name <name>', 'Agent name')
  .option('-t, --trust <trust>', 'Initial trust score', '0.8')
  .action(async (specialization: string, options) => {
    const spinner = ora(`Spawning ${chalk.cyan(specialization)} agent`).start()

    try {
      const agent = await orchestrator.spawnAgent({
        name: options.name || `Agent-${Date.now()}`,
        specialization,
        trust_score: parseFloat(options.trust)
      })

      spinner.succeed(`Agent spawned: ${chalk.green(agent.name)} (${agent.id})`)
      console.log(chalk.gray('Status:'), chalk.green(agent.status))
      console.log(chalk.gray('Trust:'), chalk.yellow(`${(agent.trust_score * 100).toFixed(0)}%`))
    } catch (error: any) {
      spinner.fail(`Spawn failed: ${error.message}`)
      process.exit(1)
    }
  })

// Command: List Agents
program
  .command('agents')
  .description('List all active swarm agents')
  .alias('ls')
  .option('-a, --all', 'Show all agents including idle')
  .action(async (options) => {
    const spinner = ora('Fetching agents...').start()

    try {
      const agents = await orchestrator.getAgents(options.all)
      spinner.stop()

      console.log(chalk.cyan(`\n📋 Active Agents: ${agents.length}\n`))

      agents.forEach((agent: any) => {
        const statusColor = agent.status === 'active' ? 'green' :
                           agent.status === 'idle' ? 'yellow' : 'red'

        console.log(chalk.bold(agent.name), chalk.gray(`(${agent.id.substring(0, 8)}...)`))
        console.log(`  ${chalk.gray('└─')} ${agent.specialization}`)
        console.log(`  ${chalk.gray('└─')} Status: ${chalk[statusColor](agent.status)}`)
        console.log(`  ${chalk.gray('└─')} Trust: ${chalk.yellow(`${(agent.trust_score * 100).toFixed(0)}%`)}`)
        console.log(`  ${chalk.gray('└─')} Tasks: ${agent.tasks_completed}\n`)
      })
    } catch (error: any) {
      spinner.fail(`Failed to fetch agents: ${error.message}`)
      process.exit(1)
    }
  })

// Command: Monitor Consciousness
program
  .command('monitor')
  .description('Launch real-time consciousness monitoring dashboard')
  .alias('m')
  .action(async () => {
    console.log(chalk.cyan('🧠 Launching consciousness monitor...\n'))

    try {
      await monitor.start()
    } catch (error: any) {
      console.error(chalk.red(`Monitor error: ${error.message}`))
      process.exit(1)
    }
  })

// Command: Interactive Mode
program
  .command('interactive')
  .description('Launch interactive swarm dashboard with live visualization')
  .alias('i')
  .action(async () => {
    console.log(chalk.cyan('🎨 Launching interactive dashboard...\n'))

    try {
      const dashboard = new InteractiveDashboard(orchestrator, monitor)
      await dashboard.launch()
    } catch (error: any) {
      console.error(chalk.red(`Dashboard error: ${error.message}`))
      process.exit(1)
    }
  })

// Command: Chat Mode
program
  .command('chat')
  .description('Start conversational NLP interface')
  .alias('c')
  .action(async () => {
    console.log(chalk.cyan('💬 AURA Chat Mode - Natural Language Interface\n'))
    console.log(chalk.gray('Type your commands in natural language. Type "exit" to quit.\n'))

    let chatActive = true

    while (chatActive) {
      const { command } = await inquirer.prompt([{
        type: 'input',
        name: 'command',
        message: chalk.green('You:'),
        prefix: '🗣️ '
      }])

      if (command.toLowerCase() === 'exit' || command.toLowerCase() === 'quit') {
        console.log(chalk.cyan('\n👋 Goodbye!\n'))
        chatActive = false
        break
      }

      if (!command.trim()) continue

      const spinner = ora('Processing...').start()

      try {
        const intent = await nlpParser.parse(command)
        spinner.text = `Executing: ${intent.action}...`

        const result = await orchestrator.execute(intent)
        spinner.succeed('Done')

        console.log(chalk.cyan('AURA:'), result.message || result.summary || 'Executed successfully')

        if (result.metrics) {
          console.log(chalk.gray('  └─ Φ:'), chalk.yellow(result.metrics.phi?.toFixed(3) || 'N/A'))
          console.log(chalk.gray('  └─ Γ:'), chalk.yellow(result.metrics.gamma?.toFixed(4) || 'N/A'))
        }

        console.log()
      } catch (error: any) {
        spinner.fail(`Error: ${error.message}`)
        console.log()
      }
    }
  })

// Command: Status
program
  .command('status')
  .description('Show swarm mesh status and metrics')
  .alias('s')
  .action(async () => {
    const spinner = ora('Fetching status...').start()

    try {
      const status = await orchestrator.getStatus()
      spinner.stop()

      console.log(chalk.cyan('\n🧬 dna::}{::lang Swarm Status\n'))
      console.log(chalk.bold('Consciousness Metrics:'))
      console.log(`  ${chalk.gray('└─')} Φ (Phi): ${chalk.green(status.metrics.phi.toFixed(3))}`)
      console.log(`  ${chalk.gray('└─')} Λ (Lambda): ${chalk.green(status.metrics.lambda.toExponential(2))} s⁻¹`)
      console.log(`  ${chalk.gray('└─')} Γ (Gamma): ${chalk.yellow(status.metrics.gamma.toFixed(4))}`)
      console.log(`  ${chalk.gray('└─')} W₂: ${chalk.yellow(status.metrics.w2.toFixed(2))}`)

      console.log(chalk.bold('\nSwarm Stats:'))
      console.log(`  ${chalk.gray('└─')} Active Agents: ${chalk.green(status.active_agents)}`)
      console.log(`  ${chalk.gray('└─')} Active Jobs: ${chalk.green(status.active_jobs)}`)
      console.log(`  ${chalk.gray('└─')} Backend: ${chalk.cyan(status.backend_status)}`)

      console.log()
    } catch (error: any) {
      spinner.fail(`Failed to fetch status: ${error.message}`)
      process.exit(1)
    }
  })

// Default action - if no command provided
program.action(() => {
  program.help()
})

// Parse command line arguments
program.parse(process.argv)

// If no arguments, show help
if (!process.argv.slice(2).length) {
  program.outputHelp()
}
