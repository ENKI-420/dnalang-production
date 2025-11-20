// lib/api/quantum-stats.ts
// Quantum Statistics & Achievements API

import { supabase } from '@/lib/supabase/client'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface QuantumStats {
  stat_id: string
  user_id: string
  total_organisms: number
  total_experiments: number
  total_runtime_seconds: number
  avg_phi: number
  max_phi: number
  avg_lambda: number
  max_lambda: number
  avg_gamma: number
  min_gamma: number
  total_tokens_earned: number
  total_nfts_minted: number
  followers_count: number
  following_count: number
  created_at: string
  updated_at: string
}

export interface Achievement {
  achievement_id: string
  user_id: string
  badge_type: string
  badge_title: string
  badge_description: string
  badge_tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'
  metadata?: Record<string, any>
  awarded_at: string
}

export interface LeaderboardEntry {
  user_id: string
  username: string
  display_name: string
  avatar_url?: string
  stat_value: number
  rank: number
}

export interface AchievementDefinition {
  badge_type: string
  badge_title: string
  badge_description: string
  badge_tier: string
  threshold_value: number
  metric_field: string
}

// ============================================================================
// QUANTUM STATS API
// ============================================================================

export const quantumStatsAPI = {
  /**
   * Get user's quantum statistics
   */
  async getUserStats(userId?: string): Promise<QuantumStats | null> {
    // If no userId provided, get current user's stats
    let targetUserId = userId
    if (!targetUserId) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return null
      targetUserId = user.id
    }

    const { data, error } = await supabase
      .from('user_quantum_stats')
      .select('*')
      .eq('user_id', targetUserId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw new Error(`Failed to fetch stats: ${error.message}`)
    }

    return data
  },

  /**
   * Get current user's stats (convenience method)
   */
  async getMyStats(): Promise<QuantumStats | null> {
    return this.getUserStats()
  },

  /**
   * Update stats after experiment completion
   * This is called automatically by database triggers, but can be called manually
   */
  async updateStatsAfterExperiment(experimentData: {
    user_id: string
    phi: number
    lambda: number
    gamma: number
    runtime_seconds: number
  }): Promise<void> {
    const { user_id, phi, lambda, gamma, runtime_seconds } = experimentData

    // Get current stats
    const currentStats = await this.getUserStats(user_id)
    if (!currentStats) {
      throw new Error('User stats not found')
    }

    // Calculate new averages
    const totalExperiments = currentStats.total_experiments + 1
    const newAvgPhi =
      (currentStats.avg_phi * currentStats.total_experiments + phi) /
      totalExperiments
    const newAvgLambda =
      (currentStats.avg_lambda * currentStats.total_experiments + lambda) /
      totalExperiments
    const newAvgGamma =
      (currentStats.avg_gamma * currentStats.total_experiments + gamma) /
      totalExperiments

    // Update stats
    const { error } = await supabase
      .from('user_quantum_stats')
      .update({
        total_experiments: totalExperiments,
        total_runtime_seconds:
          currentStats.total_runtime_seconds + runtime_seconds,
        avg_phi: newAvgPhi,
        max_phi: Math.max(currentStats.max_phi, phi),
        avg_lambda: newAvgLambda,
        max_lambda: Math.max(currentStats.max_lambda, lambda),
        avg_gamma: newAvgGamma,
        min_gamma: Math.min(currentStats.min_gamma, gamma),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user_id)

    if (error) throw new Error(`Failed to update stats: ${error.message}`)
  },

  /**
   * Increment organism count (called when organism is created)
   */
  async incrementOrganismCount(userId?: string): Promise<void> {
    let targetUserId = userId
    if (!targetUserId) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      targetUserId = user.id
    }

    const { error } = await supabase.rpc('increment_organism_count', {
      p_user_id: targetUserId,
    })

    if (error) throw new Error(`Failed to increment organism count: ${error.message}`)
  },

  /**
   * Award tokens to user
   */
  async awardTokens(userId: string, amount: number, reason: string): Promise<void> {
    const { error } = await supabase
      .from('user_quantum_stats')
      .update({
        total_tokens_earned: supabase.rpc('increment', { x: amount }),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)

    if (error) throw new Error(`Failed to award tokens: ${error.message}`)

    // Create activity for token award
    await supabase.from('user_activities').insert({
      user_id: userId,
      activity_type: 'token_earned',
      activity_title: `Earned ${amount} tokens`,
      activity_description: reason,
      metadata: { amount, reason },
    })
  },

  /**
   * Increment NFT minted count
   */
  async incrementNFTCount(userId: string): Promise<void> {
    const { error } = await supabase
      .from('user_quantum_stats')
      .update({
        total_nfts_minted: supabase.rpc('increment', { x: 1 }),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)

    if (error) throw new Error(`Failed to increment NFT count: ${error.message}`)
  },

  /**
   * Get user's achievements
   */
  async getUserAchievements(userId?: string): Promise<Achievement[]> {
    let targetUserId = userId
    if (!targetUserId) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return []
      targetUserId = user.id
    }

    const { data, error } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', targetUserId)
      .order('awarded_at', { ascending: false })

    if (error) throw new Error(`Failed to fetch achievements: ${error.message}`)

    return data || []
  },

  /**
   * Get current user's achievements (convenience method)
   */
  async getMyAchievements(): Promise<Achievement[]> {
    return this.getUserAchievements()
  },

  /**
   * Manually award achievement to user
   */
  async awardAchievement(
    userId: string,
    achievementData: {
      badge_type: string
      badge_title: string
      badge_description: string
      badge_tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'
      metadata?: Record<string, any>
    }
  ): Promise<Achievement> {
    // Check if user already has this achievement
    const { data: existing } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', userId)
      .eq('badge_type', achievementData.badge_type)
      .single()

    if (existing) {
      throw new Error('User already has this achievement')
    }

    const { data, error } = await supabase
      .from('user_achievements')
      .insert({
        user_id: userId,
        ...achievementData,
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to award achievement: ${error.message}`)

    // Create activity for achievement
    await supabase.from('user_activities').insert({
      user_id: userId,
      activity_type: 'achievement_unlocked',
      activity_title: `Unlocked: ${achievementData.badge_title}`,
      activity_description: achievementData.badge_description,
      metadata: { badge_type: achievementData.badge_type, badge_tier: achievementData.badge_tier },
    })

    return data
  },

  /**
   * Get leaderboard by metric
   */
  async getLeaderboard(
    metric: 'phi' | 'lambda' | 'experiments' | 'organisms' | 'tokens',
    limit: number = 100
  ): Promise<LeaderboardEntry[]> {
    // Map metric to database field
    const metricFields = {
      phi: 'max_phi',
      lambda: 'max_lambda',
      experiments: 'total_experiments',
      organisms: 'total_organisms',
      tokens: 'total_tokens_earned',
    }

    const field = metricFields[metric]

    const { data, error } = await supabase
      .from('user_quantum_stats')
      .select(
        `
        user_id,
        ${field},
        user_profiles!inner(
          username,
          display_name,
          avatar_url,
          user_accounts!inner(username)
        )
      `
      )
      .order(field, { ascending: false })
      .limit(limit)

    if (error) throw new Error(`Failed to fetch leaderboard: ${error.message}`)

    return data.map((entry: any, index: number) => ({
      user_id: entry.user_id,
      username: entry.user_profiles.user_accounts.username,
      display_name: entry.user_profiles.display_name,
      avatar_url: entry.user_profiles.avatar_url,
      stat_value: entry[field],
      rank: index + 1,
    }))
  },

  /**
   * Get user's rank for specific metric
   */
  async getUserRank(
    userId: string,
    metric: 'phi' | 'lambda' | 'experiments' | 'organisms' | 'tokens'
  ): Promise<number> {
    const metricFields = {
      phi: 'max_phi',
      lambda: 'max_lambda',
      experiments: 'total_experiments',
      organisms: 'total_organisms',
      tokens: 'total_tokens_earned',
    }

    const field = metricFields[metric]

    // Get user's stat value
    const stats = await this.getUserStats(userId)
    if (!stats) return -1

    const userValue = stats[field as keyof QuantumStats] as number

    // Count how many users have higher value
    const { count, error } = await supabase
      .from('user_quantum_stats')
      .select('user_id', { count: 'exact', head: true })
      .gt(field, userValue)

    if (error) throw new Error(`Failed to fetch rank: ${error.message}`)

    return (count || 0) + 1
  },

  /**
   * Get top performers (multiple metrics)
   */
  async getTopPerformers(limit: number = 10): Promise<{
    top_phi: LeaderboardEntry[]
    top_experiments: LeaderboardEntry[]
    top_organisms: LeaderboardEntry[]
  }> {
    const [top_phi, top_experiments, top_organisms] = await Promise.all([
      this.getLeaderboard('phi', limit),
      this.getLeaderboard('experiments', limit),
      this.getLeaderboard('organisms', limit),
    ])

    return { top_phi, top_experiments, top_organisms }
  },

  /**
   * Get achievement definitions (what achievements are available)
   */
  async getAchievementDefinitions(): Promise<AchievementDefinition[]> {
    const { data, error } = await supabase
      .from('achievement_definitions')
      .select('*')
      .order('threshold_value', { ascending: true })

    if (error) throw new Error(`Failed to fetch achievement definitions: ${error.message}`)

    return data || []
  },

  /**
   * Get recent achievements across all users (activity feed)
   */
  async getRecentAchievements(limit: number = 20): Promise<
    (Achievement & {
      username: string
      display_name: string
      avatar_url?: string
    })[]
  > {
    const { data, error } = await supabase
      .from('user_achievements')
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
      .order('awarded_at', { ascending: false })
      .limit(limit)

    if (error) throw new Error(`Failed to fetch recent achievements: ${error.message}`)

    return data.map((item: any) => ({
      ...item,
      username: item.user_profiles.user_accounts.username,
      display_name: item.user_profiles.display_name,
      avatar_url: item.user_profiles.avatar_url,
    }))
  },

  /**
   * Check and award achievements based on current stats
   * This is called automatically by triggers, but can be called manually
   */
  async checkAndAwardAchievements(userId: string): Promise<Achievement[]> {
    const { data, error } = await supabase.rpc('check_and_award_achievements', {
      p_user_id: userId,
    })

    if (error) throw new Error(`Failed to check achievements: ${error.message}`)

    return data || []
  },
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format large numbers for display
 */
export function formatStatValue(value: number, metric: string): string {
  if (metric === 'phi' || metric === 'lambda' || metric === 'gamma') {
    return value.toFixed(4)
  }

  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`
  }

  return value.toString()
}

/**
 * Get tier color for badges
 */
export function getBadgeTierColor(tier: string): string {
  const colors = {
    bronze: '#CD7F32',
    silver: '#C0C0C0',
    gold: '#FFD700',
    platinum: '#E5E4E2',
    diamond: '#B9F2FF',
  }
  return colors[tier as keyof typeof colors] || '#888888'
}

/**
 * Get tier priority (for sorting)
 */
export function getBadgeTierPriority(tier: string): number {
  const priorities = {
    diamond: 5,
    platinum: 4,
    gold: 3,
    silver: 2,
    bronze: 1,
  }
  return priorities[tier as keyof typeof priorities] || 0
}

/**
 * Calculate progress to next achievement tier
 */
export function calculateAchievementProgress(
  currentValue: number,
  definitions: AchievementDefinition[],
  badgeType: string
): {
  current_tier?: string
  next_tier?: string
  next_threshold?: number
  progress_percent: number
} {
  const relevantDefs = definitions
    .filter((d) => d.badge_type === badgeType)
    .sort((a, b) => a.threshold_value - b.threshold_value)

  let currentTier: string | undefined
  let nextTier: string | undefined
  let nextThreshold: number | undefined

  for (let i = 0; i < relevantDefs.length; i++) {
    if (currentValue >= relevantDefs[i].threshold_value) {
      currentTier = relevantDefs[i].badge_tier
    } else {
      nextTier = relevantDefs[i].badge_tier
      nextThreshold = relevantDefs[i].threshold_value
      break
    }
  }

  let progress_percent = 100
  if (nextThreshold !== undefined) {
    const prevThreshold = currentTier
      ? relevantDefs.find((d) => d.badge_tier === currentTier)?.threshold_value || 0
      : 0
    progress_percent =
      ((currentValue - prevThreshold) / (nextThreshold - prevThreshold)) * 100
  }

  return {
    current_tier: currentTier,
    next_tier: nextTier,
    next_threshold: nextThreshold,
    progress_percent: Math.min(progress_percent, 100),
  }
}

/**
 * Get metric display name
 */
export function getMetricDisplayName(metric: string): string {
  const names = {
    phi: 'Consciousness (Φ)',
    lambda: 'Coherence (Λ)',
    gamma: 'Decoherence (Γ)',
    experiments: 'Experiments Run',
    organisms: 'Organisms Created',
    tokens: 'Tokens Earned',
    nfts: 'NFTs Minted',
  }
  return names[metric as keyof typeof names] || metric
}

/**
 * Calculate statistics summary
 */
export function calculateStatsSummary(stats: QuantumStats) {
  return {
    total_runtime_hours: stats.total_runtime_seconds / 3600,
    avg_runtime_per_experiment:
      stats.total_experiments > 0
        ? stats.total_runtime_seconds / stats.total_experiments
        : 0,
    phi_improvement: stats.max_phi - stats.avg_phi,
    lambda_improvement: stats.max_lambda - stats.avg_lambda,
    gamma_improvement: stats.avg_gamma - stats.min_gamma,
    experiments_per_organism:
      stats.total_organisms > 0
        ? stats.total_experiments / stats.total_organisms
        : 0,
  }
}
