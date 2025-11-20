import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAuth, logActivity } from "@/lib/auth/middleware";

// ΛΦ = 2.176435 × 10⁻⁸ s⁻¹

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getSupabase() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase credentials not configured");
  }
  return createClient(supabaseUrl, supabaseKey);
}

// POST /api/swarm/commit-mutation - Commit code mutation to repository
export const POST = requireAuth(async (request: NextRequest, user: any) => {
  try {
    const { code, filename, commit_message } = await request.json();

    if (!code || !filename) {
      return NextResponse.json(
        { error: 'code and filename required' },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    // Store code artifact
    const { data: artifact, error: artifactError } = await supabase
      .from('code_artifacts')
      .insert({
        user_id: user.id,
        filename,
        code,
        language: filename.endsWith('.tsx') || filename.endsWith('.ts') ? 'typescript' : 'javascript',
        version: 1,
        metadata: {
          commit_message: commit_message || 'Recursive mutation via NLP2 Arena',
          lambda_phi: 2.176435e-8
        }
      })
      .select()
      .single();

    if (artifactError) throw artifactError;

    // Log self-building activity
    await supabase
      .from('self_building_pipeline')
      .insert({
        trigger_type: 'manual_nlp2',
        status: 'pending',
        target_file: filename,
        modifications: {
          artifact_id: artifact.id,
          user_id: user.id,
          timestamp: new Date().toISOString()
        }
      });

    // Log activity
    await logActivity(
      user.id,
      'code_mutation_committed',
      'code_artifact',
      artifact.id,
      { filename, commit_message }
    );

    // In production, this would trigger GitHub commit via API
    // For now, we simulate the commit SHA
    const commit_sha = `sim_${Date.now()}_${artifact.id.substring(0, 8)}`;

    return NextResponse.json({
      success: true,
      artifact_id: artifact.id,
      commit_sha,
      message: 'Code mutation committed successfully'
    });
  } catch (error: any) {
    console.error('Commit mutation error:', error);
    return NextResponse.json(
      { error: error.message || 'Commit failed' },
      { status: 500 }
    );
  }
});
