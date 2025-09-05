import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function POST(req: Request) {
  try {
    const { clientEmail, privateKey } = await req.json();

    if (!clientEmail || !privateKey) {
      return NextResponse.json(
        { valid: false, error: "Credenciais ausentes." },
        { status: 400 }
      );
    }

    const auth = new google.auth.JWT(
      clientEmail,
      undefined,
      privateKey.replace(/\\n/g, "\n"),
      ["https://www.googleapis.com/auth/calendar.readonly"]
    );

    await auth.authorize();
    const calendar = google.calendar({ version: "v3", auth });
    await calendar.calendarList.list({ maxResults: 1 });

    return NextResponse.json({ valid: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { valid: false, error: message },
      { status: 400 }
    );
  }
}

