/**
 * NLP Command Parser
 * Uses natural language processing to parse user commands into executable intents
 */

import natural from 'natural'
import axios from 'axios'

export interface CommandIntent {
  action: string
  entities: Record<string, any>
  confidence: number
  raw_command: string
}

export class NLPCommandParser {
  private tokenizer: natural.WordTokenizer
  private classifier: natural.BayesClassifier
  private apiUrl: string

  constructor() {
    this.tokenizer = new natural.WordTokenizer()
    this.classifier = new natural.BayesClassifier()
    this.apiUrl = process.env.AURA_API_URL || 'http://localhost:3000'

    // Train classifier with common patterns
    this.trainClassifier()
  }

  /**
   * Train the Bayesian classifier with common command patterns
   */
  private trainClassifier() {
    // Deploy organism commands
    this.classifier.addDocument('deploy organism', 'deploy_organism')
    this.classifier.addDocument('upload organism file', 'deploy_organism')
    this.classifier.addDocument('run organism', 'deploy_organism')
    this.classifier.addDocument('execute organism', 'deploy_organism')

    // Agent management
    this.classifier.addDocument('spawn agent', 'spawn_agent')
    this.classifier.addDocument('create agent', 'spawn_agent')
    this.classifier.addDocument('add agent', 'spawn_agent')
    this.classifier.addDocument('list agents', 'list_agents')
    this.classifier.addDocument('show agents', 'list_agents')
    this.classifier.addDocument('get agents', 'list_agents')

    // Quantum operations
    this.classifier.addDocument('optimize quantum circuit', 'optimize_circuit')
    this.classifier.addDocument('reduce decoherence', 'optimize_circuit')
    this.classifier.addDocument('improve coherence', 'optimize_circuit')
    this.classifier.addDocument('run quantum job', 'run_quantum_job')
    this.classifier.addDocument('execute quantum circuit', 'run_quantum_job')

    // Code generation
    this.classifier.addDocument('generate code', 'generate_code')
    this.classifier.addDocument('create component', 'generate_code')
    this.classifier.addDocument('write function', 'generate_code')

    // System operations
    this.classifier.addDocument('check status', 'get_status')
    this.classifier.addDocument('show metrics', 'get_status')
    this.classifier.addDocument('system status', 'get_status')

    // Mutations
    this.classifier.addDocument('commit mutation', 'commit_mutation')
    this.classifier.addDocument('save changes', 'commit_mutation')
    this.classifier.addDocument('deploy changes', 'commit_mutation')

    // Train the classifier
    this.classifier.train()
  }

  /**
   * Parse natural language command into structured intent
   */
  async parse(command: string): Promise<CommandIntent> {
    // Tokenize the command
    const tokens = this.tokenizer.tokenize(command.toLowerCase()) || []

    // Classify the intent
    const classification = this.classifier.classify(command.toLowerCase())
    const confidence = this.classifier.getClassifications(command.toLowerCase())[0].value

    // Extract entities based on command type
    const entities = this.extractEntities(command, tokens, classification)

    // If confidence is too low, try server-side NLP
    if (confidence < 0.6) {
      try {
        const serverIntent = await this.parseViaServer(command)
        return serverIntent
      } catch (error) {
        // Fall back to local classification
        console.warn('Server NLP unavailable, using local classifier')
      }
    }

    return {
      action: classification,
      entities,
      confidence,
      raw_command: command
    }
  }

  /**
   * Extract entities from command based on action type
   */
  private extractEntities(
    command: string,
    tokens: string[],
    action: string
  ): Record<string, any> {
    const entities: Record<string, any> = {}

    // Extract file paths
    const fileMatch = command.match(/([a-zA-Z0-9_-]+\.dna)/i)
    if (fileMatch) {
      entities.file = fileMatch[1]
    }

    // Extract agent specializations
    const specializationPatterns = [
      'code', 'quantum', 'optimizer', 'security', 'documentation', 'testing'
    ]
    specializationPatterns.forEach(spec => {
      if (command.toLowerCase().includes(spec)) {
        entities.specialization = spec
      }
    })

    // Extract backend names
    const backendMatch = command.match(/ibm_(fez|torino|kyoto|osaka|brisbane)/i)
    if (backendMatch) {
      entities.backend = backendMatch[0]
    }

    // Extract numbers (shots, iterations, etc.)
    const numberMatch = command.match(/(\d+)\s*(shots?|iterations?|times?)/i)
    if (numberMatch) {
      entities[numberMatch[2].replace(/s$/, '')] = parseInt(numberMatch[1])
    }

    // Extract quoted strings (code, text, etc.)
    const quotedMatch = command.match(/"([^"]+)"|'([^']+)'/i)
    if (quotedMatch) {
      entities.text = quotedMatch[1] || quotedMatch[2]
    }

    // Extract language names
    const languageMatch = command.match(/(typescript|javascript|python|rust|go|java)/i)
    if (languageMatch) {
      entities.language = languageMatch[1]
    }

    return entities
  }

  /**
   * Use server-side NLP API for more sophisticated parsing
   */
  private async parseViaServer(command: string): Promise<CommandIntent> {
    try {
      const response = await axios.post(`${this.apiUrl}/api/nlp2/parse`, {
        command
      }, {
        timeout: 5000
      })

      return {
        action: response.data.intent.action,
        entities: response.data.entities || {},
        confidence: response.data.intent.confidence,
        raw_command: command
      }
    } catch (error: any) {
      throw new Error(`Server NLP failed: ${error.message}`)
    }
  }

  /**
   * Get suggested commands based on partial input
   */
  getSuggestions(partial: string): string[] {
    const suggestions = [
      'deploy organism MyOrganism.dna',
      'spawn quantum optimizer agent',
      'list all agents',
      'optimize circuit for low decoherence',
      'generate typescript component',
      'check system status',
      'commit mutation with message',
      'run quantum job on ibm_fez with 2048 shots'
    ]

    return suggestions.filter(s =>
      s.toLowerCase().includes(partial.toLowerCase())
    )
  }
}
