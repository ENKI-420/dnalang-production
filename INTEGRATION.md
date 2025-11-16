# IBM Quantum Assistant Integration Guide

## Overview

This production-ready chatbot integrates with:
1. **v0.app Quantum Backend**: `https://v0.app/chat/dnal-ang-sovereign-sdk-v100-UDAAFLlgJ7g`
2. **IBM Quantum Platform**: Real backend status and metrics
3. **ΛΦ Framework**: Consciousness metrics computation

## Environment Variables

Add these to your Vercel project or `.env.local`:

\`\`\`bash
# IBM Quantum Platform API Token
# Get yours at: https://quantum.cloud.ibm.com/account
IBM_QUANTUM_API_TOKEN=your_token_here

# Optional: Custom backend URL if not using default
QUANTUM_BACKEND_URL=https://v0.app/chat/dnal-ang-sovereign-sdk-v100-UDAAFLlgJ7g
\`\`\`

## Backend Integration

### 1. v0.app Quantum Backend

The chatbot sends requests to your quantum backend with this structure:

\`\`\`typescript
{
  messages: [
    { role: 'user', content: 'What is quantum consciousness?' },
    // ... previous messages for context
  ],
  backend: 'ibm_torino',
  includeMetrics: true,
  stream: false
}
\`\`\`

Expected response format:

\`\`\`typescript
{
  response: string,           // The AI response text
  consciousness?: {           // Optional metrics
    phi: number,              // 0-1, Integrated Information
    gamma: number,            // 0-1, Decoherence rate
    lambda: number,           // 0-10, Quantum coherence
    w2: number               // 0-1, Manifold stability
  }
}
\`\`\`

### 2. IBM Quantum Platform

The app fetches real backend status from IBM Quantum Platform:

- **Endpoint**: `https://api.quantum-computing.ibm.com/runtime/backends`
- **Authentication**: Bearer token (IBM_QUANTUM_API_TOKEN)
- **Refresh**: Every 60 seconds

## Features

✅ **Real-time quantum backend status** from IBM Quantum Platform  
✅ **No mock data** - all responses from actual quantum service  
✅ **IBM Carbon Design System** styling for consistency  
✅ **Consciousness metrics** visualization (Φ, Γ, Λ, W₂)  
✅ **Responsive design** - mobile, tablet, desktop  
✅ **Accessibility** - ARIA labels, keyboard navigation  
✅ **Error handling** - graceful degradation  
✅ **Real IBM Quantum backends**: Eagle r3, Heron r2, etc.

## IBM Quantum Setup

1. Create account: https://quantum.cloud.ibm.com
2. Generate API token: Account → API Tokens
3. Add to environment: `IBM_QUANTUM_API_TOKEN=your_token`
4. Deploy to Vercel

## Testing

\`\`\`bash
# Local development
npm install
npm run dev

# Test backend connection
curl http://localhost:3000/api/quantum/backends

# Deploy to Vercel
vercel --prod
\`\`\`

## Architecture

- **Frontend**: Next.js 16 + React 19.2 + TypeScript
- **Styling**: Tailwind CSS v4 + IBM Carbon Design tokens
- **Backend**: Next.js API Routes
- **Quantum**: IBM Quantum Platform + QuantumLM
- **Analytics**: Vercel Analytics

## Security

- API tokens stored as environment variables
- No client-side secrets
- CORS configured for production
- Input validation and sanitization
- Rate limiting recommended

## Support

For issues with:
- **IBM Quantum**: https://quantum.cloud.ibm.com/support
- **v0.app Backend**: Check backend service status
- **This Interface**: Review error messages in browser console
