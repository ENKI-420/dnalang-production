// ============================================================================
// Commit Writer Edge Function
// Writes code commits from Aura Arena agents to database
// ============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHash } from "https://deno.land/std@0.168.0/hash/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CommitRequest {
  session_id: string;
  commit_message: string;
  author: string;
  files_changed: number;
  additions: number;
  deletions: number;
  diff: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get user from JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Verify user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const {
      session_id,
      commit_message,
      author,
      files_changed,
      additions,
      deletions,
      diff,
    }: CommitRequest = await req.json();

    // Validate required fields
    if (!session_id || !commit_message || !diff) {
      return new Response(
        JSON.stringify({
          error: 'Missing required fields: session_id, commit_message, diff'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify session belongs to user
    const { data: session, error: sessionError } = await supabaseClient
      .from('arena_sessions')
      .select('user_id, session_name')
      .eq('session_id', session_id)
      .single();

    if (sessionError || !session || session.user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Invalid session_id or unauthorized' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate commit hash
    const hash = createHash("sha256");
    hash.update(
      `${session_id}${commit_message}${author}${Date.now()}${diff.substring(0, 100)}`
    );
    const commit_hash = hash.toString();

    // Insert commit
    const { data: commit, error: insertError } = await supabaseClient
      .from('commit_logs')
      .insert({
        session_id: session_id,
        user_id: user.id,
        commit_hash: commit_hash,
        commit_message: commit_message,
        author: author || 'Aura Agent',
        files_changed: files_changed || 0,
        additions: additions || 0,
        deletions: deletions || 0,
        diff: diff,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Commit insertion error:', insertError);
      return new Response(
        JSON.stringify({
          error: 'Failed to write commit',
          details: insertError.message
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update session commit count
    await supabaseClient.rpc('increment_session_commits', {
      p_session_id: session_id,
    });

    // Log agent event
    await supabaseClient
      .from('agent_events')
      .insert({
        session_id: session_id,
        agent_id: `commit_${commit.commit_id}`,
        agent_type: 'coder',
        event_type: 'commit',
        event_data: {
          commit_id: commit.commit_id,
          commit_hash: commit_hash,
          files_changed: files_changed,
          additions: additions,
          deletions: deletions,
          message: commit_message,
        },
        level: 'info',
      });

    return new Response(
      JSON.stringify({
        success: true,
        commit_id: commit.commit_id,
        commit_hash: commit_hash,
        message: 'Commit written successfully',
        session: session.session_name,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Commit writer error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
