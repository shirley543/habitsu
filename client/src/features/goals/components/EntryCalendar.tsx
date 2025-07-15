import * as React from "react"

import { Calendar } from "@/components/ui/calendar"
import { useGoalEntries, useGoal } from "../GoalApi";
import { GoalQuantifyType, type GoalEntryResponse, type SearchParamsGoalEntryDto } from "@habit-tracker/shared";
import { computeBinAndColorArrays } from "@/lib/colourUtils";
import { navigateToCreateOrEdit } from "./NavigateUtils";
import { getEntryDataForDate } from "../EntryUtils";
import { useNavigate } from "@tanstack/react-router";


interface ModifierConfig {
  name: string,
  dates: Date[],
  colour: string,
}

interface EntryCalendarProps {
  goalId: number,
  searchParams: SearchParamsGoalEntryDto,
}

// TODOs: investigate refactor (searchParams has optional goal ID parameter)
const EntryCalendar: React.FC<EntryCalendarProps> = ({ goalId, searchParams }) => {
  const navigate = useNavigate();

  const [date, setDate] = React.useState<Date | undefined>(
    new Date(2025, 6, 12)
  )

  const { data: goalData } = useGoal(goalId.toString());
  const { data: entriesData, isLoading, error } = useGoalEntries(searchParams);

  let lowProgressDates: Date[] = [];
  let medProgressDates: Date[] = [];
  let highProgressDates: Date[] = [];
  let fullProgressDates: Date[] = [];


  if (goalData) {
    // Compute modifier configs
    let modifierConfigs: ModifierConfig[] = [];
    switch (goalData.goalType) {
      case GoalQuantifyType.Numeric:
        {
          const { binArray, colorArray } = computeBinAndColorArrays(goalData.colour, goalData.numericTarget);
          modifierConfigs = colorArray.map((color, idx) => {
            const filterFn = (entry: GoalEntryResponse) => {
              if (idx === 0) {
                return entry.numericValue && entry.numericValue < binArray[idx]
              } else if (idx === (colorArray.length - 1)) {
                return entry.numericValue && entry.numericValue >= binArray[idx]
              } else {
                return entry.numericValue && entry.numericValue < binArray[idx] && entry.numericValue >= binArray[idx - 1]
              }
            }
            return {
              name: `modifier${idx}`,
              dates: entriesData?.filter(filterFn).map((entry) => new Date(entry.entryDate)) || [],
              colour: color,
            }
          })

          lowProgressDates = entriesData?.filter((entry) => entry.numericValue && entry.numericValue < 10).map((entry) => new Date(entry.entryDate)) || []
          medProgressDates = entriesData?.filter((entry) => entry.numericValue && entry.numericValue < 20 && entry.numericValue >= 10).map((entry) => new Date(entry.entryDate)) || []
          highProgressDates = entriesData?.filter((entry) => entry.numericValue && entry.numericValue < 30 && entry.numericValue >= 20).map((entry) => new Date(entry.entryDate)) || []
          fullProgressDates = entriesData?.filter((entry) => entry.numericValue && entry.numericValue >= 30 && entry.numericValue >= 5).map((entry) => new Date(entry.entryDate)) || []
        }
        break;
      case GoalQuantifyType.Boolean:
        {
          fullProgressDates = entriesData?.map((entry) => new Date(entry.entryDate)) || [];
          modifierConfigs = [{
            name: `modifierFull`,
            dates: entriesData?.map((entry) => new Date(entry.entryDate)) || [],
            colour: goalData.colour,
          }]
        }
        break;
    }

    // Compute reduced objects
    // const modifiers = modifierConfigs.reduce((accumulator, currentValue, index) => {
    //   (accumulator as any)[currentValue.name] = currentValue.dates;
    //   return accumulator;
    // });

    const modifiers = modifierConfigs.reduce((obj, item) => Object.assign(obj, { [item.name]: item.dates }), {})
    console.log("modifiers", modifiers);
  }


  

  const modifiersStyles = {
    lowProgress: {
      borderColor: goalData?.colour,
    }
  }

  return (
    <Calendar
      mode="single"
      defaultMonth={date}
      selected={date}
      onSelect={(date) => {
        setDate(date);

        if (goalData && date) {
          const goalEntryForDate = entriesData ? getEntryDataForDate(entriesData, date) : undefined;
          navigateToCreateOrEdit(goalData.id, goalEntryForDate, date, navigate);
        }
      }}
      modifiers={{
        lowProgress: lowProgressDates,
        medProgress: medProgressDates,
        highProgress: highProgressDates,
        fullProgress: fullProgressDates,
      }}
      modifiersClassNames={{
        lowProgress: "border-2 border-[#FF0000]/10 rounded-lg [&>button]:font-medium",
        medProgress: "border-2 border-[#FF0000]/15 rounded rounded-lg [&>button]:font-medium",
        highProgress: "border-2 border-[#FF0000]/20 rounded rounded-lg [&>button]:font-medium",
        fullProgress: "border-2 border-[#FF0000]/50 rounded rounded-lg [&>button]:font-medium",
      }}
      showOutsideDays={true}
      className="rounded-lg border shadow-sm"
    />
  )
}

export default EntryCalendar;