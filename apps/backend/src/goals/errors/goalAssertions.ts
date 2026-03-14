import { Goal, GoalPublicity, ProfilePublicity } from '@prisma/client';
import { GoalNotFoundError } from './goalNotFound.error';
import { GoalUnauthorizedError } from './goalUnauthorized.error';

/**
 * Helper types
 */
type GoalWithId = Pick<Goal, 'id'>;
type GoalWithIds = Pick<Goal, 'id' | 'userId'>;
type GoalWithIdsPublicity = Pick<Goal, 'id' | 'userId' | 'publicity'>;
type GoalWithUserProfile = GoalWithIdsPublicity & {
  user: { id: number; profilePublicity: ProfilePublicity };
};

/**
 * Asserts that a goal exists.
 *
 * @param goal - The goal object or null
 * @param goalId - ID used in the error if goal is not found
 * @throws GoalNotFoundError if goal is null
 */
export function assertGoalFound<T extends GoalWithId>(
  goal: T | null,
): asserts goal is T {
  if (!goal) throw new GoalNotFoundError();
}

/**
 * Asserts that the given user can create resources for this goal.
 *
 * @param goal - The goal object (must contain id and userId)
 * @param userId - The ID of the requesting user (or undefined for unauthenticated)
 * @throws GoalUnauthorizedError if the user does not own the goal
 */
export function assertGoalCanCreate<T extends GoalWithIds>(
  goal: T,
  userId?: number,
) {
  if (goal.userId !== userId) throw new GoalUnauthorizedError('created');
}

/**
 * Asserts that the given user can modify this goal.
 *
 * Modifying rules:
 * - Owner can always modify
 * - Non-owner cannot modify; forbidden error if public, not found error if private
 *
 * @param goal - The goal object (must contain id and userId)
 * @param userId - The ID of the requesting user (or undefined for unauthenticated)
 * @throws GoalNotFoundError if the user does not own the goal
 */
export function assertGoalCanModify<T extends GoalWithIdsPublicity>(
  goal: T,
  userId?: number,
) {
  const isOwner = goal.userId === userId;
  const isPublic = goal.publicity === GoalPublicity.PUBLIC;

  if (!isOwner && !isPublic) {
    throw new GoalNotFoundError();
  } else if (!isOwner && isPublic) {
    throw new GoalUnauthorizedError('modified');
  }
}

/**
 * Asserts that the given user can view this goal.
 *
 * Viewing rules (profile publicity takes precedence):
 * - Owner can always view regardless of profile or goal publicity
 * - Non-owner cannot view any goal if the owner's profile is PRIVATE
 * - Non-owner may view the goal only if its publicity is PUBLIC
 *
 * @param goal - The goal record, including `user.profilePublicity`
 * @param userId - The ID of the requesting user (or undefined for unauthenticated)
 * @throws GoalNotFoundError if the user is not allowed to view the goal
 */
export function assertGoalCanView(goal: GoalWithUserProfile, userId?: number) {
  const isOwner = goal.userId === userId;
  const isProfilePrivate =
    goal.user.profilePublicity === ProfilePublicity.PRIVATE;

  // Check whether profile is private;
  // if yes and not owner accessing, throw not found
  if (!isOwner && isProfilePrivate) {
    throw new GoalNotFoundError();
  }

  // Check whether goal is private;
  // if yes and not owner accessing, throw not found
  const isGoalPrivate = goal.publicity === GoalPublicity.PRIVATE;
  if (!isOwner && isGoalPrivate) {
    throw new GoalNotFoundError();
  }
}
