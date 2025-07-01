import { Button } from "@/components/ui/button";
import { ArrowLeft, CalendarDays, Pencil, Plus, Settings } from "lucide-react";
import Heatmap from "./components/Heatmap";
import { GoalCard, type GoalCardProps, GoalCardType } from "./components/GoalCard";
import { useState } from "react";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import GoalIconText from "./components/GoalIconText";
import MonthAreaChart, { MonthEnum } from "./components/MonthAreaChart";

interface GoalStats {
  dailyAverage: number,
  daysTracked: number,
  currentStreak: number,
  longestStreak: number,
}

export const GoalDetailsPage = () => {
  const initialData = {
    title: "Drink water",
    description: "Drink at least 6 cups per day",
    baseColour: "#60A5FA", ///< TODOs: Blue/400
    iconName: "glass-water" as IconName,
    goalThreshold: 6,
    units: "cups",
  }
  const [data, setData] = useState(initialData)

  const initialStats: GoalStats = {
    dailyAverage: 5,
    daysTracked: 312,
    currentStreak: 5,
    longestStreak: 5,
  }
  const [stats, setStats] = useState(initialStats);

  const dummyInputChartData: Record<MonthEnum, number> = {
    [MonthEnum.January]: 10,
    [MonthEnum.February]: 20,
    [MonthEnum.March]: 6,
    [MonthEnum.April]: 4,
    [MonthEnum.May]: 2,
    [MonthEnum.June]: 10,
    [MonthEnum.July]: 20,
    [MonthEnum.August]: 10,
    [MonthEnum.September]: 35,
    [MonthEnum.October]: 10,
    [MonthEnum.November]: 6,
    [MonthEnum.December]: 20,
  }

  type GoalStatsKeys = keyof GoalStats;
  interface GoalStatsDisplay {
    title: string,
    units: string,
    icon: IconName,
  }

  const GOAL_STATS_DISPLAYS: Record<GoalStatsKeys, GoalStatsDisplay> = {
    dailyAverage: { title: "Daily Average", units: data.units, icon: "arrow-up-narrow-wide" },
    daysTracked: { title: "Days Tracked", units: "days", icon: "timer" },
    currentStreak: { title: "Current Streak", units: "days", icon: "flame" },
    longestStreak: { title: "Longest Streak", units: "days", icon: "flame-kindling" },
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Topbar container */}
      <div className="topbar-container flex flex-row items-center">
        <div className="buttons-container">
          <Button variant="secondary" size="icon">
            <ArrowLeft className="size-4"/>
          </Button>
        </div>
        <h1 className="text-base font-extrabold">Goal Details</h1>
      </div>
      {/* Goal description container */}
      <div className="header-container flex flex-row justify-between bg-white rounded-xl p-2.5 shadow-sm">
        <GoalIconText title={data.title} description={data.description} baseColour={data.baseColour} iconName={data.iconName} />
        <div className="buttons-container flex flex-row gap-1">
          <Button variant="secondary" size="icon">
            <Pencil className="size-4"/>
          </Button>
        </div>
      </div>
      {/* Heatmap container */}
      <GoalCard 
        title={data.title}
        description={data.description}
        baseColour={data.baseColour}
        goalThreshold={data.goalThreshold}
        iconName={data.iconName}
        cardType={GoalCardType.ControlOnly}
      />
      {/* Gridded summary statistics */}
      <div className="grid grid-cols-2 grid-rows-2 gap-3">
        {
          Object.entries(stats).map(([key, value]) => {
            const display = GOAL_STATS_DISPLAYS[key as GoalStatsKeys];
            return <>
              <div className="bg-white rounded-xl p-2.5 shadow-sm">
                <div className="flex flex-row gap-3">
                  <h3 className="w-full text-base font-semibold">{display.title}</h3>
                  <div className="icon-container w-9 h-9 flex items-center justify-center rounded-md" style={{
                    backgroundColor:
                    // TODOs: fix bug where icon container width shorter than w-9
                    // TODOs: light/ dark mode differing opacities. :dark selector?
                      `${data.baseColour}1A`, ///< 66 - 40% for dark mode, 1A - 10% for light mode
                    color: data.baseColour,
                    strokeOpacity: 0.8, ///< 1.0 for dark mode, 0.8 for light mode
                  }}>
                    <DynamicIcon name={display.icon} />
                  </div>
                </div>
                <span className="text-4xl font-semibold">{value}</span> <span className="text-xl font-medium">{display.units}</span>
              </div>
            </>
          })
        }
      </div>
      {/* Line graph */}
      <MonthAreaChart baseColour={data.baseColour} inputChartData={dummyInputChartData} />
    </div>
  );
};
