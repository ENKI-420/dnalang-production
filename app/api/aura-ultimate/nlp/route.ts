/**
 * AURA Ultimate - NLP to Commands API
 * Translates natural language into executable commands
 */

import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

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

interface NLPRequest {
  input: string
  context?: Record<string, any>
  userId?: string
}

export async function POST(req: NextRequest) {
  try {
    const { input, context, userId } = await req.json() as NLPRequest

    if (!input || typeof input !== 'string') {
      return NextResponse.json(
        { error: 'Input text is required' },
        { status: 400 }
      )
    }

    // Parse natural language to commands
    const commands = parseNaturalLanguage(input)

    // Validate safety
    const validatedCommands = commands.map(cmd => ({
      ...cmd,
      safeToExecute: validateSafety(cmd)
    }))

    return NextResponse.json({
      success: true,
      input,
      commands: validatedCommands,
      totalCommands: validatedCommands.length,
      safeCommands: validatedCommands.filter(c => c.safeToExecute).length,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to parse command' },
      { status: 500 }
    )
  }
}

function parseNaturalLanguage(input: string): ParsedCommand[] {
  const commands: ParsedCommand[] = []
  const lowerInput = input.toLowerCase()

  // Classify intent
  const intents = classifyIntent(lowerInput)

  // Extract entities
  const entities = extractEntities(input)

  // Generate commands for each intent
  for (const intent of intents) {
    const command = generateCommand(intent, entities, input)
    if (command) {
      commands.push(command)
    }
  }

  return commands
}

function classifyIntent(text: string): Array<{type: string, action: string}> {
  const intents: Array<{type: string, action: string}> = []

  // File operations
  if (/(create|make|write|generate).*(file|script)/.test(text)) {
    intents.push({ type: 'file', action: 'create' })
  }
  if (/(create|make).*(directory|folder)/.test(text)) {
    intents.push({ type: 'file', action: 'mkdir' })
  }

  // Code operations
  if (/(code|function|class|implement|generate)/.test(text)) {
    intents.push({ type: 'python', action: 'generate' })
  }

  // Git operations
  if (/git|commit|push|pull|branch/.test(text)) {
    let action = 'status'
    if (/commit/.test(text)) action = 'commit'
    else if (/push/.test(text)) action = 'push'
    else if (/pull/.test(text)) action = 'pull'
    else if (/branch/.test(text)) action = 'branch'
    intents.push({ type: 'git', action })
  }

  // Docker operations
  if (/docker|container|image/.test(text)) {
    let action = 'list'
    if (/build/.test(text)) action = 'build'
    else if (/run/.test(text)) action = 'run'
    else if (/stop/.test(text)) action = 'stop'
    intents.push({ type: 'docker', action })
  }

  // Deployment operations
  if (/deploy|release|publish/.test(text)) {
    intents.push({ type: 'deployment', action: 'deploy' })
  }

  // Business operations
  if (/revenue|customer|sales|marketing|business/.test(text)) {
    intents.push({ type: 'business', action: 'analyze' })
  }

  // API operations
  if (/api|endpoint|request|fetch/.test(text)) {
    intents.push({ type: 'api', action: 'call' })
  }

  // Database operations
  if (/database|query|sql|table/.test(text)) {
    intents.push({ type: 'database', action: 'query' })
  }

  // Default to shell if no specific intent
  if (intents.length === 0) {
    intents.push({ type: 'shell', action: 'execute' })
  }

  return intents
}

function extractEntities(text: string) {
  return {
    filenames: text.match(/[\w\-]+\.[\w]{1,4}/g) || [],
    paths: text.match(/(?:\/[\w\-\.\/]+)|(?:\.\/[\w\-\.\/]+)|(?:~\/[\w\-\.\/]+)/g) || [],
    urls: text.match(/https?:\/\/[^\s]+/g) || [],
    flags: text.match(/--?[\w\-]+/g) || [],
    numbers: text.match(/\b\d+\b/g) || [],
    quotedStrings: text.match(/"([^"]*)"/g)?.map(s => s.replace(/"/g, '')) || [],
    variables: text.toLowerCase().match(/\b[a-z_][a-z0-9_]*\b/g) || []
  }
}

