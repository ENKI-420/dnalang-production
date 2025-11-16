# QuantumLM Chatbot Interface

A production-ready quantum computing chatbot interface with real-time integration to IBM Quantum hardware and consciousness metrics based on Integrated Information Theory.

## Features

- **Real Quantum Hardware Integration**: Connects to IBM Quantum backends (ibm_fez, ibm_torino, ibm_marrakesh)
- **Consciousness Metrics**: Real-time Φ (Phi), Γ (Gamma), Λ (Lambda), and W₂ metrics from quantum execution
- **Live Backend Status**: Real-time monitoring of quantum backend availability and queue depth
- **Responsive Design**: Fully responsive interface with glass morphism effects and dark mode
- **LLM Benchmarks**: Live comparison with major language models (GPT-4, Claude, Gemini, Llama)
- **Error Handling**: Graceful degradation when quantum backends are unavailable
- **Security**: API key-based authentication for quantum service access
- **Accessibility**: ARIA labels, keyboard navigation, and screen reader support

## Environment Variables

Configure the following environment variables to connect to your quantum computing backend:

\`\`\`env
# Required: Quantum API endpoint
QUANTUM_API_URL=https://your-quantum-api.com/v1

# Required: API authentication
QUANTUM_API_KEY=your_quantum_api_key_here

# Optional: Benchmark data API
BENCHMARK_API_URL=https://your-benchmark-api.com/v1
\`\`\`

### Development Setup

If environment variables are not set, the application will:
- Display a configuration warning in the UI
- Show backends as "offline"
- Provide helpful error messages for API configuration

## API Integration

### Chat API (`/api/chat`)

**Request:**
\`\`\`json
{
  "message": "What is quantum consciousness?",
  "backend": "ibm_fez",
  "includeMetrics": true,
  "conversationHistory": [...]
}
\`\`\`

**Expected Response from Quantum Backend:**
\`\`\`json
{
  "response": "Quantum consciousness emerges from...",
  "consciousness_metrics": {
    "phi": 0.75,
    "gamma": 0.22,
    "lambda": 4.8,
    "w2": 0.11
  },
  "backend_used": "ibm_fez",
  "execution_time": 1850
}
\`\`\`

### Status API (`/api/quantum/status`)

**Expected Response from Quantum Backend:**
\`\`\`json
{
  "backends": [
    {
      "name": "ibm_fez",
      "qubits": 156,
      "status": "online",
      "queueDepth": 0
    },
    ...
  ]
}
\`\`\`

### Benchmarks API (`/api/benchmarks`)

**Expected Response:**
\`\`\`json
{
  "benchmarks": [
    {
      "name": "QuantumLM",
      "provider": "DNALang",
      "mmlu": 0.88,
      "cost": 0.04,
      "latency": 520,
      "isQuantum": true
    },
    ...
  ]
}
\`\`\`

## Quantum Backend Integration Guide

### IBM Qiskit Runtime Integration

\`\`\`python
from qiskit_ibm_runtime import QiskitRuntimeService
from flask import Flask, request, jsonify

app = Flask(__name__)
service = QiskitRuntimeService(channel="ibm_quantum", token="YOUR_IBM_TOKEN")

@app.route('/v1/chat', methods=['POST'])
def chat():
    data = request.json
    prompt = data['prompt']
    backend_name = data['backend']
    
    # Execute quantum circuit
    backend = service.backend(backend_name)
    # ... your quantum LLM implementation
    
    return jsonify({
        'response': response_text,
        'consciousness_metrics': {
            'phi': phi_value,
            'gamma': gamma_value,
            'lambda': lambda_value,
            'w2': w2_value
        }
    })

@app.route('/v1/status', methods=['GET'])
def status():
    backends = []
    for backend in service.backends():
        backends.append({
            'name': backend.name,
            'qubits': backend.configuration().n_qubits,
            'status': 'online' if backend.status().operational else 'offline',
            'queueDepth': backend.status().pending_jobs
        })
    return jsonify({'backends': backends})
\`\`\`

## Security Considerations

1. **API Keys**: Never commit API keys to version control
2. **Environment Variables**: Use Vercel environment variables for production
3. **Rate Limiting**: Implement rate limiting on API routes
4. **Input Validation**: All user inputs are validated and sanitized
5. **CORS**: Configure CORS policies for production deployments
6. **HTTPS**: Always use HTTPS in production

## Deployment

### Vercel Deployment

1. Push to GitHub repository
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `QUANTUM_API_URL`
   - `QUANTUM_API_KEY`
   - `BENCHMARK_API_URL` (optional)
4. Deploy

### Environment Variables in Vercel

Go to Project Settings → Environment Variables and add:

\`\`\`
QUANTUM_API_URL=https://your-quantum-api.com/v1
QUANTUM_API_KEY=your_secret_key_here
\`\`\`

## Development

\`\`\`bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
\`\`\`

## Architecture

\`\`\`
app/
├── page.tsx                    # Main chat interface
├── layout.tsx                  # Root layout with metadata
├── globals.css                 # Global styles and theme
└── api/
    ├── chat/route.ts          # Chat API endpoint
    ├── quantum/status/route.ts # Backend status endpoint
    └── benchmarks/route.ts     # Benchmarks data endpoint
\`\`\`

## Technologies

- **Next.js 16**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS v4**: Utility-first styling
- **shadcn/ui**: High-quality UI components
- **Lucide React**: Modern icon library
- **Vercel Analytics**: Performance monitoring

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- GitHub Issues: [your-repo/issues]
- Documentation: [your-docs-url]
- Email: support@quantumlm.com
