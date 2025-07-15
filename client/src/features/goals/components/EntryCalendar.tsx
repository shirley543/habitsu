import * as React from "react"

import { Calendar } from "@/components/ui/calendar"
import { CalendarDay, DayButton, type CustomComponents, type DayButtonProps, type Modifiers } from "react-day-picker"
import { cn } from "@/lib/utils";
import { useGoalEntries, useGoal } from "../GoalApi";
import { GoalQuantifyType, type SearchParamsGoalEntryDto } from "@habit-tracker/shared";

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


interface EntryCalendarProps {
  searchParams: SearchParamsGoalEntryDto,
}

const EntryCalendar: React.FC<EntryCalendarProps> = ({ searchParams }) => {

// export default function EntryCalendar(searchParams: SearchParamsGoalEntryDto) {
  const [date, setDate] = React.useState<Date | undefined>(
    new Date(2025, 6, 12)
  )

  const { data: goalData } = useGoal((11).toString());
  const { data: entriesData, isLoading, error } = useGoalEntries(searchParams);

  console.log("goal data", goalData)
  console.log("entries data", entriesData);

  const bookedDates = Array.from(
    { length: 12 },
    (_, i) => new Date(2025, 5, 15 + i)
  )

  let lowProgressDates: Date[] = [];
  let medProgressDates: Date[] = [];
  let highProgressDates: Date[] = [];
  let fullProgressDates: Date[] = [];
  switch (goalData?.goalType) {
    case GoalQuantifyType.Numeric:
      {
        lowProgressDates = entriesData?.filter((entry) => entry.numericValue && entry.numericValue < 10).map((entry) => new Date(entry.entryDate)) || []
        medProgressDates = entriesData?.filter((entry) => entry.numericValue && entry.numericValue < 20 && entry.numericValue >= 10).map((entry) => new Date(entry.entryDate)) || []
        highProgressDates = entriesData?.filter((entry) => entry.numericValue && entry.numericValue < 30 && entry.numericValue >= 20).map((entry) => new Date(entry.entryDate)) || []
        fullProgressDates = entriesData?.filter((entry) => entry.numericValue && entry.numericValue >= 30 && entry.numericValue >= 5).map((entry) => new Date(entry.entryDate)) || []
      }
      break;
    case GoalQuantifyType.Boolean:
      {
        fullProgressDates = entriesData?.map((entry) => new Date(entry.entryDate)) || []
      }
      break;
  }

  // const lowProgressDates = entriesData?.filter((entry) => entry.numericValue >);
  // const medProgressDates = 

  const customComponents: Partial<CustomComponents> = {
    DayButton: DottedDayButton
  }

  return (
    <Calendar
      mode="single"
      defaultMonth={date}
      selected={date}
      onSelect={(date) => {
        setDate(date);
        console.log("Selected date", date)
      }}
      // disabled={bookedDates}
      modifiers={{
        // booked: bookedDates,
        lowProgress: lowProgressDates,
        medProgress: medProgressDates,
        highProgress: highProgressDates,
        fullProgress: fullProgressDates,
      }}
      modifiersClassNames={{
        // booked: "[&>button]:line-through bg-[#ADADAD] rounded-md opacity-100",
        // lowProgress: "bg-[#FF0000]/10 rounded-md [&>button]:font-medium",
        // medProgress: "bg-[#FF0000]/15 rounded-md [&>button]:font-medium",
        // highProgress: "bg-[#FF0000]/20 rounded-md [&>button]:font-medium",
        // fullProgress: "bg-[#FF0000]/50 rounded-md [&>button]:font-medium",
        lowProgress: "border-2 border-[#FF0000]/10 rounded-lg [&>button]:font-medium",
        medProgress: "border-2 border-[#FF0000]/15 rounded rounded-lg [&>button]:font-medium",
        highProgress: "border-2 border-[#FF0000]/20 rounded rounded-lg [&>button]:font-medium",
        fullProgress: "border-2 border-[#FF0000]/50 rounded rounded-lg [&>button]:font-medium",
      }}
      showOutsideDays={true}
      // components={customComponents}
      className="rounded-lg border shadow-sm"
    />
  )
}

export default EntryCalendar;