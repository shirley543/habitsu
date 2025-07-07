import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { GoalMonthlyAveragesResponse } from "@habit-tracker/shared"

interface MonthAreaChartProps {
  baseColour: string,
  inputChartData: GoalMonthlyAveragesResponse
}

export enum MonthEnum {
  January = "January",
  February = "February",
  March = "March",
  April = "April",
  May = "May",
  June = "June",
  July = "July",
  August = "August",
  September = "September",
  October = "October",
  November = "November",
  December = "December"
};

const MonthAreaChart: React.FC<MonthAreaChartProps> = ({ baseColour, inputChartData }) => {
  const chartData = Object.values(MonthEnum).map((monthEnum, idx) => {
    const foundInputChartData = inputChartData.find((data) => data.month === (idx + 1));
    return { month: monthEnum, average: foundInputChartData?.average || 0 };
  })

  const chartConfig = {
    average: {
      label: "Average",
      color: `#${baseColour}`,
    },
  } satisfies ChartConfig
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Average over Months</CardTitle>
      </CardHeader>
      <CardContent className="h-[20vh] min-h-[200px]">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Area
              dataKey="average"
              type="linear"
              fill="var(--color-average)"
              fillOpacity={0.2}
              stroke="var(--color-average)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export default MonthAreaChart;