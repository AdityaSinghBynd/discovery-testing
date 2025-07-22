"use client";
import React, { useState, useCallback } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  Tooltip,
  Legend,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { handleChartConfigResponse } from "@/services/ResponseMapping";
import ToolBar from "@/components/ToolBar";
import styles from "@/styles/Charts.module.scss";

export const description = "A multiple line chart";

const ChartLegendContent = ({ payload }: any) => {
  const maxLength = 20;

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "flex-end",
        gap: "16px",
      }}
    >
      {payload.length <= 5 &&
        payload.map((entry: any, index: number) => (
          <div
            key={`item-${index}`}
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "8px",
            }}
          >
            <span
              style={{
                width: "10px",
                height: "10px",
                backgroundColor: entry.color,
                marginRight: "8px",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "150px",
                cursor: "pointer",
              }}
              title={entry.value}
            >
              {entry.value.length > maxLength
                ? `${entry.value.substring(0, maxLength).toLowerCase()}...`
                : entry.value}
            </span>
          </div>
        ))}
    </div>
  );
};

export function Component({
  chartData,
  title,
  description,
  contentToCopy,
}: Record<string, any>) {
  const categories = chartData["chartConfig"]["series"];
  const config = handleChartConfigResponse(chartData["chartConfig"]);

  const [selectedColorVariable, setSelectedColorVariable] = useState<
    string | null
  >(null);

  const handleColorSelect = useCallback(
    (color: { name: string; variable: string }) => {
      setSelectedColorVariable(color.variable);
    },
    [],
  );

  const getLineColor = useCallback(
    (index: number) => {
      if (selectedColorVariable) {
        // Use the selected color variable with the appropriate index
        return `hsl(var(--${selectedColorVariable}-${index + 1}))`;
      }
      // Fallback to the original color if no color is selected
      return categories[index].color;
    },
    [selectedColorVariable, categories],
  );

  return (
    <Card>
      <CardHeader className={styles.classHeader}>
        <div className={styles.toolbarContainer}>
          {/* <ToolBar
            chunks
            highlightViewer
            contentToCopy={contentToCopy}
            onAddToWorkspace={() => {}}
            isSearch={false}
            askAI
            isChart
            isTextChunk={false}
            isGraphChunk={false}
            categoryCount={categories.length}
            onColorSelect={handleColorSelect}
            onAskAI={() => {}}
            workspaceElement
            onToggleView={() => {}}
            tableTitle={""}
          /> */}
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={config}
          style={{ height: "300px", width: "100%" }}
        >
          <LineChart
            data={chartData["chartData"]}
            margin={{
              left: 12,
              right: 12,
            }}
            width={400}
            height={300}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="xAxisLabel"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <Legend
              content={<ChartLegendContent />}
              verticalAlign="top"
              align="right"
              height={36}
            />
            <Tooltip
              cursor={true}
              content={<ChartTooltipContent hideLabel />}
            />
            {categories.map((category: any, index: number) => (
              <Line
                key={category.key}
                dataKey={category.key}
                type="monotone"
                stroke={getLineColor(index)}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            {/* <div className="flex items-center gap-2 font-medium leading-none">
              Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              Showing total visitors for the last 6 months
            </div> */}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

export default Component;
