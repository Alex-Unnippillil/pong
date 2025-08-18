import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  DATABASE_URL: z.string().url(),
  NEXTAUTH_URL: z.string().url(),
  EMAIL_SERVER: z.string(),
  EMAIL_FROM: z.string().email(),
  GITHUB_ID: z.string(),
  GITHUB_SECRET: z.string(),
  AUTH_SECRET: z.string(),
  UPSTASH_REDIS_URL: z.string().url(),
  UPSTASH_REDIS_TOKEN: z.string(),
  MATCHMAKING_QUEUE_TTL_SECONDS: z.coerce.number().int().positive().default(60),
  MATCH_TTL_SECONDS: z.coerce.number().int().positive().default(3600),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  const errors = parsed.error.flatten().fieldErrors
  const formatted = Object.entries(errors)
    .map(([name, issues]) => `${name}: ${issues?.join(', ')}`)
    .join('\n')
  throw new Error(`Invalid environment variables:\n${formatted}`)
}

export const env = parsed.data
