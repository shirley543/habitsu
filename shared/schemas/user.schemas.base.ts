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
