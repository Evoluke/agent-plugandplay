import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import LRUCache from "lru-cache";
import sanitizeHtml from "sanitize-html";
import { resumePromptTemplate, resumeSchema, type ResumePayload } from "@/lib/resume";
import { getUserPlan, persistResume } from "@/lib/resumeStorage.server";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

type GenerateBody = {
  resume: ResumePayload;
  action?: "rewrite-bullet" | "optimize-job" | "translate" | "cover-letter";
  payload?: Record<string, unknown>;
};

const rateLimiter = new LRUCache<string, { count: number; resetAt: number }>({
  max: 5000,
});

function getClientKey(request: Request, userId: string | null) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return `${userId ?? "guest"}:${forwarded ?? "ip"}`;
}

function assertRateLimit(key: string) {
  const now = Date.now();
  const bucket = rateLimiter.get(key);
  if (!bucket || bucket.resetAt < now) {
    rateLimiter.set(key, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return true;
  }
  if (bucket.count >= 3) {
    return false;
  }
  rateLimiter.set(key, { ...bucket, count: bucket.count + 1 });
  return true;
}

async function callOpenAI(model: string, messages: { role: "system" | "user"; content: string }[]) {
  const response = await openai.responses.create({
    model,
    input: messages.map((message) => ({ role: message.role, content: [{ type: "text", text: message.content }] })),
  });

  const content = response.output_text;
  return content ?? "";
}

function parseJson<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error("Erro ao converter JSON", error, raw);
    return null;
  }
}

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ message: "OPENAI_API_KEY não configurada" }, { status: 500 });
  }

  const body = (await request.json()) as GenerateBody;
  const parsedResume = resumeSchema.safeParse(body.resume);
  if (!parsedResume.success) {
    return NextResponse.json({ message: "Dados inválidos" }, { status: 400 });
  }

  const resume = parsedResume.data;
  const plan = await getUserPlan(resume.userId ?? null);

  if (plan === "free" && (!body.action || body.action === "optimize-job")) {
    const key = getClientKey(request, resume.userId ?? null);
    if (!assertRateLimit(key)) {
      return NextResponse.json({ message: "Limite de uso gratuito atingido. Tente novamente em 1 hora." }, { status: 429 });
    }
  }

  const model = plan === "premium" ? "gpt-4.1" : "gpt-4o-mini";

  try {
    const updatedResume = { ...resume };

    switch (body.action) {
      case "rewrite-bullet": {
        const experienceIndex = body.payload?.experienceIndex as number | undefined;
        const bulletIndex = body.payload?.bulletIndex as number | undefined;
        const experience =
          typeof experienceIndex === "number" ? updatedResume.experiences[experienceIndex] : undefined;
        if (!experience || typeof bulletIndex !== "number") {
          return NextResponse.json({ message: "Contexto inválido" }, { status: 400 });
        }
        const bullet = experience.achievements[bulletIndex];
        const prompt = `Reescreva o bullet point a seguir com foco em resultados e palavras-chave ATS, mantendo idioma português e até 28 palavras. Contexto: ${experience.role} em ${experience.company}. Bullet: "${bullet}".`;
        const completion = await callOpenAI(model, [
          { role: "system", content: "Você é um consultor de carreira" },
          { role: "user", content: prompt },
        ]);
        const suggestion = completion.trim();
        if (suggestion) {
          updatedResume.experiences[experienceIndex].achievements[bulletIndex] = suggestion;
        }
        break;
      }
      case "optimize-job": {
        const prompt = `${resumePromptTemplate}\n\nDados do candidato: ${JSON.stringify(resume)}\nRetorne JSON.`;
        const completion = await callOpenAI(model, [
          { role: "system", content: "Você é um especialista em recrutamento e otimização ATS." },
          { role: "user", content: prompt },
        ]);
        const json = parseJson<{
          summary: string;
          bulletPoints: string[];
          atsKeywords: string[];
          englishVersion?: string;
          coverLetter?: string;
        }>(completion);
        if (json) {
          updatedResume.summary = json.summary;
          if (json.bulletPoints?.length && updatedResume.experiences[0]) {
            updatedResume.experiences[0].achievements = json.bulletPoints;
          }
          updatedResume.atsKeywords = json.atsKeywords ?? [];
          if (json.englishVersion) {
            updatedResume.englishVersion = json.englishVersion;
          }
          if (json.coverLetter) {
            updatedResume.coverLetter = sanitizeHtml(json.coverLetter);
          }
        }
        break;
      }
      case "translate": {
        const prompt = `Traduza para inglês formal o seguinte resumo profissional:\n${resume.summary}`;
        const completion = await callOpenAI(model, [
          { role: "system", content: "Você é um tradutor especializado em currículos." },
          { role: "user", content: prompt },
        ]);
        updatedResume.englishVersion = completion.trim();
        break;
      }
      case "cover-letter": {
        const prompt = `Crie uma carta de apresentação envolvente em até 4 parágrafos usando as conquistas a seguir:\n${JSON.stringify(resume.experiences)}\nObjetivo: ${resume.objective}`;
        const completion = await callOpenAI(model, [
          { role: "system", content: "Você escreve cartas de apresentação profissionais." },
          { role: "user", content: prompt },
        ]);
        updatedResume.coverLetter = sanitizeHtml(completion.trim());
        break;
      }
      default: {
        const prompt = `${resumePromptTemplate}\n\nDados do candidato: ${JSON.stringify(resume)}\nRetorne JSON.`;
        const completion = await callOpenAI(model, [
          { role: "system", content: "Você é um especialista em currículos" },
          { role: "user", content: prompt },
        ]);
        const json = parseJson<{
          summary: string;
          bulletPoints: string[];
          atsKeywords: string[];
          englishVersion?: string;
          coverLetter?: string;
        }>(completion);
        if (json) {
          updatedResume.summary = json.summary;
          updatedResume.atsKeywords = json.atsKeywords ?? [];
          if (json.bulletPoints?.length) {
            if (updatedResume.experiences[0]) {
              updatedResume.experiences[0].achievements = json.bulletPoints;
            }
          }
          if (json.englishVersion) {
            updatedResume.englishVersion = json.englishVersion;
          }
          if (json.coverLetter) {
            updatedResume.coverLetter = sanitizeHtml(json.coverLetter);
          }
        }
        break;
      }
    }

    const persisted = await persistResume(updatedResume);
    const responseResume = { ...persisted, premium: plan === "premium" };
    return NextResponse.json({ resume: responseResume }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Falha na geração" }, { status: 500 });
  }
}
