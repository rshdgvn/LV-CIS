import React, { useEffect, useState } from "react";
import { MapPin, Calendar, Clock, AlertCircle } from "lucide-react";
import { APP_URL } from "@/lib/config";
import { useAuth } from "@/contexts/AuthContext";

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
  const { token } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        console.log(json);
        setAnnouncements(json.data.slice(0, 5));
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  return (
    <div className="w-full h-full rounded-xl p-6 shadow-sm border border-gray-800">
      <div className="flex flex-row justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Announcement</h2>
        <button className="text-xs font-medium text-white bg-neutral-950 hover:bg-gray-600 px-3 py-1 rounded-lg transition-colors">
          View all
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {loading && <p className="text-gray-400 text-sm">Loading...</p>}

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle size={16} /> <span>Unable to load data</span>
          </div>
        )}

        {!loading && !error && announcements.length === 0 && (
          <p className="text-gray-500 text-sm">No active announcements.</p>
        )}

        {!loading &&
          announcements.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-1 p-3 bg-neutral-950 rounded-r-lg border-l-4 border-neutral-700 mx-4 my-2"
            >
              <h3 className="font-semibold text-gray-200 text-sm">
                {item.title}
              </h3>

              <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
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
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
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
