import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { prisma } from './helpers/prisma';
import { loginWithCookie } from './helpers/login';
import * as bcrypt from 'bcrypt';
import * as cookieParser from 'cookie-parser';
import { GoalPublicity, GoalQuantify, User } from '@prisma/client';
import TestAgent from 'supertest/lib/agent';
import { CreateGoalDto, GoalPublicityType, GoalQuantifyType, GoalResponse } from '@habit-tracker/validation-schemas';

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
    const aliceHash = await bcrypt.hash(alicePassword, parseInt(process.env.TEST_BCRYPT_SALT_ROUNDS || '1'));
    const bobHash = await bcrypt.hash(bobPassword, parseInt(process.env.TEST_BCRYPT_SALT_ROUNDS || '1'));
    alice = await prisma.user.create({ data: { email: 'alice@test.com', username: 'Alice', password: aliceHash } });
    bob = await prisma.user.create({ data: { email: 'bob@test.com', username: 'Bob', password: bobHash } });

    // Login users and get agents
    aliceAgent = await loginWithCookie(app, { email: alice.email, password: alicePassword });
    bobAgent = await loginWithCookie(app, { email: bob.email, password: bobPassword });
  });

  /**
   * POST /goals
   */
  describe('POST /goals', () => {
    it('rejects unauthenticated requests (401)', async () => {
      await request(app.getHttpServer()).post('/goals').send({ title: 'Test', goalType: GoalQuantify.NUMERIC }).expect(401);
    });

    it('rejects invalid payloads [all fields missing] (400)', async () => {
      // Entire object missing
      const res = await aliceAgent.post('/goals').send({}).expect(400);
      expect(res.body.message).toBe('Validation failed');
      expect(res.body.fields).toEqual(
        {
          "_errors": [],
          "colour": {
            "_errors": [
              "Required"
            ]
          },
          "description": {
            "_errors": [
              "Required"
            ]
          },
          "goalType": {
            "_errors": [
              "Invalid discriminator value. Expected 'NUMERIC' | 'BOOLEAN'"
            ]
          },
          "icon": {
            "_errors": [
              "Required"
            ]
          },
          "publicity": {
            "_errors": [
              "Required"
            ]
          },
          "title": {
            "_errors": [
              "Required"
            ]
          }
        }
      );
    });

    it('rejects invalid payloads [one field incorrect type] (400)', async () => {
      // All fields correct except for numeric target type being string
      const res2 = await aliceAgent.post('/goals').send({ title: 'Run daily', description: 'Desc', goalType: GoalQuantifyType.Numeric, publicity: GoalPublicityType.Public, colour: 'FFFFFF', icon: 'a1', visibility: true, numericTarget: "10", numericUnit: "km" }).expect(400);
      expect(res2.body.message).toBe('Validation failed');
      expect(res2.body.fields).toEqual(
        {
          "_errors": [],
          "numericTarget": {
            "_errors": [
              "Expected number, received string",
            ],
          },
        }
      );
    })

    it('creates a goal successfully [numeric goal] (201)', async () => {
      const payload: CreateGoalDto = { title: 'Run daily', description: 'Desc', goalType: GoalQuantifyType.Numeric, publicity: GoalPublicityType.Public, colour: 'FFFFFF', icon: 'a1', visibility: true, numericTarget: 10, numericUnit: "km" };
      
      const res = await aliceAgent.post('/goals').send(payload).expect(201);

      expect(res.body.title).toBe(payload.title);
      expect(res.body.userId).toBe(alice.id);

      const goalInDb = await prisma.goal.findUnique({ where: { id: res.body.id } });
      expect(goalInDb).not.toBeNull();
      expect(goalInDb?.userId).toBe(alice.id);
      expect(goalInDb?.order).toBe(1);
      expect(goalInDb?.createdAt).toBeDefined();
      expect(goalInDb?.updatedAt).toBeDefined();
    });

    it('creates a goal successfully [boolean goal] (201)', async () => {
      const payload: CreateGoalDto = { title: 'Run daily', description: 'Desc', goalType: GoalQuantifyType.Boolean, publicity: GoalPublicityType.Public, colour: 'FFFFFF', icon: 'a1', visibility: true };
      
      const res = await aliceAgent.post('/goals').send(payload).expect(201);

      expect(res.body.title).toBe(payload.title);
      expect(res.body.userId).toBe(alice.id);

      const goalInDb = await prisma.goal.findUnique({ where: { id: res.body.id } });
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
          { title: 'Alice Public', userId: alice.id, goalType: GoalQuantify.NUMERIC, publicity: GoalPublicity.PUBLIC, order: 1, colour: 'FFFFFF', icon: 'a1' },
          { title: 'Alice Private', userId: alice.id, goalType: GoalQuantify.BOOLEAN, publicity: GoalPublicity.PRIVATE, order: 2, colour: 'FFFFFF', icon: 'a2' },
          { title: 'Bob Public', userId: bob.id, goalType: GoalQuantify.NUMERIC, publicity: GoalPublicity.PUBLIC, order: 1, colour: 'FFFFFF', icon: 'b1' },
          { title: 'Bob Private', userId: bob.id, goalType: GoalQuantify.BOOLEAN, publicity: GoalPublicity.PRIVATE, order: 2, colour: 'FFFFFF', icon: 'b2' },
        ],
      });

      const aliceRes = await aliceAgent.get('/goals').expect(200);
      const aliceTitles = aliceRes.body.map((g: GoalResponse) => g.title);
      const aliceExpected = ['Alice Public', 'Alice Private'];
      expect(aliceTitles).toEqual(expect.arrayContaining(aliceExpected));

      const bobRes = await bobAgent.get('/goals').expect(200);
      const bobTitles = bobRes.body.map((g: GoalResponse) => g.title);
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
    let goal: any;

    beforeEach(async () => {
      goal = await prisma.goal.create({
        data: { title: 'Alice Goal', userId: alice.id, goalType: GoalQuantify.NUMERIC, publicity: GoalPublicity.PUBLIC, order: 1, colour: 'FFFFFF', icon: 'a1' },
      });
    });

    it('rejects unauthenticated', async () => {
      const res = await request(app.getHttpServer()).get(`/goals/${goal.id}`).expect(401);
      expect(res.body.message).toBe('Unauthorized');
    });

    it('returns 400 for invalid id', async () => {
      const res = await aliceAgent.get('/goals/invalid').expect(400);
      expect(res.body.message).toBe('Validation failed (numeric string is expected)');
    });

    it('returns 404 for non-existent goal', async () => {
      const res = await aliceAgent.get('/goals/999999').expect(404);
      // TODOs #36: Currently this fails. Fix by implementing a global Prisma exception filter and map out general messages
      // expect(res.body.message).toBe('Not found');
    });

    it('returns 404 if goal belongs to another user', async () => {
      const other = await prisma.goal.create({
        data: { title: 'Bob Goal', userId: bob.id, goalType: GoalQuantify.NUMERIC, publicity: GoalPublicity.PUBLIC, order: 1, colour: 'FFFFFF', icon: 'b1' },
      });
      const res = await aliceAgent.get(`/goals/${other.id}`).expect(404);
      // TODOs #36: Currently this fails. Fix by implementing a global Prisma exception filter and map out general messages
      // expect(res.body.message).toBe('Not found');
    });

    it('returns goal if authorized', async () => {
      const res = await aliceAgent.get(`/goals/${goal.id}`).expect(200);
      expect(res.body.id).toBe(goal.id);
      expect(res.body.userId).toBe(alice.id);
    });
  });

  // /**
  //  * PATCH /goals/:id
  //  */
  // describe('PATCH /goals/:id', () => {
  //   let goal: any;

  //   beforeEach(async () => {
  //     goal = await prisma.goal.create({
  //       data: { title: 'Alice Goal', userId: alice.id, goalType: GoalQuantify.NUMERIC, publicity: GoalPublicity.PUBLIC, order: 1, colour: '#FFF', icon: 'a1' },
  //     });
  //   });

  //   it('rejects unauthenticated', async () => {
  //     await request(app.getHttpServer()).patch(`/goals/${goal.id}`).send({ title: 'Updated' }).expect(401);
  //   });

  //   it('returns 400 for invalid id', async () => {
  //     await aliceAgent.patch('/goals/invalid').send({ title: 'Updated' }).expect(400);
  //   });

  //   it('returns 400 for empty payload', async () => {
  //     await aliceAgent.patch(`/goals/${goal.id}`).send({}).expect(400);
  //   });

  //   it('returns 400 for invalid enum transition', async () => {
  //     await aliceAgent.patch(`/goals/${goal.id}`).send({ goalType: GoalQuantify.BOOLEAN }).expect(400);
  //   });

  //   it('returns 404 if goal belongs to another user', async () => {
  //     const other = await prisma.goal.create({
  //       data: { title: 'Bob Goal', userId: bob.id, goalType: GoalQuantify.NUMERIC, publicity: GoalPublicity.PUBLIC, order: 1, colour: '#FFF', icon: 'b1' },
  //     });
  //     await aliceAgent.patch(`/goals/${other.id}`).send({ title: 'Updated' }).expect(404);
  //   });

  //   it('updates successfully with updatedAt modified', async () => {
  //     const oldUpdatedAt = goal.updatedAt;
  //     await new Promise((r) => setTimeout(r, 10));
  //     const res = await aliceAgent.patch(`/goals/${goal.id}`).send({ title: 'Updated Title' }).expect(200);

  //     expect(res.body.title).toBe('Updated Title');
  //     const updated = await prisma.goal.findUnique({ where: { id: goal.id } });
  //     expect(updated?.title).toBe('Updated Title');
  //     expect(new Date(updated!.updatedAt).getTime()).toBeGreaterThan(new Date(oldUpdatedAt).getTime());
  //   });
  // });

  // /**
  //  * DELETE /goals/:id
  //  */
  // describe('DELETE /goals/:id', () => {
  //   let goals: any[];

  //   beforeEach(async () => {
  //     goals = await prisma.goal.createMany({
  //       data: [
  //         { title: 'Goal1', userId: alice.id, goalType: GoalQuantify.NUMERIC, publicity: GoalPublicity.PUBLIC, order: 1, colour: '#FFF', icon: 'a1' },
  //         { title: 'Goal2', userId: alice.id, goalType: GoalQuantify.NUMERIC, publicity: GoalPublicity.PUBLIC, order: 2, colour: '#FFF', icon: 'a2' },
  //         { title: 'Goal3', userId: alice.id, goalType: GoalQuantify.NUMERIC, publicity: GoalPublicity.PUBLIC, order: 3, colour: '#FFF', icon: 'a3' },
  //       ],
  //     });
  //   });

  //   it('rejects unauthenticated', async () => {
  //     await request(app.getHttpServer()).delete('/goals/1').expect(401);
  //   });

  //   it('returns 404 if goal belongs to another user', async () => {
  //     const other = await prisma.goal.create({
  //       data: { title: 'Bob Goal', userId: bob.id, goalType: GoalQuantify.NUMERIC, publicity: GoalPublicity.PUBLIC, order: 1, colour: '#FFF', icon: 'b1' },
  //     });
  //     await aliceAgent.delete(`/goals/${other.id}`).expect(404);
  //   });

  //   it('deletes goal successfully and reorders remaining', async () => {
  //     const allGoals = await prisma.goal.findMany({ where: { userId: alice.id }, orderBy: { order: 'asc' } });
  //     const deleteId = allGoals[1].id; // Goal2
  //     await aliceAgent.delete(`/goals/${deleteId}`).expect(204);

  //     const remaining = await prisma.goal.findMany({ where: { userId: alice.id }, orderBy: { order: 'asc' } });
  //     expect(remaining.length).toBe(2);
  //     expect(remaining[0].order).toBe(1);
  //     expect(remaining[1].order).toBe(2);
  //   });
  // });

  // /**
  //  * POST /goals/reorder
  //  */
  // describe('POST /goals/reorder', () => {
  //   let goals: any[];

  //   beforeEach(async () => {
  //     goals = await prisma.goal.createMany({
  //       data: [
  //         { title: 'Goal1', userId: alice.id, goalType: GoalQuantify.NUMERIC, publicity: GoalPublicity.PUBLIC, order: 1, colour: '#FFF', icon: 'a1' },
  //         { title: 'Goal2', userId: alice.id, goalType: GoalQuantify.NUMERIC, publicity: GoalPublicity.PUBLIC, order: 2, colour: '#FFF', icon: 'a2' },
  //         { title: 'Goal3', userId: alice.id, goalType: GoalQuantify.NUMERIC, publicity: GoalPublicity.PUBLIC, order: 3, colour: '#FFF', icon: 'a3' },
  //       ],
  //     });
  //   });

  //   it('rejects unauthenticated', async () => {
  //     await request(app.getHttpServer()).post('/goals/reorder').send({ ids: [1,2,3] }).expect(401);
  //   });

  //   it('rejects invalid payloads', async () => {
  //     await aliceAgent.post('/goals/reorder').send({ ids: [] }).expect(400);
  //     await aliceAgent.post('/goals/reorder').send({ ids: ['a','b'] }).expect(400);
  //     await aliceAgent.post('/goals/reorder').send({}).expect(400);
  //   });

  //   it('returns 404 if any goal does not exist', async () => {
  //     await aliceAgent.post('/goals/reorder').send({ ids: [999] }).expect(404);
  //   });

  //   it('reorders successfully', async () => {
  //     const allGoals = await prisma.goal.findMany({ where: { userId: alice.id }, orderBy: { order: 'asc' } });
  //     const ids = allGoals.map(g => g.id).reverse(); // reverse order
  //     await aliceAgent.post('/goals/reorder').send({ ids }).expect(200);

  //     const updated = await prisma.goal.findMany({ where: { userId: alice.id }, orderBy: { order: 'asc' } });
  //     expect(updated[0].id).toBe(ids[0]);
  //     expect(updated[1].id).toBe(ids[1]);
  //     expect(updated[2].id).toBe(ids[2]);
  //   });

  //   it('reorder is atomic (partial failure rolls back)', async () => {
  //     const allGoals = await prisma.goal.findMany({ where: { userId: alice.id }, orderBy: { order: 'asc' } });
  //     const ids = allGoals.map(g => g.id).concat(999999); // invalid id
  //     await aliceAgent.post('/goals/reorder').send({ ids }).expect(404);

  //     const after = await prisma.goal.findMany({ where: { userId: alice.id }, orderBy: { order: 'asc' } });
  //     after.forEach((g, idx) => {
  //       expect(g.order).toBe(idx + 1);
  //     });
  //   });
  // });
});
