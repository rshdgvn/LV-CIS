import { useEffect, useState } from "react";
import NProgress from "nprogress";
import { APP_URL } from "@/lib/config";
import { useAuth } from "@/contexts/AuthContext";
import { CalendarCheck } from "lucide-react";

function Events() {
  const { token } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");

  const filterOptions = [
    { label: "All Events", value: "all" },
    { label: "Upcoming Events", value: "upcoming" },
    { label: "Recent Events", value: "completed" },
  ];

  const handleFilterChange = (filter) => setActiveFilter(filter);

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

  if (loading) return <p>Loading events...</p>;
  if (error) return <p>{error}</p>;

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
      </div>
      <div className="p-4">
        {events.length === 0 ? (
          <p>No events found.</p>
        ) : (
          <ul className="space-y-3">
            {events.map((event) => (
              <li
                key={event.id}
                className="border rounded-lg p-3 hover:bg-gray-50 transition"
              >
                <h2 className="font-semibold text-lg">{event.title}</h2>
                <p className="text-sm text-gray-600">
                  📍 {event.location} — {event.status}
                </p>
                <p className="text-sm">
                  {new Date(event.start_date).toLocaleDateString()} →{" "}
                  {new Date(event.end_date).toLocaleDateString()}
                </p>
                {event.description && (
                  <p className="mt-1 text-gray-700 text-sm">
                    {event.description.overview}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

export default Events;
