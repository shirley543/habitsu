// import { BaseGoalEntrySchema, GoalEntrySchema, GoalEntryTypeDiscriminatorSchema } from '@habit-tracker/shared';
import { Decimal } from '@prisma/client/runtime/library';
import { z } from 'zod';

// TODOss: Fix build error that's preventing habit-tracker/shared module from being pulled in
/**
 * Types
 */

// TODOss: how to enforce check between Prisma enums and Zod enums (Prisma enums not available at shared)

export enum GoalPublicityType {
  Public = 'PUBLIC',
  Private = 'PRIVATE',
}

export enum GoalQuantifyType {
  Numeric = 'NUMERIC',
  Boolean = 'BOOLEAN',
}

export type GoalEntrySchemaType = NumericalInterface | BooleanInterface;

interface BaseInterface {
  entryDate: Date;
  note?: string;
}

interface BooleanInterface extends BaseInterface {
  goalType: GoalQuantifyType.Boolean;
}

interface NumericalInterface extends BaseInterface {
  goalType: GoalQuantifyType.Numeric;
  numericValue: number;
}

/**
 * Schemas
 */
const GoalPublicityTypeSchema = z.nativeEnum(GoalPublicityType);

/**
 * Schemas: Goal Entries
 */

export const GoalEntryTypePartialSchema = 
  z.object({
    numericValue: z.number().nullable().optional()
  })


export const BaseGoalEntrySchema = z.object({
  entryDate: z.string()
    .transform((val) => new Date(val))
    .refine((date) => !(isNaN(date.getTime()))),
  note: z.string().nullable(),
  // numericValue: z.number().nullable()
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
export type GoalEntryResponse = z.infer<typeof GoalEntryResponseSchema>;


// /**
//  * Zod union which converts Prisma decimal object (from SQL NUMERIC type)
//  * to primitive number, or keeps number as-is
//  */
// const DecimalOrNumber = z.union([
//   z.number(),
//   z.instanceof(Decimal)
// ]).transform((val) => (val instanceof Decimal ? val.toNumber() : val));

export const GoalStatisticsSchema = z.object({
  yearAvg: z.number().nullable(),
  yearCount: z.number().nullable(),
  currentStreakLen: z.number().nullable(),
  maxStreakLen: z.number().nullable(),
})
export type GoalStatisticsReponse = z.infer<typeof GoalStatisticsSchema>;

export const GoalMonthlyAverageSchema = z.object({
  year: z.number(),
  month: z.number(),
  average: z.number(),
});
export const GoalMonthlyAveragesSchema = z.array(GoalMonthlyAverageSchema);
export type GoalMonthlyAveragesResponse = z.infer<typeof GoalMonthlyAveragesSchema>;

export const GoalMonthlyCountSchema = z.object({
  year: z.number(),
  month: z.number(),
  count: z.number(),
});
export const GoalMonthlyCountsSchema = z.array(GoalMonthlyCountSchema);
export type GoalMonthlyCountsResponse = z.infer<typeof GoalMonthlyCountsSchema>;