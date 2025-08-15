import { PrismaAdapter } from '@auth/prisma-adapter'
import { getServerSession, type NextAuthOptions } from 'next-auth'
import GithubProvider from 'next-auth/providers/github'
import EmailProvider from 'next-auth/providers/email'

import { prisma } from '@/lib/prisma'
import { env } from '@/lib/env.server'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: env.EMAIL_SERVER,
      from: env.EMAIL_FROM,
    }),
    GithubProvider({
      clientId: env.GITHUB_ID,
      clientSecret: env.GITHUB_SECRET,
    }),
  ],
  secret: env.AUTH_SECRET,
}

export const getServerAuthSession = () => getServerSession(authOptions)
