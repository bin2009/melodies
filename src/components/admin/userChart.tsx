"use client";
import * as React from "react";
import { TrendingUp } from "lucide-react";
import { Label, Pie, PieChart } from "recharts";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface UserGrowthData {
  growth: number;
  totalUser: number;
  totalUserFree: number;
  totalUserPremium: number;
  totalUserThisMonth: number;
  totalUserLastMonth: number;
}
interface UserChartProps {
  data: UserGrowthData;
}

const chartConfig = {
  regular: {
    label: "Regular",
    color: "hsl(var(--chart-1))",
  },
  premium: {
    label: "Premium",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;

function UserChart({ data }: UserChartProps) {
  const chartData = React.useMemo(() => [
    {
      type: "Regular",
      users: data.totalUserFree,
      fill: "var(--color-regular)",
    },
    {
      type: "Premium",
      users: data.totalUserPremium,
      fill: "var(--color-premium)",
    },
  ], [data.totalUserFree, data.totalUserPremium]);

  const totalVisitors = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.users, 0);
  }, [chartData]);

  const userGrowthPercentage =
    ((data.totalUserThisMonth - data.totalUserLastMonth) /
      data.totalUserLastMonth) *
    100;

  const formattedGrowthPercentage = Number(userGrowthPercentage.toFixed(2));
  const growthLabel = userGrowthPercentage >= 0 ? "Increase" : "Decrease";
  const growthColor =
    userGrowthPercentage >= 0
      ? "text-primaryColorPink"
      : "text-primaryColorBlue";

  return (
    <div className="w-full h-full">
      <Card className="flex flex-col bg-secondColorBg border-0 shadow-sm shadow-primaryColorBlue">
        <CardHeader className="items-center pb-0">
          <CardTitle>Distribution of Regular and Premium Users</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[250px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="users"
                nameKey="type"
                innerRadius={60}
                strokeWidth={5}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-3xl font-bold"
                          >
                            {totalVisitors.toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground"
                          >
                            Users
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col gap-2 text-sm">
          <div className="flex items-center gap-2 font-medium leading-none">
           Have
            <span className={growthColor}>
              {data.totalUserThisMonth || 0}
            </span>{" "}
            new users in this month
            <TrendingUp className="h-4 w-4" />
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default UserChart;


