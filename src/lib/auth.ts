import { PrismaAdapter } from '@auth/prisma-adapter'
import { getServerSession, type NextAuthOptions } from 'next-auth'
import GithubProvider from 'next-auth/providers/github'
import EmailProvider from 'next-auth/providers/email'

import { prisma } from '@/lib/prisma'
import { env } from '@/lib/env.server'

const providers: NextAuthOptions['providers'] = []

if (env.EMAIL_SERVER && env.EMAIL_FROM) {
  providers.push(
    EmailProvider({
      server: env.EMAIL_SERVER,
      from: env.EMAIL_FROM,
    }),
  )
}

if (env.GITHUB_ID && env.GITHUB_SECRET) {
  providers.push(
    GithubProvider({
      clientId: env.GITHUB_ID,
      clientSecret: env.GITHUB_SECRET,
    }),
  )
}

if (providers.length === 0) {
  throw new Error(
    'No auth providers configured. Please set EMAIL_* or GITHUB_* environment variables.',
  )
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers,
  secret: env.AUTH_SECRET,
}

export const getServerAuthSession = () => getServerSession(authOptions)
