/**
 * Login helper functions for E2E tests.
 */
import { INestApplication } from '@nestjs/common';
import { User } from '@prisma/client';
import * as request from 'supertest';
import TestAgent from 'supertest/lib/agent';

/**
 * Logs in a user via the API and returns a JWT token.
 *
 * For tests where the app expects the token
 * to be sent in the `Authorization: Bearer <token>` header.
 *
 * Example usage:
 *   const token = await loginWithToken(app, user);
 *   await request(app.getHttpServer())
 *     .get('/goals')
 *     .set('Authorization', `Bearer ${token}`);
 * 
 * @param app - The NestJS application instance
 * @param user - A Prisma User object
 * @returns A promise resolving to the access token string
 */
export async function loginWithToken(app: INestApplication, user: User): Promise<string> {
  const res = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email: user.email, password: user.password });
  return res.body.accessToken;
}

/**
 * Logs in a user via the API and returns a Supertest agent
 * with the authentication cookie set.
 *
 * For tests where the app sets JWT in an HTTP-only cookie
 * and expects cookies to be sent automatically on subsequent requests.
 *
 * Example usage:
 *   const agent = await loginWithCookie(app, user);
 *   await agent.post('/goals').send({ title: 'Goal' }); // cookie sent automatically
 * 
 * @param app - The NestJS application instance
 * @param user - A Prisma User object
 * @returns A promise resolving to a Supertest agent with cookies set
 */
export async function loginWithCookie(app: INestApplication, user: User): Promise<TestAgent> {
  const agent = request.agent(app.getHttpServer());
  await agent
    .post('/auth/login')
    .send({ email: user.email, password: user.password });

  // Return agent with stored cookie
  return agent;
}
