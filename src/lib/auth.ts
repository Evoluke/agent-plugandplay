import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import type { AuthError, User } from "@supabase/supabase-js";

interface UserResponse {
  user: User | null;
  accessToken: string | null;
  error: AuthError | Error | null;
}

export async function getUserFromCookie(): Promise<UserResponse> {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    const user = session?.user ?? null;
    const accessToken = session?.access_token ?? null;

    if (!user) {
      return {
        user: null,
        accessToken,
        error: error ?? new Error("No active session"),
      };
    }

    return { user, accessToken, error };
  } catch (err) {
    const normalizedError =
      err instanceof Error ? err : new Error("Failed to retrieve user session");
    return { user: null, accessToken: null, error: normalizedError };
  }
}
