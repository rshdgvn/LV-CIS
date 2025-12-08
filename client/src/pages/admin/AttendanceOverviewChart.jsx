"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Loader2 } from "lucide-react";
import { APP_URL } from "@/lib/config";
import { useAuth } from "@/contexts/AuthContext";

export default function AttendanceOverviewChart() {
  const { token } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("yearly");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${APP_URL}/admin/attendance-chart?filter=${filter}`,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch data");

      const json = await res.json();
      setData(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filter]);

  return (
    <div className="bg-[#171717] border border-[#2a2a2a] mt-0 rounded-xl p-6 w-full h-[350px] flex flex-col">
      {/* HEADER WITH FILTER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-white text-lg font-medium">Attendance Overview</h2>

        {/* Filter Dropdown */}
        <div className="relative">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-[#0f0f0f] text-gray-300 text-xs font-medium border border-[#333] rounded-lg px-3 py-1.5 outline-none focus:border-[#7C3AED] transition-colors cursor-pointer appearance-none pr-8"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
      </div>

      {/* CHART CONTAINER */}
      <div className="flex-1 w-full min-h-0 relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[#171717]/50 z-10 rounded-lg">
            <Loader2 className="w-6 h-6 text-[#7C3AED] animate-spin" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
            >
              {/* Very subtle grid lines */}
              <CartesianGrid
                stroke="#333"
                vertical={false}
                strokeDasharray="3 3"
                strokeOpacity={0.5}
              />

              <XAxis
                dataKey="name"
                tick={{ fill: "#6B7280", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                dy={10}
              />

              <YAxis
                tick={{ fill: "#6B7280", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  borderColor: "transparent",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                itemStyle={{ fontSize: "12px", textTransform: "capitalize" }}
              />

              <Legend
                verticalAlign="top"
                height={36}
                iconType="circle"
                wrapperStyle={{
                  fontSize: "12px",
                  paddingBottom: "10px",
                  right: 0,
                  top: -40,
                }}
              />

              {/* 1. GREEN LINE (Present) */}
              <Line
                name="Present"
                type="monotone"
                dataKey="present"
                stroke="#10B981" // Bright Green
                strokeWidth={3}
                dot={false} // Remove dots for cleaner look
                activeDot={{ r: 6, fill: "#10B981", strokeWidth: 0 }}
              />

              {/* 2. RED LINE (Absent) */}
              <Line
                name="Absent"
                type="monotone"
                dataKey="absent"
                stroke="#EF4444" // Bright Red
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, fill: "#EF4444", strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
