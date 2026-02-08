import { z } from "zod";

/**
 * Input Schemas
 */
const UserSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email().min(1, "Email is required"),
  password: z.string().min(8, "Password minimum length is 8"),
});

export const CreateUserSchema = UserSchema;
export const UpdateUserSchema = CreateUserSchema.partial().and(
  z.object({
    currentPassword: z.string(),
  }),
);

export const LoginUserSchema = z.object({
  email: z.string().email().min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

/**
 * Input DTOs
 */
export type CreateUserDto = z.infer<typeof CreateUserSchema>;
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
export type LoginUserDto = z.infer<typeof LoginUserSchema>;

/**
 * Output Schemas
 */
export const UserResponseSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string().email(),
});

/**
 * Output DTOs
 */
export type UserResponseDto = z.infer<typeof UserResponseSchema>;
