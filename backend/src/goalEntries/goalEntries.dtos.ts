// import { BaseGoalEntrySchema, GoalEntrySchema, GoalEntryTypeDiscriminatorSchema } from '@habit-tracker/shared';
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

export type GoalEntrySchemaType = NumericalInterface | BooleanInterface;

interface BaseInterface {
  entryDate: Date;
  note?: string;
}

interface BooleanInterface extends BaseInterface {
  goalType: GoalQuantifyType.Boolean;
  booleanValue: boolean;
}

interface NumericalInterface extends BaseInterface {
  goalType: GoalQuantifyType.Numerical;
  numericValue: number;
}

/**
 * Schemas
 */
const GoalPublicityTypeSchema = z.nativeEnum(GoalPublicityType);

export const GoalEntryTypeDiscriminatorSchema = z.discriminatedUnion("goalType", [
  // Numerical goal schema
  z.object({
    goalType: z.literal(GoalQuantifyType.Numerical),
    numericValue: z.number({ required_error: "Value is required" }),
  }),
  // Boolean goal schema
  z.object({
    goalType: z.literal(GoalQuantifyType.Boolean),
    booleanValue: z.boolean({ required_error: "Value is required" }),
  }),
]);

export const BaseGoalEntrySchema = z.object({
  entryDate: z.date({ required_error: "Entry date is required" }),
  note: z.string().nullable(),
});

export const GoalEntrySchema = BaseGoalEntrySchema.and(GoalEntryTypeDiscriminatorSchema);

// export const SearchParamsGoalEntrySchema = z.object({
//   goalId: z.number(),
//   year: z.number(),
// }).partial()

export const SearchParamsGoalEntrySchema = z.object({
  goalId: z.preprocess((val) => (val ? Number(val) : undefined), z.number()),
  year: z.preprocess((val) => (val ? Number(val) : undefined), z.number()),
}).partial();

// --------------------

const PartialBaseGoalEntrySchema = BaseGoalEntrySchema.partial();

export const CreateGoalEntrySchema = GoalEntrySchema;
export const UpdateGoalEntrySchema = z.intersection(PartialBaseGoalEntrySchema, GoalEntryTypeDiscriminatorSchema);

export type CreateGoalEntryDto = z.infer<typeof CreateGoalEntrySchema>;
export type UpdateGoalEntryDto = z.infer<typeof UpdateGoalEntrySchema>;
export type SearchParamsGoalEntryDto = z.infer<typeof SearchParamsGoalEntrySchema>;