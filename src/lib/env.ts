import { z } from 'zod'

const envSchema = z.object({
  UPSTASH_REDIS_URL: z.string().url(),
  UPSTASH_REDIS_TOKEN: z.string().min(1),
})

const envResult = envSchema.safeParse(process.env)

if (!envResult.success) {
  const missing = Object.keys(envResult.error.flatten().fieldErrors)
    .map((name) => `- ${name}`)
    .join('\n')
  const message = `Missing environment variables:\n${missing}`

  if (process.env.NODE_ENV === 'development') {
    console.warn(message)
  } else {
    throw new Error(message)
  }
}

export const env = envResult.success
  ? envResult.data
  : {
      UPSTASH_REDIS_URL: process.env.UPSTASH_REDIS_URL!,
      UPSTASH_REDIS_TOKEN: process.env.UPSTASH_REDIS_TOKEN!,
    }
