import { NextRequest, NextResponse } from 'next/server'
import { getActivityLogs, logActivity } from '@/lib/watsonx/client'
import type { ActivityLog } from '@/lib/watsonx/client'

// Dynamic import to avoid build-time errors
function getSupabase() {
  const { supabase } = require('@/lib/supabase/client')
  return supabase
}

export async function GET(request: NextRequest) {
  try {
    const { data: { user } } = await getSupabase().auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')

    const activities = await getActivityLogs(user.id, limit)

    return NextResponse.json(activities)
  } catch (error: any) {
    console.error('Error fetching activities:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { data: { user } } = await getSupabase().auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    const activity: ActivityLog = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
      agentId: body.agentId,
      userId: user.id,
      action: body.action,
      result: body.result || 'pending',
      details: body.details,
      impactScore: body.impactScore || 5.0,
      metadata: body.metadata
    }

    await logActivity(activity)

    return NextResponse.json(activity, { status: 201 })
  } catch (error: any) {
    console.error('Error logging activity:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
