/**
 * ============================================================================
 * Quantum Jobs API
 * Manage IBM Quantum job execution and tracking
 * ============================================================================
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface CreateJobRequest {
  circuit_qasm: string;
  backend?: string;
  shots?: number;
  num_qubits: number;
  session_id?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
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
      // List user's quantum jobs
      const { limit = '20', status, session_id } = req.query;

      let query = supabase
        .from('quantum_jobs')
        .select('*')
        .eq('user_id', user.id)
        .order('submitted_at', { ascending: false })
        .limit(parseInt(limit as string));

      if (status && typeof status === 'string') {
        query = query.eq('status', status);
      }

      if (session_id && typeof session_id === 'string') {
        query = query.eq('session_id', session_id);
      }

      const { data: jobs, error } = await query;

      if (error) {
        console.error('Jobs query error:', error);
        return res.status(500).json({ error: 'Failed to fetch jobs' });
      }

      return res.status(200).json({ jobs, count: jobs.length });
    }

    if (req.method === 'POST') {
      // Create new quantum job
      const {
        circuit_qasm,
        backend = 'ibm_fez',
        shots = 4096,
        num_qubits,
        session_id,
      }: CreateJobRequest = req.body;

      if (!circuit_qasm || !num_qubits) {
        return res.status(400).json({
          error: 'circuit_qasm and num_qubits are required'
        });
      }

      // Verify session if provided
      if (session_id) {
        const { data: session } = await supabase
          .from('arena_sessions')
          .select('user_id')
          .eq('session_id', session_id)
          .single();

        if (!session || session.user_id !== user.id) {
          return res.status(403).json({ error: 'Invalid session_id' });
        }
      }

      // Dispatch to agent-dispatcher Edge Function
      const dispatchResponse = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/agent-dispatcher`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authHeader,
          },
          body: JSON.stringify({
            agent_type: 'quantum',
            task_type: 'execute',
            task_payload: {
              circuit_qasm,
              backend,
              shots,
              num_qubits,
              session_id,
              user_id: user.id,
            },
            priority: 3, // High priority for quantum jobs
            session_id,
          }),
        }
      );

      if (!dispatchResponse.ok) {
        const errorData = await dispatchResponse.json();
        console.error('Dispatch error:', errorData);
        return res.status(500).json({
          error: 'Failed to dispatch quantum job',
          details: errorData,
        });
      }

      const { task_id } = await dispatchResponse.json();

      return res.status(202).json({
        message: 'Quantum job dispatched',
        task_id,
        backend,
        shots,
        num_qubits,
        estimated_completion: '2-5 minutes',
      });
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
