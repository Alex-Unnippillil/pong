import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  UPSTASH_REDIS_URL: z.string().url(),
  UPSTASH_REDIS_TOKEN: z.string(),
  NEXT_PUBLIC_POSTHOG_KEY: z.string(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
  EMAIL_SERVER: z.string(),
  EMAIL_FROM: z.string().email(),
  GITHUB_ID: z.string(),
  GITHUB_SECRET: z.string(),
  GOOGLE_ID: z.string(),
  GOOGLE_SECRET: z.string(),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error(
    'Invalid environment variables:',
    parsed.error.flatten().fieldErrors,
  )
  throw new Error('Invalid environment variables')
}

export const {
  DATABASE_URL,
  UPSTASH_REDIS_URL,
  UPSTASH_REDIS_TOKEN,
  NEXT_PUBLIC_POSTHOG_KEY,
  NEXT_PUBLIC_POSTHOG_HOST,
  EMAIL_SERVER,
  EMAIL_FROM,
  GITHUB_ID,
  GITHUB_SECRET,
  GOOGLE_ID,
  GOOGLE_SECRET,
} = parsed.data
