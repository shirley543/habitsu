import { useState } from 'react'
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

export const GoalDetailsPage = () => {
  const navigate = useNavigate()
  const route = getRouteApi('/goals_/$goalId')

  // TODOs #12 Improve loading display + error display
  const { goalId } = route.useParams()
  const [selectedYear, setSelectedYear] = useState<number>(2025)

  // Un-used variables to be addressed in #12
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const {
    data: goalData,
    isLoading: goalIsLoading,
    error: goalError,
  } = useGoal(goalId)
  const {
    data: statsData,
    isLoading: statsIsLoading,
    error: statsError,
  } = useGoalStatistics({ goalId: parseInt(goalId), year: selectedYear })
  const {
    data: monthlyAvgsData,
    isLoading: monthlyAvgsIsLoading,
    error: monthlyAvgsError,
  } = useGoalMonthlyAvgs(
    { goalId: parseInt(goalId), year: selectedYear },
    goalData?.goalType === GoalQuantifyType.Numeric,
  )
  const {
    data: monthlyCountsData,
    isLoading: monthlyCountsIsLoading,
    error: monthlyCountsError,
  } = useGoalMonthlyCounts(
    { goalId: parseInt(goalId), year: selectedYear },
    goalData?.goalType === GoalQuantifyType.Boolean,
  )
  /* eslint-enable @typescript-eslint/no-unused-vars */

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

  return (
    <div className="flex flex-col gap-3">
      {/* Topbar config */}
      <TopBarBack
        title="Goal Details"
        backCallback={() => {
          navigate({ to: '/goals' })
        }}
      />
      {goalIsLoading && <div>Goal Loading...</div>}
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
      {goalData && (
        <>
          {/* Goal description container */}
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
          />

          {/* Gridded summary statistics */}
          {statsData && (
            <div className="grid grid-cols-2 grid-rows-2 gap-3">
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
            </div>
          )}

          {/* Line graph: monthly averages */}
          {monthlyAvgsData && (
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

          {/* Line graph: monthly counts */}
          {monthlyCountsData && (
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
      )}
    </div>
  )
}
