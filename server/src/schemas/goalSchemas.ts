import { z } from "zod";
import { GoalPublicityType, GoalQuantifyType, GoalSchema, type GoalSchemaType } from '@habit-tracker/shared'

/**
 * Backend-specific schemas
 */

export const createGoalSchema = z.object({
  body: GoalSchema
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
  body: GoalSchema,
});


export type CreateGoalInput = z.infer<typeof createGoalSchema.shape.body>;
export type GoalParamsInput = z.infer<typeof goalParamsSchema.shape.params>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
