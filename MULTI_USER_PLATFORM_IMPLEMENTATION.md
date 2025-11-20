# Multi-User Platform Implementation Guide
## DNA::}{::lang User Accounts & Profile System

**Date**: November 19, 2025
**Platform**: www.dnalang.dev (Production)
**Status**: Architecture & Implementation Plan

---

## Executive Summary

This document provides the complete blueprint for implementing a **multi-user quantum research platform** with:
- Secure authentication (JWT + OAuth 2.0)
- User profiles with quantum research metrics
- Role-Based Access Control (RBAC) for Researchers/Admins
- Wallet integration for tokenomics
- Social features (Follow, Activity Feed)
- Quantum experiment tracking per user

**Integration Points**:
- Supabase (PostgreSQL + Auth) - Already configured ✅
- IBM Quantum (per-user job tracking)
- Wallet addresses (for future tokenomics)
- NFT minting (for quantum experiments)

---

## Phase 1: Database Schema Design

### 1.1 Core Identity Tables

**Building on existing Supabase setup**, we extend the schema:

```sql
-- ============================================================================
-- USERS & AUTHENTICATION (Enhanced)
-- ============================================================================

-- 1. Users Table (Identity) - Extends Supabase auth.users
CREATE TABLE public.user_accounts (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    wallet_address VARCHAR(42) UNIQUE, -- Ethereum address for tokenomics
    is_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    last_active TIMESTAMP WITH TIME ZONE,

    CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_-]{3,50}$')
);

-- 2. User Profiles (Public Data)
CREATE TABLE public.user_profiles (
    profile_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.user_accounts(user_id) ON DELETE CASCADE,
    display_name VARCHAR(100),
    avatar_url TEXT,
    banner_url TEXT,
    bio TEXT CHECK (LENGTH(bio) <= 500),
    location VARCHAR(100),
    affiliation VARCHAR(150), -- University/Company
    research_interests JSONB DEFAULT '[]'::jsonb, -- ['Quantum ML', 'NISQ Algorithms']
    social_links JSONB DEFAULT '{}'::jsonb, -- {'twitter': '@user', 'github': 'user'}
    visibility VARCHAR(20) DEFAULT 'public', -- 'public', 'followers', 'private'
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT visibility_options CHECK (visibility IN ('public', 'followers', 'private'))
);

-- 3. Role-Based Access Control (RBAC)
CREATE TABLE public.roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(30) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '[]'::jsonb -- ['create_experiments', 'manage_users']
);

CREATE TABLE public.user_roles (
    user_id UUID REFERENCES public.user_accounts(user_id) ON DELETE CASCADE,
    role_id INT REFERENCES public.roles(role_id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_by UUID REFERENCES public.user_accounts(user_id),
    PRIMARY KEY (user_id, role_id)
);

-- Insert default roles
INSERT INTO public.roles (role_name, description, permissions) VALUES
    ('admin', 'Platform administrator', '["manage_users", "manage_roles", "delete_any", "view_analytics"]'::jsonb),
    ('researcher', 'Quantum researcher', '["create_experiments", "run_quantum_jobs", "mint_nfts"]'::jsonb),
    ('viewer', 'Read-only access', '["view_experiments", "view_profiles"]'::jsonb);
```

---

### 1.2 Quantum Research Metrics

```sql
-- ============================================================================
-- QUANTUM RESEARCH & EXPERIMENTS (Per-User)
-- ============================================================================

-- 1. User Quantum Statistics
CREATE TABLE public.user_quantum_stats (
    user_id UUID PRIMARY KEY REFERENCES public.user_accounts(user_id) ON DELETE CASCADE,
    total_experiments INT DEFAULT 0,
    total_quantum_jobs INT DEFAULT 0,
    total_organisms_evolved INT DEFAULT 0,
    highest_phi_achieved DECIMAL(5,4) DEFAULT 0.0,
    total_ibm_runtime_hours DECIMAL(10,2) DEFAULT 0.0,
    total_cost_usd DECIMAL(10,2) DEFAULT 0.0,
    consciousness_index DECIMAL(5,4) DEFAULT 0.0, -- Average Φ across all experiments
    reputation_score INT DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. User Experiments (Links to existing organisms table)
ALTER TABLE public.organisms
    ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.user_accounts(user_id),
    ADD COLUMN IF NOT EXISTS visibility VARCHAR(20) DEFAULT 'public',
    ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb;

-- 3. User Quantum Jobs (Links to existing quantum_jobs table)
ALTER TABLE public.quantum_jobs
    ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.user_accounts(user_id);

-- 4. User Achievements/Badges
CREATE TABLE public.user_achievements (
    achievement_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.user_accounts(user_id) ON DELETE CASCADE,
    badge_type VARCHAR(50) NOT NULL, -- 'first_experiment', 'phi_master_0.9', 'quantum_pioneer'
    badge_title VARCHAR(100),
    badge_description TEXT,
    badge_icon_url TEXT,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb -- Additional context
);
```

