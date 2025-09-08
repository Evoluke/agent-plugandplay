import { NextRequest, NextResponse } from "next/server";
import { supabaseadmin } from "@/lib/supabaseAdmin";

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const agentId = searchParams.get("agent_id");
  if (!agentId) {
    return NextResponse.json({ error: "missing agent_id" }, { status: 400 });
  }

  const { error } = await supabaseadmin
    .from("agent_google_tokens")
    .delete()
    .eq("agent_id", agentId);

  if (error) {
    return NextResponse.json({ error: "failed to disconnect" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
