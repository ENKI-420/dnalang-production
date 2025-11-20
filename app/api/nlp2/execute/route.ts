import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ΛΦ = 2.176435 × 10⁻⁸ s⁻¹
const LAMBDA_PHI = 2.176435e-8;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getSupabase() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase credentials not configured");
  }
  return createClient(supabaseUrl, supabaseKey);
}

// Intent parser - maps natural language to structured intents
function parseIntent(command: string) {
  const lowerCommand = command.toLowerCase();

  // Code generation patterns
  if (
    lowerCommand.includes("create") ||
    lowerCommand.includes("build") ||
    lowerCommand.includes("generate")
  ) {
    if (lowerCommand.includes("component")) {
      return {
        action: "code_generation",
        target: "react_component",
        parameters: extractComponentParams(command),
        confidence: 0.85
      };
    } else if (lowerCommand.includes("api") || lowerCommand.includes("endpoint")) {
      return {
        action: "code_generation",
        target: "api_endpoint",
        parameters: extractApiParams(command),
        confidence: 0.82
      };
    } else if (lowerCommand.includes("function")) {
      return {
        action: "code_generation",
        target: "function",
        parameters: extractFunctionParams(command),
        confidence: 0.80
      };
    }
  }

  // Quantum optimization patterns
  if (
    lowerCommand.includes("optimize") &&
    (lowerCommand.includes("quantum") || lowerCommand.includes("circuit"))
  ) {
    return {
      action: "quantum_optimization",
      target: "circuit",
      parameters: extractQuantumParams(command),
      confidence: 0.88
    };
  }

  // Database operations
  if (lowerCommand.includes("database") || lowerCommand.includes("table")) {
    if (lowerCommand.includes("create") || lowerCommand.includes("add")) {
      return {
        action: "database_migration",
        target: "create_table",
        parameters: extractDatabaseParams(command),
        confidence: 0.75
      };
    }
  }

  // Testing
  if (lowerCommand.includes("test") || lowerCommand.includes("unit test")) {
    return {
      action: "testing",
      target: "unit_test",
      parameters: extractTestParams(command),
      confidence: 0.78
    };
  }

  // Default fallback
  return {
    action: "general_query",
    target: "unknown",
    parameters: { original_command: command },
    confidence: 0.40
  };
}

function extractComponentParams(command: string) {
  const params: any = { type: "react_component" };

  // Extract component name
  const nameMatch = command.match(/(?:component|interface)\s+(?:for|called)\s+([a-zA-Z]+)/i);
  if (nameMatch) {
    params.name = nameMatch[1];
  }

  // Detect features
  if (command.toLowerCase().includes("form")) params.features = ["form"];
  if (command.toLowerCase().includes("table")) params.features = ["table"];
  if (command.toLowerCase().includes("chart")) params.features = ["chart"];

  return params;
}

function extractApiParams(command: string) {
  const params: any = { type: "api_endpoint" };

  // Extract HTTP method
  const methodMatch = command.match(/(GET|POST|PUT|DELETE|PATCH)/i);
  if (methodMatch) {
    params.method = methodMatch[1].toUpperCase();
  }

  // Extract route
  const routeMatch = command.match(/\/([\w\/]+)/);
  if (routeMatch) {
    params.route = routeMatch[0];
  }

  return params;
}

function extractFunctionParams(command: string) {
  const params: any = { type: "function" };

  // Extract function purpose
  const purposeMatch = command.match(/(?:to|that)\s+([a-zA-Z\s]+)/i);
  if (purposeMatch) {
    params.purpose = purposeMatch[1].trim();
  }

  return params;
}

function extractQuantumParams(command: string) {
  const params: any = { type: "quantum_circuit" };

  // Detect algorithm
  if (command.toLowerCase().includes("vqe")) params.algorithm = "VQE";
  if (command.toLowerCase().includes("qaoa")) params.algorithm = "QAOA";
  if (command.toLowerCase().includes("grover")) params.algorithm = "Grover";

  // Detect backend preference
  const backendMatch = command.match(/on\s+(ibm_\w+)/i);
  if (backendMatch) {
    params.backend = backendMatch[1];
  } else {
    params.backend = "ibm_fez"; // default
  }

  return params;
}

function extractDatabaseParams(command: string) {
  const params: any = { type: "database_operation" };

  // Extract table name
  const tableMatch = command.match(/table\s+(?:called\s+)?([a-zA-Z_]+)/i);
  if (tableMatch) {
    params.table_name = tableMatch[1];
  }

  return params;
}

function extractTestParams(command: string) {
  const params: any = { type: "test" };

  // Extract what to test
  const targetMatch = command.match(/test\s+(?:for\s+)?([a-zA-Z\s]+)/i);
  if (targetMatch) {
    params.test_target = targetMatch[1].trim();
  }

  return params;
}

