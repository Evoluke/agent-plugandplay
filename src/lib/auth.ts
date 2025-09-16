import { cookies } from "next/headers";
import { supabaseadmin } from "@/lib/supabaseAdmin";

function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4;
  const padded = padding === 0 ? normalized : normalized.padEnd(normalized.length + 4 - padding, "=");
  return Buffer.from(padded, "base64").toString("utf-8");
}

function decodeCookieValue(value: string): string {
  if (value.startsWith("base64-")) {
    try {
      return decodeBase64Url(value.slice(7));
    } catch {
      return "";
    }
  }
  return value;
}

function getCookieValue(
  cookieStore: ReturnType<typeof cookies>,
  cookieName: string,
): string | null {
  const directCookie = cookieStore.get(cookieName);
  if (directCookie?.value) {
    return decodeCookieValue(directCookie.value);
  }

  const chunkPrefix = `${cookieName}.`;
  const chunkCookies = cookieStore
    .getAll()
    .map((cookie) => {
      if (!cookie.name.startsWith(chunkPrefix)) {
        return null;
      }
      const indexValue = Number.parseInt(cookie.name.slice(chunkPrefix.length), 10);
      if (Number.isNaN(indexValue)) {
        return null;
      }
      return { index: indexValue, value: cookie.value };
    })
    .filter((chunk): chunk is { index: number; value: string } => chunk !== null);

  if (chunkCookies.length === 0) {
    return null;
  }

  const combinedValue = chunkCookies
    .sort((a, b) => a.index - b.index)
    .map((chunk) => chunk.value)
    .join("");

  if (!combinedValue) {
    return null;
  }

  return decodeCookieValue(combinedValue);
}

export async function getUserFromCookie() {
  const cookieStore = await cookies();
  const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const projectRef = new URL(projectUrl).hostname.split(".")[0];
  const cookieName = `sb-${projectRef}-auth-token`;
  const cookieValue = getCookieValue(cookieStore, cookieName);
  if (!cookieValue) {
    return { user: null, accessToken: null, error: new Error("No auth cookie") };
  }
  let session: unknown;
  try {
    session = JSON.parse(cookieValue);
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
