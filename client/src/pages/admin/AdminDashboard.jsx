import { useEffect, useState } from "react";
import { Home } from "lucide-react";
import DashboardCards from "./DashboardCards";
import ActiveClubsChart from "./ActiveClubsChart";
import AttendanceOverviewChart from "./AttendanceOverviewChart";
import AnnouncementCard from "@/components/AnnouncementCard";
import Calendar from "../system/Calendar";
import { APP_URL } from "@/lib/config";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const { token } = useAuth();
  const [cards, setCards] = useState([]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch(`${APP_URL}/admin/dashboard`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      console.log(data);
      setCards(data.cards);
    } catch (err) {
      console.error("Dashboard error:", err);
    }
  };

  const nav = useNavigate();

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

      <DashboardCards cards={cards} />

      <div className="flex flex-col lg:flex-row gap-5 mb-5 w-full">
        <div className="flex-1">
          <ActiveClubsChart />
        </div>
        <div className="flex-1">
          <AttendanceOverviewChart />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 mb-8 w-full h-full min-h-96">
        <div className="flex-1 cursor-pointer" onClick={() => nav("/calendar")}>
          <Calendar />
        </div>

        <div className="w-lg bg-neutral-900">
          <AnnouncementCard />
        </div>
      </div>
    </>
  );
}

export default AdminDashboard;
