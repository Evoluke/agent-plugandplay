import { cookies } from "next/headers";
import { supabaseadmin } from "@/lib/supabaseAdmin";

function decodeCookieValue(value: string): string {
  if (value.startsWith("base64-")) {
    try {
      return Buffer.from(value.slice(7), "base64").toString("utf-8");
    } catch {
      return "";
    }
  }
  return value;
}

export async function getUserFromCookie() {
  const cookieStore = await cookies();
  const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const projectRef = new URL(projectUrl).hostname.split(".")[0];
  const cookieName = `sb-${projectRef}-auth-token`;
  const tokenCookie = cookieStore.get(cookieName);
  if (!tokenCookie) {
    return { user: null, accessToken: null, error: new Error("No auth cookie") };
  }
  const decoded = decodeCookieValue(tokenCookie.value);
  let session: unknown;
  try {
    session = JSON.parse(decoded);
  } catch {
    return { user: null, accessToken: null, error: new Error("Invalid auth cookie") };
  }
  const accessToken = Array.isArray(session)
    ? session[0]
    : typeof session === "object" && session !== null && "access_token" in session
    ? (session as { access_token: string }).access_token
    : undefined;
  if (!accessToken || typeof accessToken !== "string") {
    return { user: null, accessToken: null, error: new Error("No access token") };
  }
  const { data, error } = await supabaseadmin.auth.getUser(accessToken);
  return { user: data.user, accessToken, error };
}
