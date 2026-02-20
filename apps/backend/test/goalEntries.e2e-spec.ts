import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { prisma } from './helpers/prisma';
import { loginWithCookie } from './helpers/login';
import * as bcrypt from 'bcrypt';
import * as cookieParser from 'cookie-parser';
import {
  Goal,
  GoalEntry,
  GoalPublicity,
  GoalQuantify,
  User,
  ProfilePublicity,
} from '@prisma/client';
import TestAgent from 'supertest/lib/agent';
import {
  CreateGoalEntryDto,
  UpdateGoalEntryDto,
  GoalEntryResponse,
  SearchParamsGoalEntryDto,
} from '@habit-tracker/validation-schemas';

describe('Goal Entries API (E2E)', () => {
  let app: INestApplication;

  let alice: User;
  let bob: User;

  let aliceGoal: Goal;
  let bobGoal: Goal;
  let alicePrivateGoal: Goal;
  let bobPrivateGoal: Goal;

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
    const alicePassword = 'alicespassword';
    const bobPassword = 'bobpassword';
    const aliceHash = await bcrypt.hash(
      alicePassword,
      parseInt(process.env.TEST_BCRYPT_SALT_ROUNDS || '1'),
    );
    const bobHash = await bcrypt.hash(
      bobPassword,
      parseInt(process.env.TEST_BCRYPT_SALT_ROUNDS || '1'),
    );
    alice = await prisma.user.create({
      data: { email: 'alice@test.com', username: 'Alice', password: aliceHash },
    });
    bob = await prisma.user.create({
      data: { email: 'bob@test.com', username: 'Bob', password: bobHash },
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

    // Seed goals
    aliceGoal = await prisma.goal.create({
      data: {
        title: 'Alice Public Goal',
        userId: alice.id,
        goalType: GoalQuantify.NUMERIC,
        publicity: GoalPublicity.PUBLIC,
        order: 1,
        colour: 'FFFFFF',
        icon: 'a1',
        numericUnit: 'km',
      },
    });

    alicePrivateGoal = await prisma.goal.create({
      data: {
        title: 'Alice Private Goal',
        userId: alice.id,
        goalType: GoalQuantify.BOOLEAN,
        publicity: GoalPublicity.PRIVATE,
        order: 2,
        colour: 'FFFFFF',
        icon: 'a2',
      },
    });

    bobGoal = await prisma.goal.create({
      data: {
        title: 'Bob Public Goal',
        userId: bob.id,
        goalType: GoalQuantify.NUMERIC,
        publicity: GoalPublicity.PUBLIC,
        order: 1,
        colour: 'FFFFFF',
        icon: 'b1',
        numericUnit: 'miles',
      },
    });

    bobPrivateGoal = await prisma.goal.create({
      data: {
        title: 'Bob Private Goal',
        userId: bob.id,
        goalType: GoalQuantify.BOOLEAN,
        publicity: GoalPublicity.PRIVATE,
        order: 2,
        colour: 'FFFFFF',
        icon: 'b2',
      },
    });
  });

  /**
   * POST /goals/:goalId/entries
   */
  describe('POST /goals/:goalId/entries', () => {
    it('rejects unauthenticated requests (401)', async () => {
      const payload: CreateGoalEntryDto = {
        entryDate: new Date('2025-01-01'),
        note: 'Test note',
        numericValue: 5,
      };
      await request(app.getHttpServer())
        .post(`/goals/${aliceGoal.id}/entries`)
        .send(payload)
        .expect(401);
    });

    it('rejects invalid payloads [missing required fields] (400)', async () => {
      const res = await aliceAgent
        .post(`/goals/${aliceGoal.id}/entries`)
        .send({})
        .expect(400);
      expect(res.body.message).toBe('Validation failed');
    });

    it('rejects invalid payloads [invalid date format] (400)', async () => {
      const res = await aliceAgent
        .post(`/goals/${aliceGoal.id}/entries`)
        .send({
          entryDate: new Date('invalid-date'),
          note: null,
          numericValue: 5,
        })
        .expect(400);
      expect(res.body.message).toBe('Validation failed');
    });

    it('returns 404 if goal does not exist', async () => {
      const payload: CreateGoalEntryDto = {
        entryDate: new Date('2025-01-01'),
        note: 'Test note',
        numericValue: 5,
      };
      const res = await aliceAgent
        .post(`/goals/999999/entries`)
        .send(payload)
        .expect(404);
      expect(res.body.message).toBe('Goal not found');
    });

    it('returns 403 if goal public and user is not the goal owner', async () => {
      const payload: CreateGoalEntryDto = {
        entryDate: new Date('2025-01-01'),
        note: 'Test note',
        numericValue: 5,
      };
      const res = await aliceAgent
        .post(`/goals/${bobGoal.id}/entries`)
        .send(payload)
        .expect(403);
      expect(res.body.message).toBe(
        'Goal cannot be modified by the current user',
      );
    });

    it('returns 404 if goal private and user is not the goal owner', async () => {
      const payload: CreateGoalEntryDto = {
        entryDate: new Date('2025-01-01'),
        note: 'Test note',
      };
      const res = await aliceAgent
        .post(`/goals/${bobPrivateGoal.id}/entries`)
        .send(payload)
        .expect(404);
      expect(res.body.message).toBe('Goal not found');
    });

    it('creates numeric goal entry successfully (201)', async () => {
      const payload: CreateGoalEntryDto = {
        entryDate: new Date('2025-01-15'),
        note: 'Ran 5km',
        numericValue: 5,
      };
      const res = await aliceAgent
        .post(`/goals/${aliceGoal.id}/entries`)
        .send(payload)
        .expect(201);

      expect(res.body.entryDate).toBeDefined();
      expect(res.body.goalId).toBe(aliceGoal.id);
      expect(res.body.numericValue).toBe(5);
      expect(res.body.note).toBe('Ran 5km');
      expect(res.body.id).toBeDefined();
      expect(res.body.createdAt).toBeDefined();
      expect(res.body.updatedAt).toBeDefined();

      const entryInDb = await prisma.goalEntry.findUnique({
        where: { id: res.body.id },
      });
      expect(entryInDb).not.toBeNull();
      expect(entryInDb?.goalId).toBe(aliceGoal.id);
      expect(entryInDb?.numericValue).toBe(5);
    });

    it('creates boolean goal entry successfully (201)', async () => {
      const payload: CreateGoalEntryDto = {
        entryDate: new Date('2025-01-15'),
        note: 'Completed meditation',
      };
      const res = await aliceAgent
        .post(`/goals/${alicePrivateGoal.id}/entries`)
        .send(payload)
        .expect(201);

      expect(res.body.entryDate).toBeDefined();
      expect(res.body.goalId).toBe(alicePrivateGoal.id);
      expect(res.body.note).toBe('Completed meditation');
      expect(res.body.numericValue).toBeNull();
      expect(res.body.id).toBeDefined();
    });

    it('allows null note for entries', async () => {
      const payload: CreateGoalEntryDto = {
        entryDate: new Date('2025-01-15'),
        note: null,
        numericValue: 3,
      };
      const res = await aliceAgent
        .post(`/goals/${aliceGoal.id}/entries`)
        .send(payload)
        .expect(201);

      expect(res.body.note).toBeNull();
    });
  });

  /**
   * GET /entries
   */
  describe('GET /entries', () => {
    let aliceEntry1: GoalEntry;
    let aliceEntry2: GoalEntry;

    beforeEach(async () => {
      // Create entries for testing
      aliceEntry1 = await prisma.goalEntry.create({
        data: {
          goalId: aliceGoal.id,
          entryDate: new Date('2025-01-01'),
          numericValue: 5,
          note: 'Alice Entry 1',
        },
      });

      aliceEntry2 = await prisma.goalEntry.create({
        data: {
          goalId: aliceGoal.id,
          entryDate: new Date('2025-02-01'),
          numericValue: 10,
          note: 'Alice Entry 2',
        },
      });

      await prisma.goalEntry.create({
        data: {
          goalId: alicePrivateGoal.id,
          entryDate: new Date('2025-01-10'),
          note: 'Private entry',
        },
      });

      await prisma.goalEntry.create({
        data: {
          goalId: bobGoal.id,
          entryDate: new Date('2025-01-05'),
          numericValue: 3,
          note: 'Bob Entry',
        },
      });
    });

    it('returns entries filtered by goalId', async () => {
      const searchParams: SearchParamsGoalEntryDto = {
        goalId: aliceGoal.id,
      };
      const res = await aliceAgent
        .get('/entries')
        .query(searchParams)
        .expect(200);

      const entries: GoalEntryResponse[] = res.body;
      expect(entries.length).toBe(2);
      expect(entries.map((e) => e.id)).toEqual(
        expect.arrayContaining([aliceEntry1.id, aliceEntry2.id]),
      );
    });

    it('returns entries filtered by goalId and year', async () => {
      const searchParams: SearchParamsGoalEntryDto = {
        goalId: aliceGoal.id,
        year: 2025,
      };
      const res = await aliceAgent
        .get('/entries')
        .query(searchParams)
        .expect(200);

      const entries: GoalEntryResponse[] = res.body;
      expect(entries.length).toBe(2);
    });

    it('returns empty array for year with no entries', async () => {
      const searchParams: SearchParamsGoalEntryDto = {
        goalId: aliceGoal.id,
        year: 2024,
      };
      const res = await aliceAgent
        .get('/entries')
        .query(searchParams)
        .expect(200);

      expect(res.body).toEqual([]);
    });

    it('allows unauthenticated access to public goal entries', async () => {
      const searchParams: SearchParamsGoalEntryDto = {
        goalId: aliceGoal.id,
      };
      const res = await request(app.getHttpServer())
        .get('/entries')
        .query(searchParams)
        .expect(200);

      const entries: GoalEntryResponse[] = res.body;
      expect(entries.length).toBe(2);
    });

    it('rejects unauthenticated access to private goal entries (404)', async () => {
      const searchParams: SearchParamsGoalEntryDto = {
        goalId: alicePrivateGoal.id,
      };
      const res = await request(app.getHttpServer())
        .get('/entries')
        .query(searchParams)
        .expect(404);
      expect(res.body.message).toBe('Goal not found');
    });

    it('rejects access to other user private goals (404)', async () => {
      const searchParams: SearchParamsGoalEntryDto = {
        goalId: alicePrivateGoal.id,
      };
      const res = await bobAgent
        .get('/entries')
        .query(searchParams)
        .expect(404);
      expect(res.body.message).toBe('Goal not found');
    });

    it('rejects access to public goal entries when owner profile is private (non-owner)', async () => {
      await prisma.user.update({
        where: { id: alice.id },
        data: { profilePublicity: ProfilePublicity.PRIVATE },
      });
      const searchParams: SearchParamsGoalEntryDto = {
        goalId: aliceGoal.id,
      };
      const res = await bobAgent
        .get('/entries')
        .query(searchParams)
        .expect(404);
      expect(res.body.message).toBe('Goal not found');
    });

    it('rejects unauthenticated access when profile is private (404)', async () => {
      await prisma.user.update({
        where: { id: alice.id },
        data: { profilePublicity: ProfilePublicity.PRIVATE },
      });
      const searchParams: SearchParamsGoalEntryDto = {
        goalId: aliceGoal.id,
      };
      const res = await request(app.getHttpServer())
        .get('/entries')
        .query(searchParams)
        .expect(404);
      expect(res.body.message).toBe('Goal not found');
    });

    it('rejects missing required query params (400)', async () => {
      const res = await aliceAgent.get('/entries').expect(400);
      expect(res.body.message).toBe('Validation failed');
    });

    it('rejects invalid goalId (400)', async () => {
      const res = await aliceAgent
        .get('/entries')
        .query({ goalId: 'invalid' })
        .expect(400);
      expect(res.body.message).toBe('Validation failed');
    });
  });

  /**
   * GET /entries/:entryId
   */
  describe('GET /entries/:entryId', () => {
    let entry: GoalEntry;

    beforeEach(async () => {
      entry = await prisma.goalEntry.create({
        data: {
          goalId: aliceGoal.id,
          entryDate: new Date('2025-01-01'),
          numericValue: 5,
          note: 'Test entry',
        },
      });
    });

    it('rejects unauthenticated requests', async () => {
      const res = await request(app.getHttpServer())
        .get(`/entries/${entry.id}`)
        .expect(401);
      expect(res.body.message).toBe('Unauthorized');
    });

    it('returns 400 for invalid entryId', async () => {
      const res = await aliceAgent.get('/entries/invalid').expect(400);
      expect(res.body.message).toBe(
        'Validation failed (numeric string is expected)',
      );
    });

    it('returns 404 for non-existent entry', async () => {
      const res = await aliceAgent.get('/entries/999999').expect(404);
      expect(res.body.message).toBe('Goal entry with id 999999 not found');
    });

    it('returns 404 if entry belongs to inaccessible goal', async () => {
      const bobEntry = await prisma.goalEntry.create({
        data: {
          goalId: bobPrivateGoal.id,
          entryDate: new Date('2025-01-01'),
          numericValue: 3,
          note: 'Bob Entry',
        },
      });
      const res = await aliceAgent.get(`/entries/${bobEntry.id}`).expect(404);
      expect(res.body.message).toBe('Goal not found');
    });

    it('returns 404 for public entry if owner profile is private and user is not owner', async () => {
      await prisma.user.update({
        where: { id: alice.id },
        data: { profilePublicity: ProfilePublicity.PRIVATE },
      });
      const newEntry = await prisma.goalEntry.create({
        data: {
          goalId: aliceGoal.id,
          entryDate: new Date('2025-03-01'),
          numericValue: 7,
          note: 'Should not be visible',
        },
      });
      const res = await bobAgent.get(`/entries/${newEntry.id}`).expect(404);
      expect(res.body.message).toBe('Goal not found');
    });

    it('returns entry if authorized', async () => {
      const res = await aliceAgent.get(`/entries/${entry.id}`).expect(200);
      expect(res.body.id).toBe(entry.id);
      expect(res.body.goalId).toBe(aliceGoal.id);
      expect(res.body.numericValue).toBe(5);
      expect(res.body.note).toBe('Test entry');
    });
  });

  /**
   * GET /goals/:goalId/entries
   */
  describe('GET /goals/:goalId/entries', () => {
    let entry1: GoalEntry;
    let entry2: GoalEntry;

    beforeEach(async () => {
      entry1 = await prisma.goalEntry.create({
        data: {
          goalId: aliceGoal.id,
          entryDate: new Date('2025-01-01'),
          numericValue: 5,
        },
      });

      entry2 = await prisma.goalEntry.create({
        data: {
          goalId: aliceGoal.id,
          entryDate: new Date('2025-02-01'),
          numericValue: 10,
        },
      });

      await prisma.goalEntry.create({
        data: {
          goalId: bobGoal.id,
          entryDate: new Date('2025-01-05'),
          numericValue: 3,
        },
      });
    });

    // Basic validation
    it('rejects unauthenticated requests (401)', async () => {
      const res = await request(app.getHttpServer())
        .get(`/goals/${aliceGoal.id}/entries`)
        .expect(401);
      expect(res.body.message).toBe('Unauthorized');
    });

    it('returns 404 for non-existent goal', async () => {
      const res = await aliceAgent.get(`/goals/999999/entries`).expect(404);
      expect(res.body.message).toBe('Goal not found');
    });

    it('returns empty array if no entries for goal', async () => {
      const res = await aliceAgent
        .get(`/goals/${alicePrivateGoal.id}/entries`)
        .expect(200);
      expect(res.body).toEqual([]);
    });

    // Profile Public / Goal Public scenarios
    describe('Profile public, Goal public', () => {
      it('allows owner to access entries (200)', async () => {
        const res = await aliceAgent
          .get(`/goals/${aliceGoal.id}/entries`)
          .expect(200);

        const entries: GoalEntryResponse[] = res.body;
        expect(entries.length).toBe(2);
        expect(entries.map((e) => e.id)).toEqual(
          expect.arrayContaining([entry1.id, entry2.id]),
        );
      });

      it('allows non-owner to access entries (200)', async () => {
        const res = await bobAgent
          .get(`/goals/${aliceGoal.id}/entries`)
          .expect(200);

        const entries: GoalEntryResponse[] = res.body;
        expect(entries.length).toBe(2);
        expect(entries.map((e) => e.id)).toEqual(
          expect.arrayContaining([entry1.id, entry2.id]),
        );
      });

      it('allows unauthenticated access (200)', async () => {
        const res = await request(app.getHttpServer())
          .get(`/goals/${aliceGoal.id}/entries`)
          .expect(200);

        const entries: GoalEntryResponse[] = res.body;
        expect(entries.length).toBe(2);
      });
    });

    // Profile Public / Goal Private scenarios
    describe('Profile public, Goal private', () => {
      it('allows owner to access entries (200)', async () => {
        const res = await aliceAgent
          .get(`/goals/${alicePrivateGoal.id}/entries`)
          .expect(200);
        expect(Array.isArray(res.body)).toBe(true);
      });

      it('denies non-owner access (404)', async () => {
        const res = await bobAgent
          .get(`/goals/${alicePrivateGoal.id}/entries`)
          .expect(404);
        expect(res.body.message).toBe('Goal not found');
      });

      it('denies unauthenticated access (404)', async () => {
        const res = await request(app.getHttpServer())
          .get(`/goals/${alicePrivateGoal.id}/entries`)
          .expect(404);
        expect(res.body.message).toBe('Goal not found');
      });
    });

    // Profile Private / Goal Public scenarios
    describe('Profile private, Goal public', () => {
      beforeEach(async () => {
        await prisma.user.update({
          where: { id: alice.id },
          data: { profilePublicity: ProfilePublicity.PRIVATE },
        });
      });

      it('allows owner to access entries (200)', async () => {
        const res = await aliceAgent
          .get(`/goals/${aliceGoal.id}/entries`)
          .expect(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(2);
      });

      it('denies non-owner access (404)', async () => {
        const res = await bobAgent
          .get(`/goals/${aliceGoal.id}/entries`)
          .expect(404);
        expect(res.body.message).toBe('Goal not found');
      });

      it('denies unauthenticated access (404)', async () => {
        const res = await request(app.getHttpServer())
          .get(`/goals/${aliceGoal.id}/entries`)
          .expect(404);
        expect(res.body.message).toBe('Goal not found');
      });
    });

    // Profile Private / Goal Private scenarios
    describe('Profile private, Goal private', () => {
      beforeEach(async () => {
        await prisma.user.update({
          where: { id: bob.id },
          data: { profilePublicity: ProfilePublicity.PRIVATE },
        });
      });

      it('allows owner to access entries (200)', async () => {
        const res = await bobAgent
          .get(`/goals/${bobPrivateGoal.id}/entries`)
          .expect(200);
        expect(Array.isArray(res.body)).toBe(true);
      });

      it('denies non-owner access (404)', async () => {
        const res = await aliceAgent
          .get(`/goals/${bobPrivateGoal.id}/entries`)
          .expect(404);
        expect(res.body.message).toBe('Goal not found');
      });
    });
  });

  /**
   * PATCH /goals/:goalId/entries/:entryId
   */
  describe('PATCH /goals/:goalId/entries/:entryId', () => {
    let entry: GoalEntry;

    beforeEach(async () => {
      entry = await prisma.goalEntry.create({
        data: {
          goalId: aliceGoal.id,
          entryDate: new Date('2025-01-01'),
          numericValue: 5,
          note: 'Original note',
        },
      });
    });

    it('rejects unauthenticated requests', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/goals/${aliceGoal.id}/entries/${entry.id}`)
        .send({ note: 'Updated' })
        .expect(401);
      expect(res.body.message).toBe('Unauthorized');
    });

    it('returns 400 for invalid goalId', async () => {
      const res = await aliceAgent
        .patch(`/goals/invalid/entries/${entry.id}`)
        .send({ note: 'Updated' })
        .expect(400);
      expect(res.body.message).toBe(
        'Validation failed (numeric string is expected)',
      );
    });

    it('returns 400 for invalid entryId', async () => {
      const res = await aliceAgent
        .patch(`/goals/${aliceGoal.id}/entries/invalid`)
        .send({ note: 'Updated' })
        .expect(400);
      expect(res.body.message).toBe(
        'Validation failed (numeric string is expected)',
      );
    });

    it('returns 404 for non-existent entry', async () => {
      const res = await aliceAgent
        .patch(`/goals/${aliceGoal.id}/entries/999999`)
        .send({ note: 'Updated' })
        .expect(404);
      expect(res.body.message).toBe('Goal entry with id 999999 not found');
    });

    it('returns 404 if goal private and user is not goal owner', async () => {
      const bobPrivateGoalEntry = await prisma.goalEntry.create({
        data: {
          goalId: bobPrivateGoal.id,
          entryDate: new Date('2025-01-01'),
          note: 'Bob private goal entry',
        },
      });

      const res = await aliceAgent
        .patch(`/goals/${bobPrivateGoal.id}/entries/${bobPrivateGoalEntry.id}`)
        .send({ note: 'Updated' })
        .expect(404);
      expect(res.body.message).toBe('Goal not found');
    });

    it('returns 403 if goal public and user is not goal owner', async () => {
      const bobGoalEntry = await prisma.goalEntry.create({
        data: {
          goalId: bobGoal.id,
          entryDate: new Date('2025-01-01'),
          numericValue: 5,
          note: 'Bob public goal entry',
        },
      });

      const res = await aliceAgent
        .patch(`/goals/${bobGoal.id}/entries/${bobGoalEntry.id}`)
        .send({ note: 'Updated' })
        .expect(403);
      expect(res.body.message).toBe(
        'Goal cannot be modified by the current user',
      );
    });

    it('updates entry note successfully', async () => {
      const updateDto: UpdateGoalEntryDto = {
        note: 'Updated note',
      };
      const res = await aliceAgent
        .patch(`/goals/${aliceGoal.id}/entries/${entry.id}`)
        .send(updateDto)
        .expect(200);

      expect(res.body.note).toBe('Updated note');
      expect(res.body.numericValue).toBe(5); // Should remain unchanged

      const updated = await prisma.goalEntry.findUnique({
        where: { id: entry.id },
      });
      expect(updated?.note).toBe('Updated note');
    });

    it('updates entry date successfully', async () => {
      const updateDto: UpdateGoalEntryDto = {
        entryDate: new Date('2025-02-15'),
      };
      const res = await aliceAgent
        .patch(`/goals/${aliceGoal.id}/entries/${entry.id}`)
        .send(updateDto)
        .expect(200);

      expect(res.body.entryDate).toBeDefined();

      const updated = await prisma.goalEntry.findUnique({
        where: { id: entry.id },
      });
      expect(updated?.entryDate.toISOString().split('T')[0]).toBe('2025-02-15');
    });

    it('updates numeric value successfully', async () => {
      const updateDto: UpdateGoalEntryDto = {
        numericValue: 10,
      };
      const res = await aliceAgent
        .patch(`/goals/${aliceGoal.id}/entries/${entry.id}`)
        .send(updateDto)
        .expect(200);

      expect(res.body.numericValue).toBe(10);

      const updated = await prisma.goalEntry.findUnique({
        where: { id: entry.id },
      });
      expect(updated?.numericValue).toBe(10);
    });

    it('updates multiple fields at once', async () => {
      const updateDto: UpdateGoalEntryDto = {
        entryDate: new Date('2025-02-15'),
        note: 'Completely updated',
        numericValue: 15,
      };
      const res = await aliceAgent
        .patch(`/goals/${aliceGoal.id}/entries/${entry.id}`)
        .send(updateDto)
        .expect(200);

      expect(res.body.note).toBe('Completely updated');
      expect(res.body.numericValue).toBe(15);
      expect(res.body.entryDate).toBeDefined();
    });

    it('allows partial updates with empty payload', async () => {
      const res = await aliceAgent
        .patch(`/goals/${aliceGoal.id}/entries/${entry.id}`)
        .send({})
        .expect(200);

      // Should return unchanged entry
      expect(res.body.note).toBe(entry.note);
      expect(res.body.numericValue).toBe(entry.numericValue);
    });
  });

  /**
   * DELETE /goals/:goalId/entries/:entryId
   */
  describe('DELETE /goals/:goalId/entries/:entryId', () => {
    let entry: GoalEntry;
    let bobGoalEntry: GoalEntry;
    let bobPrivateGoalEntry: GoalEntry;

    beforeEach(async () => {
      entry = await prisma.goalEntry.create({
        data: {
          goalId: aliceGoal.id,
          entryDate: new Date('2025-01-01'),
          numericValue: 5,
          note: 'To delete',
        },
      });

      bobGoalEntry = await prisma.goalEntry.create({
        data: {
          goalId: bobGoal.id,
          entryDate: new Date('2025-01-01'),
          numericValue: 5,
          note: 'To delete',
        },
      });

      bobPrivateGoalEntry = await prisma.goalEntry.create({
        data: {
          goalId: bobPrivateGoal.id,
          entryDate: new Date('2025-01-01'),
          note: 'To delete',
        },
      });
    });

    it('rejects unauthenticated requests', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/goals/${aliceGoal.id}/entries/${entry.id}`)
        .expect(401);
      expect(res.body.message).toBe('Unauthorized');
    });

    it('returns 400 for invalid goalId', async () => {
      const res = await aliceAgent
        .delete(`/goals/invalid/entries/${entry.id}`)
        .expect(400);
      expect(res.body.message).toBe(
        'Validation failed (numeric string is expected)',
      );
    });

    it('returns 400 for invalid entryId', async () => {
      const res = await aliceAgent
        .delete(`/goals/${aliceGoal.id}/entries/invalid`)
        .expect(400);
      expect(res.body.message).toBe(
        'Validation failed (numeric string is expected)',
      );
    });

    it('returns 404 for non-existent entry', async () => {
      const res = await aliceAgent
        .delete(`/goals/${aliceGoal.id}/entries/999999`)
        .expect(404);
      expect(res.body.message).toBe('Goal entry with id 999999 not found');
    });

    it('returns 403 if goal public and user is not the goal owner', async () => {
      const res = await aliceAgent
        .delete(`/goals/${bobGoal.id}/entries/${bobGoalEntry.id}`)
        .expect(403);
      expect(res.body.message).toBe(
        'Goal cannot be modified by the current user',
      );
    });

    it('returns 404 if goal private and user is not the goal owner', async () => {
      const res = await aliceAgent
        .delete(`/goals/${bobPrivateGoal.id}/entries/${bobPrivateGoalEntry.id}`)
        .expect(404);
      expect(res.body.message).toBe('Goal not found');
    });

    it('deletes entry successfully', async () => {
      const res = await aliceAgent
        .delete(`/goals/${aliceGoal.id}/entries/${entry.id}`)
        .expect(200);

      expect(res.body.id).toBe(entry.id);

      const deleted = await prisma.goalEntry.findUnique({
        where: { id: entry.id },
      });
      expect(deleted).toBeNull();
    });

    it('returns deleted entry data on successful deletion', async () => {
      const res = await aliceAgent
        .delete(`/goals/${aliceGoal.id}/entries/${entry.id}`)
        .expect(200);

      expect(res.body.goalId).toBe(aliceGoal.id);
      expect(res.body.numericValue).toBe(5);
      expect(res.body.note).toBe('To delete');
    });
  });

  /**
   * GET /entries/statistics
   */
  describe('GET /entries/statistics', () => {
    beforeEach(async () => {
      // Create multiple entries for statistics
      await prisma.goalEntry.createMany({
        data: [
          {
            goalId: aliceGoal.id,
            entryDate: new Date('2025-01-01'),
            numericValue: 5,
          },
          {
            goalId: aliceGoal.id,
            entryDate: new Date('2025-01-02'),
            numericValue: 10,
          },
          {
            goalId: aliceGoal.id,
            entryDate: new Date('2025-01-03'),
            numericValue: 8,
          },
        ],
      });
    });

    it('rejects unauthenticated requests', async () => {
      const res = await request(app.getHttpServer())
        .get('/entries/statistics')
        .query({ goalId: aliceGoal.id, year: 2025 })
        .expect(401);
      expect(res.body.message).toBe('Unauthorized');
    });

    it('returns statistics for numeric goal', async () => {
      const res = await aliceAgent
        .get('/entries/statistics')
        .query({ goalId: aliceGoal.id, year: 2025 })
        .expect(200);

      expect(res.body.yearAvg).toBeDefined();
      expect(res.body.yearCount).toBeDefined();
      expect(res.body.currentStreakLen).toBeDefined();
      expect(res.body.maxStreakLen).toBeDefined();
    });

    it('returns 400 for missing required query params', async () => {
      const res = await aliceAgent.get('/entries/statistics').expect(400);
      expect(res.body.message).toBe(
        'Validation failed (numeric string is expected)',
      );
    });

    it('returns 400 for invalid goalId', async () => {
      const res = await aliceAgent
        .get('/entries/statistics')
        .query({ goalId: 'invalid', year: 2025 })
        .expect(400);
      expect(res.body.message).toBe(
        'Validation failed (numeric string is expected)',
      );
    });

    it('returns 404 if goal does not exist', async () => {
      const res = await aliceAgent
        .get('/entries/statistics')
        .query({ goalId: 999999, year: 2025 })
        .expect(404);
      expect(res.body.message).toBe('Goal not found');
    });

    it('returns 404 when profile is private and caller is not owner', async () => {
      await prisma.user.update({
        where: { id: alice.id },
        data: { profilePublicity: ProfilePublicity.PRIVATE },
      });
      const res = await bobAgent
        .get('/entries/statistics')
        .query({ goalId: aliceGoal.id, year: 2025 })
        .expect(404);
      expect(res.body.message).toBe('Goal not found');
    });
  });

  /**
   * GET /entries/monthly-averages
   */
  describe('GET /entries/monthly-averages', () => {
    // TODOs #30: Add checks to confirm that:
    // - Alice sees full values across all their own (Alice's) public + private goal entries
    // - Bob sees only values across other people's (Alice's) public goal entries

    // TODOs #30: Split into:
    // Basic validation
    // Profile Public / Goal Public scenarios
    // Profile Public / Goal Private scenarios
    // Profile Private / Goal Public scenarios
    // Profile Private / Goal Private scenarios
    beforeEach(async () => {
      await prisma.goalEntry.createMany({
        data: [
          {
            goalId: aliceGoal.id,
            entryDate: new Date('2025-01-01'),
            numericValue: 5,
          },
          {
            goalId: aliceGoal.id,
            entryDate: new Date('2025-01-15'),
            numericValue: 10,
          },
          {
            goalId: aliceGoal.id,
            entryDate: new Date('2025-02-01'),
            numericValue: 8,
          },
        ],
      });
    });

    // Basic validation
    it('rejects unauthenticated requests', async () => {
      const res = await request(app.getHttpServer())
        .get('/entries/monthly-averages')
        .query({ goalId: aliceGoal.id, year: 2025 })
        .expect(401);
      expect(res.body.message).toBe('Unauthorized');
    });

    it('returns 404 for non-existent goal', async () => {
      const res = await aliceAgent.get(`/entries/monthly-averages`).expect(404);
      expect(res.body.message).toBe('Goal not found');
    });

    it('returns monthly averages for numeric goal', async () => {
      const res = await aliceAgent
        .get('/entries/monthly-averages')
        .query({ goalId: aliceGoal.id, year: 2025 })
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('month');
      expect(res.body[0]).toHaveProperty('year');
      expect(res.body[0]).toHaveProperty('average');
    });

    it('returns 400 for boolean goal', async () => {
      const res = await aliceAgent
        .get('/entries/monthly-averages')
        .query({ goalId: alicePrivateGoal.id, year: 2025 })
        .expect(400);
      expect(res.body.message).toBe('Goal type must be NUMERIC');
    });

    it('returns 404 when profile is private, goal is public, and caller is not owner', async () => {
      await prisma.user.update({
        where: { id: alice.id },
        data: { profilePublicity: ProfilePublicity.PRIVATE },
      });
      const res = await bobAgent
        .get('/entries/monthly-averages')
        .query({ goalId: aliceGoal.id, year: 2025 })
        .expect(404);
      expect(res.body.message).toBe('Goal not found');
    });

    it('returns 404 when profile is public, goal is ')
  });

  /**
   * GET /entries/monthly-counts
   */
  describe('GET /entries/monthly-counts', () => {
    beforeEach(async () => {
      await prisma.goalEntry.createMany({
        data: [
          {
            goalId: aliceGoal.id,
            entryDate: new Date('2025-01-01'),
            numericValue: 5,
          },
          {
            goalId: aliceGoal.id,
            entryDate: new Date('2025-01-15'),
            numericValue: 10,
          },
          {
            goalId: aliceGoal.id,
            entryDate: new Date('2025-02-01'),
            numericValue: 8,
          },
        ],
      });
    });

    it('rejects unauthenticated requests', async () => {
      const res = await request(app.getHttpServer())
        .get('/entries/monthly-counts')
        .query({ goalId: aliceGoal.id, year: 2025 })
        .expect(401);
      expect(res.body.message).toBe('Unauthorized');
    });

    it('returns monthly counts for goal', async () => {
      const res = await aliceAgent
        .get('/entries/monthly-counts')
        .query({ goalId: aliceGoal.id, year: 2025 })
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('month');
      expect(res.body[0]).toHaveProperty('year');
      expect(res.body[0]).toHaveProperty('count');
    });

    it('returns 404 if goal does not exist', async () => {
      const res = await aliceAgent
        .get('/entries/monthly-counts')
        .query({ goalId: 999999, year: 2025 })
        .expect(404);
      expect(res.body.message).toBe('Goal not found');
    });

    it('returns 404 when profile is private and caller is not owner', async () => {
      await prisma.user.update({
        where: { id: alice.id },
        data: { profilePublicity: ProfilePublicity.PRIVATE },
      });
      const res = await bobAgent
        .get('/entries/monthly-counts')
        .query({ goalId: aliceGoal.id, year: 2025 })
        .expect(404);
      expect(res.body.message).toBe('Goal not found');
    });
  });
});
