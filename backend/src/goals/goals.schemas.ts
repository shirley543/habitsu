import { z } from "zod";
import { GoalPublicityType, GoalQuantifyType, goalSchema, type GoalSchemaType } from '@habit-tracker/shared'

/**
 * Backend-specific schemas
 */

export const createGoalSchema = z.object({
  body: goalSchema
});

export const goalParamsSchema = z.object({
  params: z.object({
    goalId: z.string({ required_error: "Goal ID is required"})
  })
})

export const updateGoalSchema = z.object({
  params: z.object({
    goalId: z.string({ required_error: "Goal ID is required" }),
  }),
  body: goalSchema,
});


export type CreateGoalInput = z.infer<typeof createGoalSchema.shape.body>;
export type GoalParamsInput = z.infer<typeof goalParamsSchema.shape.params>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
