import { z } from 'zod'

const serverSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  EMAIL_SERVER: z.string().min(1),
  EMAIL_FROM: z.string().email(),
  GITHUB_ID: z.string().min(1),
  GITHUB_SECRET: z.string().min(1),
  GOOGLE_ID: z.string().min(1),
  GOOGLE_SECRET: z.string().min(1),
  UPSTASH_REDIS_URL: z.string().url(),
  UPSTASH_REDIS_TOKEN: z.string().min(1),
  CI: z.string().optional(),
})

const clientSchema = z.object({
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().optional(),
})

const schema = serverSchema.merge(clientSchema)

const _env =
  typeof window === 'undefined'
    ? schema.safeParse(process.env)
    : clientSchema.safeParse(process.env)

if (!_env.success) {
  console.error(
    '❌ Invalid environment variables:',
    _env.error.flatten().fieldErrors,
  )
  throw new Error('Invalid environment variables')
}

export const env = _env.data as z.infer<typeof schema>