// Create execution plan
async function createExecutionPlan(intent: any, supabase: any) {
  const plan: any = {
    steps: [],
    agents: [],
    estimated_time: 0
  };

  switch (intent.action) {
    case "code_generation":
      plan.steps = [
        "Parse requirements",
        "Generate code structure",
        "Implement logic",
        "Add error handling",
        "Write tests",
        "Review code quality"
      ];

      // Assign appropriate agents
      if (intent.target === "react_component") {
        plan.agents = await getAgentsBySpecialization(supabase, "frontend");
      } else if (intent.target === "api_endpoint") {
        plan.agents = await getAgentsBySpecialization(supabase, "backend");
      } else {
        plan.agents = await getAgentsBySpecialization(supabase, "backend");
      }

      plan.estimated_time = 180; // 3 minutes
      break;

    case "quantum_optimization":
      plan.steps = [
        "Analyze circuit structure",
        "Apply ΛΦ-aware transpilation",
        "Optimize gate decomposition",
        "Validate on quantum backend",
        "Measure coherence improvement"
      ];

      plan.agents = await getAgentsBySpecialization(supabase, "quantum");
      plan.estimated_time = 300; // 5 minutes
      break;

    case "database_migration":
      plan.steps = [
        "Design schema",
        "Write migration SQL",
        "Add indexes",
        "Configure RLS policies",
        "Test migration"
      ];

      plan.agents = await getAgentsBySpecialization(supabase, "database");
      plan.estimated_time = 120; // 2 minutes
      break;

    case "testing":
      plan.steps = [
        "Analyze code to test",
        "Generate test cases",
        "Write test implementation",
        "Run tests",
        "Generate coverage report"
      ];

      plan.agents = await getAgentsBySpecialization(supabase, "testing");
      plan.estimated_time = 150; // 2.5 minutes
      break;

    default:
      plan.steps = ["Analyze request", "Determine best approach"];
      plan.agents = [];
      plan.estimated_time = 60;
  }

  return plan;
}

async function getAgentsBySpecialization(supabase: any, specialization: string) {
  const { data, error } = await supabase
    .from("swarm_agents")
    .select("agent_id, name")
    .eq("specialization", specialization)
    .eq("status", "active")
    .order("trust_score", { ascending: false })
    .limit(2);

  if (error || !data) return [];

  return data.map((agent: any) => agent.agent_id);
}

// POST /api/nlp2/execute - Execute natural language command
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const { command } = await request.json();

    if (!command || typeof command !== "string") {
      return NextResponse.json(
        { error: "Command is required" },
        { status: 400 }
      );
    }

    // Parse intent
    const parsed_intent = parseIntent(command);

    // Create execution plan
    const execution_plan = await createExecutionPlan(parsed_intent, supabase);

    // Store command in database
    const { data: nlpCommand, error: insertError } = await supabase
      .from("nlp2_commands")
      .insert([{
        command_text: command,
        parsed_intent,
        execution_plan,
        status: "planning"
      }])
      .select()
      .single();

    if (insertError) throw insertError;

    // Create tasks for agents
    if (execution_plan.agents.length > 0) {
      const taskData = {
        task_id: `task_${Date.now()}`,
        nlp_command_id: nlpCommand.id,
        title: `${parsed_intent.action}: ${parsed_intent.target}`,
        description: command,
        task_type: parsed_intent.action,
        assigned_agents: execution_plan.agents,
        input_spec: parsed_intent.parameters,
        status: "queued",
        priority: 7,
        estimated_time: execution_plan.estimated_time
      };

      await supabase.from("swarm_tasks").insert([taskData]);
    }

    // Update command status
    await supabase
      .from("nlp2_commands")
      .update({ status: "executing" })
      .eq("id", nlpCommand.id);

    // Simulate execution (in real implementation, this would trigger actual agent execution)
    const result = {
      success: true,
      message: `Command parsed and queued for execution`,
      agents_assigned: execution_plan.agents.length,
      estimated_completion: new Date(Date.now() + execution_plan.estimated_time * 1000).toISOString()
    };

    // Update with result
    await supabase
      .from("nlp2_commands")
      .update({
        status: "completed",
        result,
        completed_at: new Date().toISOString()
      })
      .eq("id", nlpCommand.id);

    return NextResponse.json({
      id: nlpCommand.id,
      command,
      intent: parsed_intent,
      execution_plan,
      result,
      lambda_phi: LAMBDA_PHI
    });
  } catch (error: any) {
    console.error("Error executing NLP command:", error);
    return NextResponse.json(
      { error: error.message || "Failed to execute command" },
      { status: 500 }
    );
  }
}
