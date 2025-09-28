import { supabaseadmin } from "./supabaseAdmin";
import type { ResumePayload, ResumePlan } from "./resume";
import { mapResumeFromDb, mapResumeToDb } from "./resumeMapping";

export async function getResumeById(id: string) {
  const { data, error } = await supabaseadmin.from("resumes").select("*").eq("id", id).maybeSingle();
  if (error) {
    throw new Error(`Erro ao buscar currículo: ${error.message}`);
  }
  return data ? mapResumeFromDb(data) : null;
}

export async function getUserPlan(userId: string | null): Promise<ResumePlan> {
  if (!userId) return "free";
  const { data, error } = await supabaseadmin
    .from("billing_subscriptions")
    .select("plan")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();
  if (error) {
    console.error("Erro ao consultar assinatura", error);
    return "free";
  }
  return (data?.plan as ResumePlan | null) ?? "free";
}

export async function registerExport(resumeId: string, format: string, userId: string | null) {
  const { error } = await supabaseadmin.from("resume_exports").insert({
    resume_id: resumeId,
    user_id: userId,
    format,
  });
  if (error) {
    console.error("Falha ao registrar exportação", error);
  }
}

export async function persistResume(resume: ResumePayload) {
  const payload = mapResumeToDb(resume);
  const { data, error } = await supabaseadmin.from("resumes").upsert(payload, { onConflict: "id" }).select("*").maybeSingle();
  if (error) {
    throw new Error(`Erro ao persistir currículo: ${error.message}`);
  }
  return data ? mapResumeFromDb(data) : resume;
}
