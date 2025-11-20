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

// GET /api/auth/profile - Get current user's profile
export const GET = requireAuth(async (request: NextRequest, user: any) => {
  try {
    const supabase = getSupabase();

    const { data: profile, error } = await supabase
      .from('user_profile_complete')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) throw error;

    await logActivity(user.id, 'profile_viewed', 'profile', user.id);

    return NextResponse.json(profile);
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch profile' },
      { status: 500 }
    );
  }
});

// PUT /api/auth/profile - Update current user's profile
export const PUT = requireAuth(async (request: NextRequest, user: any) => {
  try {
    const supabase = getSupabase();
    const body = await request.json();

    // Only allow updating specific fields
    const allowedFields = [
      'display_name',
      'avatar_url',
      'bio',
      'location',
      'website',
      'github_username',
      'twitter_username',
      'preferences',
      'privacy_settings'
    ];

    const updates: any = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const { data: profile, error } = await supabase
      .from('user_profiles_extended')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    await logActivity(
      user.id,
      'profile_updated',
      'profile',
      user.id,
      { fields_updated: Object.keys(updates) }
    );

    return NextResponse.json(profile);
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update profile' },
      { status: 500 }
    );
  }
});
