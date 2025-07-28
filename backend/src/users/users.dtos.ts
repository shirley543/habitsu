// import { UserSchema } from '@habit-tracker/shared';
import { z } from 'zod';

// TODOss: Fix build error that's preventing habit-tracker/shared module from being pulled in
export const UserSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().min(1, "Email is required"),
  password: z.string()
    .min(8, "Password minimum length is 8"),
});


export const CreateUserSchema = UserSchema;
export const UpdateUserSchema = CreateUserSchema.partial();

export type CreateUserDto = z.infer<typeof CreateUserSchema>;
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;