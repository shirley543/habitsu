import { useState, type Dispatch } from 'react'
import { DynamicIcon } from 'lucide-react/dynamic'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { GoalQuantifyType } from '@habit-tracker/validation-schemas'
import {
  useGoal,
  useGoalMonthlyAvgs,
  useGoalMonthlyCounts,
  useGoalStatistics,
} from '../../apis/GoalApi'
import { GoalCardControlled } from './components/GoalCard'
import { GoalIconText } from './components/GoalIconText'
import MonthAreaChart from './components/MonthAreaChart'
import type { IconName } from 'lucide-react/dynamic'
import type { GoalStatisticsReponse } from '@habit-tracker/validation-schemas'
import IconButton from '@/components/custom/IconButton'
import { TopBarBack } from '@/components/custom/TopBar'
import { ErrorBodyComponent } from '@/components/custom/ErrorComponents'
import { useCurrentDate } from '@/hooks/useCurrentDate'
import { Skeleton } from '@/components/ui/skeleton'


/**
 * Private components
 */


/**
 * Goal Panel:
 * Contains goal description/ info card + heatmap card
 */
interface GoalPanelProps {
  goalId: string,
  selectedYear: number,
  setSelectedYear: Dispatch<number>
}

const GoalPanel: React.FC<GoalPanelProps> = ({
  goalId,
  selectedYear,
  setSelectedYear,
}) => {
  const navigate = useNavigate()
  const {
    data: goalData,
    isLoading: goalIsLoading,
    error: goalError,
  } = useGoal(goalId);

  return <>
    {/* Goal data skeleton */}
    {goalIsLoading && <>
      {/* Goal description */}
      <Skeleton className="h-[60px] w-full" />
      {/* Heatmap container */}
      <Skeleton className="h-[240px] w-full" />
    </>}
    {/* Goal data error */}
    {goalError && (
      <ErrorBodyComponent
        error={goalError}
        onRefreshClick={() => {
          console.log('Have refresh do something')
        }}
        onBackClick={() => {
          navigate({ to: '/goals' })
        }}
      />
    )}
    {/* Goal data content */}
    {goalData && <>
      {/* Goal description */}
      <div className="header-container flex flex-row justify-between items-center bg-white rounded-xl p-2.5 shadow-sm">
        <GoalIconText
          title={goalData.title}
          description={goalData.description}
          baseColour={goalData.colour}
          iconName={goalData.icon as IconName}
        />
        <div className="buttons-container flex flex-row gap-1">
          <IconButton
            iconName="pencil"
            tooltip="Edit Goal"
            onClickCallback={() => {
              navigate({
                to: '/goals/$goalId/edit',
                params: { goalId: goalData.id.toString() },
              })
            }}
          />
        </div>
      </div>

      {/* Heatmap container */}
      <GoalCardControlled
        goalData={goalData}
        selectedYear={selectedYear}
        onCalendarSelect={(year) => {
          console.log('Goal details page > calendar selection made', year)
          setSelectedYear(year)
        }}
        viewOnly={false}
      />
    </>
    }
  </>
}

/**
 * Goal Stats:
 * Contains stat cards for e.g. daily average, days tracked, etc
 */
interface GoalStatsProps {
  goalId: string,
  selectedYear: number,
}

const GoalStats: React.FC<GoalStatsProps> = ({
  goalId,
  selectedYear,
}) => {
  const navigate = useNavigate()
  const {
    data: goalData,
    isLoading: goalIsLoading
  } = useGoal(goalId)

  const {
    data: statsData,
    isLoading: statsIsLoading,
    error: statsError,
  } = useGoalStatistics({ goalId: parseInt(goalId), year: selectedYear })

  type GoalStatsKeys = keyof GoalStatisticsReponse
  interface GoalStatsDisplay {
    title: string
    units: string
    icon: IconName
    labelOverride?: string
  }

  const GOAL_STATS_DISPLAYS: Record<GoalStatsKeys, GoalStatsDisplay> = {
    yearAvg: {
      title: 'Daily Average',
      units:
        goalData?.goalType === GoalQuantifyType.Numeric
          ? goalData.numericUnit
          : '',
      icon: 'arrow-up-narrow-wide',
      labelOverride:
        goalData?.goalType === GoalQuantifyType.Boolean ? 'N/A' : undefined,
    },
    yearCount: { title: 'Days Tracked', units: 'days', icon: 'timer' },
    currentStreakLen: { title: 'Current Streak', units: 'days', icon: 'flame' },
    maxStreakLen: {
      title: 'Longest Streak',
      units: 'days',
      icon: 'flame-kindling',
    },
  }

  const roundIfDecimal = (num: number) => {
    if (num % 1 !== 0) {
      return Math.round(num)
    } else {
      return num
    }
  }

  return <>
    {/* Gridded summary statistics */}
    <div className="grid grid-cols-2 grid-rows-2 gap-3">
      {/* Stats loading */}
      {(goalIsLoading || statsIsLoading) && <>
        {Object.entries(GOAL_STATS_DISPLAYS).map(() => {
          return <Skeleton className="h-[100px] w-full" />
        })}
      </>}
      {/* Stats error */}
      {statsError && (
        <ErrorBodyComponent
          error={statsError}
          onRefreshClick={() => {
            console.log('Have refresh do something')
          }}
          onBackClick={() => {
            navigate({ to: '/goals' })
          }}
        />
      )}
      {/* Stats content */}
      {(goalData && statsData) && <>
        {Object.entries(statsData).map(([key, value]) => {
          const display = GOAL_STATS_DISPLAYS[key as GoalStatsKeys]
          return (
            <div
              key={`statsCard_${key}`}
              className="bg-white rounded-xl p-2.5 shadow-sm"
            >
              <div className="flex flex-row gap-3">
                <h3 className="w-full text-base font-semibold">
                  {display.title}
                </h3>
                <div
                  className="icon-container w-9 h-9 flex items-center justify-center rounded-md"
                  style={{
                    backgroundColor:
                      // TODOs #18: light/ dark mode differing opacities. :dark selector?
                      `#${goalData.colour}1A`, // /< 66 - 40% for dark mode, 1A - 10% for light mode
                    color: `#${goalData.colour}`,
                    strokeOpacity: 0.8, // /< 1.0 for dark mode, 0.8 for light mode
                  }}
                >
                  <DynamicIcon name={display.icon} />
                </div>
              </div>
              {display.labelOverride ? (
                <span className="text-3xl font-semibold">
                  {display.labelOverride}
                </span>
              ) : (
                <>
                  <span className="text-4xl font-semibold">
                    {roundIfDecimal(value || 0)}
                  </span>{' '}
                  <span className="text-xl font-medium">
                    {display.units}
                  </span>
                </>
              )}
            </div>
          )
        })}
      </>}
    </div>
  </>
}

