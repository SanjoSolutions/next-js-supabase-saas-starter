import { createClient as createSupabaseClient } from "@supabase/supabase-js"

/**
 * Creates a Supabase admin client using the service role key.
 * This bypasses Row Level Security and should only be used on the server-side
 * for operations that require elevated privileges, like webhooks.
 * 
 * IMPORTANT: Never expose this client to the browser.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set")
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
