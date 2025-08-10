import { z } from "zod";

/**
 * Types
 */

/**
 * Schemas
 */

export const UserSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().min(1, "Email is required"),
  password: z.string()
    .min(8, "Password minimum length is 8"),
});


export const CreateUserSchema = UserSchema;
export const UpdateUserSchema = CreateUserSchema.partial();

export const LoginUserSchema = z.object({
  email: z.string().min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>;
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
export type LoginUserDto = z.infer<typeof LoginUserSchema>;

export type UserResponse = z.infer<typeof CreateUserSchema>;