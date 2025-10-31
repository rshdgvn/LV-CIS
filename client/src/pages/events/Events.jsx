import { useEffect, useState } from "react";
import NProgress from "nprogress";
import { APP_URL } from "@/lib/config";
import { useAuth } from "@/contexts/AuthContext";
import {
  CalendarCheck,
  FilterIcon,
  ChevronDown,
  SquarePlus,
} from "lucide-react";
import EventCard from "@/components/EventCard";
import { SkeletonEventPage } from "@/components/skeletons/SkeletonEventPage";
import { useNavigate } from "react-router-dom";

function Events() {
  const { token, user, isAdmin } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);

  const nav = useNavigate();

  const filterOptions = [
    { label: "All Events", value: "all" },
    { label: "Upcoming Events", value: "upcoming" },
    { label: "Recent Events", value: "completed" },
  ];

  const categoryOptions = [
    { label: "All Clubs", value: "all" },
    { label: "Your Clubs", value: "yourclub" },
    { label: "Other Clubs", value: "otherclub" },
  ];

  const handleFilterChange = (filter) => setActiveFilter(filter);
  const handleCategorySelect = (value) => {
    setCategoryFilter(value);
    setShowCategoryMenu(false);
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      NProgress.start();

      const res = await fetch(`${APP_URL}/events`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch events");

      const data = await res.json();
      console.log("Fetched events:", data);

      setEvents(data);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Failed to load events.");
    } finally {
      setLoading(false);
      NProgress.done();
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  if (loading) return <SkeletonEventPage />;
  if (error) return <p>{error}</p>;

  const filteredEvents = events.filter((event) => {
    if (categoryFilter === "yourclub") {
      if (!event.club?.users?.some((m) => Number(m.id) === Number(user?.id))) {
        return false;
      }
    } else if (categoryFilter === "otherclub") {
      if (event.club?.users?.some((m) => Number(m.id) === Number(user?.id))) {
        return false;
      }
    }

    if (activeFilter === "upcoming") {
      return event.status === "upcoming" || event.status === "ongoing";
    } else if (activeFilter === "completed") {
      return event.status === "completed";
    }

    return true;
  });

  return (
    <>
      <div className="flex flex-col gap-2 my-8 mx-4">
        <div className="flex flex-row items-center gap-5">
          <CalendarCheck className="h-9 w-9 bg-green-400 text-green-900 border-green-300 p-1 rounded-lg" />
          <h1 className="text-4xl font-semibold">Club Events</h1>
        </div>
        <p className="text-gray-400 my-2">
          See all upcoming and past events organized by student clubs.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3 my-3 ml-5">
        {filterOptions.map((filter) => (
          <button
            key={filter.value}
            onClick={() => handleFilterChange(filter.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeFilter === filter.value
                ? "bg-blue-950 text-white shadow-lg"
                : "bg-neutral-800 text-gray-300 hover:bg-neutral-700"
            }`}
          >
            {filter.label}
          </button>
        ))}

        {!isAdmin && (
          <div className="relative">
            <button
              onClick={() => setShowCategoryMenu((prev) => !prev)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-900 text-white text-sm font-medium shadow-md hover:bg-blue-950 transition"
            >
              <FilterIcon className="w-4 h-4" />
              {categoryOptions.find((opt) => opt.value === categoryFilter)
                ?.label || "All Clubs"}
              <ChevronDown className="w-4 h-4" />
            </button>

            {showCategoryMenu && (
              <div className="absolute mt-2 w-56 bg-neutral-800 text-sm text-white rounded-xl shadow-lg border border-neutral-700 z-50">
                {categoryOptions.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => handleCategorySelect(cat.value)}
                    className="block w-full text-left px-4 py-2 hover:bg-neutral-700 first:rounded-t-xl last:rounded-b-xl"
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <button className="flex flex-row gap-2 items-center ml-auto px-6 py-2 rounded-lg text-sm font-medium transition bg-blue-950 text-gray-300 hover:bg-neutral-700 mr-8 ">
          <SquarePlus className="h-4 w-4" />
          Add
        </button>
      </div>

      <div className="p-4 grid gap-4">
        {filteredEvents.map((event) => (
          <div
            key={event.id}
            onClick={() => nav(`/events/${event.id}`)}
            className="cursor-pointer hover:scale-[1.01] transition-transform"
          >
            <EventCard event={event} />
          </div>
        ))}
      </div>
    </>
  );
}

export default Events;
