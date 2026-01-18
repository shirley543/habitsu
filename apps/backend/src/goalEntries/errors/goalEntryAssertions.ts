import { GoalEntry } from "@prisma/client";
import { GoalEntryNotFoundError } from "./goalEntryNotFound.error";

/**
 * Asserts that a goal entry exists.
 *
 * @param goalEntry - The goal entry object or null
 * @param goalEntryId - The ID of the goal entry, used in the error if not found
 * @throws GoalEntryNotFoundError if the goal entry is null
 */
export function assertGoalEntryFound(goalEntry: GoalEntry | null, goalEntryId: number): asserts goalEntry is GoalEntry {
  if (!goalEntry) throw new GoalEntryNotFoundError(goalEntryId);
}
