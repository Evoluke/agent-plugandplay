import { NextRequest, NextResponse } from "next/server";
import { supabaseadmin } from "@/lib/supabaseAdmin";

const DEFAULT_SCHEDULE_START = "08:00";
const DEFAULT_SCHEDULE_END = "17:00";
const DEFAULT_SCHEDULE_DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
];
const DEFAULT_SCHEDULE_DURATION = 60;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const stateParam = searchParams.get("state");
  if (!code || !stateParam) {
    return NextResponse.json({ error: "missing code or state" }, { status: 400 });
  }

  let agentId: string | undefined;
  try {
    const parsed = JSON.parse(decodeURIComponent(stateParam));
    agentId = parsed.agentId;
  } catch {
    return NextResponse.json({ error: "invalid state" }, { status: 400 });
  }
  if (!agentId) {
    return NextResponse.json({ error: "missing agent_id" }, { status: 400 });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.json({ error: "Google OAuth not configured" }, { status: 500 });
  }

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });
    const tokens = await tokenRes.json();
    const { access_token, refresh_token, expires_in } = tokens;
    if (!access_token || !refresh_token) {
      return NextResponse.json({ error: "invalid tokens" }, { status: 400 });
    }

    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const user = await userRes.json();
    const email = user.email as string | undefined;
    if (!email) {
      return NextResponse.json({ error: "missing email" }, { status: 400 });
    }

    const expiry_date = new Date(Date.now() + expires_in * 1000).toISOString();

    const { data: existingToken } = await supabaseadmin
      .from("agent_google_tokens")
      .select(
        "schedule_start, schedule_end, schedule_days, schedule_duration",
      )
      .eq("agent_id", agentId)
      .maybeSingle();

    await supabaseadmin
      .from("agent_google_tokens")
      .upsert(
        {
          agent_id: agentId,
          email,
          access_token,
          refresh_token,
          expiry_date,
          schedule_start:
            existingToken?.schedule_start ?? DEFAULT_SCHEDULE_START,
          schedule_end: existingToken?.schedule_end ?? DEFAULT_SCHEDULE_END,
          schedule_days: existingToken?.schedule_days ?? DEFAULT_SCHEDULE_DAYS,
          schedule_duration:
            existingToken?.schedule_duration ?? DEFAULT_SCHEDULE_DURATION,
        },
        { onConflict: "agent_id" },
      );

    const redirect = new URL(
      `/dashboard/agents/${agentId}/integracoes`,
      req.url
    );
    return NextResponse.redirect(redirect);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "oauth error" }, { status: 500 });
  }
}
