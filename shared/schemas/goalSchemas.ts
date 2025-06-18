import { z } from "zod";

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
  numericUnits: string;
}

/**
 * Schemas
 */
const GoalPublicityTypeSchema = z.nativeEnum(GoalPublicityType);

export const typeDiscriminatorSchema = z.discriminatedUnion("goalType", [
  // Numerical goal schema
  z.object({
    goalType: z.literal(GoalQuantifyType.Numerical),
    numericTarget: z.number({ required_error: "Target is required" }),
    numericUnits: z.string().min(1, "Units are required"),
  }),
  // Boolean goal schema
  z.object({
    goalType: z.literal(GoalQuantifyType.Boolean),
  }),
]);

export const goalSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  colour: z.string()
    .min(1, "Colour is required")
    .regex(/^#[a-fA-F0-9]+$/, "Colour must be a valid hex string"),
  publicity: GoalPublicityTypeSchema,
}).and(typeDiscriminatorSchema);
