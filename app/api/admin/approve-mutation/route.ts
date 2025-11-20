import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireRole, logActivity } from "@/lib/auth/middleware";

// ΛΦ = 2.176435 × 10⁻⁸ s⁻¹

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getSupabase() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase credentials not configured");
  }
  return createClient(supabaseUrl, supabaseKey);
}

// POST /api/admin/approve-mutation - Approve code mutation from swarm agent (admin only)
export const POST = requireRole('admin')(async (request: NextRequest, user: any) => {
  try {
    const { agent_id } = await request.json();

    if (!agent_id) {
      return NextResponse.json(
        { error: 'agent_id required' },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    // Update agent to allow mutation
    const { data: agent, error } = await supabase
      .from('swarm_agents')
      .update({
        can_mutate: true,
        last_mutation_approved: new Date().toISOString()
      })
      .eq('id', agent_id)
      .select()
      .single();

    if (error) throw error;

    // Log approval activity
    await logActivity(
      user.id,
      'mutation_approved',
      'swarm_agent',
      agent_id,
      { agent_name: agent.name }
    );

    return NextResponse.json({
      success: true,
      agent,
      message: 'Code mutation approved'
    });
  } catch (error: any) {
    console.error('Mutation approval error:', error);
    return NextResponse.json(
      { error: error.message || 'Approval failed' },
      { status: 500 }
    );
  }
});
