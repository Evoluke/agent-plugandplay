import { NextRequest, NextResponse } from "next/server";
import textract from "textract";

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

  let uploadBlob: Blob = file;
  try {
    const fileName = (file as File).name || "";
    const extension = fileName.split(".").pop()?.toLowerCase();

    if (extension === "doc" || extension === "docx") {
      const arrayBuffer = await (file as File).arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const text: string = await new Promise((resolve, reject) => {
        textract.fromBufferWithMime(
          (file as File).type || "application/octet-stream",
          buffer,
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );
      });

      uploadBlob = new Blob([text], { type: "text/plain" });
    }
  } catch {
    return NextResponse.json({ error: "File conversion failed" }, { status: 500 });
  }

  const response = await fetch(
    `${webhookUrl}?path_id=${path_id}&company_id=${company_id}&agent_id=${agent_id}`,
    {
      method: "POST",
      headers: {
        "Content-Type": uploadBlob.type || "application/octet-stream",
        Authorization: `Bearer ${webhookToken}`,
      },
      body: uploadBlob,
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
