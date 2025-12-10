"use client";

import { useEffect, useState } from "react";
import { Calendar, MapPin, Video, ArrowRight } from "lucide-react";
import { APP_URL } from "@/lib/config";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

export default function UpcomingEventsList() {
  const { token } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const nav = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(`${APP_URL}/dashboard/upcoming-events`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
        if (res.ok) {
          const json = await res.json();
          setEvents(json.data);
        }
      } catch (err) {
        console.error("Failed to load events", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [token]);

  const formatDateParts = (dateString) => {
    if (!dateString) return { month: "---", day: "--" };
    const parts = dateString.split(" ");
    return {
      month: parts[0] || "",
      day: parts[1] ? parts[1].replace(",", "") : "",
    };
  };

  if (loading) {
    return (
      <div className="bg-[#1A1A1A] rounded-xl border border-[#262626] p-6 h-full flex flex-col gap-4">
        <div className="flex justify-between items-center mb-2">
          <Skeleton className="h-6 w-1/3 bg-[#333]" />
          <Skeleton className="h-8 w-20 bg-[#333] rounded-lg" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-20 w-full bg-[#333] rounded-xl" />
          <Skeleton className="h-20 w-full bg-[#333] rounded-xl" />
          <Skeleton className="h-20 w-full bg-[#333] rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1A1A1A] rounded-xl border border-[#262626] p-6 h-full flex flex-col overflow-hidden">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h3 className="text-white font-semibold text-lg">
            Your Upcoming Events
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Events from clubs you have joined
          </p>
        </div>
        <p
          onClick={() => nav("/events")}
          className="text-xs bg-[#262626] hover:bg-[#333] text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-1 group cursor-pointer"
        >
          View All{" "}
          <ArrowRight
            size={12}
            className="group-hover:translate-x-0.5 transition-transform"
          />
        </p>
      </div>

      {/* SCROLLABLE LIST AREA */}
      {/* min-h-0 is crucial for nested flex scrolling */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-2 custom-scrollbar space-y-3">
        {events.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 gap-4 opacity-70">
            <div className="p-4 bg-[#262626] rounded-full">
              <Calendar size={32} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-300">
                No upcoming events
              </p>
              <p className="text-xs mt-1">You are all caught up!</p>
            </div>
          </div>
        ) : (
          events.map((event) => {
            const { month, day } = formatDateParts(event.date);
            return (
              <div
                key={event.id}
                className="group relative flex items-center justify-between p-3 bg-[#111] hover:bg-[#161616] rounded-xl border cursor-pointer border-[#262626] hover:border-[#444] transition-all duration-200"
                onClick={() => nav(`/events/${event.id}`)}
              >
                <div className="flex items-center gap-4 overflow-hidden">
                  {/* Date Box */}
                  <div className="flex flex-col items-center justify-center w-14 h-14 bg-[#1A1A1A] rounded-lg border border-[#262626] text-center group-hover:border-[#555] transition-colors shrink-0">
                    <span className="text-[10px] font-bold text-blue-500 uppercase leading-none tracking-wider">
                      {month}
                    </span>
                    <span className="text-xl font-bold text-white leading-none mt-1">
                      {day}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-gray-100 truncate group-hover:text-white transition-colors">
                      {event.title}
                    </h4>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs text-gray-500 mt-1">
                      <span className="flex items-center gap-1.5 text-blue-400 font-medium truncate">
                        {event.club_name}
                      </span>
                      <span className="hidden sm:inline text-gray-700">•</span>
                      <span className="flex items-center gap-1.5 truncate">
                        {event.mode === "online" ? (
                          <Video size={11} className="text-gray-400" />
                        ) : (
                          <MapPin size={11} className="text-gray-400" />
                        )}
                        {event.mode === "online" ? "Online" : "In-Person"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="shrink-0 ml-3">
                  <span className="text-[10px] bg-blue-900/20 text-blue-400 border border-blue-900/30 px-2.5 py-1 rounded-full font-medium tracking-wide">
                    {event.status}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
