/**
 * DistributionChart 컴포넌트
 *
 * 비율 데이터를 Pie Chart로 표시
 * - 사용자 역할 분포
 * - 예약 상태 분포
 * - 캠핑장 타입 분포
 *
 * @example
 * ```tsx
 * <DistributionChart
 *   data={[
 *     { name: 'MEMBER', value: 850 },
 *     { name: 'OWNER', value: 120 },
 *     { name: 'ADMIN', value: 30 },
 *   ]}
 *   title="사용자 역할 분포"
 * />
 * ```
 */

"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // purple
  "#ec4899", // pink
];

type DistributionChartProps = {
  data: Array<{ name: string; value: number }>;
  title?: string;
  height?: number;
  valueFormatter?: (value: number) => string;
};

/**
 * Recharts Pie Label Props
 * Props passed to custom label render function
 */
interface PieLabelProps {
  cx?: string | number;
  cy?: string | number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  percent?: number;
  index?: number;
  name?: string;
  value?: number;
}

/**
 * DistributionChart 컴포넌트
 */
export function DistributionChart({
  data,
  title,
  height = 300,
  valueFormatter = (value) => value.toLocaleString(),
}: DistributionChartProps) {
  return (
    <div className="rounded-lg border bg-white p-4">
      {title && <h3 className="mb-4 text-lg font-semibold">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(props: PieLabelProps) =>
              `${props.name}: ${((props.percent || 0) * 100).toFixed(0)}%`
            }
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "0.5rem",
            }}
            formatter={(value: number) => valueFormatter(value)}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
