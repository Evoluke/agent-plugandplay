import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Payload = {
  title?: string; // linha grande
  body?: string; // parágrafo
  linkText?: string; // texto sublinhado
  arrow?: boolean; // mostra seta
  bg?: string; // cor de fundo
  fg?: string; // cor do texto
};

async function getBrowser() {
  const isVercel = !!process.env.VERCEL;
  if (isVercel) {
    const { default: chromium } = await import("@sparticuz/chromium");
    const puppeteer = await import("puppeteer-core");
    const executablePath = await chromium.executablePath();
    const headless = chromium.headless === "new" ? true : chromium.headless;
    return puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 1080, height: 1080 },
      executablePath,
      headless,
    });
  } else {
    const puppeteer = await import("puppeteer");
    return puppeteer.launch({
      headless: "new",
      defaultViewport: { width: 1080, height: 1080 },
    });
  }
}

function htmlTemplate({
  title = "Você não precisa atender\ntodos",
  body = "A maioria ainda responde clientes\nmanualmente.",
  linkText = "Esse post não é pra eles.",
  arrow = true,
  bg = "#FFFFFF",
  fg = "#0D0D0D",
}: Payload) {
  // converte quebras \n para <br/>
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const br = (s: string) => esc(s).replace(/\n/g, "<br/>");

  return `
<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=1080, initial-scale=1" />
<style>
  @font-face { font-family: Inter; font-weight: 400; src: local("Inter"); font-display: swap; }
  @font-face { font-family: Inter; font-weight: 600; src: local("Inter"); font-display: swap; }
  html,body{margin:0;padding:0;width:1080px;height:1080px;background:${bg};}
  .wrap{
    position:relative; box-sizing:border-box; width:100%; height:100%;
    padding:120px 96px; font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial;
    color:${fg};
    display:flex; flex-direction:column; gap:48px;
  }
  .title{
    font-size:96px; line-height:1.05; font-weight:700; letter-spacing:-0.02em;
    max-width:820px;
  }
  .body{
    font-size:44px; line-height:1.3; font-weight:400; color:#242424;
    max-width:820px;
  }
  .link{
    font-size:44px; line-height:1.3; font-weight:500; text-decoration:underline;
    color:${fg};
  }
  .cta{
    position:absolute; right:96px; bottom:96px; width:360px; height:8px; border-radius:999px;
    background:${fg};
  }
  .cta::after{
    content:""; position:absolute; right:-8px; top:-12px;
    width:0; height:0; border-top:16px solid transparent; border-bottom:16px solid transparent;
    border-left:32px solid ${fg};
  }
</style>
</head>
<body>
  <div class="wrap">
    <div class="title">${br(title)}</div>
    <div>
      <div class="body">${br(body)}</div>
      <div class="link">${br(linkText)}</div>
    </div>
    ${arrow ? '<div class="cta"></div>' : ""}
  </div>
</body>
</html>
`;
}

export async function POST(req: NextRequest) {
  const payload = (await req.json().catch(() => ({}))) as Payload;

  const browser = await getBrowser();
  try {
    const page = await browser.newPage();
    const html = htmlTemplate(payload);

    await page.setContent(html, { waitUntil: "networkidle0" });
    const buf = await page.screenshot({ type: "png", fullPage: false });

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store",
      },
    });
  } finally {
    await browser.close();
  }
}

export async function GET(req: NextRequest) {
  // Permite testar via querystring
  const { searchParams } = new URL(req.url);
  const q = Object.fromEntries(searchParams.entries());
  return POST(
    new NextRequest(req.url, {
      method: "POST",
      body: JSON.stringify({
        title: q.title,
        body: q.body,
        linkText: q.linkText,
        arrow: q.arrow !== "false",
        bg: q.bg,
        fg: q.fg,
      }),
    })
  );
}
