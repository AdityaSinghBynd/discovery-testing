"use client";
import React, { useState, useCallback } from "react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { handleChartConfigResponse } from "@/services/ResponseMapping";
import ToolBar from "@/components/ToolBar";
import styles from "@/styles/Charts.module.scss";

const ChartLegendContent = ({ payload, askAI }: any) => {
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

// Update the component propswis interface
interface BarChartProps {
  chartData: any;
  title: string | undefined;
  contentToCopy: string;
}

function Component({
  chartData,
  title,
  contentToCopy,
}: BarChartProps) {
  const categories = chartData.chartConfig.series;
  const config = handleChartConfigResponse(chartData.chartConfig);
  const [selectedColorVariable, setSelectedColorVariable] =
    useState<string>("chart-color-blue");
  const [isStacked, setIsStacked] = useState(false);
  if (chartData.chartConfig.type === "stack") {
    setIsStacked(true);
  }

  const handleColorSelect = useCallback(
    (color: { name: string; variable: string }) => {
      setSelectedColorVariable(color.variable);
    },
    [],
  );

  const getBarColor = useCallback(
    (index: number) => {
      if (selectedColorVariable) {
        const totalCategories = categories.length;

        const colorIndex = isStacked
          ? totalCategories - index // This will map index 0 to the highest number
          : index + 1; // Keep same behavior for non-stacked

        return `hsl(var(--${selectedColorVariable}-${colorIndex}))`;
      }
      // Fallback to the original color if no color is selected
      return categories[index].color;
    },
    [selectedColorVariable, categories, isStacked],
  );

  return (
    <Card className="p-4">
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
            onToggleView={() => {}}
            tableTitle={""}
            workspaceElement
          /> */}
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={config}
          style={{ height: "300px", width: "100%" }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData.chartData}
              margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis dataKey="xAxisLabel" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Legend
                content={<ChartLegendContent />}
                verticalAlign="bottom"
                align="right"
                height={36}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent indicator="line" hideIndicator={false} />
                }
              />

              {categories.map((category: any, index: number) => (
                <Bar
                  key={category.key}
                  dataKey={category.key}
                  fill={getBarColor(index)}
                  radius={isStacked ? [0, 0, 4, 4] : 4}
                  stackId={isStacked ? "stack" : undefined}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export default Component;
