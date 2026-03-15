import { cva } from 'class-variance-authority'
import React, { forwardRef, useEffect, useMemo, useRef } from 'react'
import { CalendarDays } from 'lucide-react'
import { GoalQuantifyType } from '@habit-tracker/validation-schemas'
import { useNavigate } from '@tanstack/react-router'
import { getEntryDataForDate } from '../EntryUtils'
import { navigateToCreateOrEdit } from './NavigateUtils'
import type { GoalEntryResponse } from '@habit-tracker/validation-schemas'
import type { ColourGoalData } from '@/lib/colourUtils'
import type { VariantProps } from 'class-variance-authority'
import { Skeleton } from '@/components/ui/skeleton'
import {
  daysOfWeekShort,
  getPartialDaysOfWeekShort,
  monthsOfYearShort,
} from '@/lib/dateUtils'
import { computeCellColour } from '@/lib/colourUtils'
import HoverPopover from '@/components/custom/HoverPopup'
import { cn } from '@/lib/utils'

/**
 * Public types
 */
export enum HeatmapDisplayState {
  WITH_LABELS = 'with-labels',
  NO_LABELS = 'no-labels',
}

/**
 * Private functions
 */

/**
 * Function for determining the number of days in a year (standard: 365, leap year: 366)
 *
 * Rules for determining a leap year based on Gregorian calendar are as follows:
 * Years evenly divisible by 4 are leap years, with the exception of
 * century years (divisible 100) which are not leap years unless also divisible by 400
 *
 * @param year
 * @return Number of days in a year
 */
function getDaysInYear(year: number) {
  const divisibleByFour = year % 4 === 0
  const divisibleByHundred = year % 100 === 0
  const divisibleByFourHundred = year % 400 === 0

  const isLeapYear = (() => {
    if (divisibleByFour) {
      return true
    } else if (divisibleByHundred) {
      return divisibleByFourHundred
    } else {
      return false
    }
  })()

  return isLeapYear ? 366 : 365
}

interface CellProps {
  date: Date
  goalData: ColourGoalData
  entryData: GoalEntryResponse | undefined
  viewOnly: boolean
}

