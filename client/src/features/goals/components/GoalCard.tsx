import  { Heatmap, SkeletonHeatmap } from "./Heatmap";
import { type IconName } from 'lucide-react/dynamic';
import { GoalIconText, SkeletonGoalIconText } from "./GoalIconText";
import IconButton from "@/components/custom/IconButton";
import { useNavigate } from "@tanstack/react-router";
import { YearDropdown } from "./YearDropdown";
import { useGoalEntries } from "../GoalApi";
import type { GoalEntryResponse, SearchParamsGoalEntryDto } from "@habit-tracker/shared";
import { navigateToCreateOrEdit } from "./NavigateUtils";
import type { ColourGoalData } from "@/lib/colourUtils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import EntryCalendar from "./EntryCalendar";

export type GoalCardGoalData = ColourGoalData;

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
    <div className="goal-card max-w-full w-fit bg-white rounded-xl p-2.5 shadow-sm flex flex-col gap-3">
      {contentSlot}
      {isLoading && <SkeletonHeatmap />}
      {entriesData && <Heatmap entriesData={entriesData} goalData={goalData} year={selectedYear}/>}
    </div>
  )
}

const findExistingEntryAndTodayDate = (goalEntries: Array<GoalEntryResponse> | undefined) => {
  const todayDate = new Date();
  const todayDateStr = (todayDate).toDateString();
  const existingEntryToday = goalEntries && goalEntries?.find((entry) => {
    const entryDate = new Date(entry.entryDate);
    const entryDateStr = entryDate.toDateString();
    return entryDateStr === todayDateStr
  });
  return { existingEntryToday, todayDate };
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
  const { data: goalEntries } = useGoalEntries({ goalId: goalId, year: selectedYear });
  const { existingEntryToday, todayDate } = findExistingEntryAndTodayDate(goalEntries);

  const descriptionTypeContent = (() => {
    return <>
      <div className="header-container flex flex-row justify-between items-center">
        {/* Icon and Text */}
        <GoalIconText title={title} description={description} baseColour={goalData.colour} iconName={iconName} />
        {/* Buttons */}
        <div className="buttons-container flex flex-row gap-1">
          <IconButton iconName="pencil" tooltip="Edit Goal" onClickCallback={() => {
            if (goalId) {
              navigate({ to: '/goals/$goalId/edit', params: { goalId: goalId.toString() } })
            } else {
              console.log("Undefined goal ID")
            }
          }}/>
          <IconButton iconName="square-plus" tooltip="Log Today" onClickCallback={() => {
            // Log today: check whether today's date has an entry or not
            navigateToCreateOrEdit(goalId, existingEntryToday, todayDate, navigate)
          }}/>
          <IconButton iconName="square-chevron-right" tooltip="Goal Details" onClickCallback={() => {
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
  const navigate = useNavigate()
  const goalId = goalData.id;
  const { data: goalEntries } = useGoalEntries({ goalId: goalId, year: selectedYear });
  const { existingEntryToday, todayDate } = findExistingEntryAndTodayDate(goalEntries);

  const controlOnlyTypeContent = ((() => {
    return <>
      <div className="header-container flex flex-row justify-between items-center">
        {/* Year and Calendar button */}
        <YearDropdown selectedYear={selectedYear} onSelect={onCalendarSelect} />
        {/* Buttons */}
        <div className="buttons-container flex flex-row gap-1">
          <Popover>
            <PopoverTrigger asChild>
              <IconButton iconName="calendar-plus" tooltip="Log Date" />
            </PopoverTrigger>
            <PopoverContent>
              <EntryCalendar goalId={goalId} searchParams={{
                goalId: goalId,
                year: selectedYear,
              }} />
            </PopoverContent>
          </Popover>
          <IconButton iconName="square-plus" tooltip="Log Today" onClickCallback={() => {
            navigateToCreateOrEdit(goalId, existingEntryToday, todayDate, navigate)
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

const SkeletonGoalCard: React.FC = () => {  
  return (
    <div className="w-full goal-card bg-white rounded-xl p-2.5 shadow-sm flex flex-col gap-3">
      <SkeletonGoalIconText />
      <SkeletonHeatmap />
    </div>
  )
}



export { GoalCardDescriptive, GoalCardControlled, SkeletonGoalCard };