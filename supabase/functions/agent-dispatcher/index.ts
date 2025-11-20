// ============================================================================
// Agent Dispatcher Edge Function
// Dispatches agent tasks to Python worker queue
// ============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AgentTask {
  agent_type: 'architect' | 'coder' | 'quantum' | 'admin';
  task_type: 'plan' | 'code' | 'test' | 'deploy' | 'quantum_execute';
  task_payload: Record<string, unknown>;
  priority?: number;
  session_id?: string;
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
    const { agent_type, task_type, task_payload, priority = 5, session_id }: AgentTask =
      await req.json();

    // Validate required fields
    if (!agent_type || !task_type) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: agent_type, task_type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if session_id belongs to user
    if (session_id) {
      const { data: session, error: sessionError } = await supabaseClient
        .from('arena_sessions')
        .select('user_id')
        .eq('session_id', session_id)
        .single();

      if (sessionError || !session || session.user_id !== user.id) {
        return new Response(
          JSON.stringify({ error: 'Invalid session_id or unauthorized' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Insert task into queue
    const { data: task, error: insertError } = await supabaseClient
      .from('task_queue')
      .insert({
        user_id: user.id,
        session_id: session_id,
        task_type: `${agent_type}:${task_type}`,
        task_payload: task_payload,
        priority: priority,
        status: 'pending',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Task insertion error:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to dispatch task', details: insertError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log agent event
    if (session_id) {
      await supabaseClient
        .from('agent_events')
        .insert({
          session_id: session_id,
          agent_id: task.task_id,
          agent_type: agent_type,
          event_type: 'task_dispatched',
          event_data: {
            task_id: task.task_id,
            task_type: task_type,
            priority: priority,
          },
          level: 'info',
        });
    }

    return new Response(
      JSON.stringify({
        success: true,
        task_id: task.task_id,
        message: `Task dispatched to ${agent_type} agent`,
        task: task,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Agent dispatcher error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
