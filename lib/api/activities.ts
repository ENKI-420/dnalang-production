// lib/api/activities.ts
// User Activities & Comments API

import { supabase } from '@/lib/supabase/client'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface UserActivity {
  activity_id: string
  user_id: string
  activity_type: string
  activity_title: string
  activity_description?: string
  target_id?: string
  target_type?: string
  visibility: 'public' | 'followers' | 'private'
  metadata?: Record<string, any>
  created_at: string
  // Joined data
  username?: string
  display_name?: string
  avatar_url?: string
}

export interface ExperimentComment {
  comment_id: string
  experiment_id: string
  user_id: string
  parent_comment_id?: string
  comment_text: string
  created_at: string
  updated_at: string
  // Joined data
  username?: string
  display_name?: string
  avatar_url?: string
  reaction_count?: number
  user_reaction?: string
}

export interface CommentReaction {
  reaction_id: string
  comment_id: string
  user_id: string
  reaction_type: 'like' | 'insightful' | 'quantum' | 'brilliant'
  created_at: string
}

export interface ActivityFeedOptions {
  limit?: number
  offset?: number
  userId?: string // Filter to specific user
  activityTypes?: string[] // Filter by activity types
  visibility?: ('public' | 'followers' | 'private')[]
}

// ============================================================================
// ACTIVITIES API
// ============================================================================

export const activitiesAPI = {
  /**
   * Get activity feed
   * Shows activities from followed users + public activities
   */
  async getActivityFeed(options: ActivityFeedOptions = {}): Promise<UserActivity[]> {
    const {
      limit = 50,
      offset = 0,
      userId,
      activityTypes,
      visibility = ['public', 'followers'],
    } = options

    const {
      data: { user },
    } = await supabase.auth.getUser()

    let query = supabase
      .from('user_activities')
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
      .in('visibility', visibility)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Filter by user if specified
    if (userId) {
      query = query.eq('user_id', userId)
    }

    // Filter by activity types if specified
    if (activityTypes && activityTypes.length > 0) {
      query = query.in('activity_type', activityTypes)
    }

    // If authenticated, include activities from followed users
    if (user) {
      // Get list of followed user IDs
      const { data: follows } = await supabase
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', user.id)

      const followedIds = follows?.map((f) => f.following_id) || []

      // Include own activities + followed users + public
      if (followedIds.length > 0) {
        query = query.or(
          `user_id.eq.${user.id},user_id.in.(${followedIds.join(',')}),visibility.eq.public`
        )
      }
    }

    const { data, error } = await query

    if (error) throw new Error(`Failed to fetch activity feed: ${error.message}`)

    return data.map((item: any) => ({
      ...item,
      username: item.user_profiles.user_accounts.username,
      display_name: item.user_profiles.display_name,
      avatar_url: item.user_profiles.avatar_url,
    }))
  },

  /**
   * Get user's personal activity history
   */
  async getUserActivities(userId?: string, limit: number = 50): Promise<UserActivity[]> {
    let targetUserId = userId
    if (!targetUserId) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return []
      targetUserId = user.id
    }

    const { data, error } = await supabase
      .from('user_activities')
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
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw new Error(`Failed to fetch user activities: ${error.message}`)

    return data.map((item: any) => ({
      ...item,
      username: item.user_profiles.user_accounts.username,
      display_name: item.user_profiles.display_name,
      avatar_url: item.user_profiles.avatar_url,
    }))
  },

  /**
   * Create new activity
   */
  async createActivity(activityData: {
    activity_type: string
    activity_title: string
    activity_description?: string
    target_id?: string
    target_type?: string
    visibility?: 'public' | 'followers' | 'private'
    metadata?: Record<string, any>
  }): Promise<UserActivity> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('user_activities')
      .insert({
        user_id: user.id,
        ...activityData,
        visibility: activityData.visibility || 'public',
      })
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
      .single()

    if (error) throw new Error(`Failed to create activity: ${error.message}`)

    return {
      ...data,
      username: data.user_profiles.user_accounts.username,
      display_name: data.user_profiles.display_name,
      avatar_url: data.user_profiles.avatar_url,
    }
  },

  /**
   * Delete activity (only own activities)
   */
  async deleteActivity(activityId: string): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('user_activities')
      .delete()
      .eq('activity_id', activityId)
      .eq('user_id', user.id)

    if (error) throw new Error(`Failed to delete activity: ${error.message}`)
  },

  /**
   * Get activities by type
   */
  async getActivitiesByType(
    activityType: string,
    limit: number = 50
  ): Promise<UserActivity[]> {
    return this.getActivityFeed({
      limit,
      activityTypes: [activityType],
    })
  },

  /**
   * Get recent activities for specific target (e.g., all activities for an organism)
   */
  async getActivitiesForTarget(
    targetId: string,
    targetType: string,
    limit: number = 50
  ): Promise<UserActivity[]> {
    const { data, error } = await supabase
      .from('user_activities')
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
      .eq('target_id', targetId)
      .eq('target_type', targetType)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw new Error(`Failed to fetch target activities: ${error.message}`)

    return data.map((item: any) => ({
      ...item,
      username: item.user_profiles.user_accounts.username,
      display_name: item.user_profiles.display_name,
      avatar_url: item.user_profiles.avatar_url,
    }))
  },
}

