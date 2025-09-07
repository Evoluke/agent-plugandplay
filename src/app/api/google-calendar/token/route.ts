import { NextRequest, NextResponse } from "next/server";
import { supabaseadmin } from "@/lib/supabaseAdmin";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const agentId = searchParams.get("agent_id");
  if (!agentId) {
    return NextResponse.json({ error: "missing agent_id" }, { status: 400 });
  }

  const { data, error } = await supabaseadmin
    .from("agent_google_tokens")
    .select("access_token, refresh_token, expiry_date")
    .eq("agent_id", agentId)
    .single();
  if (error || !data) {
    return NextResponse.json({ error: "token not found" }, { status: 404 });
  }

  let access_token = data.access_token as string;
  const refresh_token = data.refresh_token as string;
  let expiry_date = data.expiry_date as string;
  if (!access_token || !refresh_token) {
    return NextResponse.json({ error: "invalid token" }, { status: 400 });
  }

  if (new Date(expiry_date) < new Date()) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: "Google OAuth not configured" }, { status: 500 });
    }
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token,
        grant_type: "refresh_token",
      }),
    });
    const tokens = await tokenRes.json();
    access_token = tokens.access_token;
    expiry_date = new Date(Date.now() + tokens.expires_in * 1000).toISOString();
    await supabaseadmin
      .from("agent_google_tokens")
      .update({ access_token, expiry_date })
      .eq("agent_id", agentId);
  }

  return NextResponse.json({ access_token });
}
