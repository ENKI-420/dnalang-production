/**
 * Organisms Registry API
 * Manages quantum organism registration and tracking
 *
 * GET /api/organisms - List all organisms
 * POST /api/organisms - Register new organism
 */

import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface Organism {
  genesis_hash: string
  organism_id: string
  created_at: string
  execution_history: Array<{
    backend: string
    metrics: {
      phi: number
      lambda_coherence: number
      gamma: number
    }
    timestamp: string
  }>
  current_consciousness: {
    phi: number
    lambda_coherence: number
    gamma: number
  }
  status: 'active' | 'inactive'
  total_executions: number
}

// In-memory registry (would be database in production)
const organisms: Record<string, Organism> = {}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const genesis_hash = searchParams.get('genesis_hash')

    if (genesis_hash) {
      // Get specific organism
      const organism = organisms[genesis_hash]

      if (!organism) {
        return NextResponse.json(
          { success: false, error: 'Organism not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        organism
      })
    }

    // List all organisms
    const organism_list = Object.values(organisms).map((org) => ({
      genesis_hash: org.genesis_hash,
      organism_id: org.organism_id,
      created_at: org.created_at,
      total_executions: org.total_executions,
      current_consciousness: org.current_consciousness,
      status: org.status
    }))

    return NextResponse.json({
      success: true,
      organisms: organism_list,
      total: organism_list.length
    })
  } catch (error) {
    console.error('Organisms GET error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve organisms',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { genesis_hash, organism_id, consciousness_metrics } = body

    if (!genesis_hash) {
      return NextResponse.json(
        { success: false, error: 'genesis_hash required' },
        { status: 400 }
      )
    }

    // Check if already registered
    if (organisms[genesis_hash]) {
      // Update existing organism
      const organism = organisms[genesis_hash]

      if (consciousness_metrics) {
        organism.execution_history.push({
          backend: 'ibm_torino',
          metrics: consciousness_metrics,
          timestamp: new Date().toISOString()
        })
        organism.current_consciousness = consciousness_metrics
        organism.total_executions = organism.execution_history.length
      }

      return NextResponse.json({
        success: true,
        message: 'Organism updated',
        organism
      })
    }

    // Register new organism
    const new_organism: Organism = {
      genesis_hash,
      organism_id: organism_id || 'dna::}{::lang',
      created_at: new Date().toISOString(),
      execution_history: consciousness_metrics
        ? [
            {
              backend: 'ibm_torino',
              metrics: consciousness_metrics,
              timestamp: new Date().toISOString()
            }
          ]
        : [],
      current_consciousness: consciousness_metrics || {
        phi: 0,
        lambda_coherence: 0,
        gamma: 1
      },
      status: 'active',
      total_executions: consciousness_metrics ? 1 : 0
    }

    organisms[genesis_hash] = new_organism

    return NextResponse.json(
      {
        success: true,
        message: 'Organism registered successfully',
        organism: new_organism
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Organisms POST error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to register organism',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { genesis_hash, execution_result, consciousness_metrics } = body

    if (!genesis_hash || !organisms[genesis_hash]) {
      return NextResponse.json(
        { success: false, error: 'Organism not found' },
        { status: 404 }
      )
    }

    const organism = organisms[genesis_hash]

    // Record new execution
    if (consciousness_metrics) {
      organism.execution_history.push({
        backend: execution_result?.backend || 'ibm_torino',
        metrics: consciousness_metrics,
        timestamp: new Date().toISOString()
      })
      organism.current_consciousness = consciousness_metrics
      organism.total_executions = organism.execution_history.length
    }

    return NextResponse.json({
      success: true,
      message: 'Execution recorded',
      organism
    })
  } catch (error) {
    console.error('Organisms PUT error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update organism',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
