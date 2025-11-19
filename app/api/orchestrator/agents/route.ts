import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import type { WatsonxAgent } from '@/lib/watsonx/client'

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
      .from('watsonx_agents')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    const agents: WatsonxAgent[] = data.map(row => ({
      id: row.agent_id,
      name: row.name,
      type: row.type,
      status: row.status,
      capabilities: row.capabilities || [],
      trust: row.trust,
      permissions: row.permissions || [],
      performance: row.performance,
      watsonxModel: row.watsonx_model,
      quantumBackend: row.quantum_backend
    }))

    return NextResponse.json(agents)
  } catch (error: any) {
    console.error('Error fetching agents:', error)
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

    const agent = {
      user_id: user.id,
      agent_id: `agent-${Date.now()}`,
      name: body.name,
      type: body.type,
      status: body.status || 'idle',
      capabilities: body.capabilities || [],
      trust: body.trust || 0.5,
      permissions: body.permissions || [],
      performance: body.performance || {
        tasksCompleted: 0,
        successRate: 0,
        avgExecutionTime: 0
      },
      watsonx_model: body.watsonxModel,
      quantum_backend: body.quantumBackend
    }

    const { data, error } = await supabase
      .from('watsonx_agents')
      .insert(agent)
      .select()
      .single()

    if (error) throw error

    const created: WatsonxAgent = {
      id: data.agent_id,
      name: data.name,
      type: data.type,
      status: data.status,
      capabilities: data.capabilities,
      trust: data.trust,
      permissions: data.permissions,
      performance: data.performance,
      watsonxModel: data.watsonx_model,
      quantumBackend: data.quantum_backend
    }

    return NextResponse.json(created, { status: 201 })
  } catch (error: any) {
    console.error('Error creating agent:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