---

### 1.3 Social Features

```sql
-- ============================================================================
-- SOCIAL GRAPH & INTERACTIONS
-- ============================================================================

-- 1. Follower System
CREATE TABLE public.user_follows (
    follower_id UUID REFERENCES public.user_accounts(user_id) ON DELETE CASCADE,
    following_id UUID REFERENCES public.user_accounts(user_id) ON DELETE CASCADE,
    followed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (follower_id, following_id),
    CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

-- 2. Activity Feed
CREATE TABLE public.user_activities (
    activity_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.user_accounts(user_id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL, -- 'experiment_created', 'phi_milestone', 'organism_evolved'
    activity_title VARCHAR(200),
    activity_description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb, -- Experiment ID, Φ value, etc.
    visibility VARCHAR(20) DEFAULT 'public',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_activities_user_type ON public.user_activities(user_id, activity_type);
CREATE INDEX idx_user_activities_created ON public.user_activities(created_at DESC);

-- 3. Comments/Annotations
CREATE TABLE public.experiment_comments (
    comment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organism_id UUID REFERENCES public.organisms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_accounts(user_id) ON DELETE CASCADE,
    comment_text TEXT CHECK (LENGTH(comment_text) <= 1000),
    parent_comment_id UUID REFERENCES public.experiment_comments(comment_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);
```

---

### 1.4 Row-Level Security (RLS) Policies

```sql
-- ============================================================================
-- SECURITY POLICIES (Supabase RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE public.user_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quantum_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organisms ENABLE ROW LEVEL SECURITY;

-- User Accounts: Users can view their own, admins can view all
CREATE POLICY "Users can view own account"
    ON public.user_accounts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all accounts"
    ON public.user_accounts FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.roles r ON ur.role_id = r.role_id
            WHERE ur.user_id = auth.uid() AND r.role_name = 'admin'
        )
    );

-- Profiles: Public visibility check
CREATE POLICY "Public profiles are viewable"
    ON public.user_profiles FOR SELECT
    USING (visibility = 'public');

CREATE POLICY "Users can view own profile"
    ON public.user_profiles FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Followers can view followers-only profiles"
    ON public.user_profiles FOR SELECT
    USING (
        visibility = 'followers' AND EXISTS (
            SELECT 1 FROM public.user_follows
            WHERE following_id = user_profiles.user_id
            AND follower_id = auth.uid()
        )
    );

-- Organisms: User can see own + public + shared
CREATE POLICY "Users can view own organisms"
    ON public.organisms FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Public organisms viewable by all"
    ON public.organisms FOR SELECT
    USING (visibility = 'public');

-- Activities: Feed based on follows
CREATE POLICY "Users can view followed activities"
    ON public.user_activities FOR SELECT
    USING (
        visibility = 'public' OR
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.user_follows
            WHERE following_id = user_activities.user_id
            AND follower_id = auth.uid()
        )
    );
```

---

## Phase 2: API Implementation

### 2.1 Authentication Endpoints

