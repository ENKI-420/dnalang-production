import { NextRequest, NextResponse } from 'next/server'

// Import mesh state from parent (in production, this would be Redis)
// For now, we'll use a simple module-level store
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

interface MetricsReport {
  subsystemId: string
  timestamp: string
  metrics: SubsystemMetrics
  events?: Array<{
    type: string
    severity: 'info' | 'warning' | 'error' | 'critical'
    message: string
  }>
}

// Metrics history (would be time-series database in production)
const metricsHistory: MetricsReport[] = []
const MAX_HISTORY_SIZE = 10000

// POST /api/aiden-mesh/metrics - Report metrics
export async function POST(request: NextRequest) {
  try {
    const body: MetricsReport = await request.json()

    // Validate required fields
    if (!body.subsystemId || !body.metrics) {
      return NextResponse.json(
        { error: 'Missing required fields: subsystemId, metrics' },
        { status: 400 }
      )
    }

    // Add timestamp if not provided
    if (!body.timestamp) {
      body.timestamp = new Date().toISOString()
    }

    // Store metrics in history
    metricsHistory.push(body)

    // Trim history if too large
    if (metricsHistory.length > MAX_HISTORY_SIZE) {
      metricsHistory.shift()
    }

    // Log critical events
    if (body.events) {
      for (const event of body.events) {
        if (event.severity === 'critical' || event.severity === 'error') {
          console.error(`[AIDEN Mesh] ${body.subsystemId} - ${event.type}: ${event.message}`)
        } else if (event.severity === 'warning') {
          console.warn(`[AIDEN Mesh] ${body.subsystemId} - ${event.type}: ${event.message}`)
        }
      }
    }

    // Log ΛΦ tensor metrics if present
    if (body.metrics.lambda !== undefined || body.metrics.gamma !== undefined || body.metrics.phi !== undefined) {
      console.log(`[AIDEN Mesh] ${body.subsystemId} - ΛΦ Metrics: Λ=${body.metrics.lambda?.toFixed(4)}, Γ=${body.metrics.gamma?.toFixed(4)}, Φ=${body.metrics.phi?.toFixed(4)}`)
    }

    return NextResponse.json({
      received: true,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Error receiving metrics:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to receive metrics' },
      { status: 500 }
    )
  }
}

// GET /api/aiden-mesh/metrics - Query metrics history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const subsystemId = searchParams.get('subsystemId')
    const limit = parseInt(searchParams.get('limit') || '100')
    const startTime = searchParams.get('startTime')
    const endTime = searchParams.get('endTime')

    let filtered = [...metricsHistory]

    // Filter by subsystem
    if (subsystemId) {
      filtered = filtered.filter(m => m.subsystemId === subsystemId)
    }

    // Filter by time range
    if (startTime) {
      const start = new Date(startTime).getTime()
      filtered = filtered.filter(m => new Date(m.timestamp).getTime() >= start)
    }

    if (endTime) {
      const end = new Date(endTime).getTime()
      filtered = filtered.filter(m => new Date(m.timestamp).getTime() <= end)
    }

    // Sort by timestamp descending
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Limit results
    filtered = filtered.slice(0, limit)

    // Calculate aggregate statistics if no specific subsystem
    let stats: any = null
    if (!subsystemId && filtered.length > 0) {
      let totalLambda = 0
      let totalGamma = 0
      let totalPhi = 0
      let totalW2 = 0
      let metricsCount = 0

      for (const report of filtered) {
        if (report.metrics.lambda !== undefined) {
          totalLambda += report.metrics.lambda
          metricsCount++
        }
        if (report.metrics.gamma !== undefined) {
          totalGamma += report.metrics.gamma
        }
        if (report.metrics.phi !== undefined) {
          totalPhi += report.metrics.phi
        }
        if (report.metrics.w2 !== undefined) {
          totalW2 += report.metrics.w2
        }
      }

      stats = {
        averageLambda: metricsCount > 0 ? totalLambda / metricsCount : 0,
        averageGamma: metricsCount > 0 ? totalGamma / metricsCount : 0,
        averagePhi: metricsCount > 0 ? totalPhi / metricsCount : 0,
        averageW2: metricsCount > 0 ? totalW2 / metricsCount : 0,
        totalReports: filtered.length
      }
    }

    return NextResponse.json({
      metrics: filtered,
      stats,
      count: filtered.length,
      total: metricsHistory.length
    })

  } catch (error: any) {
    console.error('Error querying metrics:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to query metrics' },
      { status: 500 }
    )
  }
}
