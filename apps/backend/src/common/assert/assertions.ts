import { ForbiddenException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { GoalPublicity } from '@prisma/client';

/**
 * Various common helper assert functions, for asserting e.g.
 * whether a resource exists, or whether given user can modify/ view a resource.
 *
 * Note:
 * Creator has edit and view access, regardless of publicity state (public or private)
 * Others have view access ONLY if creator has made it public, otherwise no view access
 */

/**
 * Asserts that a resource exists.
 *
 * @param resource - The resource to check (nullable)
 * @param message - Optional custom not found message
 * @throws NotFoundException if resource is null or undefined.
 */
export function assertFound<T>(
  resource: T | null | undefined,
  message = 'Resource not found',
): asserts resource is T {
  if (resource == null) {
    throw new NotFoundException(message);
  }
}

/**
 * Asserts that the resource (goal, goal entry) can be viewed by the given user,
 * given said resource's publicity type
 *
 * @param resource - The resource to check
 * @param userId - The user ID who is requesting to view
 * @param message - Optional custom not viewable (unauthorized) message
 * @throws NotFoundException if resource cannot be viewed by the inputted user ID
 */
export function assertCanView<
  T extends { userId: number; publicity: GoalPublicity },
>(
  resource: T,
  userId: number,
  message = 'Resource not found',
) {
  const isOwner = resource.userId === userId;
  const isPublic = resource.publicity === GoalPublicity.PUBLIC;

  if (!isOwner && !isPublic) {
    throw new NotFoundException(message);
  }
}

/**
 * Asserts that the resource can be modified by the given user
 * (only owners can modify their own resources)
 *
 * @param resource - The resource to check
 * @param userId - The user ID who is requesting to modify
 * @param message - Optional custom not modifiable (unauthorized) message
 * @throws NotFoundException if resource cannot be modified by the inputted user ID
 */
export function assertCanModify<T extends { userId: number }>(
  resource: T,
  userId: number,
  message = 'Resource not found',
) {
  const isOwner = resource.userId === userId;
  if (!isOwner) {
    throw new NotFoundException(message);
  }
}

/**
 * Asserts that the resource can be created by the given user
 * (e.g. only goal owners can create goal entries for that goal)
 *
 * @param resource - The resource to check
 * @param userId - The user ID who is requesting to create
 * @param message - Optional custom not modifiable (unauthorized) message
 * @throws ForbiddenException if resource cannot be created by the inputted user ID
 */
export function assertCanCreate<T extends { userId: number }>(
  resource: T,
  userId: number,
  message = 'Resource cannot be created',
) {
  const isOwner = resource.userId === userId;
  if (!isOwner) {
    throw new ForbiddenException(message);
  }
}
