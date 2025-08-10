import { PrismaClient } from '@prisma/client'
import { NODE_ENV } from '@/env'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma =
  globalForPrisma.prisma || new PrismaClient({ log: ['error', 'warn'] })

if (NODE_ENV !== 'production') globalForPrisma.prisma = prisma
