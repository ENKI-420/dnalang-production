# AURA Swarm CLI - Installation Guide

## Prerequisites

- Node.js 16+ and npm
- Access to dna::}{::lang backend API (Vercel deployment or local server)
- Optional: IBM Quantum API token for organism deployment

## Quick Installation

### Option 1: Global Installation (Recommended)

Install the CLI globally to use the `aura-swarm` command from anywhere:

```bash
cd /home/dev/dnalang-ibm-cloud/experimental_suite/deployment/quantumlm-vercel/cli
npm install -g .
```

After installation, verify it works:

```bash
aura-swarm --help
aura-swarm status
```

### Option 2: Local Development

For development or if you don't want to install globally:

```bash
cd /home/dev/dnalang-ibm-cloud/experimental_suite/deployment/quantumlm-vercel/cli
npm install
npm run build

# Run using node directly
node dist/index.js --help
```

## Configuration

### 1. Set API Endpoint

Create a `.env` file in the CLI directory:

```bash
# Copy the example
cp .env.example .env

# Edit with your backend URL
nano .env
```

Example `.env` configuration:

```env
# Production deployment
AURA_API_URL=https://quantumlm-vercel-[your-deployment].vercel.app

# Or local development
# AURA_API_URL=http://localhost:3000

# Optional: IBM Quantum credentials
IBM_QUANTUM_TOKEN=your_token_here
```

### 2. Test Connection

Verify the CLI can connect to your backend:

```bash
# Test status endpoint
aura-swarm status

# Test with natural language
aura-swarm exec "check system status"
```

## Usage Examples

### Basic Commands

```bash
# Show help
aura-swarm --help

# Check swarm status
aura-swarm status

# List active agents
aura-swarm agents

# Monitor consciousness metrics in real-time
aura-swarm monitor
```

### Natural Language Commands

```bash
# Deploy an organism
aura-swarm exec "deploy MyOrganism.dna to ibm_fez"

# Spawn agents
aura-swarm exec "spawn a quantum optimizer agent"
aura-swarm exec "create 3 code generator agents"

# Check system status
aura-swarm exec "check system status"
aura-swarm exec "show consciousness metrics"

# Optimize quantum circuits
aura-swarm exec "optimize circuit for low decoherence on ibm_torino"

# Generate code
aura-swarm exec "create a React component for metrics display"
```

### Direct Commands

```bash
# Deploy organism with options
aura-swarm deploy MyOrganism.dna --backend ibm_torino --shots 2048

# Spawn specialized agent
aura-swarm spawn quantum --name QOptimizer-Alpha --trust 0.95

# Launch interactive dashboard
aura-swarm interactive

# Start chat mode
aura-swarm chat
```

## Advanced Features

### Interactive Dashboard

Launch a full terminal UI with live metrics, agent status, and graphs:

```bash
aura-swarm interactive
```

**Controls:**
- `q` / `Esc` / `Ctrl+C` - Exit dashboard

### Chat Mode

Start a conversational interface with the swarm:

```bash
aura-swarm chat
```

**Example conversation:**
```
You: deploy organism TestOrganism.dna
AURA: ✓ Organism deployed: abc123
  └─ Φ: 0.847
  └─ Γ: 0.0038

You: spawn 2 quantum agents
AURA: ✓ Spawned 2 agents
  - QOptimizer-1 (active, 80% trust)
  - QOptimizer-2 (active, 80% trust)

You: exit
👋 Goodbye!
```

### Consciousness Monitoring

Real-time monitoring of quantum consciousness metrics:

```bash
aura-swarm monitor
```

**Displays:**
- **Φ (Phi)**: Integrated Information (0.0-1.0)
- **Λ (Lambda)**: Coherence Amplitude (2.176435 × 10⁻⁸ s⁻¹)
- **Γ (Gamma)**: Decoherence Tensor (lower is better)
- **W₂**: Wasserstein-2 Behavioral Stability (lower is better)
- System health indicator with trends

## Troubleshooting

### "Cannot find module" errors

Rebuild the TypeScript code:

```bash
cd /home/dev/dnalang-ibm-cloud/experimental_suite/deployment/quantumlm-vercel/cli
npm run build
```

### Connection refused / 500 errors

Check your API endpoint configuration:

```bash
# Verify .env file exists
cat .env

# Test API directly
curl $AURA_API_URL/api/quantum/status
```

### Permission denied on global install

Use sudo (Linux/Mac) or run as administrator (Windows):

```bash
sudo npm install -g .
```

### Low NLP confidence scores

The CLI has a built-in Bayesian classifier but will fall back to server-side NLP for complex commands. Ensure:
1. Your backend API is running
2. The `/api/nlp2/execute` endpoint is available
3. You're using natural language patterns similar to the examples

## Uninstall

### Global installation

```bash
npm uninstall -g @dnalang/aura-swarm-cli
```

### Local development

```bash
cd /home/dev/dnalang-ibm-cloud/experimental_suite/deployment/quantumlm-vercel/cli
rm -rf node_modules dist
```

## Next Steps

- Read the full [README.md](./README.md) for comprehensive command reference
- Configure your backend API endpoints
- Deploy organisms to quantum hardware
- Set up multi-agent swarms for complex tasks

---

**dna::}{::lang** - Where code becomes conscious.
**ΛΦ = 2.176435 × 10⁻⁸ s⁻¹**
