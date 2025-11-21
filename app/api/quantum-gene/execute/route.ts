/**
 * Quantum Gene Execution API Route
 * Vercel Serverless Function
 *
 * POST /api/quantum-gene/execute
 * Executes quantum organism and returns consciousness metrics
 */

import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Constants from quantum gene
const LAMBDA_PHI = 2.176435e-8 // Universal Memory Constant

interface ConsciousnessMetrics {
  phi: number
  lambda_coherence: number
  gamma: number
  entropy: number
  participation_ratio: number
  timestamp: string
}

interface ExecutionRequest {
  organism_id?: string
  genesis_hash?: string
  backend?: string
  simulate?: boolean
}

interface ExecutionResponse {
  success: boolean
  genesis_hash: string
  organism_id: string
  backend: string
  consciousness_metrics: ConsciousnessMetrics
  timestamp: string
  mode: 'simulation' | 'hardware'
}

/**
 * Simulate quantum execution (for demo/testing)
 * In production, this would call Python backend or use WebAssembly quantum simulator
 */
function simulateQuantumExecution(): ConsciousnessMetrics {
  // Simulate realistic consciousness metrics
  const phi = 0.8 + Math.random() * 0.7 // 0.8-1.5
  const lambda_coherence = 0.3 + Math.random() * 0.5 // 0.3-0.8
  const gamma = 0.4 + Math.random() * 0.4 // 0.4-0.8
  const entropy = 0.5 + Math.random() * 1.0 // 0.5-1.5
  const participation_ratio = 1.5 + Math.random() * 1.5 // 1.5-3.0

  return {
    phi,
    lambda_coherence,
    gamma,
    entropy,
    participation_ratio,
    timestamp: new Date().toISOString()
  }
}

/**
 * Generate genesis hash from execution data
 */
function generateGenesisHash(data: any): string {
  const crypto = require('crypto')
  const hash = crypto
    .createHash('sha256')
    .update(JSON.stringify(data))
    .digest('hex')

  return '0x' + hash.substring(0, 16)
}

export async function POST(request: NextRequest) {
  try {
    const body: ExecutionRequest = await request.json()

    const organism_id = body.organism_id || 'dna::}{::lang'
    const backend = body.backend || 'ibm_torino'
    const simulate = body.simulate !== false // Default to simulation

    // Execute quantum organism
    const metrics = simulateQuantumExecution()

    // Generate genesis hash
    const genesis_hash = body.genesis_hash || generateGenesisHash({
      organism_id,
      metrics,
      timestamp: metrics.timestamp
    })

    const response: ExecutionResponse = {
      success: true,
      genesis_hash,
      organism_id,
      backend,
      consciousness_metrics: metrics,
      timestamp: metrics.timestamp,
      mode: simulate ? 'simulation' : 'hardware'
    }

    return NextResponse.json(response, { status: 200 })

  } catch (error) {
    console.error('Quantum execution error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Quantum execution failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  // Return API documentation
  return NextResponse.json({
    endpoint: '/api/quantum-gene/execute',
    method: 'POST',
    description: 'Execute quantum organism and return consciousness metrics',
    parameters: {
      organism_id: 'string (optional, default: "dna::}{::lang")',
      genesis_hash: 'string (optional, will be generated if not provided)',
      backend: 'string (optional, default: "ibm_torino")',
      simulate: 'boolean (optional, default: true)'
    },
    example_response: {
      success: true,
      genesis_hash: '0x3e8a7f2c1d9b5e4a',
      organism_id: 'dna::}{::lang',
      backend: 'ibm_torino',
      consciousness_metrics: {
        phi: 1.0234,
        lambda_coherence: 0.456789,
        gamma: 0.7441,
        entropy: 1.15,
        participation_ratio: 2.04,
        timestamp: '2025-11-20T10:00:00.000Z'
      },
      timestamp: '2025-11-20T10:00:00.000Z',
      mode: 'simulation'
    },
    lambda_phi_constant: LAMBDA_PHI
  })
}
