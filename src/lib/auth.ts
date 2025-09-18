import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import type { AuthError, User } from "@supabase/supabase-js";
import { supabaseadmin } from "@/lib/supabaseAdmin";

interface UserResponse {
  user: User | null;
  accessToken: string | null;
  error: AuthError | Error | null;
}

function decodeCookieValue(value: string): string {
  if (value.startsWith("base64-")) {
    try {
      return Buffer.from(value.slice(7), "base64").toString("utf-8");
    } catch (err) {
      console.error("[auth] Failed to decode base64 auth cookie", err);
      return "";
    }
  }

  return value;
}

function extractAccessToken(value: unknown): string | null {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    const [first] = value;
    if (typeof first === "string") {
      return first;
    }
    if (first && typeof first === "object" && "access_token" in first) {
      const token = (first as { access_token?: unknown }).access_token;
      return typeof token === "string" ? token : null;
    }
    return null;
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    const directToken = record.access_token;
    if (typeof directToken === "string") {
      return directToken;
    }

    const possibleSession = record.session ?? record.currentSession ?? record.data;
    if (possibleSession && typeof possibleSession === "object") {
      const sessionToken = (possibleSession as { access_token?: unknown }).access_token;
      if (typeof sessionToken === "string") {
        return sessionToken;
      }
    }

    const token = record.token;
    if (typeof token === "string") {
      return token;
    }
  }

  return null;
}

export async function getUserFromCookie(): Promise<UserResponse> {
  const cookieStore = cookies();
  let lastError: AuthError | Error | null = null;
  let accessToken: string | null = null;

  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    const user = session?.user ?? null;
    const sessionAccessToken = session?.access_token ?? null;

    if (user) {
      return { user, accessToken: sessionAccessToken, error };
    }
    accessToken = sessionAccessToken ?? null;
    lastError = error;
  } catch (err) {
    lastError = err instanceof Error ? err : new Error("Failed to retrieve user session");
  }

  const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!projectUrl) {
    return {
      user: null,
      accessToken: accessToken ?? null,
      error: lastError ?? new Error("Supabase URL not configured"),
    };
  }

  let projectRef: string | null = null;
  try {
    projectRef = new URL(projectUrl).hostname.split(".")[0] ?? null;
  } catch (err) {
    return {
      user: null,
      accessToken: accessToken ?? null,
      error:
        lastError ??
        (err instanceof Error
          ? err
          : new Error("Invalid Supabase URL configuration")),
    };
  }

  if (!projectRef) {
    return {
      user: null,
      accessToken: accessToken ?? null,
      error: lastError ?? new Error("Unable to resolve Supabase project reference"),
    };
  }

  const cookieName = `sb-${projectRef}-auth-token`;
  const tokenCookie = cookieStore.get(cookieName);

  if (!tokenCookie) {
    return {
      user: null,
      accessToken: accessToken ?? null,
      error: lastError ?? new Error("No active session"),
    };
  }

  const decoded = decodeCookieValue(tokenCookie.value);
  let parsedValue: unknown;

  try {
    parsedValue = JSON.parse(decoded);
  } catch {
    return {
      user: null,
      accessToken: accessToken ?? null,
      error: lastError ?? new Error("Invalid auth cookie"),
    };
  }

  accessToken = extractAccessToken(parsedValue);

  if (!accessToken) {
    return {
      user: null,
      accessToken: null,
      error: lastError ?? new Error("No access token found in auth cookie"),
    };
  }

  const { data, error } = await supabaseadmin.auth.getUser(accessToken);

  if (error || !data.user) {
    return {
      user: null,
      accessToken,
      error: error ?? lastError ?? new Error("Unable to retrieve user for session"),
    };
  }

  return { user: data.user, accessToken, error: error ?? lastError };
}