// ============================================================================
// COMMENTS API
// ============================================================================

export const commentsAPI = {
  /**
   * Get comments for an experiment
   */
  async getExperimentComments(experimentId: string): Promise<ExperimentComment[]> {
    const { data, error } = await supabase
      .from('experiment_comments')
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
      .eq('experiment_id', experimentId)
      .is('parent_comment_id', null) // Top-level comments only
      .order('created_at', { ascending: true })

    if (error) throw new Error(`Failed to fetch comments: ${error.message}`)

    // Get reaction counts for each comment
    const commentsWithReactions = await Promise.all(
      data.map(async (comment: any) => {
        const reactionCount = await this.getCommentReactionCount(comment.comment_id)
        const userReaction = await this.getUserReaction(comment.comment_id)

        return {
          ...comment,
          username: comment.user_profiles.user_accounts.username,
          display_name: comment.user_profiles.display_name,
          avatar_url: comment.user_profiles.avatar_url,
          reaction_count: reactionCount,
          user_reaction: userReaction,
        }
      })
    )

    return commentsWithReactions
  },

  /**
   * Get replies to a comment
   */
  async getCommentReplies(parentCommentId: string): Promise<ExperimentComment[]> {
    const { data, error } = await supabase
      .from('experiment_comments')
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
      .eq('parent_comment_id', parentCommentId)
      .order('created_at', { ascending: true })

    if (error) throw new Error(`Failed to fetch replies: ${error.message}`)

    const repliesWithReactions = await Promise.all(
      data.map(async (comment: any) => {
        const reactionCount = await this.getCommentReactionCount(comment.comment_id)
        const userReaction = await this.getUserReaction(comment.comment_id)

        return {
          ...comment,
          username: comment.user_profiles.user_accounts.username,
          display_name: comment.user_profiles.display_name,
          avatar_url: comment.user_profiles.avatar_url,
          reaction_count: reactionCount,
          user_reaction: userReaction,
        }
      })
    )

    return repliesWithReactions
  },

  /**
   * Create a comment
   */
  async createComment(commentData: {
    experiment_id: string
    comment_text: string
    parent_comment_id?: string
  }): Promise<ExperimentComment> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Validate comment text
    if (!commentData.comment_text || commentData.comment_text.trim().length === 0) {
      throw new Error('Comment text cannot be empty')
    }

    if (commentData.comment_text.length > 2000) {
      throw new Error('Comment text must be 2000 characters or less')
    }

    const { data, error } = await supabase
      .from('experiment_comments')
      .insert({
        user_id: user.id,
        ...commentData,
      })
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
      .single()

    if (error) throw new Error(`Failed to create comment: ${error.message}`)

    return {
      ...data,
      username: data.user_profiles.user_accounts.username,
      display_name: data.user_profiles.display_name,
      avatar_url: data.user_profiles.avatar_url,
      reaction_count: 0,
    }
  },

  /**
   * Update comment (only own comments)
   */
  async updateComment(
    commentId: string,
    commentText: string
  ): Promise<ExperimentComment> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    if (!commentText || commentText.trim().length === 0) {
      throw new Error('Comment text cannot be empty')
    }

    if (commentText.length > 2000) {
      throw new Error('Comment text must be 2000 characters or less')
    }

    const { data, error } = await supabase
      .from('experiment_comments')
      .update({
        comment_text: commentText,
        updated_at: new Date().toISOString(),
      })
      .eq('comment_id', commentId)
      .eq('user_id', user.id)
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
      .single()

    if (error) throw new Error(`Failed to update comment: ${error.message}`)

    return {
      ...data,
      username: data.user_profiles.user_accounts.username,
      display_name: data.user_profiles.display_name,
      avatar_url: data.user_profiles.avatar_url,
    }
  },

  /**
   * Delete comment (only own comments)
   */
  async deleteComment(commentId: string): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('experiment_comments')
      .delete()
      .eq('comment_id', commentId)
      .eq('user_id', user.id)

    if (error) throw new Error(`Failed to delete comment: ${error.message}`)
  },

  /**
   * Add reaction to comment
   */
  async addReaction(
    commentId: string,
    reactionType: 'like' | 'insightful' | 'quantum' | 'brilliant'
  ): Promise<CommentReaction> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Remove existing reaction if any
    await supabase
      .from('comment_reactions')
      .delete()
      .eq('comment_id', commentId)
      .eq('user_id', user.id)

    // Add new reaction
    const { data, error } = await supabase
      .from('comment_reactions')
      .insert({
        comment_id: commentId,
        user_id: user.id,
        reaction_type: reactionType,
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to add reaction: ${error.message}`)

    return data
  },

  /**
   * Remove reaction from comment
   */
  async removeReaction(commentId: string): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('comment_reactions')
      .delete()
      .eq('comment_id', commentId)
      .eq('user_id', user.id)

    if (error) throw new Error(`Failed to remove reaction: ${error.message}`)
  },

  /**
   * Get reaction count for a comment
   */
  async getCommentReactionCount(commentId: string): Promise<number> {
    const { count, error } = await supabase
      .from('comment_reactions')
      .select('*', { count: 'exact', head: true })
      .eq('comment_id', commentId)

    if (error) throw new Error(`Failed to fetch reaction count: ${error.message}`)

    return count || 0
  },

  /**
   * Get current user's reaction to a comment
   */
  async getUserReaction(commentId: string): Promise<string | undefined> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return undefined

    const { data, error } = await supabase
      .from('comment_reactions')
      .select('reaction_type')
      .eq('comment_id', commentId)
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch user reaction: ${error.message}`)
    }

    return data?.reaction_type
  },

  /**
   * Get reactions breakdown for a comment
   */
  async getReactionsBreakdown(commentId: string): Promise<Record<string, number>> {
    const { data, error } = await supabase
      .from('comment_reactions')
      .select('reaction_type')
      .eq('comment_id', commentId)

    if (error) throw new Error(`Failed to fetch reactions: ${error.message}`)

    const breakdown: Record<string, number> = {
      like: 0,
      insightful: 0,
      quantum: 0,
      brilliant: 0,
    }

    data.forEach((reaction) => {
      breakdown[reaction.reaction_type] = (breakdown[reaction.reaction_type] || 0) + 1
    })

    return breakdown
  },
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format activity timestamp for display
 */
