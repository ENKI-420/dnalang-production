/**
 * ============================================================================
 * Profile API
 * User profile management
 * ============================================================================
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface UpdateProfileRequest {
  username?: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  banner_url?: string;
  location?: string;
  website?: string;
  research_interests?: string[];
  specializations?: string[];
  privacy_settings?: {
    email_visible?: boolean;
    location_visible?: boolean;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Get user from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Missing authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid authorization' });
    }

    if (req.method === 'GET') {
      // Get user profile
      const { username } = req.query;

      let query = supabase
        .from('profiles')
        .select(`
          *,
          users!inner(email, wallet_address, last_login)
        `);

      if (username) {
        // Get specific user's profile
        query = query.eq('username', username);
      } else {
        // Get current user's profile
        query = query.eq('user_id', user.id);
      }

      const { data: profile, error } = await query.single();

      if (error) {
        console.error('Profile query error:', error);
        return res.status(404).json({ error: 'Profile not found' });
      }

      // Filter email based on privacy settings
      if (profile.user_id !== user.id) {
        if (!profile.privacy_settings?.email_visible) {
          delete profile.users.email;
        }
        if (!profile.privacy_settings?.location_visible) {
          delete profile.location;
        }
      }

      return res.status(200).json({ profile });
    }

    if (req.method === 'PUT') {
      // Update user profile
      const updates: UpdateProfileRequest = req.body;

      // Validate username uniqueness if changing
      if (updates.username) {
        const { data: existing } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('username', updates.username)
          .single();

        if (existing && existing.user_id !== user.id) {
          return res.status(400).json({
            error: 'Username already taken'
          });
        }
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Profile update error:', error);
        return res.status(500).json({
          error: 'Failed to update profile',
          details: error.message
        });
      }

      return res.status(200).json({ profile });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error: any) {
    console.error('API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}
