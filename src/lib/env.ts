import { z } from 'zod'

const envSchema = z.object({
  EMAIL_SERVER: z.string(),
  EMAIL_FROM: z.string(),
  GITHUB_ID: z.string(),
  GITHUB_SECRET: z.string(),
  AUTH_SECRET: z.string(),
  UPSTASH_REDIS_URL: z.string().url(),
  UPSTASH_REDIS_TOKEN: z.string(),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().optional(),
})

export const env = envSchema.parse(process.env)
