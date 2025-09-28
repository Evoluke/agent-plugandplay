import { supabasebrowser } from "./supabaseClient";
import type { ResumePayload } from "./resume";
import { mapResumeFromDb, mapResumeToDb } from "./resumeMapping";

export async function upsertResume(resume: ResumePayload) {
  const payload = mapResumeToDb(resume);
  const { error } = await supabasebrowser.from("resumes").upsert(payload, { onConflict: "id" });
  if (error) {
    throw new Error(`Erro ao salvar currículo: ${error.message}`);
  }
}

export async function fetchResume(resumeId: string) {
  const { data, error } = await supabasebrowser.from("resumes").select("*").eq("id", resumeId).single();
  if (error) throw new Error(error.message);
  return mapResumeFromDb(data);
}
