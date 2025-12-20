"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

type CategorySummary = {
  category: string;
  spent: number;
};

// A nice color palette for the slices
const COLORS = [
  "#3b82f6", // Blue
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#6366f1", // Indigo
];

const RADIAN = Math.PI / 180;

// Custom label to show percentage inside the slice if it's big enough
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  // Only show label if slice is > 5%
  if (percent < 0.05) return null;

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      className="text-xs font-bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function SpendingPieChart({
  data,
}: {
  data: CategorySummary[];
}) {
  // Filter out categories with 0 spending to keep the chart clean
  const chartData = data.filter((item) => item.spent > 0);

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={140}
            innerRadius={60} // This makes it a Donut chart
            fill="#8884d8"
            dataKey="spent"
            nameKey="category"
            paddingAngle={2} // Adds a tiny gap between slices
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                stroke="rgba(0,0,0,0)"
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(
              value: number | string | Array<number | string> | undefined,
            ) => {
              if (typeof value === "number") {
                return `$${value.toFixed(2)}`;
              }
              return value;
            }}
            contentStyle={{
              backgroundColor: "#1f2937",
              borderColor: "#374151",
              color: "#f3f4f6",
            }}
            itemStyle={{ color: "#f3f4f6" }}
          />
          <Legend
            layout="vertical"
            verticalAlign="middle"
            align="right"
            wrapperStyle={{ fontSize: "12px" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
