import React from "react";
import { Home } from "lucide-react";
import DashboardCards from "./DashboardCards";
import ActiveClubsChart from "./ActiveClubsChart";
import AttendanceOverviewChart from "./AttendanceOverviewChart";
import { SmallCalendar } from "@/components/SmallCalendar";
import AnnouncementCard from "@/components/AnnouncementCard";

function AdminDashboard() {
  return (
    <>
      <div className="flex flex-col gap-2 my-8 mx-4">
        <div className="flex flex-row items-center gap-5">
          <div className="shrink-0 p-2 bg-blue-900/30 rounded-lg">
            <Home className="w-9 h-9 text-blue-400" />
          </div>
          <h1 className="text-4xl font-semibold text-white">Dashboard</h1>
        </div>
        <p className="text-gray-400 my-2">
          Here is today’s report and performances.
        </p>
      </div>

      <DashboardCards />

      <div className="flex flex-col lg:flex-row gap-5 mb-5 w-full">
        <div className="flex-1">
          <ActiveClubsChart />
        </div>
        <div className="flex-1">
          <AttendanceOverviewChart />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 mb-8 w-full h-full min-h-[400px]">
        <div className="flex-1 rounded-xl p-4 border border-gray-800 bg-neutral-900">
          <SmallCalendar className="w-full h-full" />
        </div>

        <div className="w-full lg:w-1/ bg-neutral-900">
          <AnnouncementCard />
        </div>
      </div>
    </>
  );
}

export default AdminDashboard;