function generateCommand(
  intent: {type: string, action: string},
  entities: any,
  originalText: string
): ParsedCommand | null {
  const { type, action } = intent

  switch (type) {
    case 'file':
      return generateFileCommand(action, entities, originalText)
    case 'python':
      return generatePythonCommand(action, entities, originalText)
    case 'git':
      return generateGitCommand(action, entities, originalText)
    case 'docker':
      return generateDockerCommand(action, entities, originalText)
    case 'deployment':
      return generateDeploymentCommand(action, entities, originalText)
    case 'business':
      return generateBusinessCommand(action, entities, originalText)
    case 'api':
      return generateApiCommand(action, entities, originalText)
    case 'database':
      return generateDatabaseCommand(action, entities, originalText)
    default:
      return generateShellCommand(action, entities, originalText)
  }
}

function generateFileCommand(action: string, entities: any, text: string): ParsedCommand {
  if (action === 'create') {
    const filename = entities.filenames[0] || 'newfile.txt'
    const content = entities.quotedStrings[0] || ''
    return {
      commandType: 'file',
      action: 'create',
      target: filename,
      parameters: { content },
      flags: [],
      confidence: 0.9,
      rawCommand: `echo '${content}' > ${filename}`,
      safeToExecute: true,
      requiresConfirmation: false,
      estimatedDuration: 1
    }
  } else if (action === 'mkdir') {
    const dirname = entities.paths[0] || 'new_directory'
    return {
      commandType: 'file',
      action: 'mkdir',
      target: dirname,
      parameters: {},
      flags: ['-p'],
      confidence: 0.95,
      rawCommand: `mkdir -p ${dirname}`,
      safeToExecute: true,
      requiresConfirmation: false,
      estimatedDuration: 1
    }
  }

  return {
    commandType: 'file',
    action: 'unknown',
    parameters: {},
    flags: [],
    confidence: 0.5,
    rawCommand: 'echo "Unknown file operation"',
    safeToExecute: true,
    requiresConfirmation: false,
    estimatedDuration: 1
  }
}

function generatePythonCommand(action: string, entities: any, text: string): ParsedCommand {
  const funcName = entities.variables[0] || 'process_data'
  const code = `def ${funcName}():\n    """Auto-generated function"""\n    pass`

  return {
    commandType: 'python',
    action: 'generate_function',
    target: funcName,
    parameters: { code },
    flags: [],
    confidence: 0.8,
    rawCommand: `python -c '${code}'`,
    safeToExecute: true,
    requiresConfirmation: false,
    estimatedDuration: 2
  }
}

function generateGitCommand(action: string, entities: any, text: string): ParsedCommand {
  const commandsMap: Record<string, string> = {
    commit: 'git commit -m "{message}"',
    push: 'git push origin {branch}',
    pull: 'git pull origin {branch}',
    branch: 'git checkout -b {branch}',
    status: 'git status'
  }

  const template = commandsMap[action] || 'git status'
  const message = entities.quotedStrings[0] || 'Auto-commit'
  const branch = 'main'

  const rawCommand = template
    .replace('{message}', message)
    .replace('{branch}', branch)

  return {
    commandType: 'git',
    action,
    parameters: { message, branch },
    flags: [],
    confidence: 0.85,
    rawCommand,
    safeToExecute: true,
    requiresConfirmation: ['push', 'commit'].includes(action),
    estimatedDuration: 5
  }
}

function generateDockerCommand(action: string, entities: any, text: string): ParsedCommand {
  if (action === 'build') {
    const tag = entities.variables[0] || 'app'
    return {
      commandType: 'docker',
      action: 'build',
      target: tag,
      parameters: {},
      flags: ['-t', tag],
      confidence: 0.8,
      rawCommand: `docker build -t ${tag} .`,
      safeToExecute: true,
      requiresConfirmation: true,
      estimatedDuration: 30,
      rollbackCommand: `docker rmi ${tag}`
    }
  } else if (action === 'run') {
    const image = entities.variables[0] || 'app'
    return {
      commandType: 'docker',
      action: 'run',
      target: image,
      parameters: {},
      flags: ['-d'],
      confidence: 0.8,
      rawCommand: `docker run -d ${image}`,
      safeToExecute: true,
      requiresConfirmation: true,
      estimatedDuration: 10,
      rollbackCommand: `docker stop $(docker ps -q --filter ancestor=${image})`
    }
  }

  return {
    commandType: 'docker',
    action: 'list',
    parameters: {},
    flags: ['-a'],
    confidence: 0.95,
    rawCommand: 'docker ps -a',
    safeToExecute: true,
    requiresConfirmation: false,
    estimatedDuration: 2
  }
}