const cellVariants = cva('transition-all disabled:pointer-events-none', {
  variants: {
    variant: {
      default: 'border-0',
      outlined: 'border-solid border-black border-2',
    },
    size: {
      default: 'h-5 w-5 rounded-sm',
      sm: 'h-4 w-4 rounded-md',
      lg: 'h-16 w-16 rounded-md',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
})

const Cell = React.memo(
  forwardRef<HTMLDivElement, CellProps & VariantProps<typeof cellVariants>>(
    ({ date, goalData, entryData, viewOnly, variant, size }, ref) => {
      const navigate = useNavigate()

      const cellColor: string = computeCellColour(goalData, entryData)

      const labelText: string = (() => {
        const NO_ENTRY_TEXT = 'No entry'
        switch (goalData.goalType) {
          case GoalQuantifyType.Numeric:
            return entryData?.numericValue
              ? `${entryData.numericValue} ${goalData.numericUnit}`
              : NO_ENTRY_TEXT
          case GoalQuantifyType.Boolean:
            return entryData ? 'Completed' : NO_ENTRY_TEXT
          default:
            return 'Unknown'
        }
      })()

      return (
        <HoverPopover
          triggerElem={
            <div
              className={cn(cellVariants({ variant, size }))}
              ref={ref}
              style={{
                backgroundColor: cellColor,
              }}
              onClick={
                viewOnly
                  ? undefined
                  : () => {
                      navigateToCreateOrEdit(
                        goalData.id,
                        entryData,
                        date,
                        navigate,
                      )
                    }
              }
            />
          }
          contentElem={
            <div
              className={
                'flex flex-col justify-start bg-white text-black p-3 rounded-md shadow-xl border-1 border-solid border-neutral-100 max-w-[262px] z-10'
              }
            >
              <h2 className="text-sm font-semibold">{labelText}</h2>
              <p className="text-sm font-normal pt-1">{entryData?.note}</p>
              <div className="text-zinc-500 flex flex-row gap-2 pt-2">
                <CalendarDays size={16} />
                <p className="text-xs font-normal">{date.toDateString()}</p>
              </div>
            </div>
          }
        ></HoverPopover>
      )
    },
  ),
)

/**
 * Public functions
 */

interface HeatmapProps {
  goalData: ColourGoalData
  entriesData: Array<GoalEntryResponse>
  year: number
  displayState?: HeatmapDisplayState
  viewOnly: boolean
}

const Heatmap: React.FC<HeatmapProps> = ({
  goalData,
  entriesData,
  year,
  displayState = HeatmapDisplayState.NO_LABELS,
  viewOnly,
}) => {
  const selectedYear = year
  const daysInYear = getDaysInYear(selectedYear)
  const todayCellTargetRef = useRef<null | HTMLDivElement>(null) // Initialize with null

  // Scroll into view today's cell
  useEffect(() => {
    if (todayCellTargetRef.current) {
      todayCellTargetRef.current.scrollIntoView({
        behavior: 'auto',
        block: 'end',
        inline: 'nearest',
      })
    }
  }, [])

  // Cells: for displaying progress
  const now = new Date()
  const today = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  )

  const cells = useMemo(() => {
    // Progress cells
    const progressCells = [...Array(daysInYear)].map((_, idx) => {
      const cellDate = new Date(Date.UTC(selectedYear, 0, 1))
      cellDate.setUTCDate(cellDate.getUTCDate() + idx)

      const entryDataForCell = getEntryDataForDate(entriesData, cellDate)
      const isCellForTodaysDate = cellDate.getTime() === today.getTime()

      return (
        <Cell
          key={`cell_${idx}`}
          date={cellDate}
          ref={isCellForTodaysDate ? todayCellTargetRef : undefined}
          goalData={goalData}
          entryData={entryDataForCell}
          variant={isCellForTodaysDate ? 'outlined' : 'default'}
          viewOnly={viewOnly}
        />
      )
    })

    // Holder cells for alignment
    const weekStartDay = 1 // Monday
    const firstDate = new Date(selectedYear, 0, 1)
    const firstDay = firstDate.getDay()
    const holderCells = [...Array(firstDay - weekStartDay)].map((_, idx) => (
      <div className="holder-cell" key={`holderCell_${idx}`} />
    ))

    // Combine
    return [...holderCells, ...progressCells]
  }, [entriesData, goalData, year, today, todayCellTargetRef])

  const contentSlot = (() => {
    switch (displayState) {
      case HeatmapDisplayState.WITH_LABELS:
        {
          const a = cells.slice()
          const arrays = [],
            size = 7

          while (a.length > 0) {
            arrays.push(a.splice(0, size))
          }

          // Iterate over week-grouped arrays and add month label
          for (const array of arrays) {
            const firstDayOfMonthElem = array.find((elem) => {
              if (elem.type === Cell) {
                const elDate = elem.props.date as Date
                return elDate.getDate() === 1
              }
              return false
            })

            const labelElement = firstDayOfMonthElem ? (
              <div className="w-5 text-xs font-medium flex justify-center items-center">
                {
                  monthsOfYearShort[
                    (firstDayOfMonthElem.props.date as Date).getMonth()
                  ]
                }
              </div>
            ) : (
              <div></div>
            )
            arrays[i].unshift(labelElement)
          }

          // Weekday labels
          const weekdayLabels = daysOfWeekShort.map((shortLabel) => {
            const weekdayString = shortLabel
            if (getPartialDaysOfWeekShort([0, 2, 4]).includes(weekdayString)) {
              return (
                <div className="h-5 text-xs font-medium flex justify-center items-center">
                  {weekdayString}
                </div>
              )
            } else {
              return <div className="weekday-empty"></div>
            }
          })

          const gridWithMonthLabels = arrays.flat().slice()

          return (
            <>
              <div className="corner-holder-cell"></div>
              {weekdayLabels}
              {gridWithMonthLabels}
            </>
          )
        }
        break

      case HeatmapDisplayState.NO_LABELS: {
        const gridNoMonthLabels = cells.slice()
        return <>{gridNoMonthLabels}</>
      }
    }
  })()

  return (
    <div
      className={`grid ${displayState === HeatmapDisplayState.WITH_LABELS ? 'grid-rows-8' : 'grid-rows-7'} 
      grid-flow-col gap-1 w-full overflow-x-auto`}
    >
      {contentSlot}
    </div>
  )
}

const SkeletonHeatmap: React.FC = () => {
  return <Skeleton className={'w-full h-[180px]'} />
}

export { Heatmap, SkeletonHeatmap }
