import React, { useEffect, useState } from "react";
import { MapPin, Calendar, Clock, AlertCircle } from "lucide-react";
import { APP_URL } from "@/lib/config";
import { useAuth } from "@/contexts/AuthContext";
import { useClub } from "@/contexts/ClubContext"; // 1. Import useClub
import { useNavigate } from "react-router-dom";

export function formatDate(dateString) {
  const date = new Date(dateString);
  if (isNaN(date)) return "Invalid date";
  const options = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
}

export function formatTime(timeString) {
  if (!timeString) return "N/A";
  const [hours, minutes] = timeString.split(":");
  const h = parseInt(hours, 10);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${minutes} ${suffix}`;
}

const AnnouncementCard = () => {
  const { token, user } = useAuth();
  const { clubs } = useClub(); // 2. Get user's clubs
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const nav = useNavigate();

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await fetch(`${APP_URL}/announcements`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch announcements");
        }

        const json = await res.json();
        const allAnnouncements = json.data || [];

        // 3. Filter Logic: Show if General OR User is in the Club OR User is Admin
        const filteredData = allAnnouncements.filter((item) => {
          if (user?.role === "admin") return true; // Admins see all
          if (item.target_type === "general") return true; // Everyone sees general

          // Check if item.club_id exists in the user's clubs array
          return clubs.some((c) => Number(c.id) === Number(item.club_id));
        });

        setAnnouncements(filteredData);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if we have club data (or if loading finished to prevent empty flash)
    if (user) {
      fetchAnnouncements();
    }
  }, [clubs, user, token]);

  return (
    <div className="w-full h-full p-6 rounded-xl shadow-sm border border-[#2a2a2a] bg-[#171717] flex flex-col">
      <div className="flex flex-row justify-between items-center mb-4 shrink-0">
        <h2 className="text-xl font-semibold text-white">Announcement</h2>
        <button
          className="text-xs font-medium text-white bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 px-3 py-1 rounded-lg transition-colors cursor-pointer"
          onClick={() => nav("/announcements")}
        >
          View all
        </button>
      </div>

      <div className="flex flex-col gap-3 flex-1 overflow-y-auto min-h-0 pr-1 custom-scrollbar">
        {loading && <p className="text-gray-500 text-sm">Loading...</p>}

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle size={16} /> <span>Unable to load data</span>
          </div>
        )}

        {!loading && !error && announcements.length === 0 && (
          <p className="text-gray-500 text-sm">No announcements for you.</p>
        )}

        {!loading &&
          announcements.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-1 p-3 bg-[#0f0f0f] rounded-r-lg border-l-4 border-blue-600/70 border border-neutral-800/50 hover:bg-neutral-900 transition-colors"
            >
              <h3 className="font-semibold text-gray-200 text-sm">
                {item.title}
              </h3>

              <div className="flex items-center gap-4 text-[11px] text-gray-500 mt-1">
                <div className="flex items-center gap-1">
                  <Calendar size={12} />
                  <span>{formatDate(item.date)}</span>
                </div>

                <div className="flex items-center gap-1">
                  <Clock size={12} />
                  <span>{formatTime(item.time)}</span>
                </div>
              </div>

              {item.venue && (
                <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-1">
                  <MapPin size={12} />
                  <span>{item.venue}</span>
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

export default AnnouncementCard;
