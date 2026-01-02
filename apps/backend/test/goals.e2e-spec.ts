import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { prisma } from './helpers/prisma'
import { Goal, GoalPublicity, GoalQuantify, User } from '@prisma/client';
import { loginWithCookie } from './helpers/login';
import TestAgent from 'supertest/lib/agent';
import { PrismaService } from '../src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

describe('Goals API (Integration with cookies)', () => {
  let app: INestApplication;

  let alice: User;
  let bob: User;

  let alicePublicGoal: Goal;
  let alicePrivateGoal: Goal;
  let bobPublicGoal: Goal;
  let bobPrivateGoal: Goal;

  let aliceAgent: TestAgent;
  let bobAgent: TestAgent;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    // .overrideProvider(ConfigService)
    // .useValue({
    //   get: (key: string) => {
    //     if (key === 'DATABASE_URL') {
    //       console.log(`process.env.DATABASE_URL ${process.env.DATABASE_URL}`)
    //       return process.env.DATABASE_URL; // Testcontainers URL
    //     }
    //     return undefined;
    //   },
    // })
    .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.goal.deleteMany();
    await prisma.user.deleteMany();

    // Seed users
    alice = await prisma.user.create({ data: { email: 'alice@test.com', username: 'Alice', password: 'alicepassword' } });
    bob = await prisma.user.create({ data: { email: 'bob@test.com', username: 'Bob', password: 'bobpassword' } });

    // Seed goals
    alicePublicGoal = await prisma.goal.create({
      data: { title: 'Alice Public', description: 'Public goal', userId: alice.id, colour: '#FFF', icon: 'a1', goalType: GoalQuantify.NUMERIC, order: 1, publicity: GoalPublicity.PUBLIC },
    });
    alicePrivateGoal = await prisma.goal.create({
      data: { title: 'Alice Private', description: 'Private goal', userId: alice.id, colour: '#FFF', icon: 'a2', goalType: GoalQuantify.BOOLEAN, order: 2, publicity: GoalPublicity.PRIVATE },
    });
    bobPublicGoal = await prisma.goal.create({
      data: { title: 'Bob Public', description: 'Public goal', userId: bob.id, colour: '#FFF', icon: 'b1', goalType: GoalQuantify.NUMERIC, order: 1, publicity: GoalPublicity.PUBLIC },
    });
    bobPrivateGoal = await prisma.goal.create({
      data: { title: 'Bob Private', description: 'Private goal', userId: bob.id, colour: '#FFF', icon: 'b2', goalType: GoalQuantify.BOOLEAN, order: 2, publicity: GoalPublicity.PRIVATE },
    });

    // Log in users with cookies
    aliceAgent = await loginWithCookie(app, alice);
    bobAgent = await loginWithCookie(app, bob);
  });

  // --------------------------------------
  // Access control tests for logged-in users with cookies
  // --------------------------------------
  describe('GET /goals (logged-in user)', () => {
    it('Alice sees her own public and private goals, and Bob’s public goals only', async () => {
      const response = await aliceAgent
        .get('/goals')
        .expect(200);

      const titles = response.body.map((g: any) => g.title);

      expect(titles).toContain('Alice Public');
      expect(titles).toContain('Alice Private');
      expect(titles).toContain('Bob Public');  // public goal from another user
      expect(titles).not.toContain('Bob Private'); // cannot see Bob's private goal
    });

    it('Bob sees his own public and private goals, and Alice’s public goals only', async () => {
      const response = await bobAgent
        .get('/goals')
        .expect(200);

      const titles = response.body.map((g: any) => g.title);

      expect(titles).toContain('Bob Public');
      expect(titles).toContain('Bob Private');
      expect(titles).toContain('Alice Public'); // public goal from another user
      expect(titles).not.toContain('Alice Private'); // cannot see Alice's private goal
    });
  });

  // // --------------------------------------
  // // Access control tests for unauthenticated users
  // // --------------------------------------
  // describe('GET /goals (unauthenticated)', () => {
  //   it('returns only public goals', async () => {
  //     const response = await request(app.getHttpServer())
  //       .get('/goals')
  //       .expect(200);

  //     const titles = response.body.map((g: any) => g.title);

  //     expect(titles).toContain('Alice Public');
  //     expect(titles).toContain('Bob Public');
  //     expect(titles).not.toContain('Alice Private');
  //     expect(titles).not.toContain('Bob Private');
  //   });
  // });
});

// TODOs #66
// - Update to use TestContainers properly (currently still modifying local DB)
// - Fix login with cookie failing (jwt undefined error)
