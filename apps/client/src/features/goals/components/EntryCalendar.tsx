import * as React from 'react'

import {
  
  GoalQuantifyType
  
} from '@habit-tracker/validation-schemas'
import { useNavigate } from '@tanstack/react-router'
import { useGoal, useGoalEntries } from '../../../apis/GoalApi'
import { getEntryDataForDate } from '../EntryUtils'
import { navigateToCreateOrEdit } from './NavigateUtils'
import type {GoalEntryResponse, SearchParamsGoalEntryDto} from '@habit-tracker/validation-schemas';
import { Calendar } from '@/components/ui/calendar'
import { computeBinAndColorArrays } from '@/lib/colourUtils'

/**
 * Modifier config, for grouping modifier-related properties
 */
interface ModifierConfig {
  name: string // /< Name key for modifiers struct, e.g. `modifier0` = low entry progress modifier, `modifierFull`
  dates: Array<Date> // /< Dates associated with the modifier e.g. dates with low entry progress
  colour: string // /< Colour to represent/ indicate the modifier e.g. colour shade to denote low entry progress dates (border colour of Calendar's Day Button)
}

interface EntryCalendarProps {
  goalId: number
  searchParams: SearchParamsGoalEntryDto
}

const EntryCalendar: React.FC<EntryCalendarProps> = ({
  goalId,
  searchParams,
}) => {
  const navigate = useNavigate()

  const [date, setDate] = React.useState<Date | undefined>(
    new Date(2025, 6, 12),
  )

  const { data: goalData } = useGoal(goalId.toString())
  const { data: entriesData, isLoading, error } = useGoalEntries(searchParams)

  let modifiers = {}
  let modifiersStyles = {}
  let modifiersClassNames = {}
  if (goalData) {
    // Compute modifier configs
    let modifierConfigs: Array<ModifierConfig> = []
    switch (goalData.goalType) {
      case GoalQuantifyType.Numeric:
        {
          const { binArray, colorArray } = computeBinAndColorArrays(
            goalData.colour,
            goalData.numericTarget,
          )
          modifierConfigs = colorArray.map((color, idx) => {
            const filterFn = (entry: GoalEntryResponse) => {
              if (idx === 0) {
                return entry.numericValue && entry.numericValue < binArray[idx]
              } else if (idx === colorArray.length - 1) {
                return (
                  entry.numericValue && entry.numericValue >= binArray[idx - 1]
                )
              } else {
                return (
                  entry.numericValue &&
                  entry.numericValue < binArray[idx] &&
                  entry.numericValue >= binArray[idx - 1]
                )
              }
            }
            return {
              name: `modifier${idx}`,
              dates:
                entriesData
                  ?.filter(filterFn)
                  .map((entry) => new Date(entry.entryDate)) || [],
              colour: color,
            }
          })
        }
        break
      case GoalQuantifyType.Boolean:
        {
          modifierConfigs = [
            {
              name: `modifierFull`,
              dates:
                entriesData?.map((entry) => new Date(entry.entryDate)) || [],
              colour: `#${goalData.colour}`,
            },
          ]
        }
        break
    }

    // Compute reduced objects:
    // * modifiers (dates e.g.
    //      for numeric goal type: `modifier0`, `1`, `2`, `3` = low, med, high, full entry-progress dates.
    //      for boolean goal type: `modifierFull` = entry-completed dates)
    // * modifiers styles (CSS properties styles, for dynamic styles e.g. border colour)
    // * modifiers class names (Tailwind CSS class names, for non-dynamic styles)
    modifiers = modifierConfigs.reduce(
      (obj, item) =>
        Object.assign(obj, {
          [item.name]: item.dates,
        }),
      {},
    )

    modifiersStyles = modifierConfigs.reduce((obj, item) => {
      const styleClass: React.CSSProperties = {
        borderColor: item.colour,
      }
      return Object.assign(obj, {
        [item.name]: styleClass,
      })
    }, {})

    modifiersClassNames = modifierConfigs.reduce((obj, item) => {
      const className = 'border-2 rounded-lg [&>button]:font-medium'
      return Object.assign(obj, {
        [item.name]: className,
      })
    }, {})
  }

  const calendarYear = searchParams.year || new Date().getFullYear()
  return (
    <Calendar
      mode="single"
      defaultMonth={date}
      selected={date}
      onSelect={(selectedDate) => {
        setDate(selectedDate)

        if (goalData && selectedDate) {
          const goalEntryForDate = entriesData
            ? getEntryDataForDate(entriesData, selectedDate)
            : undefined
          navigateToCreateOrEdit(goalData.id, goalEntryForDate, selectedDate, navigate)
        }
      }}
      modifiers={modifiers}
      modifiersStyles={modifiersStyles}
      modifiersClassNames={modifiersClassNames}
      captionLayout="dropdown-months"
      startMonth={new Date(calendarYear, 0)}
      endMonth={new Date(calendarYear, 11)}
      showOutsideDays={true}
    />
  )
}

export default EntryCalendar
