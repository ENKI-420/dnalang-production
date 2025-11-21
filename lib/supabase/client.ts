import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Client-side Supabase client (uses anon key)
// Use placeholder values during build to prevent prerender errors
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTg0MDAsImV4cCI6MTk2MDc3NDQwMH0.placeholder'

export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: typeof window !== 'undefined',
    autoRefreshToken: typeof window !== 'undefined',
  },
})

// Helper function to create a new client instance
export function createClient() {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: typeof window !== 'undefined',
      autoRefreshToken: typeof window !== 'undefined',
    },
  })
}

// Types for database tables
export interface Organism {
  id: string
  user_id: string
  name: string
  dna_code: string
  genome: any
  phenome: any
  created_at: string
  updated_at: string
  version: number
  parent_id: string | null
  lambda_phi: number
  consciousness_metrics: ConsciousnessMetrics
}

export interface ConsciousnessMetrics {
  phi: number      // Φ - Integrated Information
  gamma: number    // Γ - Decoherence
  lambda: number   // Λ - Coherence Amplitude
  w2: number       // W₂ - Wasserstein-2 Distance
}

export interface QuantumJob {
  id: string
  organism_id: string
  user_id: string
  backend: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  ibm_job_id: string | null
  circuit_qasm: string
  shots: number
  results: any
  metrics: ConsciousnessMetrics | null
  created_at: string
  completed_at: string | null
}

export interface OrganismLineage {
  id: string
  organism_id: string
  parent_id: string | null
  generation: number
  fitness: number
  mutations: any
  created_at: string
}

// Authentication helpers
export async function signInWithGitHub() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  })
  return { data, error }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Organism database operations
export async function createOrganism(data: {
  name: string
  dna_code: string
  genome: any
  phenome?: any
}) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Not authenticated')

  const { data: organism, error } = await supabase
    .from('organisms')
    .insert({
      user_id: user.id,
      name: data.name,
      dna_code: data.dna_code,
      genome: data.genome,
      phenome: data.phenome || {},
      consciousness_metrics: {
        phi: 0,
        gamma: 0,
        lambda: 2.176435e-8,
        w2: 0
      }
    })
    .select()
    .single()

  if (error) throw error
  return organism as Organism
}

export async function getOrganisms() {
  const user = await getCurrentUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('organisms')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Organism[]
}

export async function getOrganism(id: string) {
  const { data, error } = await supabase
    .from('organisms')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Organism
}

// Quantum job operations
export async function createQuantumJob(data: {
  organism_id: string
  backend: string
  circuit_qasm: string
  shots: number
}) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Not authenticated')

  const { data: job, error } = await supabase
    .from('quantum_jobs')
    .insert({
      user_id: user.id,
      organism_id: data.organism_id,
      backend: data.backend,
      circuit_qasm: data.circuit_qasm,
      shots: data.shots,
      status: 'pending'
    })
    .select()
    .single()

  if (error) throw error
  return job as QuantumJob
}

export async function getQuantumJobs(organismId?: string) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Not authenticated')

  let query = supabase
    .from('quantum_jobs')
    .select('*')
    .eq('user_id', user.id)

  if (organismId) {
    query = query.eq('organism_id', organismId)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) throw error
  return data as QuantumJob[]
}

// Real-time subscriptions
export function subscribeToOrganismUpdates(
  organismId: string,
  callback: (organism: Organism) => void
) {
  return supabase
    .channel(`organism:${organismId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'organisms',
        filter: `id=eq.${organismId}`
      },
      (payload) => callback(payload.new as Organism)
    )
    .subscribe()
}

export function subscribeToJobUpdates(
  jobId: string,
  callback: (job: QuantumJob) => void
) {
  return supabase
    .channel(`job:${jobId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'quantum_jobs',
        filter: `id=eq.${jobId}`
      },
      (payload) => callback(payload.new as QuantumJob)
    )
    .subscribe()
}
