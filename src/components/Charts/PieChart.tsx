"use client";

import { TrendingUp } from "lucide-react";
import { Cell, Pie, PieChart, Tooltip } from "recharts";
import React, { useState, useCallback } from "react";
import ToolBar from "@/components/ToolBar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart";
export const description = "A pie chart with device data";

const chartData = [
  { device: "Desktop", visitors: 800, fill: "#4B6EF3" },
  { device: "Mobile", visitors: 600, fill: "#FFC107" },
];

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
} satisfies ChartConfig;

function Component({
  data,
  title,
  description,
}: {
  data?: typeof chartData;
  title?: string;
  description?: string;
}) {
  // Use the passed data or fall back to the default chartData
  const chartDataToUse = data || chartData;

  // Get the number of categories from the data
  const categories = chartDataToUse.length;

  const [selectedColorVariable, setSelectedColorVariable] = useState<
    string | null
  >(null);

  const handleColorSelect = useCallback(
    (color: { name: string; variable: string }) => {
      setSelectedColorVariable(color.variable);
    },
    [],
  );

  const getSliceColor = useCallback(
    (index: number) => {
      if (selectedColorVariable) {
        // Use the selected color variable with the appropriate index
        return `hsl(var(--${selectedColorVariable}-${index + 1}))`;
      }
      // Fallback to the original color if no color is selected
      return chartDataToUse[index].fill;
    },
    [selectedColorVariable, chartDataToUse],
  );

  const handleToggleView = useCallback(() => {
    // Implement the toggle view functionality here
  }, []);

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-x-4 pb-0">
        <div>
          {/* <ToolBar
            chunks
            highlightViewer
            isSearch={false}
            contentToCopy={""}
            onAddToWorkspace={() => {}}
            onToggleView={handleToggleView}
            askAI
            isChart
            isTextChunk={false}
            isGraphChunk={false}
            categoryCount={categories}
            onColorSelect={handleColorSelect}
            onAskAI={() => {}}
            workspaceElement
            tableTitle={""}
          /> */}
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
          style={{ height: "300px", width: "100%" }}
        >
          <PieChart width={250} height={250}>
            <Tooltip content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={chartDataToUse}
              dataKey="visitors"
              nameKey="device"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {chartDataToUse.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getSliceColor(index)} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export default Component;
