"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "AIM", value: 58 },
  { name: "JWSAP", value: 36 },
  { name: "BAB", value: 42 },
  { name: "LVPT", value: 78 },
  { name: "CDL", value: 32 },
  { name: "LVDT", value: 64 },
  { name: "CDVL", value: 50 },
  { name: "TM", value: 50 },
  { name: "LVFL", value: 50 },
];

export default function ActiveClubsChart() {
  return (
    <div className="bg-[#171717] border border-[#2a2a2a] mt-7 rounded-xl p-4 w-full h-[350px]">
      <h2 className="text-white text-lg mb-4">Active Clubs Members</h2>

      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data}>
          <defs>
            <linearGradient id="purpleBar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#b084ff" />
              <stop offset="100%" stopColor="#6e2bff" />
            </linearGradient>
          </defs>

          <CartesianGrid stroke="#222" vertical={false} />

          <XAxis
            dataKey="name"
            tick={{ fill: "#aaa" }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            tick={{ fill: "#777" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
          />

          <Tooltip
            contentStyle={{
              background: "#0f0f0f",
              border: "1px solid #333",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "#ccc" }}
            itemStyle={{ color: "#b084ff" }}
            cursor={{ fill: "rgba(255,255,255,0.05)" }}
          />

          <Bar
            dataKey="value"
            fill="url(#purpleBar)"
            maxBarSize={40}
            radius={[10, 10, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
