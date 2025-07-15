import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import HoverPopover from '@/components/custom/HoverPopup';
import { forwardRef, useEffect, useRef } from 'react';
import { CalendarDays } from 'lucide-react';
import { GoalQuantifyType, type GoalEntryResponse } from '@habit-tracker/shared';
import { Skeleton } from '@/components/ui/skeleton';
import { daysOfWeekShort, getPartialDaysOfWeekShort, monthsOfYearShort } from '@/lib/dateUtils';
import { useNavigate } from '@tanstack/react-router';
import { navigateToCreateOrEdit } from './NavigateUtils';
import { computeCellColour, type ColourGoalData } from '@/lib/colourUtils';
import { getEntryDataForDate } from '../EntryUtils';

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
  const divisibleByFour = (year % 4) === 0;
  const divisibleByHundred = (year % 100) === 0;
  const divisibleByFourHundred = (year % 400) === 0;

  const isLeapYear = (() => {
    if (divisibleByFour) {
      return true;
    } else if (divisibleByHundred) {
      return divisibleByFourHundred;
    } else {
      return false;
    }
  })();

  return isLeapYear ? 366 : 365;
}

interface CellProps {
  date: Date,
  goalData: ColourGoalData,
  entryData: GoalEntryResponse | undefined,
}

const cellVariants = cva(
  "transition-all disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "border-0",
        outlined: "border-solid border-black border-2"
      },
      size: {
        default: "h-5 w-5 rounded-sm",
        sm: "h-4 w-4 rounded-md",
        lg: "h-16 w-16 rounded-md",
      },

    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Cell = forwardRef<HTMLDivElement, CellProps & VariantProps<typeof cellVariants>>((
  {
    date,
    goalData,
    entryData,
    variant,
    size,
  },
  ref
) => {
  const navigate = useNavigate();

  const cellColor: string = computeCellColour(goalData, entryData);

  const labelText: string = (() => {
    const NO_ENTRY_TEXT = "No entry";
    switch (goalData.goalType) {
      case GoalQuantifyType.Numeric:
        return entryData?.numericValue ? `${entryData?.numericValue} ${goalData.numericUnit}` : NO_ENTRY_TEXT;
      case GoalQuantifyType.Boolean:
        return entryData ? "Completed" : NO_ENTRY_TEXT;
      default:
        return "Unknown"
    }
  })()

  return (
    <HoverPopover 
      triggerElem=
      {
        <div className={cn(cellVariants({ variant, size }))} ref={ref}
          style={{
            backgroundColor: cellColor,
          }}
          onClick={() => {
            navigateToCreateOrEdit(goalData.id, entryData, date, navigate);
          }}
        />
      }
      // TODOs:
      // - Add fade in/ out animation to make display less jarring
      contentElem={
        <div className={'flex flex-col justify-start bg-white text-black p-3 rounded-md shadow-xl border-1 border-solid border-neutral-100 max-w-[262px] z-10'}>
          <h2 className="text-sm font-semibold">{labelText}</h2>
          <p className="text-sm font-normal pt-1">{entryData?.note}</p>
          <div className="text-zinc-500 flex flex-row gap-2 pt-2">
            <CalendarDays size={16}/>
            <p className="text-xs font-normal">{date.toDateString()}</p>
          </div>
        </div>
      }>
    </HoverPopover>
  )
})

/**
 * Public functions
 */

interface HeatmapProps {
  goalData: ColourGoalData,
  entriesData: Array<GoalEntryResponse>,
  year: number,
  displayState?: HeatmapDisplayState
}

const Heatmap: React.FC<HeatmapProps> = ({ goalData, entriesData, year, displayState=HeatmapDisplayState.NO_LABELS }) => {
  const selectedYear = year;
  const daysInYear = getDaysInYear(selectedYear);
  const todayCellTargetRef = useRef<null | HTMLDivElement>(null); // Initialize with null

  // Scroll into view today's cell
  useEffect(() => {
    if (todayCellTargetRef.current) {
      todayCellTargetRef.current.scrollIntoView({
        behavior: 'auto',
        block: 'end',
        inline: 'nearest'
      })
    }
  }, [])

  // Cells: for displaying progress
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() ));

  const progressCells = [...Array(daysInYear)].map((_, idx) => {
    const cellDate = (() => {
      const newDate = new Date(Date.UTC(selectedYear, 0, 1));
      newDate.setUTCDate(newDate.getUTCDate() + idx);
      return newDate;
    })();

    const entryDataForCell = getEntryDataForDate(entriesData, cellDate);
    const isCellForTodaysDate = cellDate.getTime() === today.getTime();

    return <Cell key={`cell_${idx}`} date={cellDate} 
            ref={isCellForTodaysDate ? todayCellTargetRef : undefined}
            goalData={goalData}
            entryData={entryDataForCell}
            variant={isCellForTodaysDate ? "outlined" : "default"}
          />
  });

  // Holder cells: for gap/ placeholder to align 
  // first day of year to week day
  const weekStartDay = 1; // 0 for Sunday, 1 for Monday
  const firstDate = new Date(selectedYear, 0, 1);
  const firstDay = firstDate.getDay();
  const holderCells = [...Array(firstDay - weekStartDay)].map((_, idx) => {
    return <div className="holder-cell" key={`holderCell_${idx}`}></div>
  })

  // Group holder cells and add column title
  const cells = [...holderCells, ...progressCells];
  const a = cells.slice();
  var arrays = [], size = 7;
    
  while (a.length > 0) {
    arrays.push(a.splice(0, size));
  }

  // Iterate over week-grouped arrays and add month label
  for (let i = 0; i < arrays.length; i++) {
    const firstDayOfMonthElem = arrays[i].find((elem) => {
      if (elem.type === Cell) {
        const elDate = elem.props.date as Date;
        return elDate.getDate() === 1;
      };
      return false;
    });

    const labelElement = firstDayOfMonthElem ? 
      <div className='w-8 text-base font-medium flex justify-center items-center'>
        {monthsOfYearShort[(firstDayOfMonthElem.props.date as Date).getMonth()]}
      </div> :
      <div></div>
    arrays[i].unshift(labelElement)
  }

  const gridWithMonthLabels = arrays.flat().slice();
  const gridNoMonthLabels = cells.slice();
  const finalGridCells = displayState === HeatmapDisplayState.WITH_LABELS ? gridWithMonthLabels : gridNoMonthLabels;

  // Weekday labels
  const weekdayLabels = daysOfWeekShort.map((shortLabel) => {
    const weekdayString = shortLabel;
    if (getPartialDaysOfWeekShort([0, 2, 4]).includes(weekdayString)) {
      return <div className='h-8 text-base font-medium flex justify-center items-center'>{weekdayString}</div>
    } else {
      return <div className="weekday-empty"></div>
    }
  })
  const finalWeekdayLabels = displayState === HeatmapDisplayState.WITH_LABELS ? weekdayLabels : undefined;

  return (
    <div className={`grid ${displayState === HeatmapDisplayState.WITH_LABELS ? "grid-rows-8" : "grid-rows-7"} 
      grid-flow-col gap-1 w-full overflow-x-auto`
    }>
      {displayState === HeatmapDisplayState.WITH_LABELS ? <div className="corner-holder-cell"></div> : undefined}
      {finalWeekdayLabels}
      {finalGridCells}
    </div>
  )
}

const SkeletonHeatmap: React.FC = () => {
  return (
    <Skeleton className={"w-full h-[180px]"}/>
  )
}

export { Heatmap, SkeletonHeatmap };
