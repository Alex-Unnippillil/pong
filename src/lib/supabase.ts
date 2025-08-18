import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { env } from '@/lib/env.client'

let supabase: SupabaseClient | null = null

if (env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  try {
    supabase = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    )
  } catch (error) {
    console.warn('Failed to initialize Supabase client', error)
    supabase = null
  }
} else {
  console.warn('Supabase environment variables are missing or invalid')
}

export { supabase }
