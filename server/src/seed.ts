import { PrismaClient, GoalType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clear existing data
  await prisma.goalEntry.deleteMany()
  await prisma.goal.deleteMany()
  await prisma.user.deleteMany()

  // Create a user
  const user = await prisma.user.create({
    data: {
      name: 'Alice',
      email: 'alice@example.com',
      goals: {
        create: [
          {
            title: 'Run 10k steps daily',
            description: 'Aim for 10,000 steps every day',
            colour: 'FF5733',
            public: true,
            goalType: GoalType.NUMERIC,
            numericTarget: 10000,
            numericUnit: 'steps',
            entries: {
              create: [
                {
                  entryDate: new Date('2025-06-01'),
                  numericValue: 9500,
                  note: 'Almost reached the target',
                },
                {
                  entryDate: new Date('2025-06-02'),
                  numericValue: 10200,
                  note: 'Exceeded the goal!',
                },
              ],
            },
          },
          {
            title: 'Drink 2L water daily',
            description: 'Track if you drank 2 liters of water each day',
            colour: '33A1FF',
            public: false,
            goalType: GoalType.BOOLEAN,
            entries: {
              create: [
                {
                  entryDate: new Date('2025-06-01'),
                  booleanValue: true,
                },
                {
                  entryDate: new Date('2025-06-02'),
                  booleanValue: false,
                  note: 'Forgot to drink enough',
                },
              ],
            },
          },
        ],
      },
    },
    include: {
      goals: {
        include: {
          entries: true,
        },
      },
    },
  })

  console.log('Seeded user with goals:', JSON.stringify(user, null, 2))
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
