import { NextRequest, NextResponse } from 'next/server'
import { getUserProfile, upsertUserProfile } from '@/lib/watsonx/client'

// Dynamic import to avoid build-time errors
function getSupabase() {
  const { supabase } = require('@/lib/supabase/client')
  return supabase
}

export async function GET(request: NextRequest) {
  try {
    // Get current user
    const { data: { user } } = await getSupabase().auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user profile
    const profile = await getUserProfile(user.id)

    if (!profile) {
      // Create default profile
      const defaultProfile = {
        userId: user.id,
        preferences: {
          taskPriority: 'balanced' as const,
          quantumBackend: 'ibm_fez',
          autoOptimize: true,
          learningRate: 0.8
        },
        insights: {
          workPatterns: [],
          commonTasks: [],
          efficiencyGains: 0
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      await upsertUserProfile(defaultProfile)
      return NextResponse.json(defaultProfile)
    }

    return NextResponse.json(profile)
  } catch (error: any) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { data: { user } } = await getSupabase().auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    const profile = {
      userId: user.id,
      preferences: body.preferences,
      insights: body.insights,
      createdAt: body.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const updated = await upsertUserProfile(profile)
    return NextResponse.json(updated)
  } catch (error: any) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
