import { Button } from "@/components/ui/button";
import Heatmap from "./Heatmap";
import { DynamicIcon, type IconName } from 'lucide-react/dynamic';
import { Pencil, SquarePlus } from "lucide-react";

interface GoalCardProps {
  title: string,
  description: string,
  baseColour: string,
  iconName: IconName,
  goalThreshold: number,
}

/**
 * Goal card: displays goal header (with icon, title, description + edit and add today's entry buttons)
 * @returns 
 */
const GoalCard: React.FC<GoalCardProps> = ({ title, description, baseColour, iconName, goalThreshold }) => {
  return (
    <div className="goal-card bg-white rounded-xl p-2.5 flex flex-col gap-3 shadow-sm">
      <div className="header-container flex flex-row justify-between">
        {/* Icon and Text */}
        <div className="icon-text-container flex flex-row gap-2 items-center">
          <div className="icon-container w-9 h-9 rounded-md flex items-center justify-center text-white opacity-70" style={
            {
              backgroundColor: baseColour
            }
          }>
            <DynamicIcon name={iconName} />
          </div>
          <div className="header-container flex flex-col gap-0">
            <h2 className="text-base font-semibold">{title}</h2>
            <h2 className="text-xs font-regular">{description}</h2>
          </div>
        </div>
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
      <Heatmap baseColour={baseColour} threshold={goalThreshold}/>
    </div>
  )
}

export { GoalCard, type GoalCardProps };