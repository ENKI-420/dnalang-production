import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getSupabase() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase credentials not configured");
  }
  return createClient(supabaseUrl, supabaseKey);
}

// GET /api/swarm/tasks - List all swarm tasks
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase();

    const { data: tasks, error } = await supabase
      .from("swarm_tasks")
      .select("*")
      .order("priority", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw error;

    return NextResponse.json(tasks || []);
  } catch (error: any) {
    console.error("Error fetching swarm tasks:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

// POST /api/swarm/tasks - Create a new task
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const body = await request.json();

    const { data: task, error } = await supabase
      .from("swarm_tasks")
      .insert([{
        task_id: body.task_id || `task_${Date.now()}`,
        title: body.title,
        description: body.description,
        task_type: body.task_type,
        assigned_agents: body.assigned_agents || [],
        input_spec: body.input_spec || {},
        status: "queued",
        priority: body.priority || 5,
        estimated_time: body.estimated_time
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(task, { status: 201 });
  } catch (error: any) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create task" },
      { status: 500 }
    );
  }
}
