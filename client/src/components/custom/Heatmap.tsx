import { Link } from '@tanstack/react-router'

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
  note?: string,
}

function Cell({
  date,
  value,
  note
}: CellProps) {
  // console.log(date);
  // console.log(value);
  // console.log(note);

  return (
    <div className="w-[20px] h-[20px] bg-amber-200 rounded-sm" onClick={() => {
      console.log(date);
    }}>

    </div>
  )
}
