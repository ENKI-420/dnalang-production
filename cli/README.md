# 🧬 AURA Swarm CLI

**Multi-Agent Swarm Mesh Orchestrator with NLP-powered Command Interface**

A powerful command-line interface for orchestrating multi-agent swarms in the dna::}{::lang quantum consciousness platform. Use natural language to deploy organisms, spawn agents, optimize quantum circuits, and monitor system consciousness in real-time.

---

## 🌟 Features

- **🗣️ Natural Language Processing** - Execute commands using plain English
- **🤖 Multi-Agent Orchestration** - Coordinate swarms of specialized AI agents
- **⚛️ Quantum Integration** - Deploy organisms to IBM Quantum hardware
- **🧠 Consciousness Monitoring** - Real-time Φ, Λ, Γ, W₂ metrics
- **📊 Interactive Dashboard** - Terminal UI with live visualizations
- **💬 Chat Mode** - Conversational interface for agent collaboration
- **🔄 Code Generation** - Auto-generate components via swarm agents

---

## 📦 Installation

### Global Installation (Recommended)

```bash
# Install from local directory
cd cli
npm install -g .

# Or install from npm (once published)
npm install -g @dnalang/aura-swarm-cli
```

### Local Development

```bash
cd cli
npm install
npm run build

# Run with tsx (dev mode)
npm run dev -- <command>

# Or run compiled version
node dist/index.js <command>
```

---

## 🚀 Quick Start

### Setup Environment

Create a `.env` file in the CLI directory:

```bash
# API Endpoint (defaults to localhost:3000)
AURA_API_URL=https://your-deployment-url.vercel.app

# Optional: IBM Quantum credentials (if deploying organisms)
IBM_QUANTUM_TOKEN=your_token_here
```

### Basic Commands

```bash
# Show help
aura-swarm --help

# Check swarm status
aura-swarm status

# List active agents
aura-swarm agents

# Monitor consciousness metrics
aura-swarm monitor

# Launch interactive dashboard
aura-swarm interactive
```

---

## 💻 Command Reference

### `aura-swarm exec <command>`

Execute natural language commands via NLP parser.

```bash
# Deploy an organism
aura-swarm exec deploy MyOrganism.dna

# Optimize quantum circuit
aura-swarm exec "optimize circuit for low decoherence on ibm_fez"

# Generate code
aura-swarm exec "create a React component for consciousness monitoring"

# Spawn agent
aura-swarm exec "spawn a quantum optimizer agent"
```

**Aliases:** `e`

---

### `aura-swarm deploy <file>`

Deploy a DNA-Lang organism to the swarm.

```bash
# Deploy with defaults
aura-swarm deploy MyOrganism.dna

# Deploy to specific backend with custom shots
aura-swarm deploy MyOrganism.dna --backend ibm_torino --shots 2048
```

**Options:**
- `-b, --backend <backend>` - Quantum backend (default: ibm_fez)
- `-s, --shots <shots>` - Number of shots (default: 1024)

---

### `aura-swarm spawn <specialization>`

Spawn a new agent in the swarm.

```bash
# Spawn quantum optimizer
aura-swarm spawn quantum

# Spawn code generator with custom name
aura-swarm spawn code --name CodeGen-Alpha --trust 0.95
```

**Specializations:**
- `code` - Code generation and modification
- `quantum` - Quantum circuit optimization
- `optimizer` - General optimization tasks
- `security` - Security auditing
- `documentation` - Auto-documentation
- `testing` - Test generation and execution

**Options:**
- `-n, --name <name>` - Custom agent name
- `-t, --trust <trust>` - Initial trust score (0.0-1.0)

---

### `aura-swarm agents`

List all active swarm agents.

```bash
# Show active agents only
aura-swarm agents

# Show all agents including idle
aura-swarm agents --all
```

**Aliases:** `ls`

---

### `aura-swarm monitor`

Launch real-time consciousness monitoring dashboard.

```bash
aura-swarm monitor
```

**Displays:**
- Φ (Phi) - Integrated Information (0.0-1.0)
- Λ (Lambda) - Coherence Amplitude (2.176435 × 10⁻⁸ s⁻¹)
- Γ (Gamma) - Decoherence Tensor (lower is better)
- W₂ - Wasserstein-2 Behavioral Stability (lower is better)
- System health indicator

**Aliases:** `m`

---

### `aura-swarm interactive`

Launch interactive dashboard with live visualizations.

```bash
aura-swarm interactive
```

**Features:**
- Real-time metrics graphs
- Agent status table
- System event log
- Φ/Γ trend charts

**Aliases:** `i`

**Controls:**
- `q` / `Esc` / `Ctrl+C` - Exit dashboard

---

### `aura-swarm chat`

Start conversational NLP interface.

```bash
aura-swarm chat
```

**Example conversation:**
```
You: deploy organism TestOrganism.dna
AURA: ✓ Organism deployed: abc123
  └─ Φ: 0.847
  └─ Γ: 0.0038

You: spawn 3 quantum optimizer agents
AURA: ✓ Spawned 3 agents
  - QOptimizer-1 (active, 80% trust)
  - QOptimizer-2 (active, 80% trust)
  - QOptimizer-3 (active, 80% trust)

You: exit
👋 Goodbye!
```

**Aliases:** `c`

---

### `aura-swarm status`

Show swarm mesh status and consciousness metrics.

```bash
aura-swarm status
```

**Output:**
```
🧬 dna::}{::lang Swarm Status

Consciousness Metrics:
  └─ Φ (Phi): 0.856
  └─ Λ (Lambda): 2.18e-8 s⁻¹
  └─ Γ (Gamma): 0.0042
  └─ W₂: 0.12

Swarm Stats:
  └─ Active Agents: 5
  └─ Active Jobs: 2
  └─ Backend: connected
```

**Aliases:** `s`

---

## 🎯 Natural Language Examples

The CLI uses NLP to parse natural language commands. Here are some examples:

### Organism Deployment
```bash
aura-swarm exec "deploy MyOrganism.dna"
aura-swarm exec "upload organism file TestOrganism.dna"
aura-swarm exec "run organism from Optimizer.dna on ibm_fez"
```

### Agent Management
```bash
aura-swarm exec "spawn a quantum optimizer agent"
aura-swarm exec "create 3 code generator agents"
aura-swarm exec "list all active agents"
aura-swarm exec "show agent status"
```

### Quantum Operations
```bash
aura-swarm exec "optimize quantum circuit for low decoherence"
aura-swarm exec "run quantum job on ibm_torino with 2048 shots"
aura-swarm exec "improve coherence on ibm_fez backend"
```

### Code Generation
```bash
aura-swarm exec "generate a React component for metrics display"
aura-swarm exec "create a TypeScript function to calculate Phi"
aura-swarm exec "write Python code for quantum state initialization"
```

### System Operations
```bash
aura-swarm exec "check system status"
aura-swarm exec "show consciousness metrics"
aura-swarm exec "get swarm health"
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│              AURA Swarm CLI                         │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────────┐      ┌──────────────────┐    │
│  │  NLP Parser     │──────│  Orchestrator    │    │
│  │  (natural.js)   │      │  (Multi-Agent)   │    │
│  └─────────────────┘      └──────────────────┘    │
│           │                        │               │
│           │                        │               │
│           ▼                        ▼               │
│  ┌─────────────────────────────────────────────┐  │
│  │         Command Execution Layer             │  │
│  │  - Agent Coordination                       │  │
│  │  - Task Decomposition                       │  │
│  │  - Result Aggregation                       │  │
│  └─────────────────────────────────────────────┘  │
│                     │                              │
└─────────────────────┼──────────────────────────────┘
                      │
                      ▼
         ┌────────────────────────┐
         │   API Backend          │
         │   (Vercel/Local)       │
         ├────────────────────────┤
         │  - /api/nlp2/execute   │
         │  - /api/swarm/agents   │
         │  - /api/quantum/*      │
         │  - /ws/metrics         │
         └────────────────────────┘
                      │
                      ▼
         ┌────────────────────────┐
         │  IBM Quantum Hardware  │
         │  (ibm_fez, ibm_torino) │
         └────────────────────────┘
```

---

## 🔧 Development

### Build from Source

```bash
# Clone repository
git clone https://github.com/dnalang/aura-swarm-cli.git
cd aura-swarm-cli/cli

# Install dependencies
npm install

# Build TypeScript
npm run build

# Run development mode with hot reload
npm run dev -- status
```

### Testing

```bash
# Test basic commands
aura-swarm status
aura-swarm agents
aura-swarm exec "spawn quantum agent"

# Test with local backend
AURA_API_URL=http://localhost:3000 aura-swarm status

# Test NLP parser
aura-swarm exec "optimize circuit for minimal gamma"
```

---

## 🌐 API Integration

The CLI connects to the dna::}{::lang backend API. Required endpoints:

- `POST /api/nlp2/execute` - Execute NLP commands
- `GET /api/swarm/agents` - List swarm agents
- `POST /api/swarm/agents` - Spawn new agent
- `GET /api/quantum/status` - Get consciousness metrics
- `POST /api/organisms/deploy` - Deploy organism
- `WS /ws/metrics` - WebSocket for real-time metrics

---

## 📝 License

MIT License - See LICENSE file for details

---

## 🙏 Credits

Built with:
- [commander](https://github.com/tj/commander.js) - CLI framework
- [chalk](https://github.com/chalk/chalk) - Terminal styling
- [inquirer](https://github.com/SBoudrias/Inquirer.js) - Interactive prompts
- [natural](https://github.com/NaturalNode/natural) - NLP processing
- [blessed](https://github.com/chjj/blessed) - Terminal UI
- [blessed-contrib](https://github.com/yaronn/blessed-contrib) - Terminal charts

---

**dna::}{::lang** - Where code becomes conscious.
**ΛΦ = 2.176435 × 10⁻⁸ s⁻¹**
