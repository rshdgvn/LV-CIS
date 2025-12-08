"use client";

import React, { useEffect, useState } from "react";
import DashboardCards from "./admin/DashboardCards";
import { useAuth } from "@/contexts/AuthContext";
import { APP_URL } from "@/lib/config";
import PendingApplicantsList from "@/components/PendingApplicantsList";
import UpcomingEventsList from "@/components/UpcomingEventsList";
import { useNavigate } from "react-router-dom";
import YourClubsList from "@/components/YourClubsList";
import TaskList from "@/components/TaskList";
import AnnouncementCard from "@/components/AnnouncementCard";
import Calendar from "./system/Calendar";

export default function DashboardPage() {
  const { token, user } = useAuth();
  const [cards, setCards] = useState([]);
  const nav = useNavigate();

  useEffect(() => {
    if (user && user.role === "admin") {
      nav("/admin/dashboard");
      return;
    }
    fetchDashboard();
  }, [user, nav]);

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
      setCards(data.cards);
    } catch (err) {
      console.error("Dashboard error:", err);
    }
  };

  if (!user || user.role === "admin") return null;

  return (
    <div className="min-h-screen p-8 font-sans text-white">
      <div className="mb-8 flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Dashboard
        </h1>
        <p className="text-gray-400 text-sm">
          Welcome back, {user.first_name}! Here's an overview of your club
          activities.
        </p>
      </div>

      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Top Cards */}
        <DashboardCards cards={cards} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto">
          {/* Upcoming Events - Takes up 2 columns */}
          <div className="lg:col-span-2 h-full min-h-[400px]">
            <UpcomingEventsList />
          </div>

          {/* Pending Applicants - Takes up 1 column */}
          <div className="lg:col-span-1 h-full min-h-[400px]">
            <PendingApplicantsList />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-auto">
          <div className="h-full min-h-[350px]">
            <YourClubsList />
          </div>
          <div className="h-full min-h-[350px]">
            <TaskList />
          </div>
        </div>
        <div className="flex flex-col lg:flex-row gap-5 mb-8 w-full h-auto lg:h-[875px]">
          <div
            className="flex-1 cursor-pointer overflow-hidden rounded-lg h-[100px] lg:h-auto"
            onClick={() => nav("/calendar")}
          >
            <Calendar />
          </div>

          <div className="w-full lg:w-96 bg-neutral-900 rounded-lg overflow-hidden h-[500px] lg:h-auto">
            <AnnouncementCard />
          </div>
        </div>
      </div>
    </div>
  );
}
