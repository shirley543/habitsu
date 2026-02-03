import { Goal, GoalPublicity } from '@prisma/client';
import { GoalNotFoundError } from './goalNotFound.error';
import { GoalUnauthorizedError } from './goalUnauthorized.error';

type GoalWithId = Pick<Goal, 'id'>;
type GoalWithIds = Pick<Goal, 'id' | 'userId'>;
type GoalWithIdsPublicity = Pick<Goal, 'id' | 'userId' | 'publicity'>;

/**
 * Asserts that a goal exists.
 *
 * @param goal - The goal object or null
 * @param goalId - ID used in the error if goal is not found
 * @throws GoalNotFoundError if goal is null
 */
export function assertGoalFound<T extends GoalWithId>(
  goal: T | null,
  goalId: number,
): asserts goal is T {
  if (!goal) throw new GoalNotFoundError(goalId);
}

/**
 * Asserts that the given user can create resources for this goal.
 *
 * @param goal - The goal object (must contain id and userId)
 * @param userId - The ID of the user performing the action
 * @throws GoalUnauthorizedError if the user does not own the goal
 */
export function assertGoalCanCreate<T extends GoalWithIds>(
  goal: T,
  userId: number,
) {
  if (goal.userId !== userId)
    throw new GoalUnauthorizedError(goal.id, 'created');
}

/**
 * Asserts that the given user can modify this goal.
 *
 * Modifying rules:
 * - Owner can always modify
 * - Non-owner cannot modify; forbidden error if public, not found error if private
 * 
 * @param goal - The goal object (must contain id and userId)
 * @param userId - The ID of the user performing the action
 * @throws GoalNotFoundError if the user does not own the goal
 */
export function assertGoalCanModify<T extends GoalWithIdsPublicity>(
  goal: T,
  userId: number,
) {
  const isOwner = goal.userId === userId;
  const isPublic = goal.publicity === GoalPublicity.PUBLIC;

  if (!isOwner && !isPublic) {
    throw new GoalNotFoundError(goal.id);
  } else if (!isOwner && isPublic) {
    throw new GoalUnauthorizedError(goal.id, 'modified');
  }
}

/**
 *
 * Asserts that the given user can view this goal.
 *
 * Viewing rules:
 * - Owner can always view
 * - Non-owner can view only if goal is public
 *
 * @param goal - The goal object (must contain id, userId, and publicity)
 * @param userId - The ID of the user performing the action
 * @throws GoalNotFoundError if the user is not allowed to view the goal
 */
export function assertGoalCanView<T extends GoalWithIdsPublicity>(
  goal: T,
  userId: number,
) {
  const isOwner = goal.userId === userId;
  const isPublic = goal.publicity === GoalPublicity.PUBLIC;

  if (!isOwner && !isPublic) {
    throw new GoalNotFoundError(goal.id);
  }
}
