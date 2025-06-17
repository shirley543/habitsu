import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.post.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const user1 = await prisma.user.create({
    data: {
      name: 'Alice',
      email: 'alice@example.com',
      profile: {
        create: {
          bio: 'I am Alice',
        },
      },
      posts: {
        create: [
          {
            title: 'This is Alice\'s first post',
            content: 'This is my first post',
            published: true,
          },
          {
            title: 'This is Alice\'s second post',
            content: 'This is my second post',
            published: false,
          },
        ],
      },
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Bob',
      email: 'bob@example.com',
      profile: {
        create: {
          bio: 'I am Bob',
        },
      },
      posts: {
        create: [
          {
            title: 'This is a post from Bob',
            content: 'Bob is great',
            published: true,
          },
        ],
      },
    },
  });

  console.log('Database seeded');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
