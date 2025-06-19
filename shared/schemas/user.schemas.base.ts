import { z } from "zod";

/**
 * Types
 */

/**
 * Schemas
 */

export const UserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email is required"),
  password: z.string()
    .min(8, "Password minimum length is 8"),
});
