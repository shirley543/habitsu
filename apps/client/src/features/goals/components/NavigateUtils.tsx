/**
 * Shared navigate utils
 */

import type { GoalEntryResponse } from "@habit-tracker/validation-schemas"
import type { UseNavigateResult } from "@tanstack/react-router"

/**
 * Navigate to create entry or edit entry page, based on presence of an existing entry
 * @param goalId 
 * @param existingEntry 
 * @param selectedDate 
 * @param navigate 
 */
export const navigateToCreateOrEdit = (goalId: number, existingEntry: GoalEntryResponse | undefined, selectedDate: Date | undefined, navigate: UseNavigateResult<string>) => {
  if (existingEntry) {
    navigate({
      to: '/goals/$goalId/entries/$entryId/edit', 
      params: {
        goalId: goalId.toString(),
        entryId: existingEntry.id.toString()
      },
    })
  } else {
    navigate({
      to: '/goals/$goalId/entries/create', 
      params: { goalId: goalId.toString() },
      state: { date: selectedDate?.toISOString() }
    })
  }
}
