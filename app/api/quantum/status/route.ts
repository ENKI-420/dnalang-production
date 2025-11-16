import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const quantumApiUrl = process.env.QUANTUM_API_URL || process.env.NEXT_PUBLIC_QUANTUM_API_URL
    const quantumApiKey = process.env.QUANTUM_API_KEY
    
    if (!quantumApiUrl) {
      return NextResponse.json({
        backends: [
          { name: 'ibm_fez', qubits: 156, status: 'offline', queueDepth: 0 },
          { name: 'ibm_torino', qubits: 133, status: 'offline', queueDepth: 0 },
          { name: 'ibm_marrakesh', qubits: 156, status: 'offline', queueDepth: 0 }
        ],
        message: 'Quantum API not configured. Please set QUANTUM_API_URL environment variable.'
      })
    }

    const response = await fetch(`${quantumApiUrl}/status`, {
      headers: {
        ...(quantumApiKey && { 'Authorization': `Bearer ${quantumApiKey}` })
      }
    })

    if (!response.ok) {
      throw new Error(`Status API error: ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json({
      backends: data.backends || [],
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[v0] Quantum status API error:', error)
    
    return NextResponse.json({
      backends: [
        { name: 'ibm_fez', qubits: 156, status: 'offline', queueDepth: 0 },
        { name: 'ibm_torino', qubits: 133, status: 'offline', queueDepth: 0 },
        { name: 'ibm_marrakesh', qubits: 156, status: 'offline', queueDepth: 0 }
      ],
      error: 'Unable to fetch real-time status'
    }, { status: 200 })
  }
}
