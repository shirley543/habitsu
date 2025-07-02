import { GoalCardDescriptive } from "./components/GoalCard";
import type { IconName } from "lucide-react/dynamic";
import { TopBarConfig } from "@/components/custom/TopBar";
import { useNavigate } from "@tanstack/react-router";

interface DummyGoalData {
  id: number,
  title: string,
  description: string,
  baseColour: string,
  iconName: IconName,
  goalThreshold: number,
};


// TODOs: Add endpoint for goals being grabbed (including goal entries)
const DUMMY_GOALS_DATA: DummyGoalData[] = [
  {
    id: 1,
    title: "Drink water",
    description: "Drink at least 6 cups per day",
    baseColour: "#60A5FA", ///< TODOs: Blue/400
    iconName: "glass-water",
    goalThreshold: 6,
  },
  {
    id: 2,
    title: "Play piano",
    description: "Play for 15 minutes per day",
    baseColour: "#F472B6", ///< TODOs: Pink/400
    iconName: "piano",
    goalThreshold: 15,
  },
  {
    id: 3,
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
  const navigate = useNavigate()

  return (
    <div className="flex flex-col gap-3">
      {/* Topbar config */}
      <TopBarConfig 
        title="Goals List"
        rightConfig={[
          {
            iconName: "calendar-days",
            clickCallback: () => { console.log("calendar clicked TODOs") }
          },
          {
            iconName: "settings",
            clickCallback: () => { 
              navigate({ to: '/settings' })
            }
          },
          {
            iconName: "plus",
            clickCallback: () => {
              navigate({ to: '/goals/create' })
            }
          },
        ]}
      />
      {/* Heatmaps container */}
      <div className="flex flex-col gap-3">
        {DUMMY_GOALS_DATA.map((data) => {
          return <GoalCardDescriptive
            goalId={data.id}
            title={data.title}
            description={data.description}
            iconName={data.iconName}
            baseColour={data.baseColour}
            goalThreshold={data.goalThreshold}
            selectedYear={2025}
          />
        })}
      </div>
    </div>
  );
};
