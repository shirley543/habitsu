import { PrismaClient, GoalQuantify, GoalPublicity } from '@prisma/client'

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
            title: 'Drink water',
            description: 'Drink at least 6 cups per day',
            colour: '38BDF8',
            icon: 'glass-water',
            publicity: GoalPublicity.PRIVATE,
            goalType: GoalQuantify.NUMERIC,
            numericTarget: 6,
            numericUnit: 'cups',
            visibility: true,
            order: 1,
            entries: {
              create: [
                { entryDate: new Date('2025-01-01'), numericValue: 3 },
                { entryDate: new Date('2025-01-02'), numericValue: 1 },
                { entryDate: new Date('2025-01-04'), numericValue: 5 },
                { entryDate: new Date('2025-01-07'), numericValue: 2 },
                { entryDate: new Date('2025-01-08'), numericValue: 6 },
                { entryDate: new Date('2025-01-10'), numericValue: 1 },
                { entryDate: new Date('2025-01-12'), numericValue: 4 },
                { entryDate: new Date('2025-01-14'), numericValue: 2 },
                { entryDate: new Date('2025-01-15'), numericValue: 5 },
                { entryDate: new Date('2025-01-18'), numericValue: 3 },
                { entryDate: new Date('2025-01-20'), numericValue: 6 },
                { entryDate: new Date('2025-01-23'), numericValue: 4 },
                { entryDate: new Date('2025-01-26'), numericValue: 2 },
                { entryDate: new Date('2025-02-01'), numericValue: 5 },
                { entryDate: new Date('2025-02-05'), numericValue: 1 },
                { entryDate: new Date('2025-02-07'), numericValue: 3 },
                { entryDate: new Date('2025-02-09'), numericValue: 6 },
                { entryDate: new Date('2025-02-14'), numericValue: 4 },
                { entryDate: new Date('2025-02-16'), numericValue: 2 },
                { entryDate: new Date('2025-02-18'), numericValue: 1 },
                { entryDate: new Date('2025-02-22'), numericValue: 6 },
                { entryDate: new Date('2025-03-01'), numericValue: 5 },
                { entryDate: new Date('2025-03-04'), numericValue: 3 },
                { entryDate: new Date('2025-03-06'), numericValue: 2 },
                { entryDate: new Date('2025-03-10'), numericValue: 4 },
                { entryDate: new Date('2025-03-13'), numericValue: 6 },
                { entryDate: new Date('2025-03-17'), numericValue: 1 },
                { entryDate: new Date('2025-03-22'), numericValue: 5 },
                { entryDate: new Date('2025-04-01'), numericValue: 3 },
                { entryDate: new Date('2025-04-05'), numericValue: 2 },
                { entryDate: new Date('2025-04-09'), numericValue: 4 },
                { entryDate: new Date('2025-04-14'), numericValue: 6 },
                { entryDate: new Date('2025-04-18'), numericValue: 1 },
                { entryDate: new Date('2025-04-22'), numericValue: 5 },
                { entryDate: new Date('2025-05-01'), numericValue: 3 },
                { entryDate: new Date('2025-05-06'), numericValue: 4 },
                { entryDate: new Date('2025-05-11'), numericValue: 2 },
                { entryDate: new Date('2025-05-16'), numericValue: 6 },
                { entryDate: new Date('2025-05-21'), numericValue: 1 },
                { entryDate: new Date('2025-05-26'), numericValue: 5 },
                { entryDate: new Date('2025-06-01'), numericValue: 3 },
                { entryDate: new Date('2025-06-03'), numericValue: 2 },
                { entryDate: new Date('2025-06-06'), numericValue: 4 },
                { entryDate: new Date('2025-06-10'), numericValue: 1 },
                { entryDate: new Date('2025-06-15'), numericValue: 6 },
                { entryDate: new Date('2025-06-21'), numericValue: 3 },
                { entryDate: new Date('2025-06-28'), numericValue: 5 },
                { entryDate: new Date('2025-07-01'), numericValue: 2 },
                { entryDate: new Date('2025-07-03'), numericValue: 4 },
              ],
            },
          },
          {
            title: 'Screen-free morning',
            description: 'No scrolling on phone early in the morning',
            colour: 'F472B6',
            icon: 'hourglass',
            publicity: GoalPublicity.PUBLIC,
            goalType: GoalQuantify.BOOLEAN,
            visibility: true,
            order: 2,
            entries: {
              create: [
                { entryDate: new Date('2025-01-01') },
                { entryDate: new Date('2025-01-02') },
                { entryDate: new Date('2025-01-04') },
                { entryDate: new Date('2025-01-07') },
                { entryDate: new Date('2025-01-08') },
                { entryDate: new Date('2025-01-10') },
                { entryDate: new Date('2025-01-12') },
                { entryDate: new Date('2025-01-14') },
                { entryDate: new Date('2025-01-15') },
                { entryDate: new Date('2025-01-18') },
                { entryDate: new Date('2025-01-20') },
                { entryDate: new Date('2025-01-23') },
                { entryDate: new Date('2025-01-26') },
                { entryDate: new Date('2025-02-01') },
                { entryDate: new Date('2025-02-05') },
                { entryDate: new Date('2025-02-07') },
                { entryDate: new Date('2025-02-09') },
                { entryDate: new Date('2025-02-14') },
                { entryDate: new Date('2025-02-16') },
                { entryDate: new Date('2025-02-18') },
                { entryDate: new Date('2025-02-22') },
                { entryDate: new Date('2025-03-01') },
                { entryDate: new Date('2025-03-04') },
                { entryDate: new Date('2025-03-06') },
                { entryDate: new Date('2025-03-10') },
                { entryDate: new Date('2025-03-13') },
                { entryDate: new Date('2025-03-17') },
                { entryDate: new Date('2025-03-22') },
                { entryDate: new Date('2025-04-01') },
                { entryDate: new Date('2025-04-05') },
                { entryDate: new Date('2025-04-09') },
                { entryDate: new Date('2025-04-14') },
                { entryDate: new Date('2025-04-18') },
                { entryDate: new Date('2025-04-22') },
                { entryDate: new Date('2025-05-01') },
                { entryDate: new Date('2025-05-06') },
                { entryDate: new Date('2025-05-11') },
                { entryDate: new Date('2025-05-16') },
                { entryDate: new Date('2025-05-21') },
                { entryDate: new Date('2025-05-26') },
                { entryDate: new Date('2025-06-01') },
                { entryDate: new Date('2025-06-03') },
                { entryDate: new Date('2025-06-06') },
                { entryDate: new Date('2025-06-10') },
                { entryDate: new Date('2025-06-15') },
                { entryDate: new Date('2025-06-21') },
                { entryDate: new Date('2025-06-28') },
                { entryDate: new Date('2025-07-01') },
                { entryDate: new Date('2025-07-03') },
              ],
            },
          },
          {
            title: 'Play piano',
            description: 'Play for 30 minutes per day',
            colour: 'A78BFA',
            icon: 'piano',
            publicity: GoalPublicity.PUBLIC,
            goalType: GoalQuantify.NUMERIC,
            numericTarget: 30,
            numericUnit: 'minutes',
            visibility: true,
            order: 3,
            entries: {
              create: [
                // First streak (longest: 14 days)
                { entryDate: new Date('2025-01-01'), numericValue: 30 },
                { entryDate: new Date('2025-01-02'), numericValue: 30 },
                { entryDate: new Date('2025-01-03'), numericValue: 30 },
                { entryDate: new Date('2025-01-04'), numericValue: 30 },
                { entryDate: new Date('2025-01-05'), numericValue: 30 },
                { entryDate: new Date('2025-01-06'), numericValue: 30 },
                { entryDate: new Date('2025-01-07'), numericValue: 30 },
                { entryDate: new Date('2025-01-08'), numericValue: 30 },
                { entryDate: new Date('2025-01-09'), numericValue: 30 },
                { entryDate: new Date('2025-01-10'), numericValue: 30 },
                { entryDate: new Date('2025-01-11'), numericValue: 30 },
                { entryDate: new Date('2025-01-12'), numericValue: 30 },
                { entryDate: new Date('2025-01-13'), numericValue: 30 },
                { entryDate: new Date('2025-01-14'), numericValue: 30 },
                // Second streak (current: 13 days)
                { entryDate: new Date('2025-07-01'), numericValue: 20 },
                { entryDate: new Date('2025-07-02'), numericValue: 20 },
                { entryDate: new Date('2025-07-03'), numericValue: 20 },
                { entryDate: new Date('2025-07-04'), numericValue: 20 },
                { entryDate: new Date('2025-07-05'), numericValue: 20 },
                { entryDate: new Date('2025-07-06'), numericValue: 20 },
                { entryDate: new Date('2025-07-07'), numericValue: 20 },
                { entryDate: new Date('2025-07-08'), numericValue: 20 },
                { entryDate: new Date('2025-07-09'), numericValue: 20 },
                { entryDate: new Date('2025-07-10'), numericValue: 20 },
                { entryDate: new Date('2025-07-11'), numericValue: 20 },
                { entryDate: new Date('2025-07-12'), numericValue: 20 },
                { entryDate: new Date('2025-07-13'), numericValue: 20 },
                // Average: [(30 * 14) + (20 * 13)] / (14 + 13) = 25.1851851852
                // Tracked Days: 14 + 13 = 27
                // Average per Month:
                // - Jan: 30
                // - Feb: 0
                // - July: 20
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
