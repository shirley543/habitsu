import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { prisma } from './helpers/prisma';
import { loginWithCookie } from './helpers/login';
import * as bcrypt from 'bcrypt';
import * as cookieParser from 'cookie-parser';
import { Goal, GoalPublicity, GoalQuantify, User } from '@prisma/client';
import TestAgent from 'supertest/lib/agent';
import {
  CreateGoalDto,
  GoalPublicityType,
  GoalQuantifyType,
  GoalResponse,
  ReorderGoalDto,
} from '@habit-tracker/validation-schemas';

describe('Goals API (E2E)', () => {
  let app: INestApplication;

  let alice: User;
  let bob: User;

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
  });

  /**
   * POST /goals
   */
  describe('POST /goals', () => {
    it('rejects unauthenticated requests (401)', async () => {
      await request(app.getHttpServer())
        .post('/goals')
        .send({ title: 'Test', goalType: GoalQuantify.NUMERIC })
        .expect(401);
    });

    it('rejects invalid payloads [all fields missing] (400)', async () => {
      // Entire object missing
      const res = await aliceAgent.post('/goals').send({}).expect(400);
      expect(res.body.message).toBe('Validation failed');
      expect(res.body.fields).toEqual({
        _errors: [],
        colour: {
          _errors: ['Required'],
        },
        description: {
          _errors: ['Required'],
        },
        goalType: {
          _errors: [
            "Invalid discriminator value. Expected 'NUMERIC' | 'BOOLEAN'",
          ],
        },
        icon: {
          _errors: ['Required'],
        },
        publicity: {
          _errors: ['Required'],
        },
        title: {
          _errors: ['Required'],
        },
      });
    });

    it('rejects invalid payloads [one field incorrect type] (400)', async () => {
      // All fields correct except for numeric target type being string
      const res2 = await aliceAgent
        .post('/goals')
        .send({
          title: 'Run daily',
          description: 'Desc',
          goalType: GoalQuantifyType.Numeric,
          publicity: GoalPublicityType.Public,
          colour: 'FFFFFF',
          icon: 'a1',
          visibility: true,
          numericTarget: '10',
          numericUnit: 'km',
        })
        .expect(400);
      expect(res2.body.message).toBe('Validation failed');
      expect(res2.body.fields).toEqual({
        _errors: [],
        numericTarget: {
          _errors: ['Expected number, received string'],
        },
      });
    });

    it('creates a goal successfully [numeric goal] (201)', async () => {
      const payload: CreateGoalDto = {
        title: 'Run daily',
        description: 'Desc',
        goalType: GoalQuantifyType.Numeric,
        publicity: GoalPublicityType.Public,
        colour: 'FFFFFF',
        icon: 'a1',
        visibility: true,
        numericTarget: 10,
        numericUnit: 'km',
      };

      const res = await aliceAgent.post('/goals').send(payload).expect(201);

      expect(res.body.title).toBe(payload.title);
      expect(res.body.userId).toBe(alice.id);

      const goalInDb = await prisma.goal.findUnique({
        where: { id: res.body.id },
      });
      expect(goalInDb).not.toBeNull();
      expect(goalInDb?.userId).toBe(alice.id);
      expect(goalInDb?.order).toBe(1);
      expect(goalInDb?.createdAt).toBeDefined();
      expect(goalInDb?.updatedAt).toBeDefined();
    });

    it('creates a goal successfully [boolean goal] (201)', async () => {
      const payload: CreateGoalDto = {
        title: 'Run daily',
        description: 'Desc',
        goalType: GoalQuantifyType.Boolean,
        publicity: GoalPublicityType.Public,
        colour: 'FFFFFF',
        icon: 'a1',
        visibility: true,
      };

      const res = await aliceAgent.post('/goals').send(payload).expect(201);

      expect(res.body.title).toBe(payload.title);
      expect(res.body.userId).toBe(alice.id);

      const goalInDb = await prisma.goal.findUnique({
        where: { id: res.body.id },
      });
      expect(goalInDb).not.toBeNull();
      expect(goalInDb?.userId).toBe(alice.id);
      expect(goalInDb?.order).toBe(1);
      expect(goalInDb?.createdAt).toBeDefined();
      expect(goalInDb?.updatedAt).toBeDefined();
    });
  });

  /**
   * GET /goals
   */
  describe('GET /goals', () => {
    it('rejects unauthenticated requests', async () => {
      await request(app.getHttpServer()).get('/goals').expect(401);
    });

    it('returns user goals correctly', async () => {
      await prisma.goal.createMany({
        data: [
          {
            title: 'Alice Public',
            userId: alice.id,
            goalType: GoalQuantify.NUMERIC,
            publicity: GoalPublicity.PUBLIC,
            order: 1,
            colour: 'FFFFFF',
            icon: 'a1',
          },
          {
            title: 'Alice Private',
            userId: alice.id,
            goalType: GoalQuantify.BOOLEAN,
            publicity: GoalPublicity.PRIVATE,
            order: 2,
            colour: 'FFFFFF',
            icon: 'a2',
          },
          {
            title: 'Bob Public',
            userId: bob.id,
            goalType: GoalQuantify.NUMERIC,
            publicity: GoalPublicity.PUBLIC,
            order: 1,
            colour: 'FFFFFF',
            icon: 'b1',
          },
          {
            title: 'Bob Private',
            userId: bob.id,
            goalType: GoalQuantify.BOOLEAN,
            publicity: GoalPublicity.PRIVATE,
            order: 2,
            colour: 'FFFFFF',
            icon: 'b2',
          },
        ],
      });

      const aliceRes = await aliceAgent.get('/goals').expect(200);
      const aliceGoals: GoalResponse[] = aliceRes.body;
      const aliceTitles = aliceGoals.map((g: GoalResponse) => g.title);
      const aliceExpected = ['Alice Public', 'Alice Private'];
      expect(aliceTitles).toEqual(expect.arrayContaining(aliceExpected));

      const bobRes = await bobAgent.get('/goals').expect(200);
      const bobGoals: GoalResponse[] = bobRes.body;
      const bobTitles = bobGoals.map((g: GoalResponse) => g.title);
      const bobExpected = ['Bob Public', 'Bob Private'];
      expect(bobTitles).toEqual(expect.arrayContaining(bobExpected));
    });

    it('returns empty array if no goals', async () => {
      const res = await aliceAgent.get('/goals').expect(200);
      expect(res.body).toEqual([]);
    });
  });

  /**
   * GET /goals/:id
   */
  describe('GET /goals/:id', () => {
    let goal: Goal;

    beforeEach(async () => {
      goal = await prisma.goal.create({
        data: {
          title: 'Alice Goal',
          userId: alice.id,
          goalType: GoalQuantify.NUMERIC,
          publicity: GoalPublicity.PUBLIC,
          order: 1,
          colour: 'FFFFFF',
          icon: 'a1',
        },
      });
    });

    it('returns 400 for invalid id', async () => {
      const res = await aliceAgent.get('/goals/invalid').expect(400);
      expect(res.body.message).toBe(
        'Validation failed (numeric string is expected)',
      );
    });

    it('returns 404 for non-existent goal', async () => {
      const res = await aliceAgent.get('/goals/999999').expect(404);
      expect(res.body.message).toBe('Goal not found');
    });

    it('returns 404 if goal private and user is not the goal owner', async () => {
      const other = await prisma.goal.create({
        data: {
          title: 'Bob Goal',
          userId: bob.id,
          goalType: GoalQuantify.NUMERIC,
          publicity: GoalPublicity.PRIVATE,
          order: 1,
          colour: 'FFFFFF',
          icon: 'b1',
        },
      });
      const res = await aliceAgent.get(`/goals/${other.id}`).expect(404);
      expect(res.body.message).toBe('Goal not found');
    });

    it('returns goal if user is goal owner', async () => {
      const res = await aliceAgent.get(`/goals/${goal.id}`).expect(200);
      expect(res.body.id).toBe(goal.id);
      expect(res.body.userId).toBe(alice.id);
    });

    it('returns goal if goal public and user is not the goal owner', async () => {
      const other = await prisma.goal.create({
        data: {
          title: 'Bob Goal',
          userId: bob.id,
          goalType: GoalQuantify.NUMERIC,
          publicity: GoalPublicity.PUBLIC,
          order: 1,
          colour: 'FFFFFF',
          icon: 'b1',
        },
      });
      const res = await aliceAgent.get(`/goals/${other.id}`).expect(200);
      expect(res.body.id).toBe(other.id);
      expect(res.body.userId).toBe(bob.id)
    });

    it('returns goal if goal public and user is unauthenticated', async () => {
      const other = await prisma.goal.create({
        data: {
          title: 'Bob Goal',
          userId: bob.id,
          goalType: GoalQuantify.NUMERIC,
          publicity: GoalPublicity.PUBLIC,
          order: 1,
          colour: 'FFFFFF',
          icon: 'b1',
        },
      });
      const res = await request(app.getHttpServer())
        .get(`/goals/${other.id}`)
        .expect(200);
      expect(res.body.id).toBe(other.id);
      expect(res.body.userId).toBe(bob.id)
    });
  });

  /**
   * PATCH /goals/:id
   */
  describe('PATCH /goals/:id', () => {
    let goal: Goal;

    beforeEach(async () => {
      goal = await prisma.goal.create({
        data: {
          title: 'Alice Goal',
          userId: alice.id,
          goalType: GoalQuantify.NUMERIC,
          publicity: GoalPublicity.PUBLIC,
          order: 1,
          colour: 'FFFFFF',
          icon: 'a1',
        },
      });
    });

    it('rejects unauthenticated', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/goals/${goal.id}`)
        .send({ title: 'Updated' })
        .expect(401);
      expect(res.body.message).toBe('Unauthorized');
    });

    it('returns 400 for invalid id', async () => {
      const res = await aliceAgent
        .patch('/goals/invalid')
        .send({ title: 'Updated' })
        .expect(400);
      expect(res.body.message).toBe('Validation failed');
    });

    it('returns 400 for empty payload', async () => {
      const res = await aliceAgent
        .patch(`/goals/${goal.id}`)
        .send({})
        .expect(400);
      expect(res.body.message).toBe('Validation failed');
    });

    it('returns 422 for invalid enum transition', async () => {
      const res = await aliceAgent
        .patch(`/goals/${goal.id}`)
        .send({ goalType: GoalQuantify.BOOLEAN })
        .expect(422);
      expect(res.body.message).toBe(
        'Cannot change goalType once a goal is created',
      );
    });

    it('returns 404 for non-existent goal', async () => {
      const res = await aliceAgent
        .patch(`/goals/999999`)
        .send({ title: 'Updated', goalType: GoalQuantify.BOOLEAN })
        .expect(404);
      expect(res.body.message).toBe('Goal not found');
    });

    it('returns 403 if goal public and user is not the goal owner', async () => {
      const other = await prisma.goal.create({
        data: {
          title: 'Bob Goal',
          userId: bob.id,
          goalType: GoalQuantify.NUMERIC,
          publicity: GoalPublicity.PUBLIC,
          order: 1,
          colour: 'FFFFFF',
          icon: 'b1',
        },
      });
      const res = await aliceAgent
        .patch(`/goals/${other.id}`)
        .send({ title: 'Updated', goalType: GoalQuantify.BOOLEAN })
        .expect(403);
      expect(res.body.message).toBe('Goal cannot be modified by the current user');
    });

    it('returns 404 if goal private and user is not the goal owner', async () => {
      const other = await prisma.goal.create({
        data: {
          title: 'Bob Goal',
          userId: bob.id,
          goalType: GoalQuantify.NUMERIC,
          publicity: GoalPublicity.PRIVATE,
          order: 1,
          colour: 'FFFFFF',
          icon: 'b1',
        },
      });
      const res = await aliceAgent
        .patch(`/goals/${other.id}`)
        .send({ title: 'Updated', goalType: GoalQuantify.BOOLEAN })
        .expect(404);
      expect(res.body.message).toBe('Goal not found');
    });

    it('updates successfully', async () => {
      const res = await aliceAgent
        .patch(`/goals/${goal.id}`)
        .send({ title: 'Updated Title', goalType: GoalQuantify.NUMERIC })
        .expect(200);
      expect(res.body.title).toBe('Updated Title');

      const updated = await prisma.goal.findUnique({ where: { id: goal.id } });
      expect(updated?.title).toBe('Updated Title');
    });
  });

  /**
   * DELETE /goals/:id
   */
  describe('DELETE /goals/:id', () => {
    let goals: Goal[];

    beforeEach(async () => {
      const goalsToCreate = [
        {
          title: 'Goal1',
          userId: alice.id,
          goalType: GoalQuantify.NUMERIC,
          publicity: GoalPublicity.PUBLIC,
          order: 1,
          colour: 'FFFFFF',
          icon: 'a1',
        },
        {
          title: 'Goal2',
          userId: alice.id,
          goalType: GoalQuantify.NUMERIC,
          publicity: GoalPublicity.PUBLIC,
          order: 2,
          colour: 'FFFFFF',
          icon: 'a2',
        },
        {
          title: 'Goal3',
          userId: alice.id,
          goalType: GoalQuantify.NUMERIC,
          publicity: GoalPublicity.PUBLIC,
          order: 3,
          colour: 'FFFFFF',
          icon: 'a3',
        },
      ];

      await prisma.goal.createMany({
        data: goalsToCreate,
      });

      goals = await prisma.goal.findMany({
        where: { userId: alice.id },
        orderBy: { order: 'asc' },
      });
    });

    it('rejects unauthenticated', async () => {
      await request(app.getHttpServer()).delete('/goals/1').expect(401);
    });

    it('returns 403 if goal public and user is not the goal owner', async () => {
      const other = await prisma.goal.create({
        data: {
          title: 'Bob Goal',
          userId: bob.id,
          goalType: GoalQuantify.NUMERIC,
          publicity: GoalPublicity.PUBLIC,
          order: 1,
          colour: 'FFFFFF',
          icon: 'b1',
        },
      });
      const res = await aliceAgent.delete(`/goals/${other.id}`).expect(403);
      expect(res.body.message).toBe('Goal cannot be modified by the current user');
    });

    it('returns 404 if goal private and user is not the goal owner', async () => {
      const other = await prisma.goal.create({
        data: {
          title: 'Bob Goal',
          userId: bob.id,
          goalType: GoalQuantify.NUMERIC,
          publicity: GoalPublicity.PRIVATE,
          order: 1,
          colour: 'FFFFFF',
          icon: 'b1',
        },
      });
      const res = await aliceAgent.delete(`/goals/${other.id}`).expect(404);
      expect(res.body.message).toBe('Goal not found');
    });

    it('deletes goal successfully and reorders remaining', async () => {
      const deleteId = goals[1].id; // Goal2
      const deleteResponse = await aliceAgent
        .delete(`/goals/${deleteId}`)
        .expect(200);

      const receivedGoal = deleteResponse.body;
      const { createdAt, updatedAt, ...expectedGoal } = goals[1];
      expect(receivedGoal).toMatchObject(expectedGoal);

      const remaining = await prisma.goal.findMany({
        where: { userId: alice.id },
        orderBy: { order: 'asc' },
      });
      expect(remaining.length).toBe(2);
      expect(remaining[0].order).toBe(1);
      expect(remaining[1].order).toBe(2);
    });
  });

  /**
   * POST /goals/reorder
   */
  describe('POST /goals/reorder', () => {
    let goals: Goal[];

    beforeEach(async () => {
      const goalsToCreate = [
        {
          title: 'Goal1',
          userId: alice.id,
          goalType: GoalQuantify.NUMERIC,
          publicity: GoalPublicity.PUBLIC,
          order: 1,
          colour: 'FFFFFF',
          icon: 'a1',
        },
        {
          title: 'Goal2',
          userId: alice.id,
          goalType: GoalQuantify.NUMERIC,
          publicity: GoalPublicity.PUBLIC,
          order: 2,
          colour: 'FFFFFF',
          icon: 'a2',
        },
        {
          title: 'Goal3',
          userId: alice.id,
          goalType: GoalQuantify.NUMERIC,
          publicity: GoalPublicity.PUBLIC,
          order: 3,
          colour: 'FFFFFF',
          icon: 'a3',
        },
      ];

      await prisma.goal.createMany({
        data: goalsToCreate,
      });

      goals = await prisma.goal.findMany({
        where: { userId: alice.id },
        orderBy: { order: 'asc' },
      });
    });

    it('rejects unauthenticated', async () => {
      await request(app.getHttpServer())
        .post('/goals/reorder')
        .send({ ids: [1, 2, 3] })
        .expect(401);
    });

    it('rejects invalid payloads', async () => {
      await aliceAgent.post('/goals/reorder').send({ ids: [] }).expect(400);
      await aliceAgent
        .post('/goals/reorder')
        .send({ ids: ['a', 'b'] })
        .expect(400);
      await aliceAgent
        .post('/goals/reorder')
        .send({ ids: [999] })
        .expect(400);
      await aliceAgent.post('/goals/reorder').send({}).expect(400);
    });

    it('returns 404 if any goal does not exist', async () => {
      const reorderDto: ReorderGoalDto = [
        { id: goals[0].id, order: 1 },
        { id: goals[1].id, order: 2 },
        { id: goals[2].id + 1, order: 3 },
      ];
      const res = await aliceAgent
        .post('/goals/reorder')
        .send(reorderDto)
        .expect(404);
      expect(res.body.message).toBe(
        'Reorder request contains invalid goal IDs',
      );
    });

    it('returns 422 if reorder request is longer than number of goals', async () => {
      const reorderDto: ReorderGoalDto = [
        { id: goals[0].id, order: 1 },
        { id: goals[1].id, order: 2 },
        { id: goals[2].id, order: 3 },
        { id: 9999, order: 4 }, // Extra goal that doesn't exist
      ];
      const res = await aliceAgent
        .post('/goals/reorder')
        .send(reorderDto)
        .expect(422);
      expect(res.body.message).toBe(
        'Reorder request length does not match number of goals',
      );
    });

    it('returns 422 if goal orders are not sequential', async () => {
      const reorderDto: ReorderGoalDto = [
        { id: goals[0].id, order: 1 },
        { id: goals[1].id, order: 4 }, // Non-sequential as orders are 1, 2 4
        { id: goals[2].id, order: 2 },
      ];
      const res = await aliceAgent
        .post('/goals/reorder')
        .send(reorderDto)
        .expect(422);
      expect(res.body.message).toBe(
        'Reorder request contains invalid goal orders',
      );
    });

    it('reorders successfully', async () => {
      const allGoals = await prisma.goal.findMany({
        where: { userId: alice.id },
        orderBy: { order: 'asc' },
      });
      const reorderDto: ReorderGoalDto = allGoals.map((goal, index, arr) => {
        return {
          id: goal.id,
          order: arr.length - index, // Reverse order
        };
      });
      await aliceAgent.post('/goals/reorder').send(reorderDto).expect(200);

      const expected = reorderDto.sort((a, b) => a.order - b.order);
      const updated = await prisma.goal.findMany({
        where: { userId: alice.id },
        orderBy: { order: 'asc' },
      });
      expect(updated[0].id).toBe(expected[0].id);
      expect(updated[1].id).toBe(expected[1].id);
      expect(updated[2].id).toBe(expected[2].id);
    });
  });
});
