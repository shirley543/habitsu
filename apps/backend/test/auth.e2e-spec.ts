import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as cookieParser from 'cookie-parser';
import TestAgent from 'supertest/lib/agent';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let agent: TestAgent;
  let prisma: PrismaService;

  const testUser = {
    email: 'test@example.com',
    password: 'password123',
    username: 'test-username'
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser()); // Apply global middleware same as main.ts
    await app.init();

    prisma = app.get(PrismaService);

    // Create a test user
    await prisma.user.create({
      data: {
        email: testUser.email,
        password: await bcrypt.hash(testUser.password, 1), // test-only salt rounds
        username: testUser.username,
      },
    });

    // SuperTest agent to persist cookies
    agent = request.agent(app.getHttpServer());
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: testUser.email } });
    await app.close();
  });

  it('should login successfully and set JWT cookie', async () => {
    const res = await agent
      .post('/auth/login')
      .send({ email: testUser.email, password: testUser.password })
      .expect(200);

    expect(res.body.message).toBe('Logged in');
    expect(res.headers['set-cookie']).toBeDefined();
    const jwtCookie = res.headers['set-cookie'][0];
    expect(jwtCookie).toContain('jwt=');
  });

  it('should access protected route after login', async () => {
    await agent.get('/goals').expect(200);
  });

  it('should return 401 if user does not exist', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'nonexistent@example.com', password: '123' })
      .expect(401);

    expect(res.body.message).toBe('Unauthorized');
  });

  it('should return 401 if password is incorrect', async () => {
    const loginPayload = { email: testUser.email, password: 'wrongpassword' };

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send(loginPayload)
      .expect(401);

    expect(res.body.message).toBe('Unauthorized');
  });
});
