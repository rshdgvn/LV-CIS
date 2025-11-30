import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  CalendarDays,
  Clock,
  MapPin,
  Share2,
  ArrowLeft,
  UserRound,
  ClipboardCheck,
} from "lucide-react";
import { APP_URL } from "@/lib/config";
import { useAuth } from "@/contexts/AuthContext";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getTaskStatusColor } from "@/utils/getTaskStatusColor";
import UpdateEventModal from "@/components/events/UpdateEventModal";
import { Button } from "@/components/ui/button";
import { SkeletonEventDetails } from "@/components/skeletons/SkeletonEventDetails";
import { formatDate } from "@/utils/formatDate";

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
      console.log(data);
      setEvent(data);
    } catch (err) {
      console.error(err);
      setError("Error loading event details.");
    } finally {
      setLoading(false);
      NProgress.done();
    }
  };

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

      setTasks(data.tasks);

      console.log("Fetched tasks:", data.tasks);
    } catch (err) {
      console.error(err);
      setTasks([]);
    }
  };

  useEffect(() => {
    fetchEvent();
    fetchTasks();
  }, [id]);

  if (loading) return <SkeletonEventDetails />;
  if (error) return <p className="p-10 text-red-500">{error}</p>;
  if (!event) return null;

  const detail = event.detail || {};
  const banner = event.cover_image;

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
        <ArrowLeft className="w-5 h-5" />
      </button>

      <div className="relative z-10 pt-72 pb-20 px-6 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-neutral-900/90 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-neutral-800">
            <div className="flex flex-row justify-between mb-3">
              <h1 className="text-3xl font-semibold mb-5 mx-5">
                {event.title}
              </h1>
              <UpdateEventModal event={event} onSuccess={fetchEvent} />
            </div>

            <div className="flex flex-col gap-4 text-gray-300 text-sm mx-5">
              <div className="flex flex-row justify-between">
                <div className="flex-col items-center">
                  <div className="flex gap-2 mb-3">
                    <CalendarDays className="text-red-400 w-5 h-5" />
                    <span className="text-gray-400">Date</span>
                  </div>
                  <span className="block">
                    {formatDate(detail.event_date)}
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
            <div className="flex justify-between">
              <div className="flex gap-2 mb-3">
                <ClipboardCheck className="h-7 w-7 text-red-400" />
                <h2 className="text-lg font-semibold mb-4 text-gray-400">
                  Tasks
                </h2>
              </div>

              <p
                className="flex justify-center text-white cursor-pointer hover:underline"
                onClick={() => nav(`/events/${id}/tasks`)}
              >
                View All Tasks
              </p>
            </div>
            {tasks?.length > 0 ? (
              <ul className="space-y-3">
                {tasks.slice(0, 4).map((task, i) => (
                  <li key={i} className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      {task.assigned_by?.length > 0 && (
                        <>
                          <img
                            src={
                              task.assigned_by.avatar ||
                              `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${encodeURIComponent(
                                `${task.assigned_by.name}`
                              )}`
                            }
                            alt="avatar"
                            className="w-10 h-10 rounded-full object-cover"
                          />

                          <div>
                            <p className="font-semibold">
                              {task.assigned_by[0].name}
                            </p>
                            <p className="text-gray-400 text-xs">
                              {task.title}
                            </p>
                          </div>
                        </>
                      )}

                      {task.assigned_by?.length === 0 && (
                        <div>
                          <p className="font-semibold">{task.title}</p>
                          <p className="text-gray-400 text-sm">
                            No assigned user
                          </p>
                        </div>
                      )}
                    </div>

                    <Select
                      value={task.status}
                      onValueChange={(value) =>
                        handleStatusChange(task.id, value)
                      }
                    >
                      <SelectTrigger
                        className={`bg-blue-700
                          h-7! w-24 rounded-lg ${
                            task.status == "completed" ? "text-[10px]" : "text-xs"
                          } font-medium 
                          flex items-center justify-between px-2
                          text-white ${getTaskStatusColor(task.status)}
                          border-none shadow-sm
                        `}
                      >
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>

                      <SelectContent className="text-xs">
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">Ongoing</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No tasks assigned yet.</p>
            )}
          </div>
        </div>

        {/* Combined Event Details, Organizer Info, and Media */}
        <div className="bg-neutral-900/90 backdrop-blur-md p-6 mt-6 rounded-2xl shadow-lg border border-neutral-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left: Event Details */}
            <div className="md:col-span-2">
              <h2 className="text-3xl font-semibold mb-4">Event Details</h2>
              <p className="text-gray-300 leading-relaxed mb-5">
                {event.description}
              </p>

              {event.purpose && (
                <>
                  <h3 className="text-xl font-semibold my-3">Purpose</h3>
                  <p className="text-gray-300 leading-relaxed">
                    {event.purpose}
                  </p>
                </>
              )}
            </div>

            {/* Right: Organizer Info */}
            <div className="space-y-4">
              <div>
                <span className="block text-gray-400 text-sm mt-10 font-normal">
                  Event Organizer:
                </span>
                <p className="text-white font-semibold">
                  {detail.organizer || "N/A"}
                </p>
              </div>

              <div>
                <span className="block text-gray-400 text-sm font-normal">
                  Contact Person:
                </span>
                <p className="text-white font-semibold">
                  {detail.contact_person || "N/A"}
                </p>
              </div>

              <div>
                <span className="block text-gray-400 text-sm font-normal">
                  Email:
                </span>
                <p className="text-white font-semibold break-words">
                  {detail.contact_email || "N/A"}
                </p>
              </div>

              {detail.contact_website && (
                <div>
                  <span className="block text-gray-400 text-sm font-normal">
                    Website:
                  </span>
                  <a
                    href={detail.contact_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-400 font-semibold hover:underline break-words"
                  >
                    {detail.contact_website}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Photos and Videos */}
          {(event.photos?.length > 0 || event.videos?.length > 0) && (
            <div className="mt-8">
              <h2 className="text-2xl font-semibold mb-5">
                Event Photos and Videos
              </h2>

              {/* Photos */}
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

              {/* Videos */}
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
          )}
        </div>
      </div>
    </div>
  );
}

export default EventDetails;