```typescript
// lib/api/auth.ts
import { supabase } from '@/lib/supabase/client'

interface RegisterPayload {
  email: string
  password: string
  username: string
  displayName?: string
}

interface LoginPayload {
  email: string
  password: string
}

export const authAPI = {
  // Register new user
  async register(payload: RegisterPayload) {
    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
    })

    if (authError) throw authError

    // 2. Create user_account
    const { error: accountError } = await supabase
      .from('user_accounts')
      .insert({
        user_id: authData.user!.id,
        username: payload.username,
        email: payload.email,
      })

    if (accountError) throw accountError

    // 3. Create user_profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: authData.user!.id,
        display_name: payload.displayName || payload.username,
      })

    if (profileError) throw profileError

    // 4. Assign default role
    const { data: roleData } = await supabase
      .from('roles')
      .select('role_id')
      .eq('role_name', 'researcher')
      .single()

    await supabase.from('user_roles').insert({
      user_id: authData.user!.id,
      role_id: roleData!.role_id,
    })

    return authData.user
  },

  // Login
  async login(payload: LoginPayload) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: payload.email,
      password: payload.password,
    })

    if (error) throw error

    // Update last_login
    await supabase
      .from('user_accounts')
      .update({ last_login: new Date().toISOString() })
      .eq('user_id', data.user.id)

    return data
  },

  // Logout
  async logout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // Get current session
  async getSession() {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    return data.session
  },
}
```

---

### 2.2 Profile Management Endpoints

```typescript
// lib/api/profiles.ts
import { supabase } from '@/lib/supabase/client'

export interface UserProfile {
  profile_id: string
  user_id: string
  display_name: string
  username: string
  avatar_url?: string
  bio?: string
  affiliation?: string
  research_interests: string[]
  visibility: 'public' | 'followers' | 'private'
}

export const profileAPI = {
  // Get own profile
  async getMyProfile(): Promise<UserProfile | null> {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) return null

    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        *,
        user_accounts!inner(username, email)
      `)
      .eq('user_id', user.user.id)
      .single()

    if (error) throw error
    return data
  },

  // Get profile by username
  async getProfileByUsername(username: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        *,
        user_accounts!inner(username)
      `)
      .eq('user_accounts.username', username)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }

    return data
  },

  // Update own profile
  async updateProfile(updates: Partial<UserProfile>) {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.user.id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Upload avatar
  async uploadAvatar(file: File): Promise<string> {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) throw new Error('Not authenticated')

    const fileExt = file.name.split('.').pop()
    const fileName = `${user.user.id}-${Date.now()}.${fileExt}`
    const filePath = `avatars/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('user-content')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    const { data } = supabase.storage
      .from('user-content')
      .getPublicUrl(filePath)

    // Update profile with new avatar URL
    await this.updateProfile({ avatar_url: data.publicUrl })

    return data.publicUrl
  },
}
```

---

### 2.3 Quantum Stats Endpoints

```typescript
// lib/api/quantum-stats.ts
import { supabase } from '@/lib/supabase/client'

export interface QuantumStats {
  user_id: string
  total_experiments: number
  total_quantum_jobs: number
  total_organisms_evolved: number
  highest_phi_achieved: number
  consciousness_index: number
  reputation_score: number
}

