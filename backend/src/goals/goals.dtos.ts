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
  Numeric = 'NUMERIC',
  Boolean = 'BOOLEAN',
}

// export type GoalSchemaType = NumericalInterface | BooleanInterface;

// interface BaseInterface {
//   title: string;
//   description: string;
//   colour: string;
//   publicity: GoalPublicityType,
// }

// interface BooleanInterface extends BaseInterface {
//   goalType: GoalQuantifyType.Boolean;
// }

// interface NumericalInterface extends BaseInterface {
//   goalType: GoalQuantifyType.Numeric;
//   numericTarget: number;
//   numericUnit: string;
// }

/**
 * Schemas
 */
const GoalPublicityTypeSchema = z.nativeEnum(GoalPublicityType);

export const GoalTypeDiscriminatorSchema = z.discriminatedUnion("goalType", [
  // Numeric goal schema
  z.object({
    goalType: z.literal(GoalQuantifyType.Numeric),
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
    .regex(/^[a-fA-F0-9]{6}$/, "Colour must be a valid 6-digit hex string"),
  publicity: GoalPublicityTypeSchema,
  visibility: z.boolean().default(true),
});

export const GoalSchema = BaseGoalSchema.and(GoalTypeDiscriminatorSchema);

export const ReorderGoalSchema = z.object({
  id: z.number(),
  order: z.number()
}).array().superRefine((data, ctx) => {
  const ids = data.map(item => item.id);
  const uniqueIds = new Set(ids);

  if (ids.length !== uniqueIds.size) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Data array must have unique ids.`,
    })
  }

  const orders = data.map(item => item.order);
  const uniqueOrders = new Set(orders);

  if (orders.length !== uniqueOrders.size) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Data array must have unique orders.`,
    })
  }
})

// --------------------

const PartialBaseGoalSchema = BaseGoalSchema.partial();

export const CreateGoalSchema = GoalSchema;
export const UpdateGoalSchema = z.intersection(PartialBaseGoalSchema, GoalTypeDiscriminatorSchema);

export type CreateGoalDto = z.infer<typeof CreateGoalSchema>;
export type UpdateGoalDto = z.infer<typeof UpdateGoalSchema>;
export type ReorderGoalDto = z.infer<typeof ReorderGoalSchema>;