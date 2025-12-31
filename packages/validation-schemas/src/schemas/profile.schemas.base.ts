import { z } from "zod";

/**
 * Input Schemas
 */

/**
 * Input DTOs
 */

/**
 * Output Schemas
 */
export const ProfileResponseSchema = z.object({
  username: z.string(),
  joinedAt: z.date(),
  daysTrackedTotal: z.number(),
});

/**
 * Output DTOs
 */
export type ProfileResponseDto = z.infer<typeof ProfileResponseSchema>;
