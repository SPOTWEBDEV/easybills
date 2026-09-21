"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { RevenueTrendPoint } from "@/lib/types";
import { formatCompactNaira } from "@/lib/utils";

export function RevenueChart({ data }: { data: RevenueTrendPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#17C695" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#17C695" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#1A1E28" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fill: "#5C6376", fontSize: 12 }}
          axisLine={{ stroke: "#20242F" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#5C6376", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => formatCompactNaira(v)}
          width={56}
        />
        <Tooltip
          contentStyle={{
            background: "#161A24",
            border: "1px solid #20242F",
            borderRadius: 12,
            fontSize: 12,
            color: "#F3F5F8",
          }}
          formatter={(value: number) => formatCompactNaira(value)}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#17C695"
          strokeWidth={2.5}
          fill="url(#revenueFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
