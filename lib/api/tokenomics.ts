// lib/api/tokenomics.ts
// Tokenomics & NFT API - Wallet Integration, Token Balances, NFT Minting

import { supabase } from '@/lib/supabase/client'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface WalletTransaction {
  transaction_id: string
  user_id: string
  transaction_type: 'token_earn' | 'token_spend' | 'nft_mint' | 'nft_transfer'
  amount: number
  token_type: string
  blockchain_tx_hash?: string
  status: 'pending' | 'confirmed' | 'failed'
  metadata?: Record<string, any>
  created_at: string
  confirmed_at?: string
}

export interface NFTMetadata {
  nft_id: string
  user_id: string
  organism_id?: string
  experiment_id?: string
  nft_type: 'organism' | 'experiment' | 'achievement'
  token_id?: string
  contract_address?: string
  blockchain: string
  ipfs_hash?: string
  metadata: {
    name: string
    description: string
    image?: string
    attributes?: Array<{ trait_type: string; value: string | number }>
    external_url?: string
  }
  minted_at: string
}

export interface TokenBalance {
  balance_id: string
  user_id: string
  token_type: string
  balance: number
  locked_balance: number
  last_updated: string
}

export interface MintNFTPayload {
  nft_type: 'organism' | 'experiment' | 'achievement'
  organism_id?: string
  experiment_id?: string
  name: string
  description: string
  attributes?: Array<{ trait_type: string; value: string | number }>
}

// ============================================================================
// WALLET API
// ============================================================================

export const walletAPI = {
  /**
   * Get user's wallet address
   */
  async getWalletAddress(userId?: string): Promise<string | null> {
    let targetUserId = userId
    if (!targetUserId) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return null
      targetUserId = user.id
    }

    const { data, error } = await supabase
      .from('user_accounts')
      .select('wallet_address')
      .eq('user_id', targetUserId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new Error(`Failed to fetch wallet address: ${error.message}`)
    }

    return data.wallet_address || null
  },

  /**
   * Connect wallet address to user account
   */
  async connectWallet(walletAddress: string): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Validate Ethereum address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      throw new Error('Invalid Ethereum wallet address format')
    }

    // Check if wallet is already connected to another account
    const { data: existing } = await supabase
      .from('user_accounts')
      .select('user_id')
      .eq('wallet_address', walletAddress)
      .neq('user_id', user.id)
      .single()

    if (existing) {
      throw new Error('Wallet address is already connected to another account')
    }

    const { error } = await supabase
      .from('user_accounts')
      .update({
        wallet_address: walletAddress,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)

    if (error) throw new Error(`Failed to connect wallet: ${error.message}`)

    // Create activity
    await supabase.from('user_activities').insert({
      user_id: user.id,
      activity_type: 'wallet_connected',
      activity_title: 'Wallet Connected',
      activity_description: `Connected wallet ${walletAddress}`,
      metadata: { wallet_address: walletAddress },
    })
  },

  /**
   * Disconnect wallet from user account
   */
  async disconnectWallet(): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('user_accounts')
      .update({
        wallet_address: null,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)

    if (error) throw new Error(`Failed to disconnect wallet: ${error.message}`)
  },

  /**
   * Get all transactions for user
   */
  async getTransactions(
    userId?: string,
    limit: number = 50
  ): Promise<WalletTransaction[]> {
    let targetUserId = userId
    if (!targetUserId) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return []
      targetUserId = user.id
    }

    const { data, error } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw new Error(`Failed to fetch transactions: ${error.message}`)

    return data || []
  },

  /**
   * Get pending transactions
   */
  async getPendingTransactions(userId?: string): Promise<WalletTransaction[]> {
    let targetUserId = userId
    if (!targetUserId) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return []
      targetUserId = user.id
    }

    const { data, error } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('user_id', targetUserId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Failed to fetch pending transactions: ${error.message}`)

    return data || []
  },

  /**
   * Create transaction record
   */
  async createTransaction(transactionData: {
    transaction_type: 'token_earn' | 'token_spend' | 'nft_mint' | 'nft_transfer'
    amount: number
    token_type: string
    blockchain_tx_hash?: string
    status?: 'pending' | 'confirmed' | 'failed'
    metadata?: Record<string, any>
  }): Promise<WalletTransaction> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('wallet_transactions')
      .insert({
        user_id: user.id,
        ...transactionData,
        status: transactionData.status || 'pending',
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to create transaction: ${error.message}`)

    return data
  },

  /**
   * Update transaction status
   */
  async updateTransactionStatus(
    transactionId: string,
    status: 'confirmed' | 'failed',
    blockchainTxHash?: string
  ): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    }

    if (status === 'confirmed') {
      updateData.confirmed_at = new Date().toISOString()
    }

    if (blockchainTxHash) {
      updateData.blockchain_tx_hash = blockchainTxHash
    }

    const { error } = await supabase
      .from('wallet_transactions')
      .update(updateData)
      .eq('transaction_id', transactionId)
      .eq('user_id', user.id)

    if (error) throw new Error(`Failed to update transaction: ${error.message}`)
  },
}

