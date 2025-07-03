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

// export type GoalSchemaType = NumericalInterface | BooleanInterface;

// interface BaseInterface {
//   title: string;
//   description: string;
//   colour: string;
//   publicity: GoalPublicityType,
//   icon: string;
// }

// interface BooleanInterface extends BaseInterface {
//   goalType: GoalQuantifyType.Boolean;
// }

// interface NumericalInterface extends BaseInterface {
//   goalType: GoalQuantifyType.Numerical;
//   numericTarget: number;
//   numericUnit: string;
// }

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

export const GoalSchema = BaseGoalSchema.and(GoalTypeDiscriminatorSchema);
export type GoalInterface = z.infer<typeof GoalSchema>;
