/**
 * Swarm Orchestrator
 * Coordinates multiple agents in a mesh topology for distributed task execution
 */

import axios, { AxiosInstance } from 'axios'
import { CommandIntent } from '../nlp/parser'
import { readFileSync } from 'fs'

export interface Agent {
  id: string
  name: string
  specialization: string
  status: 'active' | 'idle' | 'error'
  trust_score: number
  tasks_completed: number
  current_task: string | null
}

export interface SwarmStatus {
  metrics: {
    phi: number
    lambda: number
    gamma: number
    w2: number
  }
  active_agents: number
  active_jobs: number
  backend_status: string
}

export class SwarmOrchestrator {
  private api: AxiosInstance
  private agents: Map<string, Agent>
  private taskQueue: Array<{ intent: CommandIntent; priority: number }>

  constructor() {
    const apiUrl = process.env.AURA_API_URL || 'http://localhost:3000'

    this.api = axios.create({
      baseURL: apiUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    this.agents = new Map()
    this.taskQueue = []
  }

  /**
   * Execute a command intent by orchestrating agents
   */
  async execute(intent: CommandIntent): Promise<any> {
    switch (intent.action) {
      case 'deploy_organism':
        return await this.deployOrganism(intent.entities.file)

      case 'spawn_agent':
        return await this.spawnAgent({
          name: intent.entities.name || `Agent-${Date.now()}`,
          specialization: intent.entities.specialization || 'general',
          trust_score: 0.8
        })

      case 'list_agents':
        return await this.getAgents()

      case 'optimize_circuit':
        return await this.optimizeCircuit(intent.entities)

      case 'run_quantum_job':
        return await this.runQuantumJob(intent.entities)

      case 'generate_code':
        return await this.generateCode(intent.entities)

      case 'get_status':
        return await this.getStatus()

      case 'commit_mutation':
        return await this.commitMutation(intent.entities)

      default:
        // Send to NLP2 orchestrator for complex commands
        return await this.executeViaAPI(intent)
    }
  }

  /**
   * Deploy a DNA-Lang organism
   */
  async deployOrganism(file: string, options: any = {}): Promise<any> {
    try {
      // Read organism file
      const dnaCode = readFileSync(file, 'utf-8')

      // Parse organism structure
      const response = await this.api.post('/api/organisms/deploy', {
        dna_code: dnaCode,
        backend: options.backend || 'ibm_fez',
        shots: options.shots || 1024
      })

      return response.data
    } catch (error: any) {
      throw new Error(`Deployment failed: ${error.response?.data?.error || error.message}`)
    }
  }

  /**
   * Spawn a new agent in the swarm
   */
  async spawnAgent(config: Partial<Agent>): Promise<Agent> {
    try {
      const response = await this.api.post('/api/swarm/agents', {
        name: config.name,
        specialization: config.specialization,
        trust_score: config.trust_score || 0.8
      })

      const agent: Agent = {
        id: response.data.id,
        name: config.name!,
        specialization: config.specialization!,
        status: 'idle',
        trust_score: config.trust_score || 0.8,
        tasks_completed: 0,
        current_task: null
      }

      this.agents.set(agent.id, agent)
      return agent
    } catch (error: any) {
      throw new Error(`Agent spawn failed: ${error.response?.data?.error || error.message}`)
    }
  }

  /**
   * Get all agents in the swarm
   */
  async getAgents(includeIdle: boolean = false): Promise<Agent[]> {
    try {
      const response = await this.api.get('/api/swarm/agents')

      const agents = response.data.filter((agent: Agent) =>
        includeIdle || agent.status !== 'idle'
      )

      // Update local cache
      agents.forEach((agent: Agent) => {
        this.agents.set(agent.id, agent)
      })

      return agents
    } catch (error: any) {
      throw new Error(`Failed to fetch agents: ${error.response?.data?.error || error.message}`)
    }
  }

  /**
   * Optimize quantum circuit
   */
  async optimizeCircuit(params: Record<string, any>): Promise<any> {
    try {
      // Assign to quantum optimizer agent
      const agent = await this.selectAgent('quantum')

      const response = await this.api.post('/api/quantum/optimize', {
        agent_id: agent.id,
        backend: params.backend || 'ibm_fez',
        optimization_goal: 'minimize_gamma', // Minimize decoherence
        ...params
      })

      return response.data
    } catch (error: any) {
      throw new Error(`Optimization failed: ${error.response?.data?.error || error.message}`)
    }
  }

  /**
   * Run quantum job
   */
  async runQuantumJob(params: Record<string, any>): Promise<any> {
    try {
      const response = await this.api.post('/api/quantum/jobs', {
        circuit_qasm: params.circuit || params.qasm,
        backend: params.backend || 'ibm_fez',
        shots: params.shots || 1024
      })

      return response.data
    } catch (error: any) {
      throw new Error(`Quantum job failed: ${error.response?.data?.error || error.message}`)
    }
  }

  /**
   * Generate code via swarm agents
   */
  async generateCode(params: Record<string, any>): Promise<any> {
    try {
      // Assign to code generator agent
      const agent = await this.selectAgent('code')

      const response = await this.api.post('/api/swarm/generate-code', {
        agent_id: agent.id,
        prompt: params.text || params.description,
        language: params.language || 'typescript'
      })

      return response.data
    } catch (error: any) {
      throw new Error(`Code generation failed: ${error.response?.data?.error || error.message}`)
    }
  }

  /**
   * Get swarm status and metrics
   */
  async getStatus(): Promise<SwarmStatus> {
    try {
      const [metricsRes, agentsRes] = await Promise.all([
        this.api.get('/api/quantum/status'),
        this.api.get('/api/swarm/agents')
      ])

      const activeAgents = agentsRes.data.filter(
        (a: Agent) => a.status === 'active'
      ).length

      return {
        metrics: {
          phi: metricsRes.data.phi || 0.856,
          lambda: metricsRes.data.lambda || 2.176435e-8,
          gamma: metricsRes.data.gamma || 0.0042,
          w2: metricsRes.data.w2 || 0.12
        },
        active_agents: activeAgents,
        active_jobs: metricsRes.data.active_jobs || 0,
        backend_status: metricsRes.data.backend || 'unknown'
      }
    } catch (error: any) {
      throw new Error(`Status fetch failed: ${error.response?.data?.error || error.message}`)
    }
  }

  /**
   * Commit code mutation
   */
  async commitMutation(params: Record<string, any>): Promise<any> {
    try {
      const response = await this.api.post('/api/swarm/commit-mutation', {
        code: params.code || params.text,
        filename: params.filename || 'generated.tsx',
        commit_message: params.message || 'Mutation via AURA Swarm CLI'
      })

      return response.data
    } catch (error: any) {
      throw new Error(`Mutation commit failed: ${error.response?.data?.error || error.message}`)
    }
  }

  /**
   * Execute command via NLP2 API for complex operations
   */
  private async executeViaAPI(intent: CommandIntent): Promise<any> {
    try {
      const response = await this.api.post('/api/nlp2/execute', {
        command: intent.raw_command,
        intent: {
          action: intent.action,
          entities: intent.entities,
          confidence: intent.confidence
        }
      })

      return response.data
    } catch (error: any) {
      throw new Error(`Execution failed: ${error.response?.data?.error || error.message}`)
    }
  }

  /**
   * Select best agent for a task based on specialization and trust
   */
  private async selectAgent(specialization: string): Promise<Agent> {
    const agents = await this.getAgents(true)

    // Filter by specialization
    let candidates = agents.filter(a => a.specialization === specialization)

    // If no specialized agents, use general agents
    if (candidates.length === 0) {
      candidates = agents.filter(a => a.specialization === 'general')
    }

    // If still no agents, spawn one
    if (candidates.length === 0) {
      return await this.spawnAgent({
        name: `${specialization}-agent-${Date.now()}`,
        specialization,
        trust_score: 0.8
      })
    }

    // Select agent with highest trust score and lowest current load
    candidates.sort((a, b) => {
      const aScore = a.trust_score * (a.status === 'idle' ? 2 : 1)
      const bScore = b.trust_score * (b.status === 'idle' ? 2 : 1)
      return bScore - aScore
    })

    return candidates[0]
  }

  /**
   * Coordinate multiple agents for complex tasks
   */
  async coordinateMultiAgent(task: string, agents: Agent[]): Promise<any> {
    // Divide task into subtasks
    const subtasks = await this.decomposeTask(task)

    // Assign subtasks to agents in parallel
    const promises = subtasks.map((subtask, idx) => {
      const agent = agents[idx % agents.length]
      return this.assignTask(agent, subtask)
    })

    // Wait for all subtasks to complete
    const results = await Promise.all(promises)

    // Aggregate results
    return this.aggregateResults(results)
  }

  /**
   * Decompose complex task into subtasks
   */
  private async decomposeTask(task: string): Promise<string[]> {
    // Simple decomposition for now
    // In production, use LLM or sophisticated task planner
    return [task]
  }

  /**
   * Assign task to specific agent
   */
  private async assignTask(agent: Agent, task: string): Promise<any> {
    agent.current_task = task
    agent.status = 'active'

    // Execute task via agent
    try {
      const result = await this.api.post(`/api/swarm/agents/${agent.id}/execute`, {
        task
      })

      agent.tasks_completed++
      agent.current_task = null
      agent.status = 'idle'

      return result.data
    } catch (error) {
      agent.status = 'error'
      throw error
    }
  }

  /**
   * Aggregate results from multiple agents
   */
  private aggregateResults(results: any[]): any {
    return {
      summary: `Completed ${results.length} subtasks`,
      results,
      success: results.every(r => r.success !== false)
    }
  }
}
