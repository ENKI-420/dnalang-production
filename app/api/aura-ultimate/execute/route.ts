/**
 * AURA Ultimate - Command Execution API
 * Secure command execution with safety validation and auditing
 */

import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

// ============================================================================
// TYPES
// ============================================================================

interface ParsedCommand {
  commandType: string
  action: string
  target?: string
  parameters: Record<string, any>
  flags: string[]
  confidence: number
  rawCommand: string
  safeToExecute: boolean
  requiresConfirmation: boolean
  estimatedDuration: number
  rollbackCommand?: string
}

interface ExecutionRequest {
  command: ParsedCommand
  confirm: boolean
  dryRun?: boolean
  userId?: string
}

interface ExecutionResult {
  success: boolean
  command: string
  executed: boolean
  output?: string
  error?: string
  exitCode?: number
  duration: number
  timestamp: string
  safetyChecks: {
    passed: boolean
    violations: string[]
  }
  auditLog: AuditEntry
}

interface AuditEntry {
  id: string
  userId?: string
  command: string
  commandType: string
  executed: boolean
  success: boolean
  timestamp: string
  ipAddress?: string
  userAgent?: string
}

// ============================================================================
// SAFETY VALIDATION
// ============================================================================

const DANGEROUS_PATTERNS = [
  // Destructive file operations
  { pattern: /rm\s+-rf\s+\//, description: 'Recursive root deletion' },
  { pattern: /rm\s+-rf\s+\*/, description: 'Recursive wildcard deletion' },
  { pattern: /rm\s+-rf\s+~/, description: 'Recursive home deletion' },

  // Fork bombs and malicious code
  { pattern: /:\(\)\{[\s\S]*:\|:&[\s\S]*\};:/, description: 'Fork bomb' },
  { pattern: /while\s*true.*do.*done/i, description: 'Infinite loop' },

  // Disk/device operations
  { pattern: />\s*\/dev\/sd[a-z]/, description: 'Direct disk write' },
  { pattern: /dd\s+if=\/dev\/zero/, description: 'Disk zeroing' },
  { pattern: /dd\s+if=\/dev\/urandom/, description: 'Random disk write' },

  // Permission escalation
  { pattern: /chmod\s+777\s+\//, description: 'Root permission change' },
  { pattern: /chmod\s+-R\s+777/, description: 'Recursive 777 permissions' },
  { pattern: /chown\s+-R\s+.*\s+\//, description: 'Root ownership change' },

  // Remote code execution
  { pattern: /curl.*\|\s*(sh|bash|zsh|fish)/, description: 'Pipe curl to shell' },
  { pattern: /wget.*\|\s*(sh|bash|zsh|fish)/, description: 'Pipe wget to shell' },
  { pattern: /eval\s+\$\(curl/, description: 'Eval curl output' },
  { pattern: /eval\s+\$\(wget/, description: 'Eval wget output' },

  // Network attacks
  { pattern: /nmap\s+.*-sS/, description: 'SYN scan' },
  { pattern: /hping3/, description: 'Packet crafting tool' },
  { pattern: /slowloris/, description: 'DoS attack tool' },

  // System modification
  { pattern: /mkfs\./, description: 'Format filesystem' },
  { pattern: /fdisk/, description: 'Disk partitioning' },
  { pattern: /parted/, description: 'Partition editing' },

  // Kernel operations
  { pattern: /insmod/, description: 'Kernel module insertion' },
  { pattern: /rmmod/, description: 'Kernel module removal' },
  { pattern: /modprobe/, description: 'Kernel module loading' },

  // Package manager danger
  { pattern: /apt-get\s+remove\s+--purge/, description: 'Purge system packages' },
  { pattern: /yum\s+remove/, description: 'Remove system packages' },
  { pattern: /npm\s+uninstall\s+-g/, description: 'Global package removal' },

  // Database destruction
  { pattern: /DROP\s+DATABASE/i, description: 'Drop database' },
  { pattern: /DROP\s+TABLE/i, description: 'Drop table' },
  { pattern: /TRUNCATE\s+TABLE/i, description: 'Truncate table' },
  { pattern: /DELETE\s+FROM.*WHERE\s+1\s*=\s*1/i, description: 'Delete all rows' },

  // Docker dangers
  { pattern: /docker\s+rm\s+-f\s+\$\(docker\s+ps/, description: 'Force remove all containers' },
  { pattern: /docker\s+system\s+prune\s+-a/, description: 'Remove all Docker data' },

  // Git dangers
  { pattern: /git\s+push\s+--force/, description: 'Force push' },
  { pattern: /git\s+reset\s+--hard/, description: 'Hard reset' },
  { pattern: /git\s+clean\s+-fdx/, description: 'Force clean all files' }
]

const RESTRICTED_PATHS = [
  '/etc',
  '/sys',
  '/proc',
  '/dev',
  '/boot',
  '/root',
  '/usr/bin',
  '/usr/sbin'
]

const ALLOWED_COMMAND_TYPES = [
  'file',      // File operations (limited)
  'git',       // Git operations (safe only)
  'api',       // API calls
  'database',  // Database queries (SELECT only in edge)
  'python',    // Python code generation (no execution in edge)
  'shell'      // Very limited shell commands
]

function validateSafety(command: ParsedCommand): { passed: boolean; violations: string[] } {
  const violations: string[] = []

  // Check if command type is allowed
  if (!ALLOWED_COMMAND_TYPES.includes(command.commandType)) {
    violations.push(`Command type '${command.commandType}' not allowed in edge runtime`)
  }

  // Check for dangerous patterns
  for (const { pattern, description } of DANGEROUS_PATTERNS) {
    if (pattern.test(command.rawCommand)) {
      violations.push(`Dangerous pattern detected: ${description}`)
    }
  }

  // Check for restricted paths
  for (const path of RESTRICTED_PATHS) {
    if (command.rawCommand.includes(path)) {
      violations.push(`Access to restricted path: ${path}`)
    }
  }

  // Check confidence threshold
  if (command.confidence < 0.5) {
    violations.push(`Low confidence score: ${command.confidence}`)
  }

  // Docker/Kubernetes operations not allowed in edge
  if (command.commandType === 'docker' || command.commandType === 'kubernetes') {
    violations.push('Container operations not allowed in edge runtime')
  }

  // Deployment operations require explicit confirmation
  if (command.commandType === 'deployment' && !command.requiresConfirmation) {
    violations.push('Deployment operations require confirmation')
  }

  return {
    passed: violations.length === 0,
    violations
  }
}

// ============================================================================
// COMMAND EXECUTION (SIMULATED IN EDGE RUNTIME)
// ============================================================================

async function executeCommand(command: ParsedCommand, dryRun: boolean = false): Promise<{
  output: string
  error?: string
  exitCode: number
  duration: number
}> {
  const startTime = Date.now()

  // In edge runtime, we can only simulate execution
  // Real execution would require a Node.js runtime or external service

  if (dryRun) {
    return {
      output: `[DRY RUN] Would execute: ${command.rawCommand}`,
      exitCode: 0,
      duration: Date.now() - startTime
    }
  }

  // Simulate execution based on command type
  let output = ''
  let exitCode = 0
  let error: string | undefined

  try {
    switch (command.commandType) {
      case 'file':
        output = simulateFileOperation(command)
        break

      case 'git':
        output = simulateGitOperation(command)
        break

      case 'api':
        output = await simulateApiCall(command)
        break

      case 'database':
        output = simulateDatabaseQuery(command)
        break

      case 'python':
        output = simulatePythonExecution(command)
        break

      case 'shell':
        output = simulateShellCommand(command)
        break

      default:
        error = `Command type '${command.commandType}' not supported in edge runtime`
        exitCode = 1
    }
  } catch (err: any) {
    error = err.message
    exitCode = 1
  }

  return {
    output,
    error,
    exitCode,
    duration: Date.now() - startTime
  }
}

function simulateFileOperation(command: ParsedCommand): string {
  if (command.action === 'create') {
    return `File '${command.target}' would be created`
  } else if (command.action === 'mkdir') {
    return `Directory '${command.target}' would be created`
  }
  return `File operation '${command.action}' simulated`
}

function simulateGitOperation(command: ParsedCommand): string {
  const outputs: Record<string, string> = {
    status: 'On branch main\nYour branch is up to date with origin/main',
    commit: `[main abc1234] ${command.parameters.message || 'Commit message'}`,
    push: 'Everything up-to-date',
    pull: 'Already up to date.',
    branch: `Switched to branch '${command.parameters.branch || 'main'}'`
  }
  return outputs[command.action] || 'Git operation simulated'
}

async function simulateApiCall(command: ParsedCommand): Promise<string> {
  const { target: url, parameters } = command
  const method = parameters.method || 'GET'

  // For GET requests in edge runtime, we can actually make the call
  if (method === 'GET' && url) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'AURA-Ultimate/1.0'
        }
      })
      const text = await response.text()
      return `HTTP ${response.status}\n${text.slice(0, 500)}${text.length > 500 ? '...' : ''}`
    } catch (err: any) {
      return `API call failed: ${err.message}`
    }
  }

  return `${method} ${url} - Simulated (non-GET requests require confirmation)`
}

function simulateDatabaseQuery(command: ParsedCommand): string {
  const { query } = command.parameters

  if (query.toUpperCase().startsWith('SELECT')) {
    return 'Query results (simulated):\n' +
           '┌────────┬───────────┐\n' +
           '│ id     │ name      │\n' +
           '├────────┼───────────┤\n' +
           '│ 1      │ Example   │\n' +
           '└────────┴───────────┘'
  }

  return `Database query would execute: ${query}`
}

function simulatePythonExecution(command: ParsedCommand): string {
  return `Python code generated:\n\n${command.parameters.code}\n\nNote: Execution requires Node.js runtime`
}

function simulateShellCommand(command: ParsedCommand): string {
  const safeLists: Record<string, string> = {
    'ls -la': 'drwxr-xr-x  5 user  group  160 Nov 19 10:00 .',
    'pwd': '/home/user/workspace',
    'whoami': 'user',
    'date': new Date().toString(),
    'echo': command.rawCommand.split('echo ')[1] || ''
  }

  for (const [cmd, output] of Object.entries(safeLists)) {
    if (command.rawCommand.startsWith(cmd)) {
      return output
    }
  }

  return `Shell command simulated: ${command.rawCommand}`
}

// ============================================================================
// AUDIT LOGGING
// ============================================================================

function createAuditEntry(
  command: ParsedCommand,
  executed: boolean,
  success: boolean,
  userId?: string,
  req?: NextRequest
): AuditEntry {
  return {
    id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    command: command.rawCommand,
    commandType: command.commandType,
    executed,
    success,
    timestamp: new Date().toISOString(),
    ipAddress: req?.headers.get('x-forwarded-for') || req?.headers.get('x-real-ip') || undefined,
    userAgent: req?.headers.get('user-agent') || undefined
  }
}

// ============================================================================
// API ROUTE HANDLER
// ============================================================================

export async function POST(req: NextRequest) {
  try {
    const { command, confirm, dryRun = false, userId } = await req.json() as ExecutionRequest

    if (!command || !command.rawCommand) {
      return NextResponse.json(
        { error: 'Command is required' },
        { status: 400 }
      )
    }

    // Safety validation
    const safetyChecks = validateSafety(command)

    // If command requires confirmation and not confirmed, reject
    if (command.requiresConfirmation && !confirm) {
      return NextResponse.json({
        success: false,
        command: command.rawCommand,
        executed: false,
        error: 'Command requires explicit confirmation',
        safetyChecks,
        requiresConfirmation: true
      })
    }

    // If safety checks failed, reject
    if (!safetyChecks.passed) {
      const auditLog = createAuditEntry(command, false, false, userId, req)

      return NextResponse.json({
        success: false,
        command: command.rawCommand,
        executed: false,
        error: 'Safety validation failed',
        safetyChecks,
        auditLog
      }, { status: 403 })
    }

    // Execute command (or dry run)
    const executionResult = await executeCommand(command, dryRun)

    const auditLog = createAuditEntry(
      command,
      !dryRun,
      executionResult.exitCode === 0,
      userId,
      req
    )

    const result: ExecutionResult = {
      success: executionResult.exitCode === 0,
      command: command.rawCommand,
      executed: !dryRun,
      output: executionResult.output,
      error: executionResult.error,
      exitCode: executionResult.exitCode,
      duration: executionResult.duration,
      timestamp: new Date().toISOString(),
      safetyChecks,
      auditLog
    }

    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to execute command' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  // Return execution capabilities and safety info
  return NextResponse.json({
    runtime: 'edge',
    capabilities: {
      allowedCommandTypes: ALLOWED_COMMAND_TYPES,
      executionMode: 'simulated',
      note: 'Real execution requires Node.js runtime or external service'
    },
    safety: {
      dangerousPatterns: DANGEROUS_PATTERNS.length,
      restrictedPaths: RESTRICTED_PATHS.length,
      requiresConfirmation: true
    }
  })
}
