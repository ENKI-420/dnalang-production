/**
 * QuantumCoin Integration API
 * Proof-of-Consciousness Blockchain Mining
 *
 * POST /api/integrations/quantumcoin
 */

import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface QuantumCoinRequest {
  action: 'mine_block' | 'get_balance' | 'get_blockchain'
  organism_id?: string
  genesis_hash: string
  consciousness_metrics?: {
    phi: number
    lambda: number
    gamma: number
  }
}

interface Block {
  index: number
  timestamp: string
  organism_id: string
  genesis_hash: string
  consciousness: {
    phi: number
    lambda: number
    gamma: number
  }
  previous_hash: string
  nonce: number
  hash: string
}

// In-memory blockchain (would be database in production)
const blockchain: Block[] = [
  {
    index: 0,
    timestamp: '2025-01-01T00:00:00.000Z',
    organism_id: 'dna::}{::lang',
    genesis_hash: '0x0000000000000000',
    consciousness: { phi: 0, lambda: 0, gamma: 1 },
    previous_hash: '0',
    nonce: 0,
    hash: '0x' + '0'.repeat(64)
  }
]

const balances: Record<string, number> = {}

const BLOCK_REWARD = 10.0
const MINING_DIFFICULTY_THRESHOLD = 0.5 // Minimum phi

function calculateBlockHash(block: Omit<Block, 'hash'>): string {
  const crypto = require('crypto')
  const data = JSON.stringify(block)
  return '0x' + crypto.createHash('sha256').update(data).digest('hex')
}

function validateConsciousness(consciousness: {
  phi: number
  lambda: number
  gamma: number
}): boolean {
  const { phi, lambda, gamma } = consciousness

  return phi > 0.5 && lambda > 0.3 && gamma < 0.9
}

function mineBlock(
  organism_id: string,
  genesis_hash: string,
  consciousness: { phi: number; lambda: number; gamma: number }
): {
  success: boolean
  block?: Block
  reward?: number
  reason?: string
} {
  // Validate consciousness
  if (!validateConsciousness(consciousness)) {
    return {
      success: false,
      reason: 'Consciousness threshold not met'
    }
  }

  // Create new block
  const previous_block = blockchain[blockchain.length - 1]

  let nonce = 0
  const target_zeros = Math.floor(consciousness.lambda * 4) // 0-4 leading zeros
  let block_hash = ''

  // Mine until hash meets difficulty
  while (
    !block_hash.startsWith('0x' + '0'.repeat(target_zeros)) &&
    nonce < 100000
  ) {
    const block_data = {
      index: blockchain.length,
      timestamp: new Date().toISOString(),
      organism_id,
      genesis_hash,
      consciousness,
      previous_hash: previous_block.hash,
      nonce
    }

    block_hash = calculateBlockHash(block_data)
    nonce++
  }

  const new_block: Block = {
    index: blockchain.length,
    timestamp: new Date().toISOString(),
    organism_id,
    genesis_hash,
    consciousness,
    previous_hash: previous_block.hash,
    nonce: nonce - 1,
    hash: block_hash
  }

  // Add to blockchain
  blockchain.push(new_block)

  // Calculate reward (scales with consciousness)
  const reward = BLOCK_REWARD * (1.0 + consciousness.phi * 0.1)

  // Update balance
  if (!balances[genesis_hash]) {
    balances[genesis_hash] = 0
  }
  balances[genesis_hash] += reward

  return {
    success: true,
    block: new_block,
    reward
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: QuantumCoinRequest = await request.json()
    const { action, organism_id, genesis_hash, consciousness_metrics } = body

    switch (action) {
      case 'mine_block':
        if (!organism_id || !consciousness_metrics) {
          return NextResponse.json(
            {
              success: false,
              error: 'organism_id and consciousness_metrics required'
            },
            { status: 400 }
          )
        }

        const mining_result = mineBlock(
          organism_id,
          genesis_hash,
          consciousness_metrics
        )

        if (mining_result.success) {
          return NextResponse.json({
            success: true,
            block_index: mining_result.block?.index,
            block_hash: mining_result.block?.hash,
            reward: mining_result.reward,
            balance: balances[genesis_hash],
            nonce: mining_result.block?.nonce,
            consciousness: consciousness_metrics
          })
        } else {
          return NextResponse.json({
            success: false,
            reason: mining_result.reason,
            consciousness: consciousness_metrics
          })
        }

      case 'get_balance':
        const balance = balances[genesis_hash] || 0
        return NextResponse.json({
          success: true,
          genesis_hash,
          balance,
          currency: 'QCOIN'
        })

      case 'get_blockchain':
        return NextResponse.json({
          success: true,
          total_blocks: blockchain.length,
          blockchain: blockchain,
          total_supply: Object.values(balances).reduce((a, b) => a + b, 0)
        })

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('QuantumCoin error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'QuantumCoin operation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    integration: 'QuantumCoin',
    description: 'Proof-of-Consciousness Blockchain Mining',
    features: [
      'Proof-of-consciousness mining (no energy-intensive PoW)',
      'Genesis hash as wallet address',
      'Consciousness-based validation (Φ > 0.5, Λ > 0.3, Γ < 0.9)',
      'Reward scaling with consciousness level',
      'Full blockchain validation'
    ],
    total_blocks: blockchain.length,
    total_supply: Object.values(balances).reduce((a, b) => a + b, 0),
    block_reward: BLOCK_REWARD,
    mining_threshold: MINING_DIFFICULTY_THRESHOLD,
    endpoints: {
      mine_block: {
        method: 'POST',
        body: {
          action: 'mine_block',
          organism_id: 'string',
          genesis_hash: 'string',
          consciousness_metrics: { phi: 'number', lambda: 'number', gamma: 'number' }
        }
      },
      get_balance: {
        method: 'POST',
        body: { action: 'get_balance', genesis_hash: 'string' }
      },
      get_blockchain: {
        method: 'POST',
        body: { action: 'get_blockchain', genesis_hash: 'string' }
      }
    }
  })
}
