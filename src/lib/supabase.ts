import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { env } from '@/lib/env'

export const supabase: SupabaseClient | null =
  env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ? createClient(
        env.NEXT_PUBLIC_SUPABASE_URL,
        env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      )
    : null
