import { z } from "zod";

/**
 * Types
 */

export enum GoalPublicityType {
  Public = "PUBLIC",
  Private = "PRIVATE",
}

export enum GoalQuantifyType {
  Numeric = "NUMERIC",
  Boolean = "BOOLEAN",
}

/**
 * Schemas: Goals
 */

const GoalPublicityTypeSchema = z.nativeEnum(GoalPublicityType);

const NumericGoalSchema = z.object({
  goalType: z.literal(GoalQuantifyType.Numeric),
  numericTarget: z.number({ required_error: "Target is required" }),
  numericUnit: z.string().min(1, "Units are required"),
})

const BooleanGoalSchema = z.object({
  goalType: z.literal(GoalQuantifyType.Boolean),
})

// Discriminated union
export const GoalTypeDiscriminatorSchema = z.discriminatedUnion("goalType", [
  NumericGoalSchema,
  BooleanGoalSchema,
]);

export const BaseGoalSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  icon: z.string().min(1, "Icon is required"),
  colour: z
    .string()
    .min(1, "Colour is required")
    .regex(/^[a-fA-F0-9]{6}$/, "Colour must be a valid 6-digit hex string"),
  publicity: GoalPublicityTypeSchema,
  visibility: z.boolean().default(true),
});

export const ReorderGoalSchema = z
  .object({
    id: z.number(),
    order: z.number(),
  })
  .array()
  .superRefine((data, ctx) => {
    const ids = data.map((item) => item.id);
    const uniqueIds = new Set(ids);

    if (ids.length !== uniqueIds.size) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Data array must have unique ids.`,
      });
    }

    const orders = data.map((item) => item.order);
    const uniqueOrders = new Set(orders);

    if (orders.length !== uniqueOrders.size) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Data array must have unique orders.`,
      });
    }
  });

/**
 * Schemas: Create / Response DTOs
 */

export const CreateGoalSchema = BaseGoalSchema.and(GoalTypeDiscriminatorSchema);
export const GoalResponseSchema = BaseGoalSchema.extend({
  id: z.number(),
  order: z.number(),
}).and(GoalTypeDiscriminatorSchema);

/**
 * Schemas: Update DTOs (PATCH)
 */

const UpdateNumericGoalSchema =
  NumericGoalSchema
    .partial()
    .required({ goalType: true });

const UpdateBooleanGoalSchema =
  BooleanGoalSchema
    .partial()
    .required({ goalType: true });

const UpdateBaseGoalSchema = BaseGoalSchema.partial();

export const UpdateGoalSchema = UpdateBaseGoalSchema.and(
  z.union([UpdateNumericGoalSchema, UpdateBooleanGoalSchema])
);

/**
 * Interfaces
 */

export type CreateGoalDto = z.infer<typeof CreateGoalSchema>;
export type UpdateGoalDto = z.infer<typeof UpdateGoalSchema>;
export type GoalResponse = z.infer<typeof GoalResponseSchema>;
export type ReorderGoalDto = z.infer<typeof ReorderGoalSchema>;

/**
 * Schemas: Goal Entries
 */

export const GoalEntryTypePartialSchema = z.object({
  numericValue: z.number().nullable().optional(),
});

export const BaseGoalEntrySchema = z.object({
  entryDate: z
    .string()
    .transform((val) => new Date(val))
    .refine((date) => !isNaN(date.getTime()), { message: "Invalid date" }),
  note: z.string().nullable(),
});

export const GoalEntrySchema = BaseGoalEntrySchema.and(
  GoalEntryTypePartialSchema,
);

export const SearchParamsGoalEntrySchema = z.object({
  goalId: z.preprocess((val) => (val ? Number(val) : undefined), z.number()),
  year: z
    .preprocess((val) => (val ? Number(val) : undefined), z.number())
    .optional(),
});

export const CreateGoalEntrySchema = GoalEntrySchema;
const PartialBaseGoalEntrySchema = BaseGoalEntrySchema.partial();
const PartialGoalEntryTypeSchema = GoalEntryTypePartialSchema.partial();

export const UpdateGoalEntrySchema = z.intersection(
  PartialBaseGoalEntrySchema,
  PartialGoalEntryTypeSchema
);

export const GoalEntryResponseSchema = BaseGoalEntrySchema.extend({
  id: z.number(),
  goalId: z.number(),
}).and(GoalEntryTypePartialSchema);

/**
 * Interfaces: Goal Entries
 */
export type CreateGoalEntryDto = z.infer<typeof CreateGoalEntrySchema>;
export type UpdateGoalEntryDto = z.infer<typeof UpdateGoalEntrySchema>;
export type SearchParamsGoalEntryDto = z.infer<
  typeof SearchParamsGoalEntrySchema
>;
export type GoalEntryResponse = z.infer<typeof GoalEntryResponseSchema>;

/**
 * Schemas / Interfaces: Goal statistics
 */
export const GoalStatisticsSchema = z.object({
  yearAvg: z.number().nullable(),
  yearCount: z.number().nullable(),
  currentStreakLen: z.number().nullable(),
  maxStreakLen: z.number().nullable(),
});
export type GoalStatisticsReponse = z.infer<typeof GoalStatisticsSchema>;

/**
 * Schemas / Interfaces: Goal monthly averages/counts
 */
export const GoalMonthlyAverageSchema = z.object({
  year: z.number(),
  month: z.number(),
  average: z.number(),
});
export const GoalMonthlyAveragesSchema = z.array(GoalMonthlyAverageSchema);
export type GoalMonthlyAveragesResponse = z.infer<
  typeof GoalMonthlyAveragesSchema
>;

export const GoalMonthlyCountSchema = z.object({
  year: z.number(),
  month: z.number(),
  count: z.number(),
});
export const GoalMonthlyCountsSchema = z.array(GoalMonthlyCountSchema);
export type GoalMonthlyCountsResponse = z.infer<typeof GoalMonthlyCountsSchema>;
