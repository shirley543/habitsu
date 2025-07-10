import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import HoverPopover from '@/components/custom/HoverPopup';
import * as d3 from 'd3';
import { forwardRef, useEffect, useRef } from 'react';
import { CalendarDays } from 'lucide-react';
import { GoalQuantifyType, type GoalEntryResponse, type GoalResponse } from '@habit-tracker/shared';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Public types
 */
export enum HeatmapDisplayState {
  WITH_LABELS = 'with-labels',
  NO_LABELS = 'no-labels',
}

export type HeatmapGoalData = Pick<GoalResponse, 'id' | 'colour'> & (
  | ({ goalType: GoalQuantifyType.Numeric } & Pick<Extract<GoalResponse, { goalType: GoalQuantifyType.Numeric }>, 'numericTarget' | 'numericUnit'>)
  | ({ goalType: GoalQuantifyType.Boolean })
);

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
  goalData: HeatmapGoalData,
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

  const { goalType } = goalData;

  /**
   * Function for converting value to a color shade
   * 
   * @param baseColor - Base color for representing full/ 100% progress on a gridcell
   * @param threshold - Threshold for value, used for representing full/ 100% progress
   * @param value - Value to convert
   * @return - Color shade for given value
   */
  const computeBinnedColour = (baseColor: string, threshold: number, value: number) => {
    // Using threshold, compute 3 equal "bins"
    // e.g. if threshold is 30, then bin array would be:
    // [ 10, 20, 30 ]
    const baseColorFullOpacity = `#${baseColor}FF`;
    const baseColorNoOpacity = `#${baseColor}00`;
    const colorInterpolate = d3.interpolate(baseColorNoOpacity, baseColorFullOpacity);

    const BIN_COUNT = 3;
    const binIncrement = threshold / BIN_COUNT;

    const binArray: number[] = [];
    for (let i = 1; i <= BIN_COUNT; i++) {
      binArray.push(binIncrement * i);
    }

    // Using base color, compute 4 colors for range with changing opacity
    // e.g. if base color is rgb(255, 0, 0), then color array would be:
    // ['rgba(255, 0, 0, 0.25)', 'rgba(255, 0, 0, 0.5)', 
    //  'rgba(255, 0, 0, 0.75)', 'rgb(255, 0, 0)']

    // TODOs: change opacity bins to be hardcoded? 20%, 40%, 65%, 100% for manually-tweaked visibility/ design?
    const COLOR_COUNT = BIN_COUNT + 1;
    const colorArray: string[] = [];
    for (let i = 1; i <= COLOR_COUNT; i++) {
      const idx = i / COLOR_COUNT;
      colorArray.push(colorInterpolate(idx));
    }

    // Convert value to color
    const domain = binArray; // Thresholds
    const range = colorArray; // Values for each threshold
    const thresholdScale = d3.scaleThreshold(domain, range);
    const colorShade = thresholdScale(value);
    return colorShade;
  }

  const cellColor: string = (() => {
    const NO_ENTRY_COLOUR = '#F5F5F5' ///< Neutral/100
    switch (goalData.goalType) {
      case GoalQuantifyType.Numeric: {
        const color = (goalData?.numericTarget && entryData?.numericValue) ? 
          computeBinnedColour(goalData.colour, goalData.numericTarget, entryData?.numericValue) 
          : NO_ENTRY_COLOUR;
        return color;
      }

      case GoalQuantifyType.Boolean: {
        const color = entryData ? computeBinnedColour(goalData.colour, 1, entryData ? 1 : 0)
          : NO_ENTRY_COLOUR;
        return color;
      }
    }
  })();

  const labelText: string = (() => {
    const NO_ENTRY_TEXT = "No entry";
    switch (goalData.goalType) {
      case GoalQuantifyType.Numeric:
        return entryData?.numericValue ? `${entryData?.numericValue} ${goalData.numericUnit}` : NO_ENTRY_TEXT;
      case GoalQuantifyType.Boolean:
        return entryData ? "Completed" : NO_ENTRY_TEXT
    }
  })()

  return (
    // ${`bg-[rgb(#,#,#)]/{opacity}`}
    <HoverPopover 
      triggerElem=
      {
        <div className={cn(cellVariants({ variant, size }))} ref={ref}
          style={{
            backgroundColor: cellColor,
          }}
          onClick={() => {
            console.log(date);
          }}
        />
      }
      // TODOs:
      // - Fix bug where hover popup content is underneath header icon for e.g. Drink water
      // - Test on small screen e.g. phone (width sufficient)
      // - Add fade in/ out animation to make display less jarring
      contentElem={
        <div className={'flex flex-col justify-start bg-white text-black p-3 rounded-md shadow-xl border-1 border-solid border-neutral-100 max-w-[262px]'}>
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
  goalData: HeatmapGoalData,
  entriesData: Array<GoalEntryResponse>,
  year: number,
}

const Heatmap: React.FC<HeatmapProps> = ({ goalData, entriesData, year }) => {

  const selectedYear = year;
  const daysInYear = getDaysInYear(selectedYear);
  const displayState: HeatmapDisplayState = HeatmapDisplayState.NO_LABELS;
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

    const entryDataForCell = entriesData.find((entry) => {
      const entryDate = new Date(entry.entryDate);
      const entryDateWithoutTime = new Date(entryDate.getFullYear(), entryDate.getMonth(), entryDate.getDate());
      const cellDateWithoutTime = new Date(cellDate.getFullYear(), cellDate.getMonth(), cellDate.getDate());
      return entryDateWithoutTime.getTime() === cellDateWithoutTime.getTime()
    });
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

    const monthsOfYear = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const monthsOfYearShort = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

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
  const weekdayLabels = [...Array(7)].map((_, i) => {
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const daysOfWeekShort = ['Mon', 'Tues', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun'];
    const weekdayString = daysOfWeekShort[i];
    if (['Mon', 'Wed', 'Fri'].includes(weekdayString)) {
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