// ============================================================================
// TOKEN BALANCE API
// ============================================================================

export const tokenBalanceAPI = {
  /**
   * Get user's token balances
   */
  async getBalances(userId?: string): Promise<TokenBalance[]> {
    let targetUserId = userId
    if (!targetUserId) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return []
      targetUserId = user.id
    }

    const { data, error } = await supabase
      .from('user_token_balances')
      .select('*')
      .eq('user_id', targetUserId)

    if (error) throw new Error(`Failed to fetch balances: ${error.message}`)

    return data || []
  },

  /**
   * Get balance for specific token type
   */
  async getBalance(tokenType: string, userId?: string): Promise<TokenBalance | null> {
    let targetUserId = userId
    if (!targetUserId) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return null
      targetUserId = user.id
    }

    const { data, error } = await supabase
      .from('user_token_balances')
      .select('*')
      .eq('user_id', targetUserId)
      .eq('token_type', tokenType)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new Error(`Failed to fetch balance: ${error.message}`)
    }

    return data
  },

  /**
   * Update token balance (internal use, typically called by backend)
   */
  async updateBalance(
    tokenType: string,
    amount: number,
    operation: 'add' | 'subtract' | 'set'
  ): Promise<TokenBalance> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Get current balance
    const currentBalance = await this.getBalance(tokenType)

    let newBalance = 0
    if (currentBalance) {
      switch (operation) {
        case 'add':
          newBalance = currentBalance.balance + amount
          break
        case 'subtract':
          newBalance = Math.max(0, currentBalance.balance - amount)
          break
        case 'set':
          newBalance = amount
          break
      }

      const { data, error } = await supabase
        .from('user_token_balances')
        .update({
          balance: newBalance,
          last_updated: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .eq('token_type', tokenType)
        .select()
        .single()

      if (error) throw new Error(`Failed to update balance: ${error.message}`)

      return data
    } else {
      // Create new balance record
      const { data, error } = await supabase
        .from('user_token_balances')
        .insert({
          user_id: user.id,
          token_type: tokenType,
          balance: amount,
          locked_balance: 0,
        })
        .select()
        .single()

      if (error) throw new Error(`Failed to create balance: ${error.message}`)

      return data
    }
  },

  /**
   * Lock tokens (for pending transactions)
   */
  async lockTokens(tokenType: string, amount: number): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const balance = await this.getBalance(tokenType)
    if (!balance) throw new Error('No balance found for token type')

    const availableBalance = balance.balance - balance.locked_balance
    if (availableBalance < amount) {
      throw new Error('Insufficient available balance')
    }

    const { error } = await supabase
      .from('user_token_balances')
      .update({
        locked_balance: balance.locked_balance + amount,
        last_updated: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .eq('token_type', tokenType)

    if (error) throw new Error(`Failed to lock tokens: ${error.message}`)
  },

  /**
   * Unlock tokens (after transaction completes or fails)
   */
  async unlockTokens(tokenType: string, amount: number): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const balance = await this.getBalance(tokenType)
    if (!balance) throw new Error('No balance found for token type')

    const { error } = await supabase
      .from('user_token_balances')
      .update({
        locked_balance: Math.max(0, balance.locked_balance - amount),
        last_updated: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .eq('token_type', tokenType)

    if (error) throw new Error(`Failed to unlock tokens: ${error.message}`)
  },
}

// ============================================================================
// NFT API
// ============================================================================

export const nftAPI = {
  /**
   * Get user's NFTs
   */
  async getUserNFTs(userId?: string): Promise<NFTMetadata[]> {
    let targetUserId = userId
    if (!targetUserId) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return []
      targetUserId = user.id
    }

    const { data, error } = await supabase
      .from('nft_metadata')
      .select('*')
      .eq('user_id', targetUserId)
      .order('minted_at', { ascending: false })

    if (error) throw new Error(`Failed to fetch NFTs: ${error.message}`)

    return data || []
  },

  /**
   * Get NFT by ID
   */
  async getNFT(nftId: string): Promise<NFTMetadata | null> {
    const { data, error } = await supabase
      .from('nft_metadata')
      .select('*')
      .eq('nft_id', nftId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new Error(`Failed to fetch NFT: ${error.message}`)
    }

    return data
  },

  /**
   * Mint NFT (creates metadata record, actual blockchain minting done separately)
   */
  async mintNFT(payload: MintNFTPayload): Promise<NFTMetadata> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Build metadata
    const metadata = {
      name: payload.name,
      description: payload.description,
      attributes: payload.attributes || [],
    }

    // Create NFT metadata record
    const { data, error } = await supabase
      .from('nft_metadata')
      .insert({
        user_id: user.id,
        organism_id: payload.organism_id,
        experiment_id: payload.experiment_id,
        nft_type: payload.nft_type,
        blockchain: 'ethereum', // Default to Ethereum
        metadata,
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to mint NFT: ${error.message}`)

    // Create transaction record
    await walletAPI.createTransaction({
      transaction_type: 'nft_mint',
      amount: 1,
      token_type: 'NFT',
      status: 'pending',
      metadata: {
        nft_id: data.nft_id,
        nft_type: payload.nft_type,
      },
    })

    // Increment NFT count in stats
    await supabase.rpc('increment_nft_count', { p_user_id: user.id })

    // Create activity
    await supabase.from('user_activities').insert({
      user_id: user.id,
      activity_type: 'nft_minted',
      activity_title: `Minted NFT: ${payload.name}`,
      activity_description: payload.description,
      target_id: data.nft_id,
      target_type: 'nft',
      metadata: { nft_type: payload.nft_type },
    })

    return data
  },

  /**
   * Update NFT with blockchain data (after on-chain minting)
   */
  async updateNFTBlockchainData(
    nftId: string,
    blockchainData: {
      token_id: string
      contract_address: string
      ipfs_hash?: string
      transaction_hash: string
    }
  ): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('nft_metadata')
      .update({
        token_id: blockchainData.token_id,
        contract_address: blockchainData.contract_address,
        ipfs_hash: blockchainData.ipfs_hash,
      })
      .eq('nft_id', nftId)
      .eq('user_id', user.id)

    if (error) throw new Error(`Failed to update NFT: ${error.message}`)
  },

  /**
   * Get NFTs by type
   */
  async getNFTsByType(
    nftType: 'organism' | 'experiment' | 'achievement',
    userId?: string
  ): Promise<NFTMetadata[]> {
    let targetUserId = userId
    if (!targetUserId) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return []
      targetUserId = user.id
    }

    const { data, error } = await supabase
      .from('nft_metadata')
      .select('*')
      .eq('user_id', targetUserId)
      .eq('nft_type', nftType)
      .order('minted_at', { ascending: false })

    if (error) throw new Error(`Failed to fetch NFTs by type: ${error.message}`)

    return data || []
  },

  /**
   * Get recent NFT mints across all users
   */
  async getRecentMints(limit: number = 20): Promise<
    (NFTMetadata & {
      username: string
      display_name: string
      avatar_url?: string
    })[]
  > {
    const { data, error } = await supabase
      .from('nft_metadata')
      .select(
        `
        *,
        user_profiles!inner(
          username,
          display_name,
          avatar_url,
          user_accounts!inner(username)
        )
      `
      )
      .order('minted_at', { ascending: false })
      .limit(limit)

    if (error) throw new Error(`Failed to fetch recent mints: ${error.message}`)

    return data.map((item: any) => ({
      ...item,
      username: item.user_profiles.user_accounts.username,
      display_name: item.user_profiles.display_name,
      avatar_url: item.user_profiles.avatar_url,
    }))
  },
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format wallet address for display (shortened)
 */
export function formatWalletAddress(address: string): string {
  if (!address) return ''
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
}

/**
 * Validate Ethereum wallet address
 */
export function validateWalletAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

/**
 * Get blockchain explorer URL
 */
export function getBlockchainExplorerURL(
  blockchain: string,
  txHash: string
): string {
  const explorers = {
    ethereum: `https://etherscan.io/tx/${txHash}`,
    polygon: `https://polygonscan.com/tx/${txHash}`,
    base: `https://basescan.org/tx/${txHash}`,
  }
  return explorers[blockchain as keyof typeof explorers] || '#'
}

/**
 * Get IPFS gateway URL
 */
export function getIPFSUrl(ipfsHash: string): string {
  return `https://ipfs.io/ipfs/${ipfsHash}`
}

/**
 * Format token amount for display
 */
export function formatTokenAmount(amount: number, decimals: number = 2): string {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(decimals)}M`
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(decimals)}K`
  }
  return amount.toFixed(decimals)
}

/**
 * Calculate transaction fee estimate
 */
export function estimateTransactionFee(
  transactionType: string,
  gasPrice?: number
): number {
  // Simplified gas estimation (in gwei)
  const gasEstimates = {
    token_transfer: 21000,
    nft_mint: 150000,
    nft_transfer: 85000,
  }

  const gasLimit = gasEstimates[transactionType as keyof typeof gasEstimates] || 21000
  const gasPriceGwei = gasPrice || 20 // Default 20 gwei

  return (gasLimit * gasPriceGwei) / 1e9 // Convert to ETH
}

/**
 * Get transaction status badge color
 */
export function getTransactionStatusColor(status: string): string {
  const colors = {
    pending: '#FFA500',
    confirmed: '#00C853',
    failed: '#FF3D00',
  }
  return colors[status as keyof typeof colors] || '#888888'
}

/**
 * Generate NFT metadata JSON for IPFS
 */
export function generateNFTMetadataJSON(nft: NFTMetadata): string {
  return JSON.stringify(
    {
      name: nft.metadata.name,
      description: nft.metadata.description,
      image: nft.metadata.image,
      external_url: nft.metadata.external_url,
      attributes: nft.metadata.attributes,
    },
    null,
    2
  )
}
