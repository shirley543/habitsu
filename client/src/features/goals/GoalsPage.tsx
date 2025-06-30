import { Button } from "@/components/ui/button";
import { CalendarDays, Plus, Settings } from "lucide-react";
import Heatmap from "./components/Heatmap";
import { GoalCard, type GoalCardProps } from "./components/GoalCard";


// TODOs: Add endpoint for goals being grabbed (including goal entries)
const DUMMY_GOALS_DATA: GoalCardProps[] = [
  {
    title: "Drink water",
    description: "Drink at least 6 cups per day",
    baseColour: "#60A5FA", ///< TODOs: Blue/400
    iconName: "glass-water",
    goalThreshold: 6,
  },
  {
    title: "Play piano",
    description: "Play for 15 minutes per day",
    baseColour: "#F472B6", ///< TODOs: Pink/400
    iconName: "piano",
    goalThreshold: 15,
  },
  {
    title: "Reading",
    description: "Read 10 pages per day",
    baseColour: "#FBBF24", ///< TODOs: Amber/400
    iconName: "book",
    goalThreshold: 10,
  },

]

export const GoalsPage = () => {
  return (
    <div className="bg-neutral-100 px-3 py-3">
      {/* Topbar container */}
      <div className="topbar-container flex flex-row justify-between items-center">
        <h1 className="text-base font-extrabold">Goals List</h1>
        <div className="buttons-container">
          <Button variant="secondary" size="icon">
            <CalendarDays className="size-4"/>
          </Button>
          <Button variant="secondary" size="icon">
            <Settings className="size-4"/>
          </Button>
          <Button variant="secondary" size="icon">
            <Plus className="size-4"/>
          </Button>
        </div>
      </div>
      {/* Heatmaps container */}
      <div className="flex flex-col gap-3">
        {DUMMY_GOALS_DATA.map((data) => {
          return <GoalCard 
            title={data.title}
            description={data.description}
            baseColour={data.baseColour}
            goalThreshold={data.goalThreshold}
            iconName={data.iconName}
          />
        })}
      </div>
    </div>
  );
};
