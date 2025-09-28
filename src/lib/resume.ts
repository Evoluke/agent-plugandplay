import { z } from "zod";

export const experienceSchema = z.object({
  id: z.string(),
  role: z.string().min(2, "Informe o cargo"),
  company: z.string().min(2, "Informe a empresa"),
  startDate: z.string(),
  endDate: z.string().nullable(),
  achievements: z.array(z.string().min(2)).default([]),
});

export const educationSchema = z.object({
  id: z.string(),
  institution: z.string().min(2, "Informe a instituição"),
  course: z.string().min(2, "Informe o curso"),
  startDate: z.string(),
  endDate: z.string().nullable(),
});

export const resumeSchema = z.object({
  id: z.string(),
  userId: z.string().nullable(),
  email: z.string().email().optional(),
  fullName: z.string().min(2),
  headline: z.string().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  objective: z.string().optional(),
  summary: z.string().optional(),
  experiences: z.array(experienceSchema).default([]),
  education: z.array(educationSchema).default([]),
  skills: z.array(z.string()).default([]),
  certifications: z.array(z.string()).default([]),
  languages: z.array(z.string()).default([]),
  focusRole: z.string().optional(),
  coverLetter: z.string().optional(),
  template: z.string().default("minimal"),
  englishVersion: z.string().optional(),
  atsKeywords: z.array(z.string()).default([]),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  premium: z.boolean().default(false),
});

export type ResumePayload = z.infer<typeof resumeSchema>;
export type ResumeExperience = z.infer<typeof experienceSchema>;

export type ResumeSectionKey =
  | "summary"
  | "experiences"
  | "education"
  | "skills"
  | "certifications"
  | "languages"
  | "englishVersion"
  | "coverLetter";

export const defaultSectionOrder: ResumeSectionKey[] = [
  "summary",
  "experiences",
  "education",
  "skills",
  "certifications",
  "languages",
  "englishVersion",
  "coverLetter",
];

export const freeTemplates = [
  { id: "minimal", name: "Minimalista" },
  { id: "elegant", name: "Elegante" },
];

export const premiumTemplates = [
  { id: "executive", name: "Executivo" },
  { id: "creative", name: "Criativo" },
  { id: "tech", name: "Tech" },
  { id: "modern", name: "Moderno" },
];

export const allTemplates = [...freeTemplates, ...premiumTemplates];

export type ResumePlan = "free" | "premium";

export const planLimits: Record<ResumePlan, { pdfExportsPerDay: number; rewritesPerDay: number }> = {
  free: { pdfExportsPerDay: 1, rewritesPerDay: 1 },
  premium: { pdfExportsPerDay: Infinity, rewritesPerDay: Infinity },
};

export function isPremiumPlan(plan?: ResumePlan | null) {
  return plan === "premium";
}

export function blankResume(id: string, email?: string | null): ResumePayload {
  return {
    id,
    userId: null,
    email: email ?? undefined,
    fullName: "",
    headline: "",
    phone: "",
    location: "",
    objective: "",
    summary: "",
    experiences: [],
    education: [],
    skills: [],
    certifications: [],
    languages: [],
    focusRole: "",
    coverLetter: "",
    template: "minimal",
    englishVersion: "",
    atsKeywords: [],
    premium: false,
  };
}

export const resumePromptTemplate = `Você é um assistente especialista em recrutamento. Resuma o perfil do usuário, gere bullets orientados a resultados, destaque palavras-chave para ATS, proponha uma versão em inglês e escreva uma carta de apresentação opcional.

Responda em JSON com o seguinte formato:
{
  "summary": "...",
  "bulletPoints": ["..."],
  "atsKeywords": ["..."],
  "englishVersion": "...",
  "coverLetter": "..."
}`;
