import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const path_id = searchParams.get("path_id");
  const company_id = searchParams.get("company_id");
  const agent_id = searchParams.get("agent_id");

  if (!path_id || !company_id || !agent_id) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  const webhookToken = process.env.N8N_WEBHOOK_TOKEN;

  if (!webhookUrl || !webhookToken) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: "File not provided" }, { status: 400 });
  }

  const response = await fetch(
    `${webhookUrl}?path_id=${path_id}&company_id=${company_id}&agent_id=${agent_id}`,
    {
      method: "POST",
      headers: {
        "Content-Type": (file as File).type || "application/octet-stream",
        Authorization: `Bearer ${webhookToken}`,
      },
      body: file,
    }
  );

  if (!response.ok) {
    return NextResponse.json(
      { error: "Webhook upload failed" },
      { status: response.status }
    );
  }

  return NextResponse.json({ ok: true });
}