/**
 * Goal Monthly Averages Chart:
 * Displays line chart with x-axis being month, y-axis being goal average value for that month
 */
interface GoalMonthlyAveragesChartProps {
  goalId: string,
  selectedYear: number,
}

const GoalMonthlyAveragesChart: React.FC<GoalMonthlyAveragesChartProps> = ({
  goalId,
  selectedYear,
}) => {
  const navigate = useNavigate()
  const {
    data: goalData,
    isLoading: goalIsLoading,
  } = useGoal(goalId)

  const {
    data: monthlyAvgsData,
    isLoading: monthlyAvgsIsLoading,
    error: monthlyAvgsError,
  } = useGoalMonthlyAvgs(
    { goalId: parseInt(goalId), year: selectedYear },
    goalData?.goalType === GoalQuantifyType.Numeric,
  )
  
  return <>
    {/* Line graph: monthly averages */}
    {/* Averages loading */}
    {(goalIsLoading || monthlyAvgsIsLoading) && <Skeleton className="h-[300px] w-full" />}
    {/* Averages error */}
    {monthlyAvgsError && (
      <ErrorBodyComponent
        error={monthlyAvgsError}
        onRefreshClick={() => {
          console.log('Have refresh do something')
        }}
        onBackClick={() => {
          navigate({ to: '/goals' })
        }}
      />
    )}
    {/* Averages data */}
    {(goalData && monthlyAvgsData) && (
      <MonthAreaChart
        baseColour={goalData.colour}
        valueLabel="Average"
        inputChartData={monthlyAvgsData.map((item) => {
          return {
            year: item.year,
            month: item.month,
            value: item.average,
          }
        })}
      />
    )}
  </>
}

/**
 * Goal Monthly Counts Chart:
 * Displays line chart with x-axis being month, y-axis being goal count value for that month
 */
interface GoalMonthlyCountsChartProps {
  goalId: string,
  selectedYear: number,
}

const GoalMonthlyCountsChart: React.FC<GoalMonthlyCountsChartProps> = ({
  goalId,
  selectedYear,
}) => {
  const navigate = useNavigate()
  const {
    data: goalData,
    isLoading: goalIsLoading,
  } = useGoal(goalId)

  const {
    data: monthlyCountsData,
    isLoading: monthlyCountsIsLoading,
    error: monthlyCountsError,
  } = useGoalMonthlyCounts(
    { goalId: parseInt(goalId), year: selectedYear },
    goalData?.goalType === GoalQuantifyType.Boolean,
  )
  
  return <>
    {/* Line graph: monthly counts */}
    {/* Counts loading */}
    {(goalIsLoading || monthlyCountsIsLoading) && <Skeleton className="h-[300px] w-full" />}
    {/* Counts error */}
    {monthlyCountsError && (
      <ErrorBodyComponent
        error={monthlyCountsError}
        onRefreshClick={() => {
          console.log('Have refresh do something')
        }}
        onBackClick={() => {
          navigate({ to: '/goals' })
        }}
      />
    )}
    {/* Counts data */}
    {(goalData && monthlyCountsData) && (
      <MonthAreaChart
        baseColour={goalData.colour}
        valueLabel="Completions"
        inputChartData={monthlyCountsData.map((item) => {
          return {
            year: item.year,
            month: item.month,
            value: item.count,
          }
        })}
      />
    )}
  </>
}

/**
 * Public components
 */

export const GoalDetailsPage = () => {
  const navigate = useNavigate()
  const route = getRouteApi('/goals_/$goalId')

  // TODOs #12 Improve error display
  const currentYear = useCurrentDate().getFullYear()
  const { goalId } = route.useParams()
  const [selectedYear, setSelectedYear] = useState<number>(currentYear)
  
  return (
    <div className="flex flex-col gap-3">
      {/* Topbar config */}
      <TopBarBack
        title="Goal Details"
        backCallback={() => {
          navigate({ to: '/goals' })
        }}
      />
      {/* Detail content components */}
      <GoalPanel goalId={goalId} selectedYear={selectedYear} setSelectedYear={setSelectedYear} />
      <GoalStats goalId={goalId} selectedYear={selectedYear} />
      <GoalMonthlyAveragesChart goalId={goalId} selectedYear={selectedYear} />
      <GoalMonthlyCountsChart goalId={goalId} selectedYear={selectedYear} />
    </div>
  )
}
