import * as React from "react"

import { Calendar } from "@/components/ui/calendar"
import { CalendarDay, DayButton, type CustomComponents, type DayButtonProps, type Modifiers } from "react-day-picker"
import { cn } from "@/lib/utils";

// function DottedDayButton(props: { day: CalendarDay; modifiers: Modifiers; } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
//   return (
//     <DayButton day={props.day} modifiers={props.modifiers} />
//   )
// }


function DottedDayButton(props: DayButtonProps) {
  const { day, modifiers, ...buttonProps } = props;

  // const { setSelected } = React.useContext(SelectedDateContext);

  // TODOsss:
  // - Selected/ clicked date transition to selecting
  // - Year + month select
  // - Pass in background colour and opacity

  return (
    <button 
      {...buttonProps}
      className="w-10 h-10 flex flex-col items-center justify-center rounded-md"
      // onClick={() => setSelected?.(undefined)}
      // onDoubleClick={() => setSelected?.(day.date)}
    >
      <span>{day.date.getDate()}</span>
      <span className="block w-1.5 h-1.5 rounded-full"
        style={{
          backgroundColor: `#ADADAD`,
          opacity: `80%`
        }}
      ></span>
    </button>
  );
}

export default function Calendar14() {
  const [date, setDate] = React.useState<Date | undefined>(
    new Date(2025, 5, 12)
  )
  const entryDates = Array.from(
    { length: 12 },
    (_, i) => new Date(2025, 5, 15 + i)
  )

  const customComponents: Partial<CustomComponents> = {
    DayButton: DottedDayButton
  }

  return (
    <Calendar
      mode="single"
      defaultMonth={date}
      selected={date}
      onSelect={setDate}
      // disabled={bookedDates}
      // modifiers={{
      //   booked: bookedDates,
      // }}
      // modifiersClassNames={{
      //   booked: "[&>button]:line-through opacity-100",
      // }}
      components={customComponents}
      className="rounded-lg border shadow-sm"
    />
  )
}
