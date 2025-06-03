import { cn } from '@/lib/utils';
import { cva } from 'class-variance-authority';
import HoverPopover from './HoverPopup';

import * as d3 from 'd3';

// TODOs
// Heatmap of gridcells. Will comprise of:
// - Year. Determines number of days in a year (leap year or not + )



export default function Heatmap() {
  const selectedYear = 2025;
  const daysInYear = getDaysInYear(selectedYear);
  const baseColour = "#6667AB";
  const threshold = 10

  // Assume start day of week = Monday.

  // Grid!! 1 col x 7 rows 


  // Cells: for displaying progress
  const cells = [...Array(daysInYear)].map((_, i) => {
    const cellDay = (() => {
      const newDate = new Date(selectedYear, 0, 1);
      newDate.setDate(newDate.getDate() + i);
      return newDate;
    })();
    return <Cell key={i} date={cellDay} value={i} baseColour={baseColour} threshold={threshold} note={`test ${i}`}></Cell>
  });

  // Holder cells: for gap/ placeholder to align 
  // first day of year to week day
  const weekStartDay = 0; // 0 for Sunday, 1 for Monday
  const firstDate = new Date(selectedYear, 0, 1);
  const firstDay = firstDate.getDay();
  const holderCells = [...Array(firstDay - weekStartDay)].map(() => {
    return <div></div>
  })

  return (
    <div className="grid grid-rows-7 grid-flow-col gap-1 w-full overflow-x-auto p-6">
      {holderCells}
      {cells}
    </div>
  )
}

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
  value: number | boolean,
  units?: string,
  baseColour: string,
  threshold?: number,
  note?: string,
}

const cellVariants = cva(
  "transition-all disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default:
          "text-pink-500",
          // "bg-amber-200 hover:bg-amber-200/90 text-pink-500",

      },
      size: {
        default: "h-8 w-8 rounded-md",
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

function Cell({
  date,
  value,
  units,
  baseColour,
  threshold,
  note
}: CellProps) {

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
    const baseColorFullOpacity = `${baseColor}FF`;
    const baseColorNoOpacity = `${baseColor}00`;
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

  const variant = 'default';
  const size = 'default'

  const cellColor = (() => {
    if (typeof value === 'number' && threshold) {
      const color = computeBinnedColour(baseColour, threshold, value);
      return color;
    } else if (typeof value === 'boolean') {
      const color = computeBinnedColour(baseColour, 1, value ? 1 : 0);
      return color;
    } else {
      console.log("Unknown value type: cannot compute cell color");
    }
  })();

  return (
    // ${`bg-[rgb(#,#,#)]/{opacity}`}
    <HoverPopover 
      triggerElem=
      {
        <div className={cn(cellVariants({ variant, size }))} 
          style={{
            backgroundColor:
              cellColor,
          }}
          onClick={() => {
            console.log(date);
          }}
        />
      }
      contentElem={
        <div className={`flex flex-col gap-2`}
             style={{
              backgroundColor:
                cellColor,
            }}
        >
          {date.toDateString()}
          {units ? `${value} ${units}` : value}
          {note}
        </div>
      }>
    </HoverPopover>
  )
}