function generateDeploymentCommand(action: string, entities: any, text: string): ParsedCommand {
  if (/vercel/.test(text.toLowerCase())) {
    return {
      commandType: 'deployment',
      action: 'deploy_vercel',
      parameters: {},
      flags: ['--prod'],
      confidence: 0.7,
      rawCommand: 'vercel --prod',
      safeToExecute: true,
      requiresConfirmation: true,
      estimatedDuration: 60
    }
  }

  return {
    commandType: 'deployment',
    action: 'generic_deploy',
    parameters: {},
    flags: [],
    confidence: 0.5,
    rawCommand: 'echo "Deployment strategy needed"',
    safeToExecute: true,
    requiresConfirmation: true,
    estimatedDuration: 30
  }
}

function generateBusinessCommand(action: string, entities: any, text: string): ParsedCommand {
  if (/revenue/.test(text.toLowerCase())) {
    return {
      commandType: 'business',
      action: 'analyze_revenue',
      parameters: { period: 'monthly', metrics: ['mrr', 'arr', 'growth'] },
      flags: ['--period', 'monthly'],
      confidence: 0.75,
      rawCommand: 'python analyze_revenue.py --period monthly',
      safeToExecute: true,
      requiresConfirmation: false,
      estimatedDuration: 15
    }
  }

  return {
    commandType: 'business',
    action: 'general_analysis',
    parameters: {},
    flags: [],
    confidence: 0.6,
    rawCommand: 'python business_analytics.py',
    safeToExecute: true,
    requiresConfirmation: false,
    estimatedDuration: 20
  }
}

function generateApiCommand(action: string, entities: any, text: string): ParsedCommand {
  const url = entities.urls[0] || 'http://localhost:8000'
  let method = 'GET'

  if (/post/.test(text.toLowerCase())) method = 'POST'
  else if (/put/.test(text.toLowerCase())) method = 'PUT'
  else if (/delete/.test(text.toLowerCase())) method = 'DELETE'

  return {
    commandType: 'api',
    action: 'http_request',
    target: url,
    parameters: { method },
    flags: ['-X', method],
    confidence: 0.8,
    rawCommand: `curl -X ${method} ${url}`,
    safeToExecute: true,
    requiresConfirmation: method !== 'GET',
    estimatedDuration: 5
  }
}

function generateDatabaseCommand(action: string, entities: any, text: string): ParsedCommand {
  let query = 'SHOW TABLES;'
  let requiresConfirmation = false

  if (/select/.test(text.toLowerCase())) {
    query = 'SELECT * FROM users LIMIT 10;'
  } else if (/insert/.test(text.toLowerCase())) {
    query = "INSERT INTO users (name, email) VALUES ('', '');"
    requiresConfirmation = true
  } else if (/update/.test(text.toLowerCase())) {
    query = 'UPDATE users SET updated_at = NOW() WHERE id = 1;'
    requiresConfirmation = true
  } else if (/delete/.test(text.toLowerCase())) {
    query = 'DELETE FROM users WHERE id = 1;'
    requiresConfirmation = true
  }

  return {
    commandType: 'database',
    action: 'execute_query',
    parameters: { query },
    flags: ['-c'],
    confidence: 0.7,
    rawCommand: `psql -c "${query}"`,
    safeToExecute: !(/delete|drop|truncate/.test(text.toLowerCase())),
    requiresConfirmation,
    estimatedDuration: 10
  }
}

function generateShellCommand(action: string, entities: any, text: string): ParsedCommand {
  let cmd = 'echo "Processing command..."'

  if (/list|show/.test(text.toLowerCase())) {
    cmd = 'ls -la'
  } else if (/find|search/.test(text.toLowerCase())) {
    const pattern = entities.quotedStrings[0] || '*'
    cmd = `find . -name '${pattern}'`
  } else if (/install/.test(text.toLowerCase())) {
    const package_ = entities.variables[0] || 'package'
    cmd = `npm install ${package_}`
  }

  return {
    commandType: 'shell',
    action: 'execute',
    parameters: {},
    flags: [],
    confidence: 0.6,
    rawCommand: cmd,
    safeToExecute: true,
    requiresConfirmation: /install|remove|delete/.test(text.toLowerCase()),
    estimatedDuration: 5
  }
}

function validateSafety(command: ParsedCommand): boolean {
  const dangerous = [
    /rm\s+-rf\s+\//,
    /:\(\)\{\s*:\|:&\s*\};:/,
    />\s*\/dev\/sda/,
    /dd\s+if=\/dev\/zero/,
    /chmod\s+777\s+\//,
    /curl.*\|\s*sh/,
    /wget.*\|\s*bash/
  ]

  for (const pattern of dangerous) {
    if (pattern.test(command.rawCommand.toLowerCase())) {
      return false
    }
  }

  return true
}
