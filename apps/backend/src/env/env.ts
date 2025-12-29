import { z } from 'zod';
import * as ms from 'ms';

export const envSchema = z.object({
  PORT: z.coerce.number().optional().default(8080),
  JWT_SECRET: z.string(),
  JWT_EXPIRY: z
    .string()
    .default('3600s')
    .refine(
      (val): val is ms.StringValue =>
        typeof ms(val as ms.StringValue) === 'number',
      { message: 'Invalid JWT_EXPIRY' },
    ),
  SALT_ROUNDS: z.coerce.number().default(10),
  // TODOs #31: node env pass in as dev, prod, test? local? default to dev?
});

export type Env = z.infer<typeof envSchema>;
