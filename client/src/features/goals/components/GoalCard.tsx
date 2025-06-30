import { Button } from "@/components/ui/button";
import Heatmap from "./Heatmap";
import { DynamicIcon, type IconName } from 'lucide-react/dynamic';
import { CalendarDays, CalendarPlus, Pencil, SquarePlus } from "lucide-react";
import GoalIconText from "./GoalIconText";

enum GoalCardType {
  Description = 'description',
  ControlOnly = 'control-only'
}

/**
 * Goal Card types: 
 * - Description type: with description, edit, log today, vs.
 * - Control-only type: with year select, add entry, log today
 */

interface GoalCardProps {
  title: string,
  description: string,
  baseColour: string,
  iconName: IconName,
  goalThreshold: number,
  cardType: GoalCardType
}

/**
 * Goal card: displays goal header (with icon, title, description + edit and add today's entry buttons)
 * @returns 
 */
const GoalCard: React.FC<GoalCardProps> = ({ title, description, baseColour, iconName, goalThreshold, cardType=GoalCardType.Description }) => {
  const descriptionTypeContent = (() => {
    return <>
      <div className="header-container flex flex-row justify-between">
        {/* Icon and Text */}
        <GoalIconText title={title} description={description} baseColour={baseColour} iconName={iconName} />
        {/* Buttons */}
        <div className="buttons-container flex flex-row gap-1">
          <Button variant="secondary" size="icon">
            <Pencil className="size-4"/>
          </Button>
          <Button variant="secondary" size="icon">
            <SquarePlus className="size-4"/>
          </Button>
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
          <Button variant="secondary" size="icon">
            <CalendarDays className="size-4"/>
          </Button>
        </div>
        {/* Buttons */}
        <div className="buttons-container flex flex-row gap-1">
          <Button variant="secondary" size="icon">
            <CalendarPlus className="size-4"/>
          </Button>
          <Button variant="secondary" size="icon">
            <SquarePlus className="size-4"/>
          </Button>
        </div>
      </div>
    </>
  }))();

  return (
    <div className="goal-card bg-white rounded-xl p-2.5 flex flex-col gap-3 shadow-sm">
      {/* {descriptionTypeContent} */}
      {cardType === GoalCardType.ControlOnly ? controlOnlyTypeContent : descriptionTypeContent}
      <Heatmap baseColour={baseColour} threshold={goalThreshold}/>
    </div>
  )
}


export { GoalCard, type GoalCardProps };