// lib/api/auth.ts
// Authentication API - Register, Login, Logout, Session Management

import { supabase } from '@/lib/supabase/client'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface RegisterPayload {
  email: string
  password: string
  username: string
  displayName?: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface User {
  id: string
  email: string
  username: string
  created_at: string
}

export interface AuthSession {
  user: User
  access_token: string
  refresh_token: string
  expires_at: number
}

// ============================================================================
// AUTHENTICATION API
// ============================================================================

export const authAPI = {
  /**
   * Register a new user
   * Creates auth user + user_account + user_profile + assigns default role
   */
  async register(payload: RegisterPayload): Promise<User> {
    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
    })

    if (authError) throw new Error(`Registration failed: ${authError.message}`)
    if (!authData.user) throw new Error('User creation failed')

    try {
      // 2. Create user_account
      const { error: accountError } = await supabase
        .from('user_accounts')
        .insert({
          user_id: authData.user.id,
          username: payload.username,
          email: payload.email,
          email_verified_at: authData.user.confirmed_at,
        })

      if (accountError) throw accountError

      // 3. Create user_profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: authData.user.id,
          display_name: payload.displayName || payload.username,
        })

      if (profileError) throw profileError

      // 4. Initialize user_quantum_stats
      const { error: statsError } = await supabase
        .from('user_quantum_stats')
        .insert({
          user_id: authData.user.id,
        })

      if (statsError) throw statsError

      // 5. Assign default role (researcher)
      const { data: roleData, error: roleQueryError } = await supabase
        .from('roles')
        .select('role_id')
        .eq('role_name', 'researcher')
        .single()

      if (!roleQueryError && roleData) {
        await supabase.from('user_roles').insert({
          user_id: authData.user.id,
          role_id: roleData.role_id,
        })
      }

      // 6. Award first achievement
      await supabase.from('user_achievements').insert({
        user_id: authData.user.id,
        badge_type: 'quantum_pioneer',
        badge_title: 'Quantum Pioneer',
        badge_description: 'Joined the DNA::}{::lang platform',
        badge_tier: 'bronze',
      })

      return {
        id: authData.user.id,
        email: payload.email,
        username: payload.username,
        created_at: authData.user.created_at,
      }
    } catch (error: any) {
      // Rollback: Delete auth user if account creation fails
      await supabase.auth.admin.deleteUser(authData.user.id)
      throw new Error(`Account creation failed: ${error.message}`)
    }
  },

  /**
   * Login user with email and password
   */
  async login(payload: LoginPayload): Promise<AuthSession> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: payload.email,
      password: payload.password,
    })

    if (error) throw new Error(`Login failed: ${error.message}`)
    if (!data.user || !data.session)
      throw new Error('Invalid login response')

    // Update last_login timestamp
    await supabase
      .from('user_accounts')
      .update({
        last_login: new Date().toISOString(),
        last_active: new Date().toISOString(),
      })
      .eq('user_id', data.user.id)

    // Get username
    const { data: accountData } = await supabase
      .from('user_accounts')
      .select('username')
      .eq('user_id', data.user.id)
      .single()

    return {
      user: {
        id: data.user.id,
        email: data.user.email!,
        username: accountData?.username || '',
        created_at: data.user.created_at,
      },
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at || 0,
    }
  },

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut()
    if (error) throw new Error(`Logout failed: ${error.message}`)
  },

  /**
   * Get current session
   */
  async getSession(): Promise<AuthSession | null> {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) throw new Error(`Session retrieval failed: ${error.message}`)
    if (!session) return null

    // Get username
    const { data: accountData } = await supabase
      .from('user_accounts')
      .select('username')
      .eq('user_id', session.user.id)
      .single()

    return {
      user: {
        id: session.user.id,
        email: session.user.email!,
        username: accountData?.username || '',
        created_at: session.user.created_at,
      },
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: session.expires_at || 0,
    }
  },

  /**
   * Get current user (simplified)
   */
  async getCurrentUser(): Promise<User | null> {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) throw new Error(`User retrieval failed: ${error.message}`)
    if (!user) return null

    // Get username
    const { data: accountData } = await supabase
      .from('user_accounts')
      .select('username')
      .eq('user_id', user.id)
      .single()

    return {
      id: user.id,
      email: user.email!,
      username: accountData?.username || '',
      created_at: user.created_at,
    }
  },

  /**
   * Refresh session
   */
  async refreshSession(): Promise<AuthSession> {
    const {
      data: { session },
      error,
    } = await supabase.auth.refreshSession()

    if (error) throw new Error(`Session refresh failed: ${error.message}`)
    if (!session) throw new Error('No session to refresh')

    // Get username
    const { data: accountData } = await supabase
      .from('user_accounts')
      .select('username')
      .eq('user_id', session.user.id)
      .single()

    return {
      user: {
        id: session.user.id,
        email: session.user.email!,
        username: accountData?.username || '',
        created_at: session.user.created_at,
      },
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: session.expires_at || 0,
    }
  },

  /**
   * Update password
   */
  async updatePassword(newPassword: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) throw new Error(`Password update failed: ${error.message}`)
  },

  /**
   * Send password reset email
   */
  async resetPassword(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error)
      throw new Error(`Password reset request failed: ${error.message}`)
  },

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<void> {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'email',
    })

    if (error) throw new Error(`Email verification failed: ${error.message}`)
  },

  /**
   * Check if username is available
   */
  async checkUsernameAvailability(username: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('user_accounts')
      .select('username')
      .eq('username', username)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Username check failed: ${error.message}`)
    }

    return !data // Available if no data found
  },

  /**
   * OAuth login (Google, GitHub, etc.)
   */
  async loginWithOAuth(
    provider: 'google' | 'github' | 'discord'
  ): Promise<void> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) throw new Error(`OAuth login failed: ${error.message}`)
  },
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate password strength
 * Requires: 8+ chars, 1 uppercase, 1 lowercase, 1 number
 */
export function validatePassword(password: string): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validate username format
 * Allows: letters, numbers, underscore, hyphen (3-50 chars)
 */
export function validateUsername(username: string): {
  valid: boolean
  error?: string
} {
  if (username.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters' }
  }

  if (username.length > 50) {
    return { valid: false, error: 'Username must be 50 characters or less' }
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return {
      valid: false,
      error: 'Username can only contain letters, numbers, underscore, and hyphen',
    }
  }

  return { valid: true }
}
