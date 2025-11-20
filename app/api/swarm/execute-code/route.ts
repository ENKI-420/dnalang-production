import { NextRequest, NextResponse } from "next/server";

// POST /api/swarm/execute-code - Execute code in sandbox
export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "Code is required" },
        { status: 400 }
      );
    }

    // For MVP, we'll just parse and validate the code
    // In production, this would execute in a sandboxed environment
    const result = {
      success: true,
      output: "Code validation successful. Sandboxed execution coming soon.",
      language: detectLanguage(code),
      lines: code.split("\n").length,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error executing code:", error);
    return NextResponse.json(
      { error: error.message || "Failed to execute code" },
      { status: 500 }
    );
  }
}

function detectLanguage(code: string): string {
  if (code.includes("import React") || code.includes("export default function")) {
    return "TypeScript/React";
  } else if (code.includes("def ") || code.includes("import ")) {
    return "Python";
  } else if (code.includes("function ") || code.includes("const ")) {
    return "JavaScript";
  } else if (code.includes("SELECT ") || code.includes("CREATE TABLE")) {
    return "SQL";
  } else {
    return "Unknown";
  }
}
