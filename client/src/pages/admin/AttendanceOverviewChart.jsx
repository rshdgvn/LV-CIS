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
  }, [filter]); // Re-fetch whenever filter changes

  return (
    <div className="bg-[#171717] border border-[#2a2a2a] mt-7 rounded-xl p-4 w-full h-[400px] flex flex-col">
      {/* HEADER WITH FILTER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-white text-lg font-semibold">
          Attendance Overview
        </h2>

        {/* Filter Dropdown */}
        <div className="relative">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-[#0f0f0f] text-gray-300 text-xs font-medium border border-[#333] rounded-lg px-3 py-1.5 outline-none focus:border-[#b084ff] transition-colors cursor-pointer appearance-none pr-8"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option> 
          </select>
          
          {/* Custom Arrow Icon */}
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg
              width="10"
              height="6"
              viewBox="0 0 10 6"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 1L5 5L9 1"
                stroke="#666"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* CHART CONTAINER */}
      <div className="flex-1 w-full min-h-0 relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[#171717]/50 z-10 rounded-lg">
            <Loader2 className="w-6 h-6 text-[#b084ff] animate-spin" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                stroke="#333"
                vertical={false}
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="name"
                tick={{ fill: "#9ca3af", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                dy={10}
              />

              <YAxis
                tick={{ fill: "#6b7280", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f0f0f",
                  borderColor: "#333",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                itemStyle={{ fontSize: "12px", textTransform: "capitalize" }}
                cursor={{
                  stroke: "#444",
                  strokeWidth: 1,
                  strokeDasharray: "4 4",
                }}
              />

              <Legend
                verticalAlign="top"
                height={36}
                iconType="circle"
                wrapperStyle={{
                  fontSize: "12px",
                  color: "#999",
                  paddingTop: "0px",
                }}
              />

              {/* 1. GREEN LINE (Present) */}
              <Line
                name="Present"
                type="monotone"
                dataKey="present"
                stroke="#22c55e"
                strokeWidth={3}
                dot={{
                  r: 4,
                  fill: "#171717",
                  stroke: "#22c55e",
                  strokeWidth: 2,
                }}
                activeDot={{ r: 6, fill: "#22c55e", strokeWidth: 0 }}
                animationDuration={1500}
              />

              {/* 2. RED LINE (Absent) */}
              <Line
                name="Absent"
                type="monotone"
                dataKey="absent"
                stroke="#ef4444"
                strokeWidth={3}
                dot={{
                  r: 4,
                  fill: "#171717",
                  stroke: "#ef4444",
                  strokeWidth: 2,
                }}
                activeDot={{ r: 6, fill: "#ef4444", strokeWidth: 0 }}
                animationDuration={1500}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}