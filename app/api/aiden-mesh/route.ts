import { NextRequest, NextResponse } from 'next/server'

// AIDEN Mesh State Management
// In production, this would be stored in Redis or a distributed cache
interface SubsystemInfo {
  id: string
  name: string
  type: 'swarm-agent' | 'compliance' | 'blockchain' | 'multimodal' | 'quantum' | 'orchestrator' | 'workload'
  status: 'online' | 'offline' | 'degraded'
  capabilities: string[]
  endpoints: string[]
  lastHeartbeat: string
  metrics: SubsystemMetrics
  registeredAt: string
}

interface SubsystemMetrics {
  lambda?: number
  gamma?: number
  phi?: number
  w2?: number
  cpuUsage?: number
  memoryUsage?: number
  requestRate?: number
  errorRate?: number
}

// In-memory mesh state (would be Redis in production)
const meshState = {
  subsystems: new Map<string, SubsystemInfo>(),
  version: '2.2.0',
  startTime: Date.now()
}

// ΛΦ constant
const LAMBDA_PHI = 2.176435e-8

// GET /api/aiden-mesh - Get mesh status
export async function GET(request: NextRequest) {
  try {
    // Calculate aggregate metrics
    const subsystems = Array.from(meshState.subsystems.values())
    const onlineSubsystems = subsystems.filter(s => s.status === 'online')

    let totalLambda = 0
    let totalGamma = 0
    let totalPhi = 0
    let metricsCount = 0

    for (const subsystem of onlineSubsystems) {
      if (subsystem.metrics.lambda !== undefined) {
        totalLambda += subsystem.metrics.lambda
        metricsCount++
      }
      if (subsystem.metrics.gamma !== undefined) {
        totalGamma += subsystem.metrics.gamma
      }
      if (subsystem.metrics.phi !== undefined) {
        totalPhi += subsystem.metrics.phi
      }
    }

    const averageLambda = metricsCount > 0 ? totalLambda / metricsCount : 0
    const averageGamma = metricsCount > 0 ? totalGamma / metricsCount : 0
    const averagePhi = metricsCount > 0 ? totalPhi / metricsCount : 0

    // Determine overall mesh health
    const healthyCount = onlineSubsystems.length
    const totalCount = subsystems.length
    const healthRatio = totalCount > 0 ? healthyCount / totalCount : 1

    let status: 'healthy' | 'degraded' | 'offline'
    if (healthRatio >= 0.8) {
      status = 'healthy'
    } else if (healthRatio >= 0.5) {
      status = 'degraded'
    } else {
      status = 'offline'
    }

    // Calculate mesh topology (simplified)
    const nodes = subsystems.length
    const edges = subsystems.reduce((sum, s) => sum + s.endpoints.length, 0)
    const clusters = new Set(subsystems.map(s => s.type)).size

    return NextResponse.json({
      version: meshState.version,
      status,
      uptime: Math.floor((Date.now() - meshState.startTime) / 1000),
      registeredSubsystems: subsystems.length,
      subsystems: subsystems.map(s => ({
        ...s,
        metrics: {
          ...s.metrics,
          // Ensure ΛΦ tensor metrics are present
          lambda: s.metrics.lambda || 0,
          gamma: s.metrics.gamma || 0,
          phi: s.metrics.phi || 0,
          w2: s.metrics.w2 || 0
        }
      })),
      lambdaPhi: {
        constant: LAMBDA_PHI,
        averageLambda,
        averageGamma,
        averagePhi
      },
      meshTopology: {
        nodes,
        edges,
        clusters
      }
    })
  } catch (error: any) {
    console.error('Error fetching mesh status:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch mesh status' },
      { status: 500 }
    )
  }
}

// POST /api/aiden-mesh - Register subsystem
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate registration data
    if (!body.name || !body.type || !body.endpoints || !body.capabilities) {
      return NextResponse.json(
        { error: 'Missing required fields: name, type, endpoints, capabilities' },
        { status: 400 }
      )
    }

    // Generate unique subsystem ID
    const id = `${body.type}-${Date.now()}-${Math.random().toString(36).substring(7)}`

    // Create subsystem info
    const subsystem: SubsystemInfo = {
      id,
      name: body.name,
      type: body.type,
      status: 'online',
      capabilities: body.capabilities,
      endpoints: body.endpoints,
      lastHeartbeat: new Date().toISOString(),
      metrics: {
        lambda: 0,
        gamma: 0,
        phi: 0,
        w2: 0,
        cpuUsage: 0,
        memoryUsage: 0,
        requestRate: 0,
        errorRate: 0
      },
      registeredAt: new Date().toISOString()
    }

    // Register in mesh
    meshState.subsystems.set(id, subsystem)

    console.log(`[AIDEN Mesh] Registered subsystem: ${body.name} (${body.type}) with ID: ${id}`)

    // Determine cluster assignment (simplified - based on type)
    const clusterMap: Record<string, number> = {
      'swarm-agent': 0,
      'compliance': 1,
      'blockchain': 2,
      'multimodal': 3,
      'quantum': 4,
      'orchestrator': 5,
      'workload': 6
    }

    return NextResponse.json({
      id,
      registeredAt: subsystem.registeredAt,
      meshVersion: meshState.version,
      assignedCluster: clusterMap[body.type] || 0
    }, { status: 201 })

  } catch (error: any) {
    console.error('Error registering subsystem:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to register subsystem' },
      { status: 500 }
    )
  }
}

// DELETE /api/aiden-mesh/{id} - Deregister subsystem
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Subsystem ID required' },
        { status: 400 }
      )
    }

    if (!meshState.subsystems.has(id)) {
      return NextResponse.json(
        { error: 'Subsystem not found' },
        { status: 404 }
      )
    }

    const subsystem = meshState.subsystems.get(id)
    meshState.subsystems.delete(id)

    console.log(`[AIDEN Mesh] Deregistered subsystem: ${subsystem?.name} (${id})`)

    return NextResponse.json({
      success: true,
      message: 'Subsystem deregistered'
    })

  } catch (error: any) {
    console.error('Error deregistering subsystem:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to deregister subsystem' },
      { status: 500 }
    )
  }
}
