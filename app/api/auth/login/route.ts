import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { logSecurityEvent } from "@/lib/auth/middleware";

// ΛΦ = 2.176435 × 10⁻⁸ s⁻¹

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getSupabase(useServiceKey = false) {
  if (!supabaseUrl) {
    throw new Error("Supabase credentials not configured");
  }
  const key = useServiceKey ? supabaseServiceKey : supabaseAnonKey;
  return createClient(supabaseUrl, key);
}

// POST /api/auth/login - Login user
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    // Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      // Log failed login
      if (data?.user?.id) {
        await logSecurityEvent(
          data.user.id,
          'login_failed',
          { reason: error.message },
          'medium'
        );
      }
      throw error;
    }

    if (!data.user) {
      throw new Error('Login failed');
    }

    // Update last login time
    const supabaseService = getSupabase(true);
    await supabaseService
      .from('user_profiles_extended')
      .update({
        last_login: new Date().toISOString(),
        login_count: supabaseService.raw('login_count + 1')
      })
      .eq('user_id', data.user.id);

    // Log successful login
    await logSecurityEvent(
      data.user.id,
      'login_success',
      { method: 'email_password' },
      'low'
    );

    return NextResponse.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        email_confirmed_at: data.user.email_confirmed_at
      },
      session: data.session
    });
  } catch (error: any) {
    console.error('Login error:', error);

    if (error.message?.includes('Invalid login credentials')) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Login failed' },
      { status: 500 }
    );
  }
}

// GET /api/auth/login - Get session info
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No session' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const supabase = getSupabase(true);

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    // Get full profile
    const { data: profile } = await supabase
      .from('user_profile_complete')
      .select('*')
      .eq('user_id', user.id)
      .single();

    return NextResponse.json({
      user,
      profile
    });
  } catch (error: any) {
    console.error('Session check error:', error);
    return NextResponse.json(
      { error: 'Session check failed' },
      { status: 500 }
    );
  }
}
