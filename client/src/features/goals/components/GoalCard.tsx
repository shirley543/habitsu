import { Button } from "@/components/ui/button";
import Heatmap from "./Heatmap";
import { DynamicIcon, type IconName } from 'lucide-react/dynamic';
import { CalendarDays, CalendarPlus, Pencil, SquarePlus } from "lucide-react";
import GoalIconText from "./GoalIconText";
import IconButton from "@/components/custom/IconButton";
import { useNavigate } from "@tanstack/react-router";
import { DropdownMenuCheckboxes } from "@/components/custom/DropdownMenuCheckboxes";

export enum GoalCardType {
  Description = 'description',
  ControlOnly = 'control-only'
}

/**
 * Goal Card types: 
 * - Description type: with description, edit, log today, vs.
 * - Control-only type: with year select, add entry, log today
 */

interface GoalCardProps {
  goalId: number,
  title: string,
  description: string,
  baseColour: string,
  iconName: IconName,
  goalThreshold: number,
  cardType?: GoalCardType
}

/**
 * Goal card: displays goal header (with icon, title, description + edit and add today's entry buttons)
 * @returns 
 */
const GoalCard: React.FC<GoalCardProps> = ({ goalId, title, description, baseColour, iconName, goalThreshold, cardType=GoalCardType.Description }) => {
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

  const controlOnlyTypeContent = ((() => {
    return <>
      <div className="header-container flex flex-row justify-between">
        {/* Year and Calendar button */}
        <div className="year-calendar-container flex flex-row gap-1">
          <h2 className="text-xl font-bold">2025</h2>
          <DropdownMenuCheckboxes></DropdownMenuCheckboxes>
          <IconButton iconName="calendar-days" onClickCallback={() => {
            console.log("Clicked on goal details card > details page year select (menu dropdown)")
          }}/>
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
    // TODOs: pull styles "bg-white rounded-xl p-2.5 shadow-sm" into it's own component. "CardWrapper?"
    <div className="goal-card bg-white rounded-xl p-2.5 shadow-sm flex flex-col gap-3">
      {/* {descriptionTypeContent} */}
      {cardType === GoalCardType.ControlOnly ? controlOnlyTypeContent : descriptionTypeContent}
      <Heatmap baseColour={baseColour} threshold={goalThreshold}/>
    </div>
  )
}


export { GoalCard, type GoalCardProps };