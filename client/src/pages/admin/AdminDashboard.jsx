import React from "react";
import { Home } from "lucide-react";
import DashboardCards from "./DashboardCards";
import ActiveClubsChart from "./ActiveClubsChart";
import AttendanceOverviewChart from "./AttendanceOverviewChart";

function AdminDashboard() {
  return (
    <>
      <div className="flex flex-col gap-2 my-8 mx-4">
        <div className="flex flex-row items-center gap-5">
          <div className="shrink-0 p-2 bg-blue-900/30 rounded-lg">
            <Home className="w-9 h-9 text-blue-400" />
          </div>
          <h1 className="text-4xl font-semibold">Dashboard</h1>
        </div>
        <p className="text-gray-400 my-2">
          Here is today’s report and performances.
        </p>
      </div>
      <DashboardCards />
      <div className="flex gap-5">
        <ActiveClubsChart />
        <AttendanceOverviewChart />
      </div>
    </>
  );
}

export default AdminDashboard;
