import { z } from 'zod';

// TODOss: Fix build error that's preventing habit-tracker/shared module from being pulled in
/**
 * Types
 */

export enum GoalPublicityType {
  Public = 'PUBLIC',
  Private = 'PRIVATE',
}

export enum GoalQuantifyType {
  Numerical = 'NUMERICAL',
  Boolean = 'BOOLEAN',
}

/**
 * Schemas
 */
const GoalPublicityTypeSchema = z.nativeEnum(GoalPublicityType);

export const GoalTypeDiscriminatorSchema = z.discriminatedUnion("goalType", [
  // Numerical goal schema
  z.object({
    goalType: z.literal(GoalQuantifyType.Numerical),
    numericTarget: z.number({ required_error: "Target is required" }),
    numericUnit: z.string().min(1, "Units are required"),
  }),
  // Boolean goal schema
  z.object({
    goalType: z.literal(GoalQuantifyType.Boolean),
  }),
]);

export const BaseGoalSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  icon: z.string().min(1, "Icon is required"),
  colour: z.string()
    .min(1, "Colour is required")
    .regex(/^#[a-fA-F0-9]+$/, "Colour must be a valid hex string"),
  publicity: GoalPublicityTypeSchema,
});

// --------------------

export const CreateGoalSchema = BaseGoalSchema.and(GoalTypeDiscriminatorSchema);
// TODOs: UpdateGoalSchema incorrect currently. To fix; numericTarget and numericUnits fields should be optional, but goal type should be required
export const UpdateGoalSchema = BaseGoalSchema.partial().and(GoalTypeDiscriminatorSchema);
export const GoalResponseSchema = (BaseGoalSchema.extend({ id: z.number() }).and(GoalTypeDiscriminatorSchema))

/**
 * Interfaces
 */
export type CreateGoalDto = z.infer<typeof CreateGoalSchema>;
export type UpdateGoalDto = z.infer<typeof UpdateGoalSchema>;
export type GoalResponse = z.infer<typeof GoalResponseSchema>;
