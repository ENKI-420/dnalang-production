import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// ΛΦ = 2.176435 × 10⁻⁸ s⁻¹

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getSupabase() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase credentials not configured");
  }
  return createClient(supabaseUrl, supabaseKey);
}

// Extract user from request
export async function getAuthUser(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const supabase = getSupabase();

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

// Check if user has a specific role
export async function hasRole(userId: string, roleName: string): Promise<boolean> {
  try {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .rpc('has_role', { check_user_id: userId, check_role: roleName });

    if (error) {
      console.error('Role check error:', error);
      return false;
    }

    return data === true;
  } catch (error) {
    console.error('Role check error:', error);
    return false;
  }
}

// Check if user has a specific permission
export async function hasPermission(userId: string, permissionName: string): Promise<boolean> {
  try {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .rpc('has_permission', { check_user_id: userId, check_permission: permissionName });

    if (error) {
      console.error('Permission check error:', error);
      return false;
    }

    return data === true;
  } catch (error) {
    console.error('Permission check error:', error);
    return false;
  }
}

// Middleware wrapper for protecting routes
export function requireAuth(handler: (request: NextRequest, user: any) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return handler(request, user);
  };
}

// Middleware wrapper for requiring specific role
export function requireRole(roleName: string) {
  return (handler: (request: NextRequest, user: any) => Promise<NextResponse>) => {
    return async (request: NextRequest) => {
      const user = await getAuthUser(request);

      if (!user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      const hasRequiredRole = await hasRole(user.id, roleName);

      if (!hasRequiredRole) {
        return NextResponse.json(
          { error: 'Forbidden: Insufficient permissions' },
          { status: 403 }
        );
      }

      return handler(request, user);
    };
  };
}

// Middleware wrapper for requiring specific permission
export function requirePermission(permissionName: string) {
  return (handler: (request: NextRequest, user: any) => Promise<NextResponse>) => {
    return async (request: NextRequest) => {
      const user = await getAuthUser(request);

      if (!user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      const hasRequiredPermission = await hasPermission(user.id, permissionName);

      if (!hasRequiredPermission) {
        return NextResponse.json(
          { error: 'Forbidden: Insufficient permissions' },
          { status: 403 }
        );
      }

      return handler(request, user);
    };
  };
}

// Log user activity
export async function logActivity(
  userId: string,
  action: string,
  resourceType?: string,
  resourceId?: string,
  metadata?: any
) {
  try {
    const supabase = getSupabase();

    await supabase.rpc('log_activity', {
      p_user_id: userId,
      p_action: action,
      p_resource_type: resourceType,
      p_resource_id: resourceId,
      p_metadata: metadata || {}
    });
  } catch (error) {
    console.error('Activity logging error:', error);
  }
}

// Log security event
export async function logSecurityEvent(
  userId: string,
  eventType: 'login_success' | 'login_failed' | 'password_reset' | 'email_changed' | 'mfa_enabled' | 'suspicious_activity',
  metadata?: any,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'low'
) {
  try {
    const supabase = getSupabase();

    await supabase
      .from('security_events')
      .insert([{
        user_id: userId,
        event_type: eventType,
        metadata: metadata || {},
        severity
      }]);
  } catch (error) {
    console.error('Security event logging error:', error);
  }
}
