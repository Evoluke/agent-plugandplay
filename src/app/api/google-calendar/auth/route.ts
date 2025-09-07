import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const agentId = searchParams.get("agent_id");
  if (!agentId) {
    return NextResponse.json({ error: "missing agent_id" }, { status: 400 });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    return NextResponse.json({ error: "Google OAuth not configured" }, { status: 500 });
  }

  const scope = encodeURIComponent("https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly");
  const authUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${scope}&access_type=offline&prompt=consent&state=${agentId}`;

  return NextResponse.redirect(authUrl);
}
