import { cn } from '@/lib/utils';
import { Link } from '@tanstack/react-router'
import { cva } from 'class-variance-authority';

// TODOs
// Heatmap of gridcells. Will comprise of:
// - Year. Determines number of days in a year (leap year or not + )

export default function Heatmap() {
  const selectedYear = 2025;
  const daysInYear = getDaysInYear(selectedYear);

  // Assume start day of week = Monday.

  // Grid!! 1 col x 7 rows 

  const arrr = [...Array(daysInYear)].map((_, i) => {
    const cellDay = (() => {
      const newDate = new Date(selectedYear, 0, 1);
      newDate.setDate(newDate.getDate() + i);
      return newDate;
    })();
    return <Cell key={i} date={cellDay} value={1} note={"test"}></Cell>
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
  threshold?: number,
  note?: string,
}

const cellVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
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
  threshold,
  note
}: CellProps) {
  // console.log(date);
  // console.log(value);
  // console.log(note);

  return (
    // <div className="w-[20px] h-[20px] bg-amber-200 rounded-sm" onClick={() => {
    //   console.log(date);
    // }}>
    // </div>
    <div className={cn(cellVariants({ variant, size, className }))} onClick={() => {
      console.log(date);
    }}>
    </div>


  )
}
