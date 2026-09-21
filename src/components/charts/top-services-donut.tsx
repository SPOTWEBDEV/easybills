"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { TopService } from "@/lib/types";

const COLORS = ["#17C695", "#3FDDAD", "#0B8365", "#9CF0D6", "#0FA87D"];

export function TopServicesDonut({ data }: { data: TopService[] }) {
  return (
    <div>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={70}
            outerRadius={100}
            paddingAngle={3}
            stroke="none"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "#161A24",
              border: "1px solid #20242F",
              borderRadius: 12,
              fontSize: 12,
              color: "#F3F5F8",
            }}
            formatter={(value: number) => `${value}%`}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-2 flex flex-wrap justify-center gap-x-5 gap-y-2">
        {data.map((s, i) => (
          <div key={s.name} className="flex items-center gap-2 text-xs text-ink-muted">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            />
            {s.name}
          </div>
        ))}
      </div>
    </div>
  );
}
