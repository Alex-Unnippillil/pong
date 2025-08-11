import { PrismaClient, Mode } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const alice = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      email: 'alice@example.com',
      name: 'Alice',
      profile: { create: { displayName: 'Alice', avatarUrl: '' } },
      leaderboard: { create: {} },
    },
  })

  const bob = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      email: 'bob@example.com',
      name: 'Bob',
      profile: { create: { displayName: 'Bob', avatarUrl: '' } },
      leaderboard: { create: {} },
    },
  })

  await prisma.match.create({
    data: {
      mode: Mode.SINGLEPLAYER,
      p1Id: alice.id,
      p2Id: bob.id,
      p1Score: 11,
      p2Score: 9,
      winnerId: alice.id,
      endedAt: new Date(),
    },
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
