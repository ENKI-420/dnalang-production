// lib/api/profiles.ts
// User Profile Management API

import { supabase } from '@/lib/supabase/client'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface UserProfile {
  profile_id: string
  user_id: string
  username: string
  display_name: string
  avatar_url?: string
  banner_url?: string
  bio?: string
  location?: string
  website_url?: string
  affiliation?: string
  research_interests: string[]
  social_links: {
    twitter?: string
    github?: string
    linkedin?: string
    website?: string
  }
  visibility: 'public' | 'followers' | 'private'
  show_email: boolean
  show_stats: boolean
  created_at: string
  updated_at: string
}

export interface ProfileUpdatePayload {
  display_name?: string
  bio?: string
  location?: string
  website_url?: string
  affiliation?: string
  research_interests?: string[]
  social_links?: {
    twitter?: string
    github?: string
    linkedin?: string
    website?: string
  }
  visibility?: 'public' | 'followers' | 'private'
  show_email?: boolean
  show_stats?: boolean
}

// ============================================================================
// PROFILE API
// ============================================================================

export const profileAPI = {
  /**
   * Get current user's profile
   */
  async getMyProfile(): Promise<UserProfile | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('user_profiles')
      .select(
        `
        *,
        user_accounts!inner(username, email)
      `
      )
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw new Error(`Failed to fetch profile: ${error.message}`)
    }

    return {
      ...data,
      username: data.user_accounts.username,
    }
  },

  /**
   * Get profile by username
   */
  async getProfileByUsername(username: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select(
        `
        *,
        user_accounts!inner(username, email)
      `
      )
      .eq('user_accounts.username', username)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw new Error(`Failed to fetch profile: ${error.message}`)
    }

    return {
      ...data,
      username: data.user_accounts.username,
    }
  },

  /**
   * Get profile by user ID
   */
  async getProfileById(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select(
        `
        *,
        user_accounts!inner(username, email)
      `
      )
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new Error(`Failed to fetch profile: ${error.message}`)
    }

    return {
      ...data,
      username: data.user_accounts.username,
    }
  },

  /**
   * Update current user's profile
   */
  async updateProfile(
    updates: ProfileUpdatePayload
  ): Promise<UserProfile> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .select(
        `
        *,
        user_accounts!inner(username)
      `
      )
      .single()

    if (error) throw new Error(`Failed to update profile: ${error.message}`)

    return {
      ...data,
      username: data.user_accounts.username,
    }
  },

  /**
   * Upload avatar image
   */
  async uploadAvatar(file: File): Promise<string> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Validate file
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      throw new Error('File size must be less than 5MB')
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      throw new Error('File must be an image (JPEG, PNG, GIF, or WebP)')
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}-${Date.now()}.${fileExt}`
    const filePath = `avatars/${fileName}`

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('user-content')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`)
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('user-content').getPublicUrl(filePath)

    // Update profile with new avatar URL
    await this.updateProfile({ avatar_url: publicUrl })

    return publicUrl
  },

  /**
   * Upload banner image
   */
  async uploadBanner(file: File): Promise<string> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Validate file
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      throw new Error('File size must be less than 10MB')
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      throw new Error('File must be an image (JPEG, PNG, GIF, or WebP)')
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}-banner-${Date.now()}.${fileExt}`
    const filePath = `banners/${fileName}`

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('user-content')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`)
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('user-content').getPublicUrl(filePath)

    // Update profile with new banner URL
    await this.updateProfile({ banner_url: publicUrl })

    return publicUrl
  },

  /**
   * Delete avatar
   */
  async deleteAvatar(): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Get current avatar URL
    const profile = await this.getMyProfile()
    if (!profile?.avatar_url) return

    // Extract file path from URL
    const url = new URL(profile.avatar_url)
    const filePath = url.pathname.split('/').slice(-2).join('/')

    // Delete from storage
    const { error: deleteError } = await supabase.storage
      .from('user-content')
      .remove([filePath])

    if (deleteError) {
      throw new Error(`Delete failed: ${deleteError.message}`)
    }

    // Update profile to remove avatar URL
    await this.updateProfile({ avatar_url: undefined })
  },

  /**
   * Search profiles by username or display name
   */
  async searchProfiles(query: string, limit: number = 10): Promise<UserProfile[]> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select(
        `
        *,
        user_accounts!inner(username)
      `
      )
      .or(`display_name.ilike.%${query}%,user_accounts.username.ilike.%${query}%`)
      .eq('visibility', 'public')
      .limit(limit)

    if (error) throw new Error(`Search failed: ${error.message}`)

    return data.map((item) => ({
      ...item,
      username: item.user_accounts.username,
    }))
  },

  /**
   * Get multiple profiles by IDs
   */
  async getProfilesByIds(userIds: string[]): Promise<UserProfile[]> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select(
        `
        *,
        user_accounts!inner(username)
      `
      )
      .in('user_id', userIds)

    if (error) throw new Error(`Failed to fetch profiles: ${error.message}`)

    return data.map((item) => ({
      ...item,
      username: item.user_accounts.username,
    }))
  },

  /**
   * Get recently active users
   */
  async getRecentlyActive(limit: number = 10): Promise<UserProfile[]> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select(
        `
        *,
        user_accounts!inner(username, last_active)
      `
      )
      .eq('visibility', 'public')
      .order('user_accounts.last_active', { ascending: false, nullsFirst: false })
      .limit(limit)

    if (error) throw new Error(`Failed to fetch active users: ${error.message}`)

    return data.map((item) => ({
      ...item,
      username: item.user_accounts.username,
    }))
  },

  /**
   * Get user's followers
   */
  async getFollowers(userId: string): Promise<UserProfile[]> {
    const { data, error } = await supabase
      .from('user_follows')
      .select(
        `
        follower_id,
        user_profiles!user_follows_follower_id_fkey(
          *,
          user_accounts!inner(username)
        )
      `
      )
      .eq('following_id', userId)

    if (error) throw new Error(`Failed to fetch followers: ${error.message}`)

    return data.map((item: any) => ({
      ...item.user_profiles,
      username: item.user_profiles.user_accounts.username,
    }))
  },

  /**
   * Get users that a user is following
   */
  async getFollowing(userId: string): Promise<UserProfile[]> {
    const { data, error } = await supabase
      .from('user_follows')
      .select(
        `
        following_id,
        user_profiles!user_follows_following_id_fkey(
          *,
          user_accounts!inner(username)
        )
      `
      )
      .eq('follower_id', userId)

    if (error) throw new Error(`Failed to fetch following: ${error.message}`)

    return data.map((item: any) => ({
      ...item.user_profiles,
      username: item.user_profiles.user_accounts.username,
    }))
  },

  /**
   * Check if user A follows user B
   */
  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('user_follows')
      .select('follower_id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to check follow status: ${error.message}`)
    }

    return !!data
  },

  /**
   * Follow a user
   */
  async followUser(followingId: string): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    if (user.id === followingId) {
      throw new Error('Cannot follow yourself')
    }

    const { error } = await supabase.from('user_follows').insert({
      follower_id: user.id,
      following_id: followingId,
    })

    if (error) {
      if (error.code === '23505') {
        throw new Error('Already following this user')
      }
      throw new Error(`Failed to follow user: ${error.message}`)
    }
  },

  /**
   * Unfollow a user
   */
  async unfollowUser(followingId: string): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('user_follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', followingId)

    if (error) throw new Error(`Failed to unfollow user: ${error.message}`)
  },
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validate bio length
 */
export function validateBio(bio: string): { valid: boolean; error?: string } {
  if (bio.length > 500) {
    return { valid: false, error: 'Bio must be 500 characters or less' }
  }
  return { valid: true }
}

/**
 * Validate URL format
 */
export function validateURL(url: string): { valid: boolean; error?: string } {
  try {
    new URL(url)
    return { valid: true }
  } catch {
    return { valid: false, error: 'Invalid URL format' }
  }
}

/**
 * Format user profile for display
 */
export function formatProfileForDisplay(profile: UserProfile) {
  return {
    ...profile,
    displayName: profile.display_name || profile.username,
    avatarUrl: profile.avatar_url || '/default-avatar.png',
    hasCustomAvatar: !!profile.avatar_url,
    hasBio: !!profile.bio && profile.bio.length > 0,
    hasAffiliation: !!profile.affiliation,
    hasWebsite: !!profile.website_url,
    hasSocialLinks:
      Object.keys(profile.social_links || {}).length > 0,
  }
}
