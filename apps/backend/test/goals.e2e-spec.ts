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
import * as bcrypt from 'bcrypt';
import * as cookieParser from 'cookie-parser';

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
    .compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser()); // Apply global middleware same as main.ts
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
    const aliceHashedPassword = await bcrypt.hash(alicePassword, parseInt(process.env.TEST_BCRYPT_SALT_ROUNDS || '1'));
    const bobHashedPassword = await bcrypt.hash(bobPassword, parseInt(process.env.TEST_BCRYPT_SALT_ROUNDS || '1'));
    alice = await prisma.user.create({ data: { email: 'alice@test.com', username: 'Alice', password: aliceHashedPassword } });
    bob = await prisma.user.create({ data: { email: 'bob@test.com', username: 'Bob', password: bobHashedPassword } });

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
    aliceAgent = await loginWithCookie(app, { email: alice.email, password: alicePassword });
    bobAgent = await loginWithCookie(app, { email: bob.email, password: bobPassword });
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

// Goals E2E
// ---------
//
// Auth notes:
// - All /goals routes require authentication via JWT cookie
// - Unauthenticated requests should return 401 Unauthorized
// - Users must never be able to access or mutate other users' goals
//
// POST /goals (create a goal)
// - Rejected if no authentication (401)
// - Validation error (400) if request body does not match CreateGoal DTO (zod)
//   - missing required field
//   - invalid enum (visibility, status, etc.)
//   - invalid type (string instead of number, etc.)
// - Goal created successfully if DTO is valid
//   - returns 201 Created
//   - response body matches GoalResponse DTO
//   - DB contains correct entry
//   - goal is associated with logged-in user
//   - default fields are set correctly (visibility, order, timestamps)
// - Creating a goal does NOT affect other users’ goals
//
// GET /goals (get all goals for logged-in user)
// - Rejected if no authentication (401)
// - Returns 200 with array of goals for authenticated user
//   - includes both public + private goals
//   - response matches GoalsResponse DTO
// - Returns empty array if user has no goals
// - Does NOT return goals belonging to other users
//
// GET /goals/:id (get single goal)
// - Rejected if no authentication (401)
// - Validation error (400) if id param is invalid (not an integer)
// - Returns 404 if goal does not exist
// - Returns 404 if goal exists but belongs to another user
// - Returns 200 if goal exists and belongs to logged-in user
//   - response matches GoalResponse DTO
//   - correct goal data returned
//
// PATCH /goals/:id (update goal)
// - Rejected if no authentication (401)
// - Validation error (400) if id param is invalid
// - Validation error (400) if request body does not match UpdateGoal DTO
// - Returns 404 if goal does not exist
// - Returns 404 if goal exists but belongs to another user
// - Updates goal successfully if authorized and DTO is valid
//   - returns 200 OK
//   - response matches GoalResponse DTO
//   - DB reflects updated values
//   - unchanged fields remain unchanged
//
// DELETE /goals/:id (delete goal)
// - Rejected if no authentication (401)
// - Validation error (400) if id param is invalid
// - Returns 404 if goal does not exist
// - Returns 404 if goal exists but belongs to another user
// - Deletes goal successfully if authorized
//   - returns 204 No Content (or 200 if you return body)
//   - goal is removed from DB
//   - does not affect other goals
//
// POST /goals/reorder
// - Rejected if no authentication (401)
// - Validation error (400) if body does not match ReorderGoals DTO
//   - missing ids
//   - duplicate ids
//   - non-integer ids
// - Returns 404 if any goal id does not exist
// - Returns 404 if any goal id belongs to another user
// - Reorders goals successfully if valid
//   - returns 200 OK
//   - DB order values updated correctly
//   - order is stable and matches request
//   - no goals are added or removed

// Profiles E2E
// ------------
// - GET /user/:username
//   - Rejected if no authentication (JWT cookie); returns logged in user's goals
//   - Goals array returned correctly if authenticated (check success code + DB contains correct entry + correctly returns Goals Response)
//     - Data differs depending on 
//   - 404 not found if username doesn't exist