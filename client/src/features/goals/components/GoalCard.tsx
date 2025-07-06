import  { Heatmap, SkeletonHeatmap, type HeatmapGoalData } from "./Heatmap";
import { type IconName } from 'lucide-react/dynamic';
import { GoalIconText, SkeletonGoalIconText } from "./GoalIconText";
import IconButton from "@/components/custom/IconButton";
import { useNavigate } from "@tanstack/react-router";
import { YearDropdown } from "./YearDropdown";
import { useGoalEntries } from "../GoalApi";
import type { GoalQuantifyType, SearchParamsGoalEntryDto } from "@habit-tracker/shared";

export type GoalCardGoalData = HeatmapGoalData;

/**
 * Goal card base:
 * Displays card with content slot filled, and heatmap
 * @returns 
 */
interface GoalCardBaseProps {
  goalData: GoalCardGoalData,
  selectedYear: number,
}

const GoalCardBase: React.FC<GoalCardBaseProps & { contentSlot: React.ReactNode }> = ({ contentSlot, goalData, selectedYear }) => {
  const searchParams: SearchParamsGoalEntryDto = {
    goalId: goalData.id,
    year: selectedYear,
  }
  const { data: entriesData, isLoading, error } = useGoalEntries(searchParams);
  
  return (
    // TODOs: pull styles "bg-white rounded-xl p-2.5 shadow-sm" into it's own component. "CardWrapper?" Use shadcn "Card" component since styling same/ similar?
    <div className="goal-card bg-white rounded-xl p-2.5 shadow-sm flex flex-col gap-3">
      {contentSlot}
      {isLoading && <SkeletonHeatmap />}
      {entriesData && <Heatmap entriesData={entriesData} goalData={goalData} year={selectedYear}/>}
    </div>
  )
}


/**
 * Goal Card Descriptive-type: 
 * With description, edit, log today
 */
interface GoalCardDescriptiveProps extends GoalCardBaseProps {
  title: string,
  description: string,
  iconName: IconName,
}

const GoalCardDescriptive: React.FC<GoalCardDescriptiveProps> = ({ title, description, iconName, goalData, selectedYear }) => {

  const navigate = useNavigate()

  const goalId = goalData.id;

  const descriptionTypeContent = (() => {
    return <>
      <div className="header-container flex flex-row justify-between">
        {/* Icon and Text */}
        <GoalIconText title={title} description={description} baseColour={goalData.colour} iconName={iconName} />
        {/* Buttons */}
        <div className="buttons-container flex flex-row gap-1">
          <IconButton iconName="pencil" onClickCallback={() => {
            if (goalId) {
              navigate({ to: '/goals/$goalId/edit', params: { goalId: goalId.toString() } })
            } else {
              console.log("Undefined goal ID")
            }
          }}/>
          <IconButton iconName="square-plus" onClickCallback={() => {
            interface Entry {
              id: number,
              date: Date,
              notes?: string,
              progress?: number,
            }

            const existingEntry: Entry | undefined = {
              id: 1,
              date: new Date(),
              notes: "Test notes existing entry",
              progress: 10,
            }

            // Check for an existing entry for today.
            // If there isn't one for today, navigate to create entry,
            // otherwise navigate to edit entry
            if (existingEntry) {
              navigate({
                to: '/entrys/$entryId/edit', 
                params: { entryId: existingEntry.id.toString() },
                state: { date: existingEntry.date.toISOString(),
                  goal: { id: goalId, units: "kms TODOss" }
                 }
              })
            } else {
              const todayDate = new Date();
              navigate({
                to: '/goals/$goalId/entrys/create', 
                params: { goalId: goalId.toString() },
                state: {
                  date: todayDate.toISOString(),
                }
              })
            }
          }}/>
          <IconButton iconName="square-chevron-right" onClickCallback={() => {
            navigate(
              {
                to: '/goals/$goalId', 
                params: { goalId: goalId.toString() },
              }
            )
          }}/>
        </div>
      </div>
    </>
  })();
  
  return (
    <GoalCardBase
      contentSlot={descriptionTypeContent}
      goalData={goalData}
      selectedYear={selectedYear}
    />
  )
}


/**
 * Goal Card Controlled-type: 
 * With year select, add entry, log today
 */
interface GoalCardControlledProps extends GoalCardBaseProps {
  selectedYear: number,
  onCalendarSelect: (year: number) => void,
}

const GoalCardControlled: React.FC<GoalCardControlledProps> = ({ goalData, selectedYear, onCalendarSelect }) => {
  const controlOnlyTypeContent = ((() => {
    return <>
      <div className="header-container flex flex-row justify-between">
        {/* Year and Calendar button */}
        <YearDropdown selectedYear={selectedYear} onSelect={onCalendarSelect} />
        {/* Buttons */}
        <div className="buttons-container flex flex-row gap-1">
          <IconButton iconName="calendar-plus" onClickCallback={() => {
            console.log("Clicked on goal details card > calendar select for choosing which day to modify")
          }}/>
          <IconButton iconName="square-plus" onClickCallback={() => {
            console.log("Clicked on goal details card > log today")
          }}/>
        </div>
      </div>
    </>
  }))();
  
  return (
    <GoalCardBase
      contentSlot={controlOnlyTypeContent}
      goalData={goalData}
      selectedYear={selectedYear}
    />
  )
}

const GoalCardSkeleton: React.FC = () => {  
  return (
    <div className="w-full bg-white rounded-md">
      <SkeletonGoalIconText />
    </div>
  )
}



export { GoalCardDescriptive, GoalCardControlled };