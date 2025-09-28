import type { ResumePayload } from "./resume";

export type ResumeDbRow = {
  id: string;
  user_id: string | null;
  email: string | null;
  full_name: string | null;
  headline: string | null;
  phone: string | null;
  location: string | null;
  objective: string | null;
  summary: string | null;
  experiences: unknown;
  education: unknown;
  skills: string[] | null;
  certifications: string[] | null;
  languages: string[] | null;
  focus_role: string | null;
  cover_letter: string | null;
  template: string | null;
  english_version: string | null;
  ats_keywords: string[] | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export function mapResumeFromDb(row: ResumeDbRow): ResumePayload {
  const parseArray = <T>(value: unknown): T[] => {
    if (Array.isArray(value)) return value as T[];
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? (parsed as T[]) : [];
      } catch (error) {
        console.error("Erro ao converter JSON de currículo", error);
        return [];
      }
    }
    return [];
  };

  const parseStringArray = (value: unknown): string[] => {
    if (Array.isArray(value)) return value as string[];
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? (parsed as string[]) : [];
      } catch {
        return value.split(",").map((item) => item.trim()).filter(Boolean);
      }
    }
    return [];
  };

  return {
    id: row.id,
    userId: row.user_id,
    email: row.email ?? undefined,
    fullName: row.full_name ?? "",
    headline: row.headline ?? undefined,
    phone: row.phone ?? undefined,
    location: row.location ?? undefined,
    objective: row.objective ?? undefined,
    summary: row.summary ?? undefined,
    experiences: parseArray(row.experiences),
    education: parseArray(row.education),
    skills: parseStringArray(row.skills),
    certifications: parseStringArray(row.certifications),
    languages: parseStringArray(row.languages),
    focusRole: row.focus_role ?? undefined,
    coverLetter: row.cover_letter ?? undefined,
    template: row.template ?? "minimal",
    englishVersion: row.english_version ?? undefined,
    atsKeywords: parseStringArray(row.ats_keywords),
    createdAt: row.created_at ?? undefined,
    updatedAt: row.updated_at ?? undefined,
    premium: false,
  };
}

export function mapResumeToDb(resume: ResumePayload) {
  return {
    id: resume.id,
    user_id: resume.userId,
    email: resume.email ?? null,
    full_name: resume.fullName,
    headline: resume.headline ?? null,
    phone: resume.phone ?? null,
    location: resume.location ?? null,
    objective: resume.objective ?? null,
    summary: resume.summary ?? null,
    experiences: resume.experiences,
    education: resume.education,
    skills: resume.skills,
    certifications: resume.certifications,
    languages: resume.languages,
    focus_role: resume.focusRole ?? null,
    cover_letter: resume.coverLetter ?? null,
    template: resume.template,
    english_version: resume.englishVersion ?? null,
    ats_keywords: resume.atsKeywords,
    updated_at: new Date().toISOString(),
    ...(resume.createdAt ? { created_at: resume.createdAt } : {}),
  };
}
