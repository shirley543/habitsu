// import { BaseGoalSchema, GoalSchema, GoalTypeDiscriminatorSchema } from '@habit-tracker/shared';
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

export type GoalSchemaType = NumericalInterface | BooleanInterface;

interface BaseInterface {
  title: string;
  description: string;
  colour: string;
  publicity: GoalPublicityType,
}

interface BooleanInterface extends BaseInterface {
  goalType: GoalQuantifyType.Boolean;
}

interface NumericalInterface extends BaseInterface {
  goalType: GoalQuantifyType.Numerical;
  numericTarget: number;
  numericUnit: string;
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
  colour: z.string()
    .min(1, "Colour is required")
    .regex(/^#[a-fA-F0-9]+$/, "Colour must be a valid hex string"),
  publicity: GoalPublicityTypeSchema,
});

export const GoalSchema = BaseGoalSchema.and(GoalTypeDiscriminatorSchema);



// --------------------

const PartialBaseGoalSchema = BaseGoalSchema.partial();

export const CreateGoalSchema = GoalSchema;
export const UpdateGoalSchema = z.intersection(PartialBaseGoalSchema, GoalTypeDiscriminatorSchema);

export type CreateGoalDto = z.infer<typeof CreateGoalSchema>;
export type UpdateGoalDto = z.infer<typeof UpdateGoalSchema>;