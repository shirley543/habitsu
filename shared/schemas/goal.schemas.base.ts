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
    .regex(/^[a-fA-F0-9]{6}$/, "Colour must be a valid 6-digit hex string"),
  publicity: GoalPublicityTypeSchema,
  visibility: z.boolean().default(true),
});

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

export const CreateGoalSchema = BaseGoalSchema.and(GoalTypeDiscriminatorSchema);
// TODOs: UpdateGoalSchema incorrect currently. To fix; numericTarget and numericUnits fields should be optional, but goal type should be required
export const UpdateGoalSchema = BaseGoalSchema.partial().and(GoalTypeDiscriminatorSchema);
export const GoalResponseSchema = (BaseGoalSchema.extend({
  id: z.number(),
  order: z.number(),
}).and(GoalTypeDiscriminatorSchema))

/**
 * Interfaces: Goals
 */
export type CreateGoalDto = z.infer<typeof CreateGoalSchema>;
export type UpdateGoalDto = z.infer<typeof UpdateGoalSchema>;
export type GoalResponse = z.infer<typeof GoalResponseSchema>;
export type ReorderGoalDto = z.infer<typeof ReorderGoalSchema>;

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
});

export const GoalEntrySchema = BaseGoalEntrySchema.and(GoalEntryTypePartialSchema);

export const SearchParamsGoalEntrySchema = z.object({
  goalId: z.preprocess((val) => (val ? Number(val) : undefined), z.number()),
  year: z.preprocess((val) => (val ? Number(val) : undefined), z.number()).optional(),
});


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