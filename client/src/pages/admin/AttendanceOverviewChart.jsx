"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Mon", value: 32 },
  { name: "Tue", value: 41 },
  { name: "Wed", value: 36 },
  { name: "Thu", value: 48 },
  { name: "Fri", value: 49 },
  { name: "Sat", value: 38 },
  { name: "Sun", value: 52 },
];

export default function AttendanceOverviewChart() {
  return (
    <div className="bg-[#171717] border border-[#2a2a2a] mt-7 rounded-xl p-4 w-full h-[350px]">
      <h2 className="text-white text-lg mb-4">Attendance Overview</h2>

      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={data}>
          <CartesianGrid stroke="#222" />

          <XAxis
            dataKey="name"
            tick={{ fill: "#aaa" }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis tick={{ fill: "#777" }} axisLine={false} tickLine={false} />

          <Tooltip
            contentStyle={{
              background: "#0f0f0f",
              border: "1px solid #333",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "#ccc" }}
            itemStyle={{ color: "#22c55e" }}
            cursor={{ stroke: "#333", strokeWidth: 1 }}
          />

          <Line
            type="monotone"
            dataKey="value"
            stroke="#22c55e"
            strokeWidth={2}
            dot={{ r: 4, fill: "#22c55e" }}
            activeDot={{ r: 6, fill: "#22c55e" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
