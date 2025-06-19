import { BaseGoalSchema, GoalSchema, GoalTypeDiscriminatorSchema } from '@habit-tracker/shared';
import { z } from 'zod';

const PartialBaseGoalSchema = BaseGoalSchema.partial();

export const CreateGoalSchema = GoalSchema;
export const UpdateGoalSchema = z.intersection(PartialBaseGoalSchema, GoalTypeDiscriminatorSchema);

export type CreateGoalDto = z.infer<typeof CreateGoalSchema>;
export type UpdateGoalDto = z.infer<typeof UpdateGoalSchema>;