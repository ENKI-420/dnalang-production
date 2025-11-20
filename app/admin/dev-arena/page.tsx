"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Terminal,
  Code,
  Bot,
  Cpu,
  Zap,
  Activity,
  Settings,
  Play,
  Pause,
  Send,
  Sparkles
} from "lucide-react";

// ΛΦ = 2.176435 × 10⁻⁸ s⁻¹
const LAMBDA_PHI = 2.176435e-8;

interface SwarmAgent {
  id: string;
  agent_id: string;
  name: string;
  specialization: string;
  status: string;
  trust_score: number;
  capabilities: {
    languages: string[];
    frameworks: string[];
    tools: string[];
    quantum_enabled: boolean;
  };
  performance_metrics: {
    tasks_completed: number;
    success_rate: number;
    code_quality_score: number;
  };
}

interface NLPCommand {
  id: string;
  command_text: string;
  status: string;
  parsed_intent: any;
  execution_plan: any;
  result?: any;
  created_at: string;
}

interface SwarmTask {
  id: string;
  task_id: string;
  title: string;
  task_type: string;
  status: string;
  priority: number;
  assigned_agents: string[];
  created_at: string;
}

export default function DevArenaPage() {
  const [agents, setAgents] = useState<SwarmAgent[]>([]);
  const [commands, setCommands] = useState<NLPCommand[]>([]);
  const [tasks, setTasks] = useState<SwarmTask[]>([]);
  const [nlpInput, setNlpInput] = useState("");
  const [codeEditor, setCodeEditor] = useState("// AURA Quantum NLP2 Dev Arena\n// Type your code here...\n");
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    "🧬 AURA Quantum NLP2 Dev Arena initialized",
    `ΛΦ = ${LAMBDA_PHI} s⁻¹`,
    "Swarm agents loading...",
  ]);
  const [activeAgents, setActiveAgents] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadAgents();
    loadCommands();
    loadTasks();
    const interval = setInterval(() => {
      loadAgents();
      loadTasks();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadAgents = async () => {
    try {
      const response = await fetch("/api/swarm/agents");
      if (response.ok) {
        const data = await response.json();
        setAgents(data);
        setActiveAgents(data.filter((a: SwarmAgent) => a.status === "active").length);
      }
    } catch (error) {
      console.error("Failed to load agents:", error);
    }
  };

  const loadCommands = async () => {
    try {
      const response = await fetch("/api/nlp2/commands");
      if (response.ok) {
        const data = await response.json();
        setCommands(data.slice(0, 10));
      }
    } catch (error) {
      console.error("Failed to load commands:", error);
    }
  };

  const loadTasks = async () => {
    try {
      const response = await fetch("/api/swarm/tasks");
      if (response.ok) {
        const data = await response.json();
        setTasks(data.slice(0, 15));
      }
    } catch (error) {
      console.error("Failed to load tasks:", error);
    }
  };

  const handleNLPCommand = async () => {
    if (!nlpInput.trim()) return;

    setIsProcessing(true);
    addTerminalLine(`> ${nlpInput}`);

    try {
      const response = await fetch("/api/nlp2/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: nlpInput }),
      });

      const result = await response.json();

      if (response.ok) {
        addTerminalLine(`✅ Command parsed: ${result.intent?.action || "unknown"}`);
        addTerminalLine(`📋 Execution plan: ${result.execution_plan?.steps?.length || 0} steps`);
        addTerminalLine(`🤖 Agents assigned: ${result.execution_plan?.agents?.length || 0}`);

        if (result.result) {
          addTerminalLine(`✨ Result: ${JSON.stringify(result.result, null, 2)}`);
        }

        loadCommands();
        loadTasks();
      } else {
        addTerminalLine(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      addTerminalLine(`❌ Failed to execute command: ${error}`);
    } finally {
      setIsProcessing(false);
      setNlpInput("");
    }
  };

  const addTerminalLine = (line: string) => {
    setTerminalOutput((prev) => [...prev, line].slice(-50));
  };

  const executeCode = async () => {
    addTerminalLine("🚀 Executing code...");

    try {
      const response = await fetch("/api/swarm/execute-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: codeEditor }),
      });

      const result = await response.json();

      if (response.ok) {
        addTerminalLine(`✅ Code executed successfully`);
        addTerminalLine(`Output: ${result.output || "No output"}`);
      } else {
        addTerminalLine(`❌ Execution error: ${result.error}`);
      }
    } catch (error) {
      addTerminalLine(`❌ Failed to execute: ${error}`);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      idle: "text-gray-400",
      active: "text-green-400",
      learning: "text-blue-400",
      blocked: "text-red-400",
      offline: "text-gray-600",
    };
    return colors[status] || "text-gray-400";
  };

  const getTaskStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      queued: "bg-yellow-500/20 text-yellow-400",
      in_progress: "bg-blue-500/20 text-blue-400",
      completed: "bg-green-500/20 text-green-400",
      failed: "bg-red-500/20 text-red-400",
    };
    return colors[status] || "bg-gray-500/20 text-gray-400";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#02010A] via-[#0F3D91]/10 to-[#02010A] text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="h-8 w-8 text-[#00FFD1] animate-pulse" />
          <h1 className="text-4xl font-light">AURA Quantum NLP2 Dev Arena</h1>
        </div>
        <p className="text-[#EAEAEA]/60">
          Self-improving platform where your tech builds your tech • ΛΦ = {LAMBDA_PHI} s⁻¹
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-[#0F3D91]/20 border-[#6A00F4]/30 p-4">
          <div className="flex items-center gap-3">
            <Bot className="h-8 w-8 text-[#00FFD1]" />
            <div>
              <p className="text-sm text-[#EAEAEA]/60">Active Agents</p>
              <p className="text-2xl font-bold">{activeAgents}/{agents.length}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-[#0F3D91]/20 border-[#6A00F4]/30 p-4">
          <div className="flex items-center gap-3">
            <Activity className="h-8 w-8 text-[#6A00F4]" />
            <div>
              <p className="text-sm text-[#EAEAEA]/60">Active Tasks</p>
              <p className="text-2xl font-bold">
                {tasks.filter(t => t.status === "in_progress").length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-[#0F3D91]/20 border-[#6A00F4]/30 p-4">
          <div className="flex items-center gap-3">
            <Cpu className="h-8 w-8 text-[#00FFD1]" />
            <div>
              <p className="text-sm text-[#EAEAEA]/60">Quantum Enabled</p>
              <p className="text-2xl font-bold">
                {agents.filter(a => a.capabilities?.quantum_enabled).length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-[#0F3D91]/20 border-[#6A00F4]/30 p-4">
          <div className="flex items-center gap-3">
            <Zap className="h-8 w-8 text-[#6A00F4]" />
            <div>
              <p className="text-sm text-[#EAEAEA]/60">Avg Trust Score</p>
              <p className="text-2xl font-bold">
                {agents.length > 0
                  ? (agents.reduce((sum, a) => sum + a.trust_score, 0) / agents.length).toFixed(2)
                  : "0.00"}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="nlp" className="w-full">
        <TabsList className="bg-[#0F3D91]/20 border border-[#6A00F4]/30">
          <TabsTrigger value="nlp">NLP Console</TabsTrigger>
          <TabsTrigger value="code">Code Editor</TabsTrigger>
          <TabsTrigger value="agents">Swarm Agents</TabsTrigger>
          <TabsTrigger value="tasks">Active Tasks</TabsTrigger>
          <TabsTrigger value="pipeline">Self-Building</TabsTrigger>
        </TabsList>

        {/* NLP Console */}
        <TabsContent value="nlp" className="space-y-4">
          <Card className="bg-[#0F3D91]/20 border-[#6A00F4]/30 p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Terminal className="h-5 w-5 text-[#00FFD1]" />
              Natural Language Command Interface
            </h3>

            <div className="space-y-4">
              {/* NLP Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={nlpInput}
                  onChange={(e) => setNlpInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleNLPCommand()}
                  placeholder="Type a command... e.g., 'Create a React component for user profile' or 'Optimize quantum circuit for VQE'"
                  className="flex-1 bg-[#02010A] border border-[#6A00F4]/30 rounded-md px-4 py-2 text-white placeholder-[#EAEAEA]/40"
                  disabled={isProcessing}
                />
                <Button
                  onClick={handleNLPCommand}
                  disabled={isProcessing}
                  className="bg-[#00FFD1] hover:bg-[#00FFD1]/80 text-[#02010A]"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isProcessing ? "Processing..." : "Execute"}
                </Button>
              </div>

              {/* Terminal Output */}
              <div className="bg-[#02010A] border border-[#6A00F4]/30 rounded-md p-4 h-64 overflow-y-auto font-mono text-sm">
                {terminalOutput.map((line, idx) => (
                  <div key={idx} className="text-[#00FFD1]/90">
                    {line}
                  </div>
                ))}
              </div>

              {/* Recent Commands */}
              <div>
                <h4 className="text-sm font-semibold mb-2 text-[#EAEAEA]/60">Recent Commands</h4>
                <div className="space-y-2">
                  {commands.map((cmd) => (
                    <div
                      key={cmd.id}
                      className="bg-[#02010A] border border-[#6A00F4]/20 rounded-md p-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm text-white">{cmd.command_text}</p>
                          <p className="text-xs text-[#EAEAEA]/60 mt-1">
                            Intent: {cmd.parsed_intent?.action || "parsing..."} • Status: {cmd.status}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${getTaskStatusColor(cmd.status)}`}>
                          {cmd.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Code Editor */}
        <TabsContent value="code" className="space-y-4">
          <Card className="bg-[#0F3D91]/20 border-[#6A00F4]/30 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Code className="h-5 w-5 text-[#00FFD1]" />
                Interactive Code Editor
              </h3>
              <div className="flex gap-2">
                <Button
                  onClick={executeCode}
                  className="bg-[#6A00F4] hover:bg-[#6A00F4]/80 text-white"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Execute
                </Button>
                <Button
                  variant="outline"
                  className="border-[#00FFD1] text-[#00FFD1] hover:bg-[#00FFD1]/10"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI Enhance
                </Button>
              </div>
            </div>

            <textarea
              value={codeEditor}
              onChange={(e) => setCodeEditor(e.target.value)}
              className="w-full h-96 bg-[#02010A] border border-[#6A00F4]/30 rounded-md p-4 text-white font-mono text-sm resize-none"
              spellCheck={false}
            />
          </Card>
        </TabsContent>

        {/* Swarm Agents */}
        <TabsContent value="agents" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agent) => (
              <Card
                key={agent.id}
                className="bg-[#0F3D91]/20 border-[#6A00F4]/30 p-4 hover:border-[#00FFD1]/50 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-lg font-semibold">{agent.name}</h4>
                    <p className="text-sm text-[#EAEAEA]/60">{agent.specialization}</p>
                  </div>
                  <span className={`text-sm ${getStatusColor(agent.status)}`}>
                    ● {agent.status}
                  </span>
                </div>

                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-[#EAEAEA]/60">Trust Score</p>
                    <div className="w-full bg-[#02010A] rounded-full h-2 mt-1">
                      <div
                        className="bg-[#00FFD1] h-2 rounded-full"
                        style={{ width: `${agent.trust_score * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-right text-[#00FFD1] mt-1">
                      {(agent.trust_score * 100).toFixed(0)}%
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-[#EAEAEA]/60">Tasks</p>
                      <p className="text-white font-semibold">
                        {agent.performance_metrics?.tasks_completed || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-[#EAEAEA]/60">Success Rate</p>
                      <p className="text-white font-semibold">
                        {((agent.performance_metrics?.success_rate || 0) * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-[#EAEAEA]/60 mb-1">Capabilities</p>
                    <div className="flex flex-wrap gap-1">
                      {agent.capabilities?.languages?.slice(0, 3).map((lang) => (
                        <span
                          key={lang}
                          className="text-xs bg-[#6A00F4]/20 text-[#00FFD1] px-2 py-0.5 rounded"
                        >
                          {lang}
                        </span>
                      ))}
                      {agent.capabilities?.quantum_enabled && (
                        <span className="text-xs bg-[#00FFD1]/20 text-[#00FFD1] px-2 py-0.5 rounded">
                          ⚛️ Quantum
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Active Tasks */}
        <TabsContent value="tasks" className="space-y-4">
          <Card className="bg-[#0F3D91]/20 border-[#6A00F4]/30 p-6">
            <h3 className="text-xl font-semibold mb-4">Active Development Tasks</h3>

            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-[#02010A] border border-[#6A00F4]/20 rounded-md p-4 hover:border-[#00FFD1]/50 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-white font-semibold">{task.title}</h4>
                        <span className={`text-xs px-2 py-0.5 rounded ${getTaskStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                      </div>
                      <p className="text-sm text-[#EAEAEA]/60">
                        Type: {task.task_type} • Priority: {task.priority}/10
                      </p>
                      <p className="text-xs text-[#EAEAEA]/40 mt-1">
                        {task.assigned_agents?.length || 0} agent(s) assigned
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Self-Building Pipeline */}
        <TabsContent value="pipeline" className="space-y-4">
          <Card className="bg-[#0F3D91]/20 border-[#6A00F4]/30 p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5 text-[#00FFD1]" />
              Self-Building Pipeline
            </h3>

            <div className="space-y-4">
              <div className="bg-[#02010A] border border-[#6A00F4]/20 rounded-md p-4">
                <p className="text-[#EAEAEA]/60 text-sm">
                  The self-building pipeline allows your platform to evolve autonomously.
                  Agents can propose improvements, generate code, test, and deploy updates
                  with quantum-enhanced validation.
                </p>
              </div>

              <Button className="bg-[#6A00F4] hover:bg-[#6A00F4]/80 text-white">
                <Sparkles className="h-4 w-4 mr-2" />
                Trigger Self-Improvement Cycle
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
