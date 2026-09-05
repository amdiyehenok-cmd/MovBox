/**
 * Supabase auth wiring.
 *
 * Server: createServerSupabase() — uses cookies() to read the
 * user's session from the @supabase/ssr pattern.
 *
 * Browser: createBrowserSupabase() — same as the existing
 * getSupabaseBrowser() in lib/supabase.ts, but with the
 * anon key + URL baked in.
 *
 * For Google OAuth: the redirect URL is `/api/auth/callback` —
 * the user lands there after Google's consent screen, and the
 * route handler exchanges the auth code for a Supabase session
 * cookie.
 */
import { createBrowserClient } from "@supabase/ssr";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export function createBrowserSupabase() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Supabase env vars missing at build time");
  }
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

/**
 * Server-side Supabase. Reads the user's session from the request
 * cookies via Next.js `cookies()`. Use in Server Components and
 * route handlers.
 */
export async function createServerSupabase() {
  const cookieStore = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(toSet) {
        try {
          toSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options as CookieOptions)
          );
        } catch {
          // setAll is called from Server Components where cookies()
          // is read-only. Ignore — middleware will refresh.
        }
      },
    },
  });
}
