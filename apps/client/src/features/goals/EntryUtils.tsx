/**
 * Goal entry-related utils
 */

import type { GoalEntryResponse } from '@habit-tracker/validation-schemas'

export const getEntryDataForDate = (
  entriesData: Array<GoalEntryResponse>,
  findDate: Date,
) => {
  return entriesData.find((entry) => {
    const entryDate = new Date(entry.entryDate)
    const entryDateWithoutTime = new Date(
      entryDate.getFullYear(),
      entryDate.getMonth(),
      entryDate.getDate(),
    )
    const findDateWithoutTime = new Date(
      findDate.getFullYear(),
      findDate.getMonth(),
      findDate.getDate(),
    )
    return entryDateWithoutTime.getTime() === findDateWithoutTime.getTime()
  })
}
