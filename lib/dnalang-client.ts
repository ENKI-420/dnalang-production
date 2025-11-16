/**
 * DNALang Quantum API Client
 * Provides unified interface for QuantumLM inference with IBM Quantum backends
 */

export interface DNALangConfig {
  apiUrl: string
  apiKey?: string
  timeout?: number
}

export interface InferenceRequest {
  prompt: string
  messages?: Array<{ role: string; content: string }>
  backend?: string
  include_consciousness_metrics?: boolean
  max_tokens?: number
  temperature?: number
  stream?: boolean
}

export interface ConsciousnessMetrics {
  phi: number
  gamma: number
  lambda: number
  w2: number
}

export interface InferenceResponse {
  response: string
  consciousness_metrics?: ConsciousnessMetrics
  backend_used?: string
  execution_time?: number
  qubits_used?: number
  circuit_depth?: number
}

export class DNALangClient {
  private config: DNALangConfig
  private apiKey: string | null = null

  constructor(config: DNALangConfig) {
    this.config = {
      timeout: 30000,
      ...config
    }
    this.apiKey = config.apiKey || null
  }

  async authenticate(): Promise<string> {
    if (this.apiKey) return this.apiKey

    try {
      const response = await fetch(`${this.config.apiUrl}/v1/auth/key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(this.config.timeout!)
      })

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.status}`)
      }

      const data = await response.json()
      this.apiKey = data.api_key

      if (typeof window !== 'undefined') {
        localStorage.setItem('quantumlm_api_key', this.apiKey!)
      }

      return this.apiKey!
    } catch (error) {
      console.error('[DNALang] Authentication error:', error)
      throw error
    }
  }

  async inference(request: InferenceRequest): Promise<InferenceResponse> {
    if (!this.apiKey) {
      await this.authenticate()
    }

    try {
      const response = await fetch(`${this.config.apiUrl}/v1/inference`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          ...(request.backend && { 'X-Backend': request.backend })
        },
        body: JSON.stringify(request),
        signal: AbortSignal.timeout(this.config.timeout!)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Inference failed: ${response.status} - ${errorText}`)
      }

      const data = await response.json()

      return {
        response: data.response || data.output || data.text,
        consciousness_metrics: data.consciousness_metrics,
        backend_used: data.backend_used || request.backend,
        execution_time: data.execution_time,
        qubits_used: data.qubits_used,
        circuit_depth: data.circuit_depth
      }
    } catch (error) {
      console.error('[DNALang] Inference error:', error)
      throw error
    }
  }

  async getBenchmarks(): Promise<any> {
    try {
      const response = await fetch(`${this.config.apiUrl}/v1/benchmarks`, {
        headers: {
          'Authorization': this.apiKey ? `Bearer ${this.apiKey}` : ''
        },
        signal: AbortSignal.timeout(this.config.timeout!)
      })

      if (!response.ok) {
        throw new Error(`Benchmarks fetch failed: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('[DNALang] Benchmarks error:', error)
      throw error
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.apiUrl}/health`, {
        signal: AbortSignal.timeout(5000)
      })
      return response.ok
    } catch {
      return false
    }
  }
}

// Singleton instance
let clientInstance: DNALangClient | null = null

export function getDNALangClient(config?: Partial<DNALangConfig>): DNALangClient {
  if (!clientInstance) {
    const apiUrl = config?.apiUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const apiKey = config?.apiKey || (typeof window !== 'undefined' ? localStorage.getItem('quantumlm_api_key') : null) || undefined

    clientInstance = new DNALangClient({
      apiUrl,
      apiKey
    })
  }

  return clientInstance
}
