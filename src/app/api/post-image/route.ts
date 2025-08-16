import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Payload = {
  title?: string; // linha grande
  body?: string; // parágrafo
  linkText?: string; // palavras sublinhadas (separadas por "|")
  arrow?: boolean; // mostra seta
  bg?: string; // cor de fundo
  fg?: string; // cor do texto
};

async function getBrowser() {
  const isVercel = !!process.env.VERCEL;
  if (isVercel) {
    const { default: chromium } = await import("@sparticuz/chromium");
    const { default: puppeteerCore } = await import("puppeteer-core");
    const chromiumOpts = chromium as unknown as {
      args: string[];
      executablePath: () => Promise<string>;
      headless: boolean;
    };
    const executablePath = await chromiumOpts.executablePath();
    return puppeteerCore.launch({
      args: chromiumOpts.args,
      defaultViewport: { width: 1024, height: 1024 },
      executablePath,
      headless: chromiumOpts.headless,
    });
  } else {
    const { default: puppeteer } = await import("puppeteer");
    return puppeteer.launch({
      headless: true,
      defaultViewport: { width: 1024, height: 1024 },
    });
  }
}

function htmlTemplate({
  title = "Você não precisa atender\ntodos",
  body = "A maioria ainda responde clientes\nmanualmente.\nEsse post não é pra eles.",
  linkText = "Esse post não é pra eles.",
  arrow = true,
  bg = "#FFFFFF",
  fg = "#0D0D0D",
}: Payload) {
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const br = (s: string) => s.replace(/\n/g, "<br/>");
  const brEsc = (s: string) => esc(s).replace(/\n/g, "<br/>");
  const underline = (text: string, links: string) => {
    let html = esc(text);
    const items = links
      ? links.split("|").map((t) => esc(t)).filter(Boolean)
      : [];
    for (const item of items) {
      const re = new RegExp(item.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"), "g");
      html = html.replace(re, `<span class="link">${item}</span>`);
    }
    return br(html);
  };

  return `
<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=1024, initial-scale=1" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
<style>
<style>
  html,body{margin:0;padding:0;width:1024px;height:1024px;background:${bg};}
  .wrap{
    position:relative; box-sizing:border-box; width:100%; height:100%;
    padding:277px 96px; font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial;
    color:${fg};
    display:flex; flex-direction:column; gap:81px;
  }
  .title{
    font-family: "Inter", system-ui, -apple-system, Segoe UI, Roboto, Arial;
    font-size:56px; line-height:78px; font-weight:600; letter-spacing:-0.001em;
    max-width:820px;
  }
  .body{
    font-size:42.667px; line-height:59px; font-weight:400; color:#0d0d0d; letter-spacing: 0.001em;
    max-width:820px;
  }
  .link{
    font-size:42.667px; line-height:59px; font-weight:400; text-decoration:underline;
    color:${fg}; letter-spacing: 0.001em; 
  }
  .cta{
    position:absolute; right:96px; bottom:-24px; width:239px; height:6px; border-radius:999px;
    background:${fg};
  }
  .cta::after{
    content:""; position:absolute; right:-8px; top:-10px;
    width:0; height:0; border-top:12px solid transparent; border-bottom:14px solid transparent; border-radius:3px;
    border-left:20px solid ${fg};
  }
</style>
</head>
<body>
  <div class="wrap">
    <div class="title">${brEsc(title)}</div>
    <div class="body">${underline(body, linkText)}</div>
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

