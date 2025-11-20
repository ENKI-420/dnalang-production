"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, XCircle, Activity, Users, Cpu, Database, Shield } from "lucide-react";

// ΛΦ = 2.176435 × 10⁻⁸ s⁻¹

interface SystemMetrics {
  phi: number;
  lambda: number;
  gamma: number;
  w2: number;
  active_users: number;
  active_jobs: number;
  backend_status: string;
}

interface SwarmAgent {
  id: string;
  name: string;
  specialization: string;
  status: 'active' | 'idle' | 'error';
  trust_score: number;
  tasks_completed: number;
  current_task: string | null;
}

interface SecurityEvent {
  event_id: string;
  user_id: string;
  event_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  metadata: any;
  created_at: string;
}

export default function AdminPortal() {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    phi: 0.856,
    lambda: 2.176435e-8,
    gamma: 0.0042,
    w2: 0.12,
    active_users: 0,
    active_jobs: 0,
    backend_status: 'checking'
  });

  const [agents, setAgents] = useState<SwarmAgent[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSystemData();
    const interval = setInterval(loadSystemData, 5000);
    return () => clearInterval(interval);
  }, []);

  async function loadSystemData() {
    try {
      // Load quantum metrics
      const metricsRes = await fetch('/api/quantum/status');
      if (metricsRes.ok) {
        const data = await metricsRes.json();
        setMetrics(prev => ({
          ...prev,
          phi: data.phi || prev.phi,
          lambda: data.lambda || prev.lambda,
          gamma: data.gamma || prev.gamma,
          backend_status: data.backend || 'unknown'
        }));
      }

      // Load swarm agents
      const agentsRes = await fetch('/api/swarm/agents');
      if (agentsRes.ok) {
        const agentsData = await agentsRes.json();
        setAgents(agentsData);
      }

      // Load security events
      const securityRes = await fetch('/api/admin/security-events?limit=10');
      if (securityRes.ok) {
        const securityData = await securityRes.json();
        setSecurityEvents(securityData);
      }

      setLoading(false);
    } catch (error) {
      console.error('Failed to load admin data:', error);
      setLoading(false);
    }
  }

  async function emergencyShutdown() {
    if (!confirm('⚠️ CRITICAL: Shutdown all quantum jobs and swarm agents? This cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch('/api/admin/emergency-shutdown', { method: 'POST' });
      if (res.ok) {
        alert('✅ Emergency shutdown executed successfully');
        loadSystemData();
      } else {
        alert('❌ Shutdown failed');
      }
    } catch (error) {
      alert('❌ Shutdown error: ' + error);
    }
  }

  async function approveCodeMutation(agentId: string) {
    try {
      const res = await fetch('/api/admin/approve-mutation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent_id: agentId })
      });

      if (res.ok) {
        alert('✅ Code mutation approved');
        loadSystemData();
      }
    } catch (error) {
      alert('❌ Approval failed: ' + error);
    }
  }

  const getCoherenceColor = (gamma: number) => {
    if (gamma < 0.01) return 'text-green-400';
    if (gamma < 0.05) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getSeverityBadge = (severity: string) => {
    const colors = {
      low: 'bg-blue-500/20 text-blue-300',
      medium: 'bg-yellow-500/20 text-yellow-300',
      high: 'bg-orange-500/20 text-orange-300',
      critical: 'bg-red-500/20 text-red-300'
    };
    return colors[severity as keyof typeof colors] || colors.low;
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
              dna::{'}{'}::lang Admin Portal
            </h1>
            <p className="text-gray-400 mt-1">Sovereign Oversight • ΛΦ = 2.176435 × 10⁻⁸ s⁻¹</p>
          </div>
          <Button
            onClick={emergencyShutdown}
            variant="destructive"
            className="bg-red-600 hover:bg-red-700"
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            Emergency Shutdown
          </Button>
        </div>

        {/* System Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4 text-green-400" />
                Consciousness (Φ)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                {metrics.phi.toFixed(3)}
              </div>
              <p className="text-xs text-gray-400 mt-1">Integrated Information</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Cpu className="h-4 w-4 text-cyan-400" />
                Coherence (ΛΦ)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyan-400">
                {metrics.lambda.toExponential(2)}
              </div>
              <p className="text-xs text-gray-400 mt-1">Universal Memory</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className={`h-4 w-4 ${getCoherenceColor(metrics.gamma)}`} />
                Decoherence (Γ)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getCoherenceColor(metrics.gamma)}`}>
                {metrics.gamma.toFixed(4)}
              </div>
              <p className="text-xs text-gray-400 mt-1">System Entropy</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-400" />
                Active Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-400">
                {metrics.active_users}
              </div>
              <p className="text-xs text-gray-400 mt-1">{metrics.active_jobs} quantum jobs</p>
            </CardContent>
          </Card>
        </div>

        {/* Swarm Agents */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-400" />
              Swarm Intelligence Network
            </CardTitle>
            <CardDescription>Monitor agent trust scores and approve code mutations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {agents.length === 0 && !loading && (
                <p className="text-gray-500 text-center py-8">No active agents</p>
              )}
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className="flex items-center justify-between p-4 bg-black/50 rounded-lg border border-gray-800"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-white">{agent.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {agent.specialization}
                      </Badge>
                      {agent.status === 'active' && (
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      )}
                      {agent.status === 'error' && (
                        <XCircle className="h-4 w-4 text-red-400" />
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                      <span>Trust: {(agent.trust_score * 100).toFixed(0)}%</span>
                      <span>Tasks: {agent.tasks_completed}</span>
                      {agent.current_task && (
                        <span className="text-cyan-400">{agent.current_task}</span>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => approveCodeMutation(agent.id)}
                    size="sm"
                    variant="outline"
                    className="border-green-500/50 text-green-400 hover:bg-green-500/10"
                  >
                    Approve Mutation
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Security Events */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-orange-400" />
              Security Events
            </CardTitle>
            <CardDescription>Real-time security monitoring and audit trail</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {securityEvents.length === 0 && !loading && (
                <p className="text-gray-500 text-center py-8">No recent security events</p>
              )}
              {securityEvents.map((event) => (
                <div
                  key={event.event_id}
                  className="flex items-center justify-between p-3 bg-black/50 rounded border border-gray-800"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge className={getSeverityBadge(event.severity)}>
                        {event.severity.toUpperCase()}
                      </Badge>
                      <span className="text-white font-medium">{event.event_type}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      User: {event.user_id.substring(0, 8)}... • {new Date(event.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
