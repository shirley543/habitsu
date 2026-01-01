import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { prisma } from './helpers/prisma'
import { GoalQuantify } from '@prisma/client';

describe('Goals API (Integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // clean DB between tests
    await prisma.goal.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('POST /goals', () => {
    it('creates a goal successfully', async () => {
      // create a user first
      const user = await prisma.user.create({
        data: { email: 'alice@test.com', username: 'Alice', password: 'alicepassword' },
      });

      const response = await request(app.getHttpServer())
        .post('/goals')
        .send({
          title: 'Learn NestJS',
          description: 'Finish building API tests',
          userId: user.id,
        })
        .expect(201);

      expect(response.body).toMatchObject({
        title: 'Learn NestJS',
        description: 'Finish building API tests',
        userId: user.id,
      });

      // verify DB state
      const goalInDb = await prisma.goal.findUnique({ where: { id: response.body.id } });
      expect(goalInDb).toBeDefined();
      expect(goalInDb?.title).toBe('Learn NestJS');
    });

    it('fails if required fields are missing', async () => {
      await request(app.getHttpServer())
        .post('/goals')
        .send({ title: '' })
        .expect(400);
    });
  });

  describe('GET /goals', () => {
    it('returns all goals', async () => {
      // seed two goals
      const user = await prisma.user.create({ data: { email: 'bob@test.com', username: 'Bob', password: 'bobpassword' } });

      await prisma.goal.createMany({
        data: [
          { title: 'Goal 1', description: 'Desc 1', userId: user.id, colour: '#FFFFFF', icon: 'icon-1', goalType: GoalQuantify.NUMERIC, order: 1 },
          { title: 'Goal 2', description: 'Desc 2', userId: user.id, colour: '#FFFFFF', icon: 'icon-2', goalType: GoalQuantify.BOOLEAN, order: 2 },
        ],
      });

      const response = await request(app.getHttpServer())
        .get('/goals')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body.map((g: any) => g.title)).toEqual(expect.arrayContaining(['Goal 1', 'Goal 2']));
    });
  });
});
