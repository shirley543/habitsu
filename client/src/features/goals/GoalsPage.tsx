import { GoalCard } from "./components/GoalCard";
import type { IconName } from "lucide-react/dynamic";
import { TopBarConfig } from "@/components/custom/TopBar";

interface DummyGoalData {
  title: string,
  description: string,
  baseColour: string,
  iconName: IconName,
  goalThreshold: number,
};


// TODOs: Add endpoint for goals being grabbed (including goal entries)
const DUMMY_GOALS_DATA: DummyGoalData[] = [
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
  {
    title: "Exercise",
    description: "Exercise for an hour at least once a week",
    baseColour: "#C084FC", ///< TODOs: Lime/400
    iconName: "biceps-flexed",
    goalThreshold: 1,
  },
]

export const GoalsPage = () => {
  return (
    <div className="flex flex-col gap-3">
      {/* Topbar config */}
      <TopBarConfig 
        title="Goals List"
        rightConfig={[
          {
            iconName: "calendar-days",
            clickCallback: () => { console.log("calendar clicked") }
          },
          {
            iconName: "settings",
            clickCallback: () => { console.log("settings clicked") }
          },
          {
            iconName: "plus",
            clickCallback: () => { console.log("create goal clicked") }
          },
        ]}
      />
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
