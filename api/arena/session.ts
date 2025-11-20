/**
 * ============================================================================
 * Arena Session API
 * Create and manage Aura Arena sessions
 * ============================================================================
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface CreateSessionRequest {
  session_name: string;
  initial_agents?: Array<{
    agent_id: string;
    type: 'architect' | 'coder' | 'quantum' | 'admin';
    model: string;
    status: 'active' | 'idle';
  }>;
}

interface Session {
  session_id: string;
  user_id: string;
  session_name: string;
  status: 'active' | 'paused' | 'completed';
  active_agents: any[];
  current_task: string | null;
  progress: {
    stage: string;
    completion: number;
  };
  total_mutations: number;
  total_commits: number;
  coherence_score: number;
  started_at: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
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
      // List user sessions
      const { data: sessions, error } = await supabase
        .from('arena_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false });

      if (error) {
        console.error('Session query error:', error);
        return res.status(500).json({ error: 'Failed to fetch sessions' });
      }

      return res.status(200).json({ sessions });
    }

    if (req.method === 'POST') {
      // Create new session
      const { session_name, initial_agents = [] }: CreateSessionRequest = req.body;

      if (!session_name) {
        return res.status(400).json({ error: 'session_name is required' });
      }

      const { data: session, error } = await supabase
        .from('arena_sessions')
        .insert({
          user_id: user.id,
          session_name,
          status: 'active',
          active_agents: initial_agents,
          progress: {
            stage: 'idle',
            completion: 0,
          },
        })
        .select()
        .single();

      if (error) {
        console.error('Session creation error:', error);
        return res.status(500).json({ error: 'Failed to create session' });
      }

      // Log agent event
      await supabase
        .from('agent_events')
        .insert({
          session_id: session.session_id,
          agent_id: 'system',
          agent_type: 'admin',
          event_type: 'session_created',
          event_data: {
            session_name,
            initial_agents,
          },
          level: 'info',
        });

      return res.status(201).json({ session });
    }

    if (req.method === 'PUT') {
      // Update session
      const { session_id, ...updates } = req.body;

      if (!session_id) {
        return res.status(400).json({ error: 'session_id is required' });
      }

      // Verify ownership
      const { data: existingSession } = await supabase
        .from('arena_sessions')
        .select('user_id')
        .eq('session_id', session_id)
        .single();

      if (!existingSession || existingSession.user_id !== user.id) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const { data: session, error } = await supabase
        .from('arena_sessions')
        .update({
          ...updates,
          last_activity: new Date().toISOString(),
        })
        .eq('session_id', session_id)
        .select()
        .single();

      if (error) {
        console.error('Session update error:', error);
        return res.status(500).json({ error: 'Failed to update session' });
      }

      return res.status(200).json({ session });
    }

    if (req.method === 'DELETE') {
      // Delete session
      const { session_id } = req.query;

      if (!session_id || typeof session_id !== 'string') {
        return res.status(400).json({ error: 'session_id is required' });
      }

      // Verify ownership
      const { data: existingSession } = await supabase
        .from('arena_sessions')
        .select('user_id')
        .eq('session_id', session_id)
        .single();

      if (!existingSession || existingSession.user_id !== user.id) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const { error } = await supabase
        .from('arena_sessions')
        .delete()
        .eq('session_id', session_id);

      if (error) {
        console.error('Session deletion error:', error);
        return res.status(500).json({ error: 'Failed to delete session' });
      }

      return res.status(200).json({ message: 'Session deleted' });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error: any) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
