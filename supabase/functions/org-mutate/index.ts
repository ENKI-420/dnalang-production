// ============================================================================
// Organism Mutation Edge Function
// Handles DNALang organism mutation requests with quantum backend execution
// ============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MutationRequest {
  session_id: string;
  organism_genome: string; // DNA-Lang code
  mutation_type: 'evolve' | 'crossover' | 'quantum_enhance' | 'self_heal';
  mutation_parameters?: Record<string, unknown>;
  backend?: string; // IBM Quantum backend
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

    // Check if user has researcher role
    const { data: userRoles } = await supabaseClient
      .from('user_roles')
      .select('role_id')
      .eq('user_id', user.id);

    const hasResearcherRole = userRoles?.some(ur =>
      [1, 2].includes(ur.role_id) // admin=1, researcher=2
    );

    if (!hasResearcherRole) {
      return new Response(
        JSON.stringify({
          error: 'Insufficient permissions',
          message: 'You need researcher role to mutate organisms'
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const {
      session_id,
      organism_genome,
      mutation_type,
      mutation_parameters = {},
      backend = 'ibm_fez',
    }: MutationRequest = await req.json();

    // Validate required fields
    if (!session_id || !organism_genome || !mutation_type) {
      return new Response(
        JSON.stringify({
          error: 'Missing required fields: session_id, organism_genome, mutation_type'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify session belongs to user
    const { data: session, error: sessionError } = await supabaseClient
      .from('arena_sessions')
      .select('session_id, user_id, total_mutations')
      .eq('session_id', session_id)
      .single();

    if (sessionError || !session || session.user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Invalid session_id or unauthorized' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Dispatch mutation task to Python worker
    const { data: task, error: taskError } = await supabaseClient
      .from('task_queue')
      .insert({
        user_id: user.id,
        session_id: session_id,
        task_type: 'organism_mutate',
        task_payload: {
          genome: organism_genome,
          mutation_type: mutation_type,
          parameters: mutation_parameters,
          backend: backend,
        },
        priority: 3, // High priority for mutations
        status: 'pending',
      })
      .select()
      .single();

    if (taskError) {
      console.error('Task creation error:', taskError);
      return new Response(
        JSON.stringify({
          error: 'Failed to dispatch mutation task',
          details: taskError.message
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update session mutation count
    await supabaseClient
      .from('arena_sessions')
      .update({
        total_mutations: (session.total_mutations || 0) + 1,
        last_activity: new Date().toISOString(),
      })
      .eq('session_id', session_id);

    // Log agent event
    await supabaseClient
      .from('agent_events')
      .insert({
        session_id: session_id,
        agent_id: `mutation_${task.task_id}`,
        agent_type: 'quantum',
        event_type: 'mutation',
        event_data: {
          task_id: task.task_id,
          mutation_type: mutation_type,
          backend: backend,
          genome_length: organism_genome.length,
        },
        level: 'info',
      });

    return new Response(
      JSON.stringify({
        success: true,
        task_id: task.task_id,
        mutation_type: mutation_type,
        message: `Organism mutation dispatched to ${backend}`,
        estimated_completion: '2-5 minutes',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Organism mutation error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
