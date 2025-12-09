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
import { Home } from "lucide-react";

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
      {/* Header */}
      <div className="flex flex-col gap-2 mb-8 mx-4">
        <div className="flex flex-row items-center gap-5">
          <div className="shrink-0 p-2 bg-blue-900/30 rounded-lg">
            <Home className="w-9 h-9 text-blue-400" />
          </div>
          <h1 className="text-4xl font-semibold">Dashboard</h1>
        </div>
        <p className="text-gray-400 my-2">
          Welcome back, {user.first_name}! Here's an overview of your club
          activities.
        </p>
      </div>

      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Top Cards */}
        {/* <DashboardCards cards={cards} /> */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-[400px]">
            <YourClubsList />
          </div>
          <div className="h-[400px]">
            <TaskList />
          </div>
        </div>

        {/* Row 1: Events & Applicants */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Events: Fixed Height to force scroll */}
          <div className="lg:col-span-2 h-[500px]">
            <UpcomingEventsList />
          </div>

          {/* Pending Applicants: Fixed Height */}
          <div className="lg:col-span-1 h-[500px]">
            <PendingApplicantsList />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-5 mb-8 w-full h-auto lg:h-[875px]">
          <div className="flex-1 cursor-pointer overflow-hidden rounded-lg h-[100px] lg:h-auto">
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
