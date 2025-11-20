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

// GET /api/nlp2/commands - List recent NLP commands
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase();

    const { data: commands, error } = await supabase
      .from("nlp2_commands")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;

    return NextResponse.json(commands || []);
  } catch (error: any) {
    console.error("Error fetching NLP commands:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch commands" },
      { status: 500 }
    );
  }
}
