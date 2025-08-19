import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  DATABASE_URL: z.string().url(),
  NEXTAUTH_URL: z.string().url().default('http://localhost:3000'),
  EMAIL_SERVER: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  GITHUB_ID: z.string().optional(),
  GITHUB_SECRET: z.string().optional(),
  AUTH_SECRET: z.string().default('dev-secret'),
  UPSTASH_REDIS_URL: z.string().optional(),
  UPSTASH_REDIS_TOKEN: z.string().optional(),
  SENTRY_DSN: z.string().url().optional(),
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

export const env: z.infer<typeof envSchema> = parsed.data
