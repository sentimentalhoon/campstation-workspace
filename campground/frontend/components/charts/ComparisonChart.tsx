/**
 * ComparisonChart 컴포넌트
 *
 * 비교 데이터를 Bar Chart로 표시
 * - 월별 예약 비교
 * - 지역별 캠핑장 분포
 * - Top 10 캠핑장
 *
 * @example
 * ```tsx
 * <ComparisonChart
 *   data={[
 *     { name: '서울', value: 30 },
 *     { name: '부산', value: 25 },
 *   ]}
 *   dataKey="value"
 *   xAxisKey="name"
 *   title="지역별 캠핑장 분포"
 *   color="#10b981"
 * />
 * ```
 */

"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ComparisonChartProps = {
  data: Array<Record<string, string | number>>;
  dataKey: string;
  xAxisKey: string;
  title?: string;
  color?: string;
  height?: number;
  valueFormatter?: (value: number) => string;
};

/**
 * ComparisonChart 컴포넌트
 */
export function ComparisonChart({
  data,
  dataKey,
  xAxisKey,
  title,
  color = "#10b981",
  height = 300,
  valueFormatter = (value) => value.toLocaleString(),
}: ComparisonChartProps) {
  return (
    <div className="rounded-lg border bg-white p-4">
      {title && <h3 className="mb-4 text-lg font-semibold">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
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
          <Bar dataKey={dataKey} fill={color} radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
