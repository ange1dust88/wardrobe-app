import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let cached: SupabaseClient | null = null

function getClient(): SupabaseClient {
  if (!cached) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
    cached = createClient(url, anonKey)
  }
  return cached
}

// Lazy so the client is only built on first use (in the browser), never at
// module-eval during static prerender — where the public env may be inlined
// as empty and createClient would throw.
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getClient()
    const value = Reflect.get(client, prop) as unknown
    return typeof value === 'function' ? value.bind(client) : value
  },
})
