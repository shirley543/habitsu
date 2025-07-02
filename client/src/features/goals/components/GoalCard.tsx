import { Button } from "@/components/ui/button";
import Heatmap from "./Heatmap";
import { DynamicIcon, type IconName } from 'lucide-react/dynamic';
import GoalIconText from "./GoalIconText";
import IconButton from "@/components/custom/IconButton";
import { useNavigate } from "@tanstack/react-router";
import DropdownMenuCheckboxes, { type DropdownMenuCheckboxesItemConfig } from "@/components/custom/DropdownMenuCheckboxes";
import { useGoalDetailYear, useGoalDetailYearDispatch, type YearAction } from "../contexts/GoalDetailYearContext";


/**
 * Goal card base:
 * Displays card with content slot filled, and heatmap
 * @returns 
 */
interface GoalCardBaseProps {
  baseColour: string,
  goalThreshold: number,
  selectedYear: number,
}

const GoalCardBase: React.FC<GoalCardBaseProps & { contentSlot: React.ReactNode }> = ({ contentSlot, baseColour, goalThreshold, selectedYear }) => {
  return (
    // TODOs: pull styles "bg-white rounded-xl p-2.5 shadow-sm" into it's own component. "CardWrapper?" Use shadcn "Card" component since styling same/ similar?
    <div className="goal-card bg-white rounded-xl p-2.5 shadow-sm flex flex-col gap-3">
      {contentSlot}
      <Heatmap baseColour={baseColour} threshold={goalThreshold} year={selectedYear}/>
    </div>
  )
}


/**
 * Goal Card Descriptive-type: 
 * With description, edit, log today
 */
interface GoalCardDescriptiveProps extends GoalCardBaseProps {
  goalId: number,
  title: string,
  description: string,
  iconName: IconName,
}

const GoalCardDescriptive: React.FC<GoalCardDescriptiveProps> = ({ goalId, title, description, iconName, baseColour, goalThreshold, selectedYear }) => {
  const navigate = useNavigate()

  const descriptionTypeContent = (() => {
    return <>
      <div className="header-container flex flex-row justify-between">
        {/* Icon and Text */}
        <GoalIconText title={title} description={description} baseColour={baseColour} iconName={iconName} />
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
      baseColour={baseColour}
      goalThreshold={goalThreshold}
      selectedYear={selectedYear}
    />
  )
}


/**
 * Goal Card Controlled-type: 
 * With year select, add entry, log today
 */
interface GoalCardControlledProps extends GoalCardBaseProps {
}

const GoalCardControlled: React.FC<GoalCardControlledProps> = ({ baseColour, goalThreshold }) => {
  const selectedYear = useGoalDetailYear();
  const selectedYearDispatch = useGoalDetailYearDispatch();

  const yearMenuConfig: DropdownMenuCheckboxesItemConfig<number>[] = [
    { label: "2025", value: 2025 },
    { label: "2024", value: 2024 },
  ]

  // useEffect(() => {
  //   console.log("selectedYear", selectedYear)
  // }, [selectedYear])

  const controlOnlyTypeContent = ((() => {
    return <>
      <div className="header-container flex flex-row justify-between">
        {/* Year and Calendar button */}
        <div className="year-calendar-container flex flex-row gap-1">
          <h2 className="text-xl font-bold">{selectedYear}</h2>
          <DropdownMenuCheckboxes<number>
            initialCheckedValue={selectedYear}
            itemsConfig={yearMenuConfig}
            selectionChangeCallback={(itemValue) => { 
              console.log("dropdown year menu selection changed TODOs", itemValue)
              const changeYearAction: YearAction = { type: 'changed', year: itemValue }
              selectedYearDispatch(changeYearAction);
            }}
          >
            <Button variant="secondary" size="icon">
              <DynamicIcon name="calendar-days" />
            </Button>
          </DropdownMenuCheckboxes>
        </div>
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
      baseColour={baseColour}
      goalThreshold={goalThreshold}
      selectedYear={selectedYear}
    />
  )
}


export { GoalCardDescriptive, GoalCardControlled };