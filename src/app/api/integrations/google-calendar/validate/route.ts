import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { apiKey, calendarId } = await req.json();

  if (!apiKey || !calendarId) {
    return NextResponse.json(
      { valid: false, error: "Missing apiKey or calendarId" },
      { status: 400 }
    );
  }

  try {
    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}?key=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) {
      return NextResponse.json({ valid: false }, { status: 200 });
    }
    return NextResponse.json({ valid: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { valid: false, error: "Unable to verify credentials" },
      { status: 500 }
    );
  }
}
