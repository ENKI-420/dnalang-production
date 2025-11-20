/**
 * ============================================================================
 * Arena Events API
 * Real-time event streaming from Aura Arena
 * ============================================================================
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
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

    const { session_id, limit = '50', since } = req.query;

    if (!session_id || typeof session_id !== 'string') {
      return res.status(400).json({ error: 'session_id is required' });
    }

    // Verify session belongs to user
    const { data: session, error: sessionError } = await supabase
      .from('arena_sessions')
      .select('user_id')
      .eq('session_id', session_id)
      .single();

    if (sessionError || !session || session.user_id !== user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Build query
    let query = supabase
      .from('agent_events')
      .select('*')
      .eq('session_id', session_id)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit as string));

    // Filter by timestamp if provided
    if (since && typeof since === 'string') {
      query = query.gt('created_at', since);
    }

    const { data: events, error } = await query;

    if (error) {
      console.error('Events query error:', error);
      return res.status(500).json({ error: 'Failed to fetch events' });
    }

    return res.status(200).json({
      session_id,
      events: events.reverse(), // Return chronological order
      count: events.length,
    });

  } catch (error: any) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
