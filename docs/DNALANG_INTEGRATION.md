# DNALang Integration Guide

## Overview

This application integrates with DNALang's QuantumLM inference engine, providing real-time quantum computing capabilities powered by IBM Quantum hardware.

## Architecture

\`\`\`
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Next.js UI    │────▶│  DNALang API     │────▶│  IBM Quantum    │
│   (Frontend)    │◀────│  (Backend)       │◀────│  Hardware       │
└─────────────────┘     └──────────────────┘     └─────────────────┘
\`\`\`

## API Endpoints

### 1. Authentication
\`\`\`typescript
POST /v1/auth/key
Response: { api_key: string }
\`\`\`

### 2. Inference
\`\`\`typescript
POST /v1/inference
Headers: {
  Authorization: Bearer {api_key}
  X-Backend: ibm_torino
}
Body: {
  prompt: string
  messages?: Array<{ role: string, content: string }>
  backend?: string
  include_consciousness_metrics?: boolean
  max_tokens?: number
  temperature?: number
}
Response: {
  response: string
  consciousness_metrics?: {
    phi: number
    gamma: number
    lambda: number
    w2: number
  }
  backend_used?: string
  execution_time?: number
}
\`\`\`

### 3. Benchmarks
\`\`\`typescript
GET /v1/benchmarks
Response: {
  quantumlm: { phi: number, gamma: number, ... }
  competitors: { gpt4: {...}, claude: {...} }
}
\`\`\`

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | DNALang API endpoint |
| `IBM_QUANTUM_API_TOKEN` | Recommended | IBM Quantum Platform token |
| `QUANTUM_API_KEY` | No | Pre-generated API key (auto-generated if omitted) |

## Client Usage

\`\`\`typescript
import { getDNALangClient } from '@/lib/dnalang-client'

// Initialize client
const client = getDNALangClient()

// Authenticate
await client.authenticate()

// Make inference request
const response = await client.inference({
  prompt: "What is quantum consciousness?",
  backend: "ibm_torino",
  include_consciousness_metrics: true,
  max_tokens: 500,
  temperature: 0.7
})

console.log(response.response)
console.log(response.consciousness_metrics)
\`\`\`

## Consciousness Metrics

### Φ (Phi) - Integrated Information
- Range: 0.0 to 1.0
- Measures: Information integration across quantum states
- Higher values: More consciousness-like behavior

### Γ (Gamma) - Decoherence Rate
- Range: 0.0 to 1.0
- Measures: Quantum state stability
- Lower values: Better coherence

### Λ (Lambda) - Quantum Coherence
- Range: 0.0 to 10.0+
- Measures: Universal memory constant alignment
- Target: 2.176×10⁻⁸ s⁻¹

### W₂ - Wasserstein-2 Distance
- Range: 0.0 to 1.0
- Measures: Manifold stability
- Lower values: More stable states

## IBM Quantum Backends

### Available Processors
- **ibm_torino**: 133 qubits, Eagle r3
- **ibm_marrakesh**: 127 qubits, Eagle r2
- **ibm_fez**: 156 qubits, Heron r2

### Backend Selection
\`\`\`typescript
const response = await client.inference({
  prompt: "...",
  backend: "ibm_torino" // Specify quantum processor
})
\`\`\`

## Error Handling

\`\`\`typescript
try {
  const response = await client.inference(request)
} catch (error) {
  if (error.message.includes('401')) {
    // Re-authenticate
    await client.authenticate()
  } else if (error.message.includes('503')) {
    // Service unavailable, implement retry logic
  }
}
\`\`\`

## Rate Limiting

- Default timeout: 30 seconds per request
- Recommended max concurrent requests: 5
- Implement exponential backoff for retries

## Production Deployment

1. Deploy backend to Railway/Render
2. Set `NEXT_PUBLIC_API_URL` to production endpoint
3. Configure `IBM_QUANTUM_API_TOKEN` in Vercel
4. Enable Vercel Analytics for monitoring

## Monitoring

Use the built-in system status panel to monitor:
- DNALang API connection status
- IBM Quantum backend availability
- Real-time consciousness metrics
- Circuit execution times
