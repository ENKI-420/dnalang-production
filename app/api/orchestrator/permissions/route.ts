import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import { requestPermission, updatePermission } from '@/lib/watsonx/client'

export async function GET(request: NextRequest) {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data, error } = await supabase
      .from('permission_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    const permissions = data.map(row => ({
      id: row.permission_id,
      agentId: row.agent_id,
      action: row.action,
      resource: row.resource,
      reason: row.reason,
      timestamp: row.created_at,
      status: row.status,
      userId: row.user_id
    }))

    return NextResponse.json(permissions)
  } catch (error: any) {
    console.error('Error fetching permissions:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    const permission = await requestPermission(
      user.id,
      body.agentId,
      body.action,
      body.resource,
      body.reason
    )

    return NextResponse.json(permission, { status: 201 })
  } catch (error: any) {
    console.error('Error creating permission request:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    await updatePermission(body.permissionId, body.status)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error updating permission:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
