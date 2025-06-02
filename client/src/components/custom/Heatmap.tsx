import { cn } from '@/lib/utils';
import { Link } from '@tanstack/react-router'
import { cva } from 'class-variance-authority';
import HoverPopover from './HoverPopup';

// TODOs
// Heatmap of gridcells. Will comprise of:
// - Year. Determines number of days in a year (leap year or not + )

export default function Heatmap() {
  const selectedYear = 2025;
  const daysInYear = getDaysInYear(selectedYear);
  const baseColour = "#ADADAD";

  // Assume start day of week = Monday.

  // Grid!! 1 col x 7 rows 


  /**
   * 4 bins
   * @param colour 
   * @param value 
   * @param threshold 
   */
  const computeBinnedColour = (value: number, threshold: number) => {
    // Using threshold, compute 4 equal "bins"
    // e.g. if threshold is 20, then bin array would be:
    // [ 5, 10, 15, 20 ]
    
    
    const BIN_COUNT = 4;
    const binIncrement = threshold / BIN_COUNT;

    const OPACITY_COUNT = BIN_COUNT + 1;
    const opacityIncrement = 100 / OPACITY_COUNT;

    const binArray: number[] = [];
    for (let i = 0; i <= BIN_COUNT; i++) {
      binArray.push(binIncrement * i);
    }

    const opacityArray: number[] = [];
    for (let i = 1; i <= OPACITY_COUNT; i++) {
      opacityArray.push(opacityIncrement * i);
    }
    
    // Using value, determine which "bin" it falls under
    // e.g. if value is >= 20, belongs in bin 4
    //      if value is >= 15 and < 20, belongs in bin 3
    // const binIndex = (() => {
    //   for (let i = BIN_COUNT; i > 0; i--) {
    //     if (i === BIN_COUNT) {
    //       const upper = binArray[i];
    //       if (value >= upper) {
    //         return i;
    //       }
    //     } else if (i === 1) {
    //       const lower = binArray[i];
    //       if (value <= lower) {
    //         return i;
    //       }
    //     } else {
    //       const upper = binArray[i];
    //       const lower = binArray[i - 1];
    //       if (value >= lower && value < upper) {
    //         return i;
    //       }
    //     }
    //   }
    // })();

    const binIndex = (() => {
      let limit = 0;
      let idx = 0;
      while (value > limit && idx < BIN_COUNT) {
        limit = binArray[idx];
        idx++;
      };
      return idx;
    })();

    console.log(`value: ${value}, threshold: ${threshold}, binIndex: ${binIndex}, binArray: ${binArray}, opacityArray: ${opacityArray}, opacity: ${opacityArray[binIndex]}`)
  }

  // TODOsss: fix this. Incorrect opacity for lowest bin. Also need to ensure empty values (undefined, null, 0) are greyed out
  computeBinnedColour(1, 20);
  computeBinnedColour(4, 20);
  computeBinnedColour(0, 20);
  computeBinnedColour(5, 20);
  computeBinnedColour(9, 20);
  computeBinnedColour(10, 20);
  computeBinnedColour(20, 20);
  computeBinnedColour(21, 20);
  console.log("______________________________________________")



  const arrr = [...Array(daysInYear)].map((_, i) => {
    const cellDay = (() => {
      const newDate = new Date(selectedYear, 0, 1);
      newDate.setDate(newDate.getDate() + i);
      return newDate;
    })();
    return <Cell key={i} date={cellDay} value={1} baseColour={baseColour} note={`test ${i}`}></Cell>
  })

  return (
    <div className="grid grid-rows-7 grid-flow-col gap-1 w-full overflow-x-auto">
      {arrr}
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
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-amber-200 hover:bg-amber-200/90",
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
  // console.log(date);
  // console.log(value);
  // console.log(note);

  const variant = 'default';
  const size = 'default'

  return (
    // ${`bg-[rgb(#,#,#)]/{opacity}`}
    <HoverPopover 
      triggerElem=
      {
        <div className={cn(cellVariants({ variant, size }))} onClick={() => {
          console.log(date);
        }} />
      }
      contentElem={
        <div className={`flex flex-col gap-2`}
             style={{
              backgroundColor:
                'rgba(5, 5, 5, 1)',
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
