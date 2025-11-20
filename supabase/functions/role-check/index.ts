// ============================================================================
// Role Check Edge Function
// Verifies user roles and permissions for RBAC
// ============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RoleCheckRequest {
  required_permission?: string; // e.g., "experiments:create", "arena:view"
  required_role?: string; // e.g., "admin", "researcher"
}

interface RoleInfo {
  role_id: number;
  role_name: string;
  permissions: string[];
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

    // Parse request body (optional)
    let required_permission: string | undefined;
    let required_role: string | undefined;

    if (req.method === 'POST') {
      const body: RoleCheckRequest = await req.json();
      required_permission = body.required_permission;
      required_role = body.required_role;
    }

    // Get user roles with join
    const { data: userRoles, error: rolesError } = await supabaseClient
      .from('user_roles')
      .select(`
        role_id,
        roles (
          role_id,
          role_name,
          permissions
        )
      `)
      .eq('user_id', user.id);

    if (rolesError) {
      console.error('Roles query error:', rolesError);
      return new Response(
        JSON.stringify({
          error: 'Failed to fetch user roles',
          details: rolesError.message
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract role information
    const roles: RoleInfo[] = userRoles
      ?.map(ur => ur.roles as unknown as RoleInfo)
      .filter(r => r) || [];

    if (roles.length === 0) {
      return new Response(
        JSON.stringify({
          authorized: false,
          message: 'No roles assigned to user',
          roles: [],
          permissions: [],
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Aggregate all permissions
    const allPermissions = new Set<string>();
    roles.forEach(role => {
      if (Array.isArray(role.permissions)) {
        role.permissions.forEach(p => allPermissions.add(p));
      }
    });

    // Check for wildcard admin permission
    const hasWildcard = allPermissions.has('*');

    // Check required permission
    let hasPermission = true;
    if (required_permission) {
      hasPermission = hasWildcard || allPermissions.has(required_permission);
    }

    // Check required role
    let hasRole = true;
    if (required_role) {
      hasRole = roles.some(r => r.role_name === required_role);
    }

    const authorized = hasPermission && hasRole;

    // Get user profile for additional context
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('username, reputation_score')
      .eq('user_id', user.id)
      .single();

    return new Response(
      JSON.stringify({
        authorized: authorized,
        user_id: user.id,
        email: user.email,
        username: profile?.username,
        reputation: profile?.reputation_score || 0,
        roles: roles.map(r => ({
          role_id: r.role_id,
          role_name: r.role_name,
        })),
        permissions: Array.from(allPermissions),
        has_wildcard: hasWildcard,
        checks: {
          required_permission: required_permission,
          has_permission: hasPermission,
          required_role: required_role,
          has_role: hasRole,
        },
      }),
      {
        status: authorized ? 200 : 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Role check error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
