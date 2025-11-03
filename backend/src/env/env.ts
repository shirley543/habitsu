import { z } from 'zod';

export const envSchema = z.object({
  PORT: z.coerce.number().optional().default(8080),
  JWT_SECRET: z.string(),
  JWT_EXPIRY: z.string().default('3600s'),
  SALT_ROUNDS: z.coerce.number().default(10),
  // TODOs #31: node env pass in as dev, prod, test? local? default to dev?
})

export type Env = z.infer<typeof envSchema>;
