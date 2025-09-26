import { supabaseadmin } from "./supabaseAdmin";

export async function getCompanyIdByUser(userId: string) {
  const { data, error } = await supabaseadmin
    .from("company")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    return { error } as const;
  }

  return { companyId: data.id } as const;
}