export function formatActivityTime(timestamp: string): string {
  const now = new Date()
  const activityTime = new Date(timestamp)
  const diffMs = now.getTime() - activityTime.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`
  return `${Math.floor(diffDays / 365)}y ago`
}

/**
 * Get activity icon based on activity type
 */
export function getActivityIcon(activityType: string): string {
  const icons = {
    organism_created: '🧬',
    experiment_completed: '⚛️',
    achievement_unlocked: '🏆',
    token_earned: '💰',
    nft_minted: '🖼️',
    followed_user: '👥',
    comment_created: '💬',
    phi_milestone: 'Φ',
    lambda_milestone: 'Λ',
  }
  return icons[activityType as keyof typeof icons] || '📌'
}

/**
 * Get reaction emoji
 */
export function getReactionEmoji(reactionType: string): string {
  const emojis = {
    like: '👍',
    insightful: '💡',
    quantum: '⚛️',
    brilliant: '✨',
  }
  return emojis[reactionType as keyof typeof emojis] || '👍'
}

/**
 * Validate comment text
 */
export function validateCommentText(text: string): { valid: boolean; error?: string } {
  if (!text || text.trim().length === 0) {
    return { valid: false, error: 'Comment cannot be empty' }
  }

  if (text.length > 2000) {
    return { valid: false, error: 'Comment must be 2000 characters or less' }
  }

  return { valid: true }
}

/**
 * Parse activity metadata for display
 */
export function parseActivityMetadata(
  activityType: string,
  metadata?: Record<string, any>
): string {
  if (!metadata) return ''

  switch (activityType) {
    case 'organism_created':
      return metadata.organism_name || ''
    case 'experiment_completed':
      return `Φ: ${metadata.phi?.toFixed(4) || 'N/A'}`
    case 'achievement_unlocked':
      return `${metadata.badge_tier || ''} tier`
    case 'token_earned':
      return `+${metadata.amount || 0} tokens`
    default:
      return ''
  }
}
