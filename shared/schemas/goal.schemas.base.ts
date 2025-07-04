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

/**
 * Schemas: Goals
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
    .regex(/^#[a-fA-F0-9]+$/, "Colour must be a valid hex string"),
  publicity: GoalPublicityTypeSchema,
});

// --------------------

export const CreateGoalSchema = BaseGoalSchema.and(GoalTypeDiscriminatorSchema);
// TODOs: UpdateGoalSchema incorrect currently. To fix; numericTarget and numericUnits fields should be optional, but goal type should be required
export const UpdateGoalSchema = BaseGoalSchema.partial().and(GoalTypeDiscriminatorSchema);
export const GoalResponseSchema = (BaseGoalSchema.extend({ id: z.number() }).and(GoalTypeDiscriminatorSchema))

/**
 * Interfaces: Goals
 */
export type CreateGoalDto = z.infer<typeof CreateGoalSchema>;
export type UpdateGoalDto = z.infer<typeof UpdateGoalSchema>;
export type GoalResponse = z.infer<typeof GoalResponseSchema>;


/**
 * Schemas: Goal Entries
 */


// export const GoalEntryTypeDiscriminatorSchema = z.discriminatedUnion("goalType", [
//   // Numeric goal schema
//   z.object({
//     goalType: z.literal(GoalQuantifyType.Numeric),
//     numericValue: z.number({ required_error: "Value is required" }),
//   }),
//   // Boolean goal schema
//   z.object({
//     goalType: z.literal(GoalQuantifyType.Boolean),
//     booleanValue: z.boolean({ required_error: "Value is required" }),
//   }),
// ]);

export const GoalEntryTypePartialSchema = 
  z.object({
    numericValue: z.number(),
    booleanValue: z.boolean(),
  }).partial();


export const BaseGoalEntrySchema = z.object({
  entryDate: z.date({ required_error: "Entry date is required" }),
  note: z.string().nullable(),
});

export const GoalEntrySchema = BaseGoalEntrySchema.and(GoalEntryTypePartialSchema);

export const SearchParamsGoalEntrySchema = z.object({
  goalId: z.preprocess((val) => (val ? Number(val) : undefined), z.number()),
  year: z.preprocess((val) => (val ? Number(val) : undefined), z.number()),
}).partial();


const PartialBaseGoalEntrySchema = BaseGoalEntrySchema.partial();

export const CreateGoalEntrySchema = GoalEntrySchema;
export const UpdateGoalEntrySchema = z.intersection(PartialBaseGoalEntrySchema, GoalEntryTypePartialSchema);
export const GoalEntryResponseSchema = (BaseGoalEntrySchema.extend({ id: z.number(), goalId: z.number() }).and(GoalEntryTypePartialSchema))

/**
 * Interfaces: Goal Entries
 */
export type CreateGoalEntryDto = z.infer<typeof CreateGoalEntrySchema>;
export type UpdateGoalEntryDto = z.infer<typeof UpdateGoalEntrySchema>;
export type SearchParamsGoalEntryDto = z.infer<typeof SearchParamsGoalEntrySchema>;
export type GoalEntryResponseDto = z.infer<typeof GoalEntryResponseSchema>;
