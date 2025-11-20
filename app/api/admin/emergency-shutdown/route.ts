import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireRole, logSecurityEvent } from "@/lib/auth/middleware";

// ΛΦ = 2.176435 × 10⁻⁸ s⁻¹

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getSupabase() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase credentials not configured");
  }
  return createClient(supabaseUrl, supabaseKey);
}

// POST /api/admin/emergency-shutdown - Emergency shutdown all quantum jobs and agents (admin only)
export const POST = requireRole('admin')(async (request: NextRequest, user: any) => {
  try {
    const supabase = getSupabase();

    // Set all swarm agents to error state
    await supabase
      .from('swarm_agents')
      .update({ status: 'error', current_task: 'EMERGENCY_SHUTDOWN' })
      .neq('status', 'idle');

    // Cancel all pending swarm tasks
    await supabase
      .from('swarm_tasks')
      .update({ status: 'cancelled' })
      .in('status', ['pending', 'in_progress']);

    // Log critical security event
    await logSecurityEvent(
      user.id,
      'suspicious_activity',
      { action: 'emergency_shutdown', timestamp: new Date().toISOString() },
      'critical'
    );

    return NextResponse.json({
      success: true,
      message: 'Emergency shutdown executed',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Emergency shutdown error:', error);
    return NextResponse.json(
      { error: error.message || 'Shutdown failed' },
      { status: 500 }
    );
  }
});
