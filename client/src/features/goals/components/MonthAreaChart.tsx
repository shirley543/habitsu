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
import { capitalizeFirstLetter } from "@/lib/stringManips"
import { monthsOfYear } from "@/lib/dateUtils"

interface MonthAreaChartData {
  year: number,
  month: number,
  value: number,
}

interface MonthAreaChartProps {
  baseColour: string,
  inputChartData: MonthAreaChartData[],
  valueLabel: string,
}

const MonthAreaChart: React.FC<MonthAreaChartProps> = ({ baseColour, inputChartData, valueLabel }) => {
  const chartData = monthsOfYear.map((monthEnum, idx) => {
    const foundInputChartData = inputChartData.find((data) => data.month === (idx + 1));
    return { month: monthEnum, value: foundInputChartData?.value || 0 };
  })

  const chartConfig = {
    value: {
      label: valueLabel,
      color: `#${baseColour}`,
    },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{capitalizeFirstLetter(valueLabel)} over Months</CardTitle>
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
              dataKey="value"
              type="linear"
              fill="var(--color-value)"
              fillOpacity={0.2}
              stroke="var(--color-value)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export default MonthAreaChart;