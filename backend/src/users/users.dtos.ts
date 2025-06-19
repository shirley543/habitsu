import { UserSchema } from '@habit-tracker/shared';
import { z } from 'zod';

export const CreateUserSchema = UserSchema;
export const UpdateUserSchema = CreateUserSchema.partial();

export type CreateUserDto = z.infer<typeof CreateUserSchema>;
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;