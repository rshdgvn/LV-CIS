"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { APP_URL } from "@/lib/config";
import { useAuth } from "@/contexts/AuthContext";

export default function ActiveClubsChart() {
  const { token } = useAuth();
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchChart();
  }, []);

  const fetchChart = async () => {
    try {
      const res = await fetch(`${APP_URL}/admin/active-clubs-chart`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();
      setData(result.data);
    } catch (err) {
      console.error("Active Clubs Chart Error:", err);
    }
  };

  const truncateLabel = (value) => {
    if (value.length > 10) {
      return value.substring(0, 10) + "...";
    }
    return value;
  };

  return (
    <div className="bg-[#171717] border border-[#2a2a2a] rounded-xl p-4 w-full h-[350px]">
      <h2 className="text-white text-lg mb-4">Active Clubs Members</h2>

      <ResponsiveContainer width="100%" height="85%">
        <BarChart
          data={data}
          margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="purpleBar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#b084ff" />
              <stop offset="100%" stopColor="#6e2bff" />
            </linearGradient>
          </defs>

          <CartesianGrid stroke="#222" vertical={false} strokeDasharray="3 3" />

          <XAxis
            dataKey="name"
            tick={{ fill: "#aaa", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            interval={0} 
            angle={-30} 
            textAnchor="end"
            height={50} 
            tickFormatter={truncateLabel} 
          />

          <YAxis
            tick={{ fill: "#777", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
          />

          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.05)" }}
            contentStyle={{
              background: "#0f0f0f",
              border: "1px solid #333",
              borderRadius: "8px",
              padding: "10px",
            }}
            labelStyle={{
              color: "#fff",
              fontWeight: "bold",
              marginBottom: "5px",
            }}
            itemStyle={{ color: "#b084ff" }}
            formatter={(value) => [`${value}%`, "Active Members"]}
          />

          <Bar
            dataKey="value"
            fill="url(#purpleBar)"
            maxBarSize={50} 
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
