import { GoalCardControlled } from "./components/GoalCard";
import { useState } from "react";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import { GoalIconText } from "./components/GoalIconText";
import MonthAreaChart, { MonthEnum } from "./components/MonthAreaChart";
import IconButton from "@/components/custom/IconButton";
import { TopBarBack } from "@/components/custom/TopBar";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { useGoal } from "./GoalApi";
import { GoalQuantifyType } from "@habit-tracker/shared";

interface GoalStats {
  dailyAverage: number,
  daysTracked: number,
  currentStreak: number,
  longestStreak: number,
}

export const GoalDetailsPage = () => {
  const route = getRouteApi('/goals_/$goalId')
  const { goalId } = route.useParams();

  const navigate = useNavigate()

  const { data, isLoading, error } = useGoal(parseInt(goalId));

  console.log("details data", data, "errors", error)
  // console.log("errors", error)

  const [selectedYear, setSelectedYear] = useState<number>(2025);

  const DUMMY_DATA = {
    id: 1,
    title: "Drink water",
    description: "Drink at least 6 cups per day",
    baseColour: "#60A5FA", ///< TODOs: Blue/400
    iconName: "glass-water" as IconName,
    goalThreshold: 6,
    units: "cups",
  }
  // const [data, setData] = useState(DUMMY_DATA)

  const DUMMY_STATS: GoalStats = {
    dailyAverage: 5,
    daysTracked: 312,
    currentStreak: 5,
    longestStreak: 5,
  }
  const [stats, setStats] = useState(DUMMY_STATS);

  const DUMMY_CHART_DATA: Record<MonthEnum, number> = {
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
    dailyAverage: { title: "Daily Average", units: data?.goalType === GoalQuantifyType.Numeric ? data.numericUnit : "", icon: "arrow-up-narrow-wide" },
    daysTracked: { title: "Days Tracked", units: "days", icon: "timer" },
    currentStreak: { title: "Current Streak", units: "days", icon: "flame" },
    longestStreak: { title: "Longest Streak", units: "days", icon: "flame-kindling" },
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Topbar config */}
      <TopBarBack title="Goal Details" backCallback={() => { 
        navigate({ to: '/goals' })
      }}/>
      {(error !== null) && <div>Errorr...</div>}
      {(data && error === null) && <>
      {/* Goal description container */}
      <div className="header-container flex flex-row justify-between bg-white rounded-xl p-2.5 shadow-sm">
        <GoalIconText title={data.title} description={data.description} baseColour={data.colour} iconName={data.icon as IconName} />
        <div className="buttons-container flex flex-row gap-1">
          <IconButton iconName="pencil" onClickCallback={() => {
            navigate({ to: '/goals/$goalId/edit', params: { goalId: data.id.toString() } })
          }}/>
        </div>
      </div>
      {/* Heatmap container */}
      <GoalCardControlled 
        goalData={data}
        selectedYear={selectedYear}
        onCalendarSelect={(year) => { 
          console.log("Goal details page > calendar selection made", year) 
          setSelectedYear(year)
        }}
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
                      `#${data.colour}1A`, ///< 66 - 40% for dark mode, 1A - 10% for light mode
                    color: `#${data.colour}`,
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
      <MonthAreaChart baseColour={data.colour} inputChartData={DUMMY_CHART_DATA} />
      </>
      }

    </div>
  );
};
