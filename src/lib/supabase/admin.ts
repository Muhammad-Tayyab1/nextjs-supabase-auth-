import { createClient } from "@supabase/supabase-js";

/**
 * Admin client using the service role key, which bypasses row-level
 * security. Never import this from client components or expose the key to
 * the browser — only use it inside Server Actions / Route Handlers for
 * operations the user's own JWT can't perform (e.g. deleting an auth user).
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