export const quantumStatsAPI = {
  // Get user's quantum stats
  async getUserStats(userId: string): Promise<QuantumStats | null> {
    const { data, error } = await supabase
      .from('user_quantum_stats')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }

    return data
  },

  // Update stats after experiment
  async updateStatsAfterExperiment(params: {
    userId: string
    phi: number
    runtimeHours: number
    costUsd: number
  }) {
    const { data: currentStats } = await supabase
      .from('user_quantum_stats')
      .select('*')
      .eq('user_id', params.userId)
      .single()

    const newTotalExperiments = (currentStats?.total_experiments || 0) + 1
    const newHighestPhi = Math.max(
      currentStats?.highest_phi_achieved || 0,
      params.phi
    )

    // Calculate new consciousness index (weighted average)
    const oldIndex = currentStats?.consciousness_index || 0
    const oldCount = currentStats?.total_experiments || 0
    const newIndex =
      (oldIndex * oldCount + params.phi) / (oldCount + 1)

    const { data, error } = await supabase
      .from('user_quantum_stats')
      .upsert({
        user_id: params.userId,
        total_experiments: newTotalExperiments,
        highest_phi_achieved: newHighestPhi,
        consciousness_index: newIndex,
        total_ibm_runtime_hours:
          (currentStats?.total_ibm_runtime_hours || 0) + params.runtimeHours,
        total_cost_usd: (currentStats?.total_cost_usd || 0) + params.costUsd,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    // Check for achievements
    await this.checkAndAwardAchievements(params.userId, newHighestPhi)

    return data
  },

  // Check and award achievements
  async checkAndAwardAchievements(userId: string, phi: number) {
    const achievements = []

    if (phi >= 0.9) {
      achievements.push({
        user_id: userId,
        badge_type: 'phi_master_0.9',
        badge_title: 'Φ Master (0.9+)',
        badge_description: 'Achieved consciousness level of 0.9 or higher',
        badge_icon_url: '/badges/phi-master-0.9.svg',
      })
    }

    if (phi >= 0.95) {
      achievements.push({
        user_id: userId,
        badge_type: 'phi_virtuoso_0.95',
        badge_title: 'Φ Virtuoso (0.95+)',
        badge_description: 'Achieved consciousness level of 0.95 or higher',
        badge_icon_url: '/badges/phi-virtuoso-0.95.svg',
      })
    }

    if (achievements.length > 0) {
      await supabase
        .from('user_achievements')
        .upsert(achievements, { onConflict: 'user_id,badge_type' })
    }
  },

  // Get leaderboard
  async getLeaderboard(limit: number = 10) {
    const { data, error } = await supabase
      .from('user_quantum_stats')
      .select(`
        *,
        user_accounts!inner(username),
        user_profiles!inner(display_name, avatar_url)
      `)
      .order('consciousness_index', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  },
}
```

---

## Phase 3: Frontend Components

### 3.1 User Profile Page

```typescript
// app/profile/[username]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { profileAPI, quantumStatsAPI } from '@/lib/api'
import type { UserProfile, QuantumStats } from '@/lib/api'

export default function ProfilePage({
  params,
}: {
  params: { username: string }
}) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<QuantumStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfile()
  }, [params.username])

  async function loadProfile() {
    try {
      const profileData = await profileAPI.getProfileByUsername(
        params.username
      )
      if (!profileData) {
        // Handle 404
        return
      }

      setProfile(profileData)

      const statsData = await quantumStatsAPI.getUserStats(
        profileData.user_id
      )
      setStats(statsData)
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading profile...</div>
  }

  if (!profile) {
    return <div>Profile not found</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Profile Header */}
      <div className="bg-black/40 border border-[#00FFD1]/20 rounded-lg p-6">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <img
            src={profile.avatar_url || '/default-avatar.png'}
            alt={profile.display_name}
            className="w-32 h-32 rounded-full border-2 border-[#00FFD1]"
          />

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-[#00FFD1]">
              {profile.display_name}
            </h1>
            <p className="text-gray-400">@{params.username}</p>

            {profile.affiliation && (
              <p className="text-sm text-gray-300 mt-2">
                📚 {profile.affiliation}
              </p>
            )}

            {profile.bio && (
              <p className="text-gray-200 mt-4">{profile.bio}</p>
            )}

            {/* Research Interests */}
            {profile.research_interests.length > 0 && (
              <div className="flex gap-2 mt-4">
                {profile.research_interests.map((interest) => (
                  <span
                    key={interest}
                    className="px-3 py-1 bg-[#00FFD1]/10 border border-[#00FFD1]/30 rounded-full text-sm"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quantum Statistics */}
      {stats && (
        <div className="grid grid-cols-3 gap-4 mt-6">
          <StatCard
            label="Experiments"
            value={stats.total_experiments}
            icon="🧪"
          />
          <StatCard
            label="Organisms Evolved"
            value={stats.total_organisms_evolved}
            icon="🧬"
          />
          <StatCard
            label="Highest Φ"
            value={stats.highest_phi_achieved.toFixed(3)}
            icon="✨"
          />
          <StatCard
            label="Consciousness Index"
            value={stats.consciousness_index.toFixed(3)}
            icon="🧠"
          />
          <StatCard
            label="Quantum Jobs"
            value={stats.total_quantum_jobs}
            icon="⚛️"
          />
          <StatCard
            label="Reputation"
            value={stats.reputation_score}
            icon="⭐"
          />
        </div>
      )}
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string
  value: string | number
  icon: string
}) {
  return (
    <div className="bg-black/40 border border-[#00FFD1]/20 rounded-lg p-4">
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-2xl font-bold text-[#00FFD1]">{value}</div>
      <div className="text-sm text-gray-400">{label}</div>
    </div>
  )
}
```

---

### 3.2 Edit Profile Component

```typescript
// components/EditProfileModal.tsx
'use client'

import { useState } from 'react'
import { profileAPI } from '@/lib/api'
import type { UserProfile } from '@/lib/api'

export function EditProfileModal({
  profile,
  onClose,
  onSave,
}: {
  profile: UserProfile
  onClose: () => void
  onSave: (updated: UserProfile) => void
}) {
  const [formData, setFormData] = useState({
    display_name: profile.display_name,
    bio: profile.bio || '',
    affiliation: profile.affiliation || '',
    research_interests: profile.research_interests.join(', '),
  })
  const [uploading, setUploading] = useState(false)

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || !e.target.files[0]) return

    setUploading(true)
    try {
      const file = e.target.files[0]
      const avatarUrl = await profileAPI.uploadAvatar(file)
      onSave({ ...profile, avatar_url: avatarUrl })
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    try {
      const updated = await profileAPI.updateProfile({
        display_name: formData.display_name,
        bio: formData.bio,
        affiliation: formData.affiliation,
        research_interests: formData.research_interests
          .split(',')
          .map((i) => i.trim())
          .filter(Boolean),
      })

      onSave(updated)
      onClose()
    } catch (error) {
      console.error('Update failed:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-[#00FFD1]/30 rounded-lg p-6 max-w-2xl w-full">
        <h2 className="text-2xl font-bold text-[#00FFD1] mb-4">
          Edit Profile
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar Upload */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">Avatar</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="w-full"
              disabled={uploading}
            />
            {uploading && <p className="text-sm text-gray-400 mt-1">Uploading...</p>}
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={formData.display_name}
              onChange={(e) =>
                setFormData({ ...formData, display_name: e.target.value })
              }
              className="w-full bg-black/40 border border-[#00FFD1]/30 rounded px-3 py-2 text-white"
              required
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
              className="w-full bg-black/40 border border-[#00FFD1]/30 rounded px-3 py-2 text-white h-24"
              maxLength={500}
            />
          </div>

          {/* Affiliation */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Affiliation
            </label>
            <input
              type="text"
              value={formData.affiliation}
              onChange={(e) =>
                setFormData({ ...formData, affiliation: e.target.value })
              }
              className="w-full bg-black/40 border border-[#00FFD1]/30 rounded px-3 py-2 text-white"
              placeholder="University or Company"
            />
          </div>

          {/* Research Interests */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Research Interests (comma-separated)
            </label>
            <input
              type="text"
              value={formData.research_interests}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  research_interests: e.target.value,
                })
              }
              className="w-full bg-black/40 border border-[#00FFD1]/30 rounded px-3 py-2 text-white"
              placeholder="Quantum ML, NISQ Algorithms, etc."
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-[#00FFD1] text-black px-6 py-2 rounded font-semibold hover:bg-[#00FFD1]/90"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-[#00FFD1]/30 text-white px-6 py-2 rounded hover:bg-white/5"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
```

---

## Phase 4: Security Implementation

### 4.1 Middleware for Protected Routes

```typescript
// middleware.ts (Next.js middleware)
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protect /profile/edit routes
  if (req.nextUrl.pathname.startsWith('/profile/edit')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  // Protect /admin routes (check for admin role)
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('roles!inner(role_name)')
      .eq('user_id', session.user.id)

    const isAdmin = userRoles?.some(
      (ur: any) => ur.roles.role_name === 'admin'
    )

    if (!isAdmin) {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  return res
}

export const config = {
  matcher: ['/profile/edit/:path*', '/admin/:path*'],
}
```

---

### 4.2 Rate Limiting (API Routes)

```typescript
// lib/rate-limit.ts
import { LRUCache } from 'lru-cache'

type Options = {
  uniqueTokenPerInterval?: number
  interval?: number
}

export default function rateLimit(options?: Options) {
  const tokenCache = new LRUCache({
    max: options?.uniqueTokenPerInterval || 500,
    ttl: options?.interval || 60000,
  })

  return {
    check: (res: Response, limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const tokenCount = (tokenCache.get(token) as number[]) || [0]
        if (tokenCount[0] === 0) {
          tokenCache.set(token, tokenCount)
        }
        tokenCount[0] += 1

        const currentUsage = tokenCount[0]
        const isRateLimited = currentUsage >= limit
        res.headers.set('X-RateLimit-Limit', limit.toString())
        res.headers.set(
          'X-RateLimit-Remaining',
          isRateLimited ? '0' : (limit - currentUsage).toString()
        )

        return isRateLimited ? reject() : resolve()
      }),
  }
}

// Usage in API route:
// app/api/auth/login/route.ts
import rateLimit from '@/lib/rate-limit'

const limiter = rateLimit({
  interval: 60 * 1000, // 60 seconds
  uniqueTokenPerInterval: 500,
})

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown'

  try {
    await limiter.check(new Response(), 5, ip) // 5 attempts per minute
  } catch {
    return new Response('Too many requests', { status: 429 })
  }

  // ... rest of login logic
}
```

---

## Phase 5: Integration with Existing Platform

### 5.1 Update Organisms Table

```sql
-- Add user tracking to existing organisms
ALTER TABLE public.organisms
    ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.user_accounts(user_id),
    ADD COLUMN IF NOT EXISTS visibility VARCHAR(20) DEFAULT 'public',
    ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS description TEXT;

-- Create index for user organisms
CREATE INDEX IF NOT EXISTS idx_organisms_user_id ON public.organisms(user_id);
CREATE INDEX IF NOT EXISTS idx_organisms_visibility ON public.organisms(visibility);
```

---

### 5.2 Track Quantum Jobs Per User

```sql
-- Add user tracking to quantum jobs
ALTER TABLE public.quantum_jobs
    ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.user_accounts(user_id);

CREATE INDEX IF NOT EXISTS idx_quantum_jobs_user_id ON public.quantum_jobs(user_id);

-- Function to auto-update user stats after job completion
CREATE OR REPLACE FUNCTION update_user_stats_on_job_complete()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        UPDATE public.user_quantum_stats
        SET
            total_quantum_jobs = total_quantum_jobs + 1,
            updated_at = NOW()
        WHERE user_id = NEW.user_id;

        -- Create activity
        INSERT INTO public.user_activities (
            user_id,
            activity_type,
            activity_title,
            metadata
        ) VALUES (
            NEW.user_id,
            'quantum_job_completed',
            'Completed quantum job',
            jsonb_build_object(
                'job_id', NEW.job_id,
                'backend', NEW.backend_name,
                'phi', NEW.consciousness_metrics->'phi'
            )
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_stats_on_job_complete
AFTER UPDATE ON public.quantum_jobs
FOR EACH ROW
EXECUTE FUNCTION update_user_stats_on_job_complete();
```

---

## Phase 6: Deployment Checklist

### 6.1 Database Migrations

```bash
# Run migrations in Supabase SQL Editor or via CLI
cd /home/dev/dnalang-ibm-cloud/experimental_suite/deployment/quantumlm-vercel

# 1. Create migration file
cat > supabase/migrations/002_user_accounts.sql << 'EOF'
-- Run all Phase 1 SQL from this document
EOF

# 2. Apply migration
npx supabase db push

# 3. Verify tables
npx supabase db diff
```

---

### 6.2 Environment Variables

```bash
# Add to .env.local
NEXT_PUBLIC_SUPABASE_URL=https://dnculjsqwigkivykedcf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional: OAuth providers
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...
NEXT_PUBLIC_GITHUB_CLIENT_ID=...
```

---

### 6.3 Storage Buckets

```bash
# Create storage bucket for user content
npx supabase storage create user-content --public

# Set up storage policies
npx supabase storage update user-content --policy "Users can upload their own content"
```

---

## Phase 7: Testing Strategy

### 7.1 Unit Tests

```typescript
// __tests__/api/profiles.test.ts
import { profileAPI } from '@/lib/api/profiles'

describe('Profile API', () => {
  it('should create a new profile', async () => {
    const profile = await profileAPI.updateProfile({
      display_name: 'Test User',
      bio: 'Test bio',
    })

    expect(profile).toHaveProperty('display_name', 'Test User')
  })

  it('should validate bio length', async () => {
    await expect(
      profileAPI.updateProfile({
        bio: 'a'.repeat(501), // Exceeds 500 char limit
      })
    ).rejects.toThrow()
  })
})
```

---

### 7.2 Integration Tests

```typescript
// __tests__/integration/auth-flow.test.ts
import { authAPI, profileAPI } from '@/lib/api'

describe('Authentication Flow', () => {
  it('should register, login, and fetch profile', async () => {
    // 1. Register
    const user = await authAPI.register({
      email: 'test@example.com',
      password: 'SecurePassword123!',
      username: 'testuser',
      displayName: 'Test User',
    })

    expect(user).toHaveProperty('id')

    // 2. Login
    const session = await authAPI.login({
      email: 'test@example.com',
      password: 'SecurePassword123!',
    })

    expect(session.user).toHaveProperty('email', 'test@example.com')

    // 3. Fetch profile
    const profile = await profileAPI.getMyProfile()

    expect(profile).toHaveProperty('display_name', 'Test User')
  })
})
```

---

## Phase 8: Future Enhancements

### 8.1 Social Features (Phase 2)

- **Activity Feed**: Display experiments from followed users
- **Notifications**: Alert users when someone follows or comments
- **Collaborative Experiments**: Share organism editing with team members
- **Discussion Forums**: Community discussions around quantum experiments

### 8.2 Gamification (Phase 3)

- **Achievement System**: Unlock badges for milestones
- **Leaderboards**: Top researchers by Φ, experiments, etc.
- **Weekly Challenges**: Community-wide quantum challenges
- **Reputation Economy**: Earn points for contributions

### 8.3 Advanced Analytics (Phase 4)

- **Personal Dashboard**: Charts showing Φ evolution over time
- **Experiment Insights**: AI-powered suggestions for improvements
- **Peer Comparison**: Compare your stats with similar researchers
- **Export Reports**: Generate PDF reports of experiments

---

## Summary

### What You'll Have After Implementation

**User System**:
- ✅ Secure authentication (Supabase Auth + JWT)
- ✅ User profiles with quantum research metrics
- ✅ Role-based access control (Admin/Researcher/Viewer)
- ✅ Social features (Follow, Activity Feed, Comments)
- ✅ Achievement/Badge system
- ✅ Leaderboards

**Integration**:
- ✅ Per-user organism tracking
- ✅ Per-user quantum job history
- ✅ Automatic stats updates
- ✅ Wallet address storage (for tokenomics)

**Security**:
- ✅ Row-Level Security (RLS)
- ✅ Rate limiting on auth endpoints
- ✅ Input sanitization
- ✅ Protected routes via middleware

**Performance**:
- ✅ Indexed database queries
- ✅ Optimistic UI updates
- ✅ Cached profile data
- ✅ Efficient RLS policies

---

## Implementation Timeline

| Phase | Duration | Tasks |
|-------|----------|-------|
| **Phase 1** | Week 1 | Database schema + RLS policies |
| **Phase 2** | Week 2 | API endpoints (auth, profiles, stats) |
| **Phase 3** | Week 3 | Frontend components (profile page, edit modal) |
| **Phase 4** | Week 4 | Security (middleware, rate limiting) |
| **Phase 5** | Week 5 | Integration with existing organisms/jobs |
| **Phase 6** | Week 6 | Testing + deployment |

**Total**: 6 weeks for complete multi-user platform

---

## Next Steps

1. **Review this document** - Ensure alignment with your vision
2. **Run Phase 1 migrations** - Create database schema
3. **Implement Phase 2 APIs** - Build backend logic
4. **Build Phase 3 UI** - Create profile pages
5. **Test thoroughly** - Ensure security and performance
6. **Deploy to production** - Launch multi-user features

---

**ΛΦ = 2.176435×10⁻⁸ s⁻¹**

**"From single user to quantum community. From experiments to social science. From platform to ecosystem."**

**Ready to build the future of quantum research collaboration.** 🚀

---

**Last Updated**: November 19, 2025
**Platform**: www.dnalang.dev
**Status**: Implementation Plan Ready
