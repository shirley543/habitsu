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
      expect(res.body.fields.password._errors).toEqual(['Password minimum length is 8']);
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
      expect(res.body.fields.email._errors).toEqual(['Invalid email']);
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
      expect(res.body.fields.username._errors).toEqual(['Username is required']);
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
      expect(res.body.message).toBe('A user with this email already exists');
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
      expect(res.body.message).toBe('A user with this username already exists');
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

    it('updates password successfully', async () => {
      const payload: UpdateUserDto = {
        password: 'alice_new_password',
      };
      const res = await aliceAgent
        .patch('/users/me')
        .send(payload)
        .expect(200);

      // Check response fields
      expect(res.body.email).toBe('alice@test.com'); // Unchanged
      expect(res.body.username).toBe('alice'); // Unchanged

      // Check database fields
      const updated = await prisma.user.findUnique({
        where: { id: alice.id },
      });
      expect(updated?.email).toBe('alice@test.com'); // Unchanged
      expect(updated?.username).toBe('alice'); // Unchanged

      // TODOs #36 uncomment once fixed, currently endpoint does not support changing of password
      // // Check successfully able to login with new password
      // await request(app.getHttpServer())
      //   .post('/auth/login')
      //   .send({
      //     email: 'alice@test.com',
      //     password: 'alice_new_password',
      //   })
      //   .expect(200);
    });

    it('updates username, email, and password', async () => {
      const payload: UpdateUserDto = {
        username: 'alice_new',
        email: 'alice_new@test.com',
        password: 'alice_new_password'
      };

      // Check response fields
      const res = await aliceAgent
        .patch('/users/me')
        .send(payload)
        .expect(200);

      expect(res.body.username).toBe('alice_new');
      expect(res.body.email).toBe('alice_new@test.com');
      expect(res.body.password).toBeUndefined();

      // Check database fields
      const updated = await prisma.user.findUnique({
        where: { id: alice.id },
      });
      expect(updated?.username).toBe('alice_new');
      expect(updated?.email).toBe('alice_new@test.com');

      // TODOs #36
      // // Check successfully able to login with new password
      // await request(app.getHttpServer())
      //   .post('/auth/login')
      //   .send({
      //     email: 'alice@test.com',
      //     password: 'alice_new_password',
      //   })
      //   .expect(200);
    });

    it('rejects duplicate username (409)', async () => {
      const payload: UpdateUserDto = {
        username: 'bob', // Already taken
      };
      const res = await aliceAgent
        .patch('/users/me')
        .send(payload)
        .expect(409);
      expect(res.body.message).toBe('A user with this username already exists');
    });

    it('rejects duplicate email (409)', async () => {
      const payload: UpdateUserDto = {
        email: 'bob@test.com', // Already taken
      };
      const res = await aliceAgent
        .patch('/users/me')
        .send(payload)
        .expect(409);
      expect(res.body.message).toBe('A user with this email already exists');
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

      // TODOs #36 verify related goal entries are deleted due to cascade
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
});
