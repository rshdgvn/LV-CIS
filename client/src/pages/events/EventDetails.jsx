import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  CalendarDays,
  Clock,
  MapPin,
  Share2,
  ArrowLeftSquare,
  UserRound,
} from "lucide-react";
import { APP_URL } from "@/lib/config";
import { useAuth } from "@/contexts/AuthContext";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { formatTaskStatus } from "@/utils/formatTaskStatus";
import { getTaskStatusColor } from "@/utils/getTaskStatusColor";

function EventDetails() {
  const { id } = useParams();
  const { token } = useAuth();
  const [event, setEvent] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const nav = useNavigate();

  // Fetch event details
  const fetchEvent = async () => {
    try {
      setLoading(true);
      NProgress.start();

      const res = await fetch(`${APP_URL}/events/${id}`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch event details.");
      const data = await res.json();
      setEvent(data);
    } catch (err) {
      console.error(err);
      setError("Error loading event details.");
    } finally {
      setLoading(false);
      NProgress.done();
    }
  };

  // Fetch tasks for this event
  const fetchTasks = async () => {
    try {
      const res = await fetch(`${APP_URL}/events/${id}/tasks`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch tasks.");
      const data = await res.json();
      setTasks(data);
      console.log(tasks);
    } catch (err) {
      console.error(err);
      setTasks([]);
    }
  };

  useEffect(() => {
    fetchEvent();
    fetchTasks();
  }, [id]);

  if (loading) return <p className="p-10 text-gray-400">Loading event...</p>;
  if (error) return <p className="p-10 text-red-500">{error}</p>;
  if (!event) return null;

  const detail = event.detail || {};
  const banner = "/placeholder.jpg";

  return (
    <div className="relative min-h-screen bg-neutral-950 text-white">
      <div
        className="absolute inset-0 w-full h-[400px] bg-cover bg-center"
        style={{
          backgroundImage: `url(${banner})`,
          filter: "brightness(0.6)",
        }}
      />

      <button
        onClick={() => nav(-1)}
        className="absolute top-4 left-4 z-50 p-2 rounded-md bg-neutral-800/60 hover:bg-neutral-950/60 transition"
      >
        <ArrowLeftSquare className="w-7 h-7 text-white" />
      </button>

      <div className="relative z-10 pt-72 pb-20 px-6 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-neutral-900/90 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-neutral-800">
            <h1 className="text-2xl font-semibold mb-5 mx-5">{event.title}</h1>

            <div className="flex flex-col gap-4 text-gray-300 text-sm mx-5">
              <div className="flex flex-row justify-between">
                <div className="flex-col items-center">
                  <div className="flex gap-2 mb-3">
                    <CalendarDays className="text-red-400 w-5 h-5" />
                    <span className="text-gray-400">Date</span>
                  </div>
                  <span className="block">
                    {new Date(detail.event_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex-col">
                  <div className="flex gap-2 mb-3 text-start">
                    <Clock className="text-red-400 w-5 h-5" />
                    <span className="text-gray-400">Time</span>
                  </div>
                  <span>{detail.event_time}</span>
                </div>
              </div>

              <div className="flex-col items-center">
                <div className="flex gap-2 mb-3">
                  <MapPin className="text-red-400 w-5 h-5" />
                  <span className="text-gray-400">Address</span>
                </div>
                <span>{detail.venue}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-4 cursor-pointer mx-5 mt-7">
              <Share2 className="text-gray-400 w-5 h-5" />
              <span className="text-sm text-gray-400">Share with friends</span>
            </div>
          </div>

          <div className="bg-neutral-900/90 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-neutral-800">
            <div className="flex gap-2 ">
              <UserRound className="h-7 w-7 text-red-400" />
              <h2 className="text-lg font-semibold mb-4 text-gray-400">
                Tasks
              </h2>
            </div>
            {tasks?.length > 0 ? (
              <ul className="space-y-3">
                {tasks.map((task, i) => (
                  <li key={i} className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{task.title}</p>
                      <p className="text-gray-400 text-sm">
                        Assigned by: {task.assigned_by || "N/A"}
                      </p>
                    </div>

                    <span
                      className={`${getTaskStatusColor(
                        task.status
                      )} text-white text-[13px] px-4 py-[3px] rounded-full font-medium shadow-sm`}
                    >
                      {formatTaskStatus(task.status)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No tasks assigned yet.</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-neutral-900/90 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-neutral-800">
            <h2 className="text-2xl font-semibold mb-5">Event Details</h2>
            <p className="text-gray-300 leading-relaxed mb-5">
              {event.description}
            </p>

            {event.purpose && (
              <>
                <h2 className="text-xl font-semibold my-3">Event Purpose:</h2>
                <p className="text-gray-300 leading-relaxed">
                  Purpose: {event.purpose}
                </p>
              </>
            )}
          </div>

          <div className="bg-neutral-900/90 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-neutral-800">
            <p className="text-white font-semibold text-sm">
              <span className="block my-1 text-gray-400 font-normal">
                Event Organizer:
              </span>{" "}
              {detail.organizer || "N/A"}
            </p>
            <p className="text-white font-semibold text-sm">
              <span className="block mb-1 mt-5 text-gray-400 font-normal">
                Contact Person:
              </span>{" "}
              {detail.contact_person || "N/A"}
            </p>
            <p className="text-white font-semibold text-sm">
              <span className="block mb-1 mt-5 text-gray-400 font-normal">
                Email:
              </span>{" "}
              {detail.contact_email || "N/A"}
            </p>
          </div>
        </div>
        <div className="bg-neutral-900/90 backdrop-blur-md mt-6 p-6 rounded-2xl shadow-lg border border-neutral-800">
          <h2 className="text-2xl font-semibold mb-5">
            Event Photos and Videos
          </h2>

          {event.photos?.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {event.photos.map((photo, i) => (
                <img
                  key={i}
                  src={photo}
                  alt={`Photo ${i + 1}`}
                  className="rounded-xl object-cover w-full h-40"
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No photos available.</p>
          )}

          {event.videos?.length > 0 && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {event.videos.map((video, i) => (
                <video
                  key={i}
                  src={video}
                  controls
                  className="rounded-xl w-full h-64 object-cover"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EventDetails;
