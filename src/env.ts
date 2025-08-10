import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).optional(),
  UPSTASH_REDIS_URL: z.string().url(),
  UPSTASH_REDIS_TOKEN: z.string(),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
  EMAIL_SERVER: z.string(),
  EMAIL_FROM: z.string().email(),
  GITHUB_ID: z.string(),
  GITHUB_SECRET: z.string(),
  GOOGLE_ID: z.string(),
  GOOGLE_SECRET: z.string(),
  CI: z.string().optional(),
})

const env = envSchema.parse(process.env)

export const {
  NODE_ENV,
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
  CI,
} = env

export { envSchema }
