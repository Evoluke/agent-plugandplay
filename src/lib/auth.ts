import { cookies } from "next/headers";
import { supabaseadmin } from "@/lib/supabaseAdmin";

export async function getUserFromCookie() {
  const cookieStore = await cookies();
  const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const projectRef = new URL(projectUrl).hostname.split(".")[0];
  const cookieName = `sb-${projectRef}-auth-token`;
  const cookieList = cookieStore.getAll();

  const baseCookie = cookieList.find((cookie) => cookie.name === cookieName);

  let rawCookieValue: string | null = null;
  if (baseCookie) {
    rawCookieValue = baseCookie.value;
  } else {
    const chunkValues: string[] = [];
    for (let i = 0; ; i++) {
      const chunkName = `${cookieName}.${i}`;
      const chunk = cookieList.find((cookie) => cookie.name === chunkName);
      if (!chunk) {
        break;
      }
      chunkValues.push(chunk.value);
    }
    if (chunkValues.length > 0) {
      rawCookieValue = chunkValues.join("");
    }
  }

  if (!rawCookieValue) {
    return { user: null, accessToken: null, error: new Error("No auth cookie") };
  }

  const decoded = decodeCookieValue(rawCookieValue);
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

function decodeCookieValue(value: string): string {
  if (value.startsWith("base64-")) {
    try {
      const base64Value = value.slice(7).replace(/-/g, "+").replace(/_/g, "/");
      const padding = base64Value.length % 4;
      const normalized =
        padding === 0 ? base64Value : base64Value + "=".repeat(4 - padding);
      return Buffer.from(normalized, "base64").toString("utf-8");
    } catch {
      return "";
    }
  }
  return value;
}
