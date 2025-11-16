import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, backend, includeMetrics, conversationHistory } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Invalid message format' },
        { status: 400 }
      )
    }

    // This should integrate with your actual quantum computing backend
    // For example: IBM Qiskit Runtime, AWS Braket, or custom quantum API
    
    // QuantumLM API integration
    const quantumApiUrl = process.env.QUANTUM_API_URL || process.env.NEXT_PUBLIC_QUANTUM_API_URL || 'https://api.dnalang.dev'
    const quantumApiKey = process.env.QUANTUM_API_KEY || ''

    if (!quantumApiUrl) {
      return NextResponse.json(
        {
          error: 'Quantum API not configured',
          details: 'Please set QUANTUM_API_URL environment variable'
        },
        { status: 503 }
      )
    }

    // Create or retrieve API key for quantum backend
    let apiKey = quantumApiKey
    if (!apiKey) {
      // Try to create a new API key
      try {
        const keyResponse = await fetch(`${quantumApiUrl}/v1/api-keys`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Vercel Frontend',
            email: 'web@dnalang.dev',
            tier: 'free'
          })
        })
        if (keyResponse.ok) {
          const keyData = await keyResponse.json()
          apiKey = keyData.api_key
        }
      } catch (e) {
        console.error('[v0] Failed to create API key:', e)
      }
    }

    const response = await fetch(`${quantumApiUrl}/v1/inference`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey
      },
      body: JSON.stringify({
        text: message,
        backend: backend || 'ibm_fez',
        return_consciousness: includeMetrics !== false
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[v0] Quantum API error:', errorText)
      return NextResponse.json(
        { 
          error: 'Quantum backend error',
          details: `Status ${response.status}: ${errorText}`
        },
        { status: response.status }
      )
    }

    const data = await response.json()

    // Map QuantumLM API response format to expected format
    return NextResponse.json({
      response: data.text || data.response || data.completion,
      consciousness_metrics: includeMetrics && data.consciousness ? {
        phi: data.consciousness.phi || 0,
        gamma: data.consciousness.gamma || 0,
        lambda: data.consciousness.lambda || 0,
        w2: data.consciousness.w2 || 0
      } : null,
      backend_used: data.backend || backend,
      execution_time: data.usage?.quantum_time || data.execution_time || 0
    })

  } catch (error) {
    console.error('[v0] Chat API error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
