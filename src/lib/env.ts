import { z } from 'zod'

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  EMAIL_SERVER: z.string().min(1),
  EMAIL_FROM: z.string().email(),
  GITHUB_ID: z.string().min(1),
  GITHUB_SECRET: z.string().min(1),
  AUTH_SECRET: z.string().min(1),
  UPSTASH_REDIS_URL: z.string().url(),
  UPSTASH_REDIS_TOKEN: z.string().min(1),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().optional(),
})

const _env = envSchema.safeParse(process.env)

if (!_env.success) {
  console.error(
    'Invalid environment variables:\n',
    _env.error.flatten().fieldErrors,
  )
  throw new Error('Invalid environment variables')
}

export const env = _env.data
