import { User } from "@prisma/client";
import { UserNotFoundError } from "./userNotFound.error";

/**
 * Asserts that a user exists.
 *
 * @param user - The user object or null
 * @param identifier - The ID or other identifier used in the error if user is not found
 * @throws UserNotFoundError if the user is null
 */
export function assertUserFound(user: User | null, identifier: number | string): asserts user is User {
  if (!user) throw new UserNotFoundError(identifier);
}
