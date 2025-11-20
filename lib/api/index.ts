// lib/api/index.ts
// Central API exports for DNA::}{::lang Multi-User Platform

// ============================================================================
// AUTHENTICATION API
// ============================================================================
export {
  authAPI,
  validateEmail,
  validatePassword,
  validateUsername,
  type RegisterPayload,
  type LoginPayload,
  type User,
  type AuthSession,
} from './auth'

// ============================================================================
// PROFILE API
// ============================================================================
export {
  profileAPI,
  validateBio,
  validateURL,
  formatProfileForDisplay,
  type UserProfile,
  type ProfileUpdatePayload,
} from './profiles'

// ============================================================================
// QUANTUM STATS API
// ============================================================================
export {
  quantumStatsAPI,
  formatStatValue,
  getBadgeTierColor,
  getBadgeTierPriority,
  calculateAchievementProgress,
  getMetricDisplayName,
  calculateStatsSummary,
  type QuantumStats,
  type Achievement,
  type LeaderboardEntry,
  type AchievementDefinition,
} from './quantum-stats'

// ============================================================================
// ACTIVITIES & COMMENTS API
// ============================================================================
export {
  activitiesAPI,
  commentsAPI,
  formatActivityTime,
  getActivityIcon,
  getReactionEmoji,
  validateCommentText,
  parseActivityMetadata,
  type UserActivity,
  type ExperimentComment,
  type CommentReaction,
  type ActivityFeedOptions,
} from './activities'

// ============================================================================
// TOKENOMICS & NFT API
// ============================================================================
export {
  walletAPI,
  tokenBalanceAPI,
  nftAPI,
  formatWalletAddress,
  validateWalletAddress,
  getBlockchainExplorerURL,
  getIPFSUrl,
  formatTokenAmount,
  estimateTransactionFee,
  getTransactionStatusColor,
  generateNFTMetadataJSON,
  type WalletTransaction,
  type NFTMetadata,
  type TokenBalance,
  type MintNFTPayload,
} from './tokenomics'

// ============================================================================
// CONVENIENCE EXPORTS
// ============================================================================

/**
 * All API modules in one object for convenience
 */
export const api = {
  auth: authAPI,
  profiles: profileAPI,
  stats: quantumStatsAPI,
  activities: activitiesAPI,
  comments: commentsAPI,
  wallet: walletAPI,
  tokens: tokenBalanceAPI,
  nfts: nftAPI,
} as const

/**
 * API configuration and constants
 */
export const API_CONFIG = {
  MAX_AVATAR_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_BANNER_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_BIO_LENGTH: 500,
  MAX_COMMENT_LENGTH: 2000,
  MAX_USERNAME_LENGTH: 50,
  MIN_USERNAME_LENGTH: 3,
  MIN_PASSWORD_LENGTH: 8,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  DEFAULT_LEADERBOARD_LIMIT: 100,
  DEFAULT_ACTIVITY_FEED_LIMIT: 50,
  DEFAULT_COMMENTS_LIMIT: 50,
} as const

/**
 * API error types
 */
export enum APIErrorType {
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
  NOT_AUTHENTICATED = 'NOT_AUTHENTICATED',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SERVER_ERROR = 'SERVER_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
}

/**
 * Custom API error class
 */
export class APIError extends Error {
  constructor(
    public type: APIErrorType,
    message: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message)
    this.name = 'APIError'
  }
}

/**
 * Parse Supabase error into APIError
 */
export function parseSupabaseError(error: any): APIError {
  // Duplicate key violation
  if (error.code === '23505') {
    return new APIError(
      APIErrorType.DUPLICATE_ENTRY,
      'This entry already exists',
      409,
      error
    )
  }

  // Not found
  if (error.code === 'PGRST116') {
    return new APIError(APIErrorType.NOT_FOUND, 'Resource not found', 404, error)
  }

  // Generic server error
  return new APIError(
    APIErrorType.SERVER_ERROR,
    error.message || 'An unexpected error occurred',
    500,
    error
  )
}

/**
 * Retry helper for API calls
 */
export async function retryAPICall<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: any

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * (i + 1)))
      }
    }
  }

  throw lastError
}
