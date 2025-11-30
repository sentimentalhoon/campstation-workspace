/**
 * TrendChart 컴포넌트
 *
 * 시계열 데이터를 Line Chart로 표시
 * - 사용자 증가 추세
 * - 매출 추세
 * - 예약 추세
 *
 * @example
 * ```tsx
 * <TrendChart
 *   data={[
 *     { month: '1월', value: 100 },
 *     { month: '2월', value: 150 },
 *   ]}
 *   dataKey="value"
 *   xAxisKey="month"
 *   title="사용자 증가 추세"
 *   color="#3b82f6"
 * />
 * ```
 */

"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type TrendChartProps = {
  data: Array<Record<string, string | number>>;
  dataKey: string;
  xAxisKey: string;
  title?: string;
  color?: string;
  height?: number;
  valueFormatter?: (value: number) => string;
};

/**
 * TrendChart 컴포넌트
 */
export function TrendChart({
  data,
  dataKey,
  xAxisKey,
  title,
  color = "#3b82f6",
  height = 300,
  valueFormatter = (value) => value.toLocaleString(),
}: TrendChartProps) {
  return (
    <div className="rounded-lg border bg-white p-4">
      {title && <h3 className="mb-4 text-lg font-semibold">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey={xAxisKey} tick={{ fontSize: 12 }} stroke="#6b7280" />
          <YAxis
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
            tickFormatter={valueFormatter}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "0.5rem",
            }}
            formatter={(value: number) => [valueFormatter(value), dataKey]}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            dot={{ fill: color, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
