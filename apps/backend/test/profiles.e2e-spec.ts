import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { prisma } from './helpers/prisma';
import { loginWithCookie } from './helpers/login';
import * as bcrypt from 'bcrypt';
import * as cookieParser from 'cookie-parser';
import { Goal, GoalPublicity, GoalQuantify, ProfilePublicity, User } from '@prisma/client';
import TestAgent from 'supertest/lib/agent';
import { ProfileResponseDto } from '@habit-tracker/validation-schemas';

describe('Profiles API (E2E)', () => {
  let app: INestApplication;

  let alice: User;
  let bob: User;
  let charlie: User;

  let aliceAgent: TestAgent;
  let bobAgent: TestAgent;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.goalEntry.deleteMany();
    await prisma.goal.deleteMany();
    await prisma.user.deleteMany();

    // Seed users
    const alicePassword = 'alicespassword123';
    const bobPassword = 'bobspassword123';
    const charliePassword = 'charliepassword123';

    const aliceHash = await bcrypt.hash(
      alicePassword,
      parseInt(process.env.TEST_BCRYPT_SALT_ROUNDS || '1'),
    );
    const bobHash = await bcrypt.hash(
      bobPassword,
      parseInt(process.env.TEST_BCRYPT_SALT_ROUNDS || '1'),
    );
    const charlieHash = await bcrypt.hash(
      charliePassword,
      parseInt(process.env.TEST_BCRYPT_SALT_ROUNDS || '1'),
    );

    alice = await prisma.user.create({
      data: {
        email: 'alice@test.com',
        username: 'alice',
        password: aliceHash,
        profilePublicity: ProfilePublicity.PUBLIC,
      },
    });

    bob = await prisma.user.create({
      data: {
        email: 'bob@test.com',
        username: 'bob',
        password: bobHash,
        profilePublicity: ProfilePublicity.PRIVATE,
      },
    });

    charlie = await prisma.user.create({
      data: {
        email: 'charlie@test.com',
        username: 'charlie',
        password: charlieHash,
        profilePublicity: ProfilePublicity.PUBLIC,
      },
    });

    // Login users and get agents
    aliceAgent = await loginWithCookie(app, {
      email: alice.email,
      password: alicePassword,
    });
    bobAgent = await loginWithCookie(app, {
      email: bob.email,
      password: bobPassword,
    });
  });

  /**
   * GET /profiles/:username
   */
  describe('GET /profiles/:username', () => {
    it('returns 404 for non-existent user', async () => {
      const res = await request(app.getHttpServer())
        .get('/profiles/nonexistent')
        .expect(404);
      expect(res.body.message).toContain('not found');
    });

    it('allows unauthenticated access to public profile', async () => {
      const res = await request(app.getHttpServer())
        .get(`/profiles/${alice.username}`)
        .expect(200);

      expect(res.body.username).toBe('alice');
      expect(res.body.joinedAt).toBeDefined();
      expect(res.body.daysTrackedTotal).toBeDefined();
    });

    it('returns full profile data for public profile (owner)', async () => {
      const res = await aliceAgent.get(`/profiles/${alice.username}`).expect(200);

      expect(res.body.username).toBe('alice');
      expect(res.body.joinedAt).toBeDefined();
      expect(res.body.daysTrackedTotal).toBeDefined();
    });

    it('returns full profile data for public profile (non-owner)', async () => {
      const res = await bobAgent.get(`/profiles/${alice.username}`).expect(200);

      expect(res.body.username).toBe('alice');
      expect(res.body.joinedAt).toBeDefined();
      expect(res.body.daysTrackedTotal).toBeDefined();
    });

    it('returns full profile data for private profile (owner)', async () => {
      const res = await bobAgent.get(`/profiles/${bob.username}`).expect(200);

      expect(res.body.username).toBe('bob');
      expect(res.body.joinedAt).toBeDefined();
      expect(res.body.daysTrackedTotal).toBeDefined();
    });

    it('returns limited profile data for private profile (non-owner)', async () => {
      const res = await aliceAgent.get(`/profiles/${bob.username}`).expect(200);

      expect(res.body.username).toBe('bob');
      expect(res.body.joinedAt).toBeUndefined();
      expect(res.body.daysTrackedTotal).toBeUndefined();
    });

    it('denies unauthenticated access to private profile (non-owner)', async () => {
      const res = await request(app.getHttpServer())
        .get(`/profiles/${bob.username}`)
        .expect(200);

      // Unauthenticated users are treated as non-owners
      expect(res.body.username).toBe('bob');
      expect(res.body.joinedAt).toBeUndefined();
      expect(res.body.daysTrackedTotal).toBeUndefined();
    });
  });

  /**
   * GET /profiles/:username - Days Tracked Calculation
   */
  describe('GET /profiles/:username - Days Tracked', () => {
    let alicePublicGoal: Goal;
    let alicePrivateGoal: Goal;

    beforeEach(async () => {
      // Create goals for alice
      alicePublicGoal = await prisma.goal.create({
        data: {
          title: 'Alice Public Goal',
          userId: alice.id,
          goalType: GoalQuantify.NUMERIC,
          publicity: GoalPublicity.PUBLIC,
          order: 1,
          colour: 'FFFFFF',
          icon: 'a1',
        },
      });

      alicePrivateGoal = await prisma.goal.create({
        data: {
          title: 'Alice Private Goal',
          userId: alice.id,
          goalType: GoalQuantify.NUMERIC,
          publicity: GoalPublicity.PRIVATE,
          order: 2,
          colour: 'FFFFFF',
          icon: 'a2',
        },
      });
    });

    it('counts entries from all goals for owner', async () => {
      // Add entries to both public and private goals
      await prisma.goalEntry.createMany({
        data: [
          {
            goalId: alicePublicGoal.id,
            entryDate: new Date('2025-01-01'),
            numericValue: 5,
          },
          {
            goalId: alicePrivateGoal.id,
            entryDate: new Date('2025-01-02'),
            numericValue: 10,
          },
          {
            goalId: alicePublicGoal.id,
            entryDate: new Date('2025-01-03'),
            numericValue: 8,
          },
        ],
      });

      const res = await aliceAgent.get(`/profiles/${alice.username}`).expect(200);

      // Should count all 3 days (2 different dates would give 2, but we have 3 entries across 3 dates)
      expect(res.body.daysTrackedTotal).toBe(3);
    });

    it('counts entries from only public goals for non-owner', async () => {
      // Add entries to both public and private goals
      await prisma.goalEntry.createMany({
        data: [
          {
            goalId: alicePublicGoal.id,
            entryDate: new Date('2025-01-01'),
            numericValue: 5,
          },
          {
            goalId: alicePrivateGoal.id,
            entryDate: new Date('2025-01-02'),
            numericValue: 10,
          },
          {
            goalId: alicePublicGoal.id,
            entryDate: new Date('2025-01-03'),
            numericValue: 8,
          },
        ],
      });

      const res = await bobAgent.get(`/profiles/${alice.username}`).expect(200);

      // Should count only public goal entries: 2 unique days (Jan 1 and Jan 3)
      expect(res.body.daysTrackedTotal).toBe(2);
    });

    it('returns zero days tracked when no entries exist', async () => {
      const res = await aliceAgent.get(`/profiles/${alice.username}`).expect(200);
      expect(res.body.daysTrackedTotal).toBe(0);
    });

    it('counts unique dates only (not total entries)', async () => {
      // Add multiple entries on the same date
      await prisma.goalEntry.createMany({
        data: [
          {
            goalId: alicePublicGoal.id,
            entryDate: new Date('2025-01-01'),
            numericValue: 5,
          },
          {
            goalId: alicePrivateGoal.id,
            entryDate: new Date('2025-01-01'),
            numericValue: 10,
          },
          {
            goalId: alicePublicGoal.id,
            entryDate: new Date('2025-01-02'),
            numericValue: 8,
          },
        ],
      });

      const res = await aliceAgent.get(`/profiles/${alice.username}`).expect(200);

      // Should count 2 unique dates
      expect(res.body.daysTrackedTotal).toBe(2);
    });
  });

  /**
   * GET /profiles/:username/goals
   */
  describe('GET /profiles/:username/goals', () => {
    let alicePublicGoal: Goal;
    let alicePrivateGoal: Goal;
    let bobPublicGoal: Goal;

    beforeEach(async () => {
      alicePublicGoal = await prisma.goal.create({
        data: {
          title: 'Alice Public Goal',
          userId: alice.id,
          goalType: GoalQuantify.NUMERIC,
          publicity: GoalPublicity.PUBLIC,
          order: 1,
          colour: 'FFFFFF',
          icon: 'a1',
        },
      });

      alicePrivateGoal = await prisma.goal.create({
        data: {
          title: 'Alice Private Goal',
          userId: alice.id,
          goalType: GoalQuantify.NUMERIC,
          publicity: GoalPublicity.PRIVATE,
          order: 2,
          colour: 'FFFFFF',
          icon: 'a2',
        },
      });

      bobPublicGoal = await prisma.goal.create({
        data: {
          title: 'Bob Public Goal',
          userId: bob.id,
          goalType: GoalQuantify.BOOLEAN,
          publicity: GoalPublicity.PUBLIC,
          order: 1,
          colour: 'FFFFFF',
          icon: 'b1',
        },
      });
    });

    it('returns 404 for non-existent user', async () => {
      const res = await request(app.getHttpServer())
        .get(`/profiles/nonexistent/goals`)
        .expect(404);
      expect(res.body.message).toContain('not found');
    });

    it('returns all goals for owner', async () => {
      const res = await aliceAgent
        .get(`/profiles/${alice.username}/goals`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      const goalTitles = res.body.map((g) => g.title);
      expect(goalTitles).toContain('Alice Public Goal');
      expect(goalTitles).toContain('Alice Private Goal');
      expect(res.body.length).toBe(2);
    });

    it('returns only public goals for non-owner of public profile', async () => {
      const res = await bobAgent
        .get(`/profiles/${alice.username}/goals`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      const goalTitles = res.body.map((g) => g.title);
      expect(goalTitles).toContain('Alice Public Goal');
      expect(goalTitles).not.toContain('Alice Private Goal');
      expect(res.body.length).toBe(1);
    });

    it('returns empty array for non-owner of private profile', async () => {
      const res = await aliceAgent
        .get(`/profiles/${bob.username}/goals`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });

    it('returns all goals for owner of private profile', async () => {
      const res = await bobAgent
        .get(`/profiles/${bob.username}/goals`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      const goalTitles = res.body.map((g) => g.title);
      expect(goalTitles).toContain('Bob Public Goal');
      expect(res.body.length).toBe(1);
    });

    it('allows unauthenticated access to public profile goals', async () => {
      const res = await request(app.getHttpServer())
        .get(`/profiles/${alice.username}/goals`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      const goalTitles = res.body.map((g) => g.title);
      expect(goalTitles).toContain('Alice Public Goal');
      expect(goalTitles).not.toContain('Alice Private Goal');
    });

    it('returns empty array for unauthenticated access to private profile goals', async () => {
      const res = await request(app.getHttpServer())
        .get(`/profiles/${bob.username}/goals`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });

    it('returns goals in order', async () => {
      await prisma.goal.create({
        data: {
          title: 'Alice Third Goal',
          userId: alice.id,
          goalType: GoalQuantify.BOOLEAN,
          publicity: GoalPublicity.PUBLIC,
          order: 3,
          colour: 'FFFFFF',
          icon: 'a3',
        },
      });

      const res = await aliceAgent
        .get(`/profiles/${alice.username}/goals`)
        .expect(200);

      expect(res.body[0].order).toBeLessThanOrEqual(res.body[1].order);
      if (res.body.length > 2) {
        expect(res.body[1].order).toBeLessThanOrEqual(res.body[2].order);
      }
    });
  });
});
