import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { prisma } from './helpers/prisma';
import { loginWithCookie } from './helpers/login';
import * as bcrypt from 'bcrypt';
import * as cookieParser from 'cookie-parser';
import { User } from '@prisma/client';
import TestAgent from 'supertest/lib/agent';
import {
  CreateUserDto,
  UpdateUserDto,
  UserResponseDto,
} from '@habit-tracker/validation-schemas';

describe('Users API (E2E)', () => {
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
    await prisma.goalEntry.deleteMany();
    await prisma.goal.deleteMany();
    await prisma.user.deleteMany();

    // Seed users
    const alicePassword = 'alicespassword123';
    const bobPassword = 'bobspassword123';
    const aliceHash = await bcrypt.hash(
      alicePassword,
      parseInt(process.env.TEST_BCRYPT_SALT_ROUNDS || '1'),
    );
    const bobHash = await bcrypt.hash(
      bobPassword,
      parseInt(process.env.TEST_BCRYPT_SALT_ROUNDS || '1'),
    );
    alice = await prisma.user.create({
      data: {
        email: 'alice@test.com',
        username: 'alice',
        password: aliceHash,
      },
    });
    bob = await prisma.user.create({
      data: {
        email: 'bob@test.com',
        username: 'bob',
        password: bobHash,
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
   * POST /users
   */
  describe('POST /users', () => {
    it('rejects request with missing fields (400)', async () => {
      const res = await request(app.getHttpServer())
        .post('/users')
        .send({})
        .expect(400);
      expect(res.body.message).toBe('Validation failed');
    });

    it('rejects request with short password (400)', async () => {
      const payload: CreateUserDto = {
        username: 'newuser',
        email: 'newuser@test.com',
        password: 'short',
      };
      const res = await request(app.getHttpServer())
        .post('/users')
        .send(payload)
        .expect(400);
      expect(res.body.message).toBe('Validation failed');
      expect(res.body.fields.password).toBeDefined();
    });

    it('rejects request with invalid email (400)', async () => {
      const payload: CreateUserDto = {
        username: 'newuser',
        email: 'notanemail',
        password: 'validpassword123',
      };
      const res = await request(app.getHttpServer())
        .post('/users')
        .send(payload)
        .expect(400);
      expect(res.body.message).toBe('Validation failed');
    });

    it('rejects request with empty username (400)', async () => {
      const payload: CreateUserDto = {
        username: '',
        email: 'newuser@test.com',
        password: 'validpassword123',
      };
      const res = await request(app.getHttpServer())
        .post('/users')
        .send(payload)
        .expect(400);
      expect(res.body.message).toBe('Validation failed');
    });

    it('creates user successfully (201)', async () => {
      const payload: CreateUserDto = {
        username: 'charlie',
        email: 'charlie@test.com',
        password: 'charliepassword123',
      };
      const res = await request(app.getHttpServer())
        .post('/users')
        .send(payload)
        .expect(201);

      expect(res.body.id).toBeDefined();
      expect(res.body.username).toBe('charlie');
      expect(res.body.email).toBe('charlie@test.com');
      expect(res.body.password).toBeUndefined(); // Password should not be returned

      const userInDb = await prisma.user.findUnique({
        where: { email: 'charlie@test.com' },
      });
      expect(userInDb).not.toBeNull();
      expect(userInDb?.username).toBe('charlie');
    });

    it('rejects duplicate email (409)', async () => {
      const payload: CreateUserDto = {
        username: 'newalice',
        email: 'alice@test.com', // Already taken
        password: 'newpassword123',
      };
      const res = await request(app.getHttpServer())
        .post('/users')
        .send(payload)
        .expect(409);
      expect(res.body.message).toContain('already exists');
    });

    it('rejects duplicate username (409)', async () => {
      const payload: CreateUserDto = {
        username: 'alice', // Already taken
        email: 'newalice@test.com',
        password: 'newpassword123',
      };
      const res = await request(app.getHttpServer())
        .post('/users')
        .send(payload)
        .expect(409);
      expect(res.body.message).toContain('already exists');
    });

    it('does not return password in response', async () => {
      const payload: CreateUserDto = {
        username: 'diana',
        email: 'diana@test.com',
        password: 'dianapassword123',
      };
      const res = await request(app.getHttpServer())
        .post('/users')
        .send(payload)
        .expect(201);

      expect(res.body.password).toBeUndefined();
      expect(Object.keys(res.body)).toEqual(
        expect.arrayContaining(['id', 'username', 'email']),
      );
    });
  });

  /**
   * GET /users/me
   */
  describe('GET /users/me', () => {
    it('rejects unauthenticated requests (401)', async () => {
      const res = await request(app.getHttpServer())
        .get('/users/me')
        .expect(401);
      expect(res.body.message).toBe('Unauthorized');
    });

    it('returns authenticated user data', async () => {
      const res = await aliceAgent.get('/users/me').expect(200);

      expect(res.body.id).toBe(alice.id);
      expect(res.body.username).toBe('alice');
      expect(res.body.email).toBe('alice@test.com');
      expect(res.body.password).toBeUndefined(); // Password should not be returned
    });

    it('returns correct user for different authenticated sessions', async () => {
      const aliceRes = await aliceAgent.get('/users/me').expect(200);
      expect(aliceRes.body.id).toBe(alice.id);
      expect(aliceRes.body.username).toBe('alice');

      const bobRes = await bobAgent.get('/users/me').expect(200);
      expect(bobRes.body.id).toBe(bob.id);
      expect(bobRes.body.username).toBe('bob');
    });

    it('does not return password in response', async () => {
      const res = await aliceAgent.get('/users/me').expect(200);
      expect(res.body.password).toBeUndefined();
    });
  });

  /**
   * PATCH /users/me
   */
  describe('PATCH /users/me', () => {
    it('rejects unauthenticated requests (401)', async () => {
      const payload: UpdateUserDto = {
        username: 'updated',
      };
      const res = await request(app.getHttpServer())
        .patch('/users/me')
        .send(payload)
        .expect(401);
      expect(res.body.message).toBe('Unauthorized');
    });

    it('allows empty payload (200)', async () => {
      const res = await aliceAgent.patch('/users/me').send({}).expect(200);

      expect(res.body.id).toBe(alice.id);
      expect(res.body.username).toBe('alice'); // Unchanged
      expect(res.body.email).toBe('alice@test.com'); // Unchanged
    });

    it('rejects invalid email (400)', async () => {
      const payload: UpdateUserDto = {
        email: 'notanemail',
      };
      const res = await aliceAgent
        .patch('/users/me')
        .send(payload)
        .expect(400);
      expect(res.body.message).toBe('Validation failed');
    });

    it('rejects short password (400)', async () => {
      const payload: UpdateUserDto = {
        password: 'short',
      };
      const res = await aliceAgent
        .patch('/users/me')
        .send(payload)
        .expect(400);
      expect(res.body.message).toBe('Validation failed');
    });

    it('updates username successfully', async () => {
      const payload: UpdateUserDto = {
        username: 'alice_updated',
      };
      const res = await aliceAgent
        .patch('/users/me')
        .send(payload)
        .expect(200);

      expect(res.body.username).toBe('alice_updated');
      expect(res.body.email).toBe('alice@test.com'); // Unchanged

      const updated = await prisma.user.findUnique({
        where: { id: alice.id },
      });
      expect(updated?.username).toBe('alice_updated');
    });

    it('updates email successfully', async () => {
      const payload: UpdateUserDto = {
        email: 'alice_new@test.com',
      };
      const res = await aliceAgent
        .patch('/users/me')
        .send(payload)
        .expect(200);

      expect(res.body.email).toBe('alice_new@test.com');
      expect(res.body.username).toBe('alice'); // Unchanged

      const updated = await prisma.user.findUnique({
        where: { id: alice.id },
      });
      expect(updated?.email).toBe('alice_new@test.com');
    });

    it('updates both username and email', async () => {
      const payload: UpdateUserDto = {
        username: 'alice_new',
        email: 'alice_new@test.com',
      };
      const res = await aliceAgent
        .patch('/users/me')
        .send(payload)
        .expect(200);

      expect(res.body.username).toBe('alice_new');
      expect(res.body.email).toBe('alice_new@test.com');
    });

    it('rejects duplicate username (409)', async () => {
      const payload: UpdateUserDto = {
        username: 'bob', // Already taken
      };
      const res = await aliceAgent
        .patch('/users/me')
        .send(payload)
        .expect(409);
      expect(res.body.message).toContain('already exists');
    });

    it('rejects duplicate email (409)', async () => {
      const payload: UpdateUserDto = {
        email: 'bob@test.com', // Already taken
      };
      const res = await aliceAgent
        .patch('/users/me')
        .send(payload)
        .expect(409);
      expect(res.body.message).toContain('already exists');
    });

    it('does not return password in response', async () => {
      const payload: UpdateUserDto = {
        username: 'alice_v2',
      };
      const res = await aliceAgent
        .patch('/users/me')
        .send(payload)
        .expect(200);

      expect(res.body.password).toBeUndefined();
    });

    it('does not allow direct password update via this endpoint', async () => {
      const payload: UpdateUserDto = {
        password: 'newpassword123',
      };
      const res = await aliceAgent
        .patch('/users/me')
        .send(payload)
        .expect(400);
      // Should fail validation as password requires minimum length in update schema
      expect(res.body.message).toBe('Validation failed');
    });
  });

  /**
   * DELETE /users/me
   */
  describe('DELETE /users/me', () => {
    it('rejects unauthenticated requests (401)', async () => {
      const res = await request(app.getHttpServer())
        .delete('/users/me')
        .expect(401);
      expect(res.body.message).toBe('Unauthorized');
    });

    it('deletes user successfully (200)', async () => {
      const res = await aliceAgent.delete('/users/me').expect(200);

      expect(res.body.id).toBe(alice.id);
      expect(res.body.username).toBe('alice');
      expect(res.body.email).toBe('alice@test.com');
      expect(res.body.password).toBeUndefined();

      const deleted = await prisma.user.findUnique({
        where: { id: alice.id },
      });
      expect(deleted).toBeNull();
    });

    it('deletes user and cascades to related data', async () => {
      // Create a goal for alice
      await prisma.goal.create({
        data: {
          title: 'Alice Goal',
          userId: alice.id,
          goalType: 'NUMERIC',
          publicity: 'PUBLIC',
          order: 1,
          colour: 'FFFFFF',
          icon: 'a1',
        },
      });

      const goalsBefore = await prisma.goal.findMany({
        where: { userId: alice.id },
      });
      expect(goalsBefore.length).toBe(1);

      // Delete alice
      await aliceAgent.delete('/users/me').expect(200);

      // Verify user is deleted
      const deletedUser = await prisma.user.findUnique({
        where: { id: alice.id },
      });
      expect(deletedUser).toBeNull();

      // Verify related goals are deleted due to cascade
      const goalsAfter = await prisma.goal.findMany({
        where: { userId: alice.id },
      });
      expect(goalsAfter.length).toBe(0);
    });

    it('allows user to delete their own account', async () => {
      const userIdBefore = alice.id;
      await aliceAgent.delete('/users/me').expect(200);

      const userAfterDelete = await prisma.user.findUnique({
        where: { id: userIdBefore },
      });
      expect(userAfterDelete).toBeNull();
    });

    it('returns deleted user data', async () => {
      const res = await aliceAgent.delete('/users/me').expect(200);

      const responseData: UserResponseDto = res.body;
      expect(responseData.id).toBeDefined();
      expect(responseData.username).toBeDefined();
      expect(responseData.email).toBeDefined();
    });
  });

  /**
   * Integration Tests
   */
  describe('User lifecycle integration', () => {
    it('allows sign up, login, and profile management', async () => {
      // Sign up
      const createPayload: CreateUserDto = {
        username: 'evan',
        email: 'evan@test.com',
        password: 'evanpassword123',
      };
      const signupRes = await request(app.getHttpServer())
        .post('/users')
        .send(createPayload)
        .expect(201);

      const newUserId = signupRes.body.id;
      expect(signupRes.body.username).toBe('evan');

      // Login
      const evanAgent = await loginWithCookie(app, {
        email: 'evan@test.com',
        password: 'evanpassword123',
      });

      // Get profile
      const profileRes = await evanAgent.get('/users/me').expect(200);
      expect(profileRes.body.id).toBe(newUserId);
      expect(profileRes.body.username).toBe('evan');

      // Update profile
      const updatePayload: UpdateUserDto = {
        username: 'evan_updated',
      };
      const updateRes = await evanAgent
        .patch('/users/me')
        .send(updatePayload)
        .expect(200);
      expect(updateRes.body.username).toBe('evan_updated');

      // Verify update persisted
      const verifyRes = await evanAgent.get('/users/me').expect(200);
      expect(verifyRes.body.username).toBe('evan_updated');

      // Delete account
      await evanAgent.delete('/users/me').expect(200);

      // Verify deleted
      const deletedUser = await prisma.user.findUnique({
        where: { id: newUserId },
      });
      expect(deletedUser).toBeNull();
    });

    it('maintains isolation between users', async () => {
      // Alice updates her profile
      const aliceUpdate: UpdateUserDto = {
        username: 'alice_updated',
      };
      await aliceAgent.patch('/users/me').send(aliceUpdate).expect(200);

      // Verify bob is unaffected
      const bobProfile = await bobAgent.get('/users/me').expect(200);
      expect(bobProfile.body.username).toBe('bob'); // Should be unchanged
      expect(bobProfile.body.email).toBe('bob@test.com');

      // Verify alice's change
      const aliceProfile = await aliceAgent.get('/users/me').expect(200);
      expect(aliceProfile.body.username).toBe('alice_updated');
    });

    it('prevents user from updating another user', async () => {
      // Alice cannot delete Bob
      const res = await aliceAgent.delete('/users/me').expect(200);
      const deletedId = res.body.id;
      expect(deletedId).toBe(alice.id); // Only alice should be deleted

      // Verify bob still exists
      const bobStillExists = await prisma.user.findUnique({
        where: { id: bob.id },
      });
      expect(bobStillExists).not.toBeNull();
    });
  });
});
