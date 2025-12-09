import React, { useState, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  parseISO,
} from "date-fns";
import { APP_URL } from "@/lib/config";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2, // Icon for delete
  Clock,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { SkeletonAttendances } from "@/components/skeletons/SkeletonAttendances";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

// --- UTILITY: Theme Classes ---
const themeClasses = {
  blue: "bg-blue-500/10 text-blue-300 border-blue-500/30 hover:bg-blue-500/20",
  red: "bg-red-500/10 text-red-300 border-red-500/30 hover:bg-red-500/20",
  yellow:
    "bg-yellow-500/10 text-yellow-300 border-yellow-500/30 hover:bg-yellow-500/20",
  purple:
    "bg-purple-500/10 text-purple-300 border-purple-500/30 hover:bg-purple-500/20",
};

// Helper to format date for input[type="datetime-local"]
const formatForInput = (dateString) => {
  if (!dateString) return "";
  return format(new Date(dateString), "yyyy-MM-dd'T'HH:mm");
};

const Calendar = () => {
  const { user } = useAuth();
  const admin = user.role == "admin";
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // "selectedEvent" determines if we are Editing (object) or Creating (null)
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    start_time: "",
    end_time: "",
    theme: "blue",
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  // --- 1. FETCH EVENTS ---
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const monthStr = format(currentDate, "yyyy-MM");
      const res = await fetch(`${APP_URL}/calendar-events?month=${monthStr}`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error(res.status);
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      console.error("Failed to fetch events:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  // --- 2. OPEN MODAL (ADD vs EDIT) ---
  const openAddModal = () => {
    setSelectedEvent(null); // Null means "Create Mode"
    setFormData({
      title: "",
      start_time: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      end_time: "",
      theme: "blue",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (event) => {
    setSelectedEvent(event); // Object means "Edit Mode"
    setFormData({
      title: event.title,
      start_time: formatForInput(event.start_time),
      end_time: event.end_time ? formatForInput(event.end_time) : "",
      theme: event.theme || "blue",
    });
    setIsModalOpen(true);
  };

  // --- 3. HANDLE SUBMIT (CREATE or UPDATE) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const isEditing = !!selectedEvent;
      const url = isEditing
        ? `${APP_URL}/calendar-events/${selectedEvent.id}`
        : `${APP_URL}/calendar-events`;

      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Operation failed");

      // Refresh and Close
      await fetchEvents();
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save event.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- 4. HANDLE DELETE ---
  const handleDelete = async () => {
    if (!selectedEvent) return;
    if (!confirm("Are you sure you want to delete this event?")) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(
        `${APP_URL}/calendar-events/${selectedEvent.id}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );

      if (!res.ok) throw new Error("Delete failed");

      await fetchEvents();
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to delete event.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const daysInMonth = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentDate)),
    end: endOfWeek(endOfMonth(currentDate)),
  });

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const nav = useNavigate();

  if (loading) return <SkeletonAttendances />;

  return (
    <div className="min-h-screen text-white flex justify-center font-sans">
      <div className="w-full max-w-6xl">
        <div className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-900 shadow-2xl p-6">
          {/* HEADER */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 border-b border-neutral-800 pb-4 gap-4">
            <div className="flex items-center gap-4">
              <h2
                className="text-3xl font-bold tracking-tight cursor-pointer"
                onClick={() => nav("/calendar")}
              >
                {format(currentDate, "MMMM yyyy")}
              </h2>

              <div className="flex gap-1 bg-neutral-800 rounded-lg p-1">
                <Button
                  onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-neutral-400 hover:text-white hover:bg-neutral-700"
                >
                  <ChevronLeft size={18} />
                </Button>
                <Button
                  onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-neutral-400 hover:text-white hover:bg-neutral-700"
                >
                  <ChevronRight size={18} />
                </Button>
              </div>
            </div>

            {admin && (
              <Button
                onClick={openAddModal}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold shadow-lg shadow-blue-900/20 transition flex items-center gap-2"
              >
                <Plus size={18} /> Add Activities
              </Button>
            )}
          </div>

          <div className="w-full border border-neutral-800 rounded-lg overflow-hidden">
            <div className="grid grid-cols-7 bg-neutral-950/50 border-b border-neutral-800">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="py-3 text-center text-neutral-500 font-semibold uppercase text-xs tracking-wider"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 auto-rows-[140px] bg-neutral-900">
              {daysInMonth.map((day) => {
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isToday = isSameDay(day, new Date());

                // Filter events for this specific day
                const dayEvents = events
                  .filter((e) => isSameDay(parseISO(e.start_time), day))
                  .sort(
                    (a, b) => parseISO(a.start_time) - parseISO(b.start_time)
                  );

                return (
                  <div
                    key={day.toString()}
                    className={`
                      relative p-2 border-b border-r border-neutral-800/50 flex flex-col gap-1 transition-all
                      ${
                        !isCurrentMonth
                          ? "bg-neutral-950/30 text-neutral-600"
                          : "hover:bg-neutral-800/30"
                      }
                    `}
                  >
                    {/* Date Number */}
                    <div className="flex justify-between items-start">
                      <span
                        className={`
                          text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full
                          ${
                            isToday
                              ? "bg-blue-600 text-white shadow-md shadow-blue-900/30"
                              : isCurrentMonth
                              ? "text-neutral-300"
                              : "text-neutral-600"
                          }
                        `}
                      >
                        {format(day, "d")}
                      </span>
                    </div>

                    {/* Events List */}
                    <div className="flex flex-col gap-1 mt-1 overflow-y-auto no-scrollbar">
                      {dayEvents.slice(0, 3).map((event) => (
                        <button
                          key={event.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(event);
                          }}
                          className={`
                            text-xs px-2 py-1.5 rounded-md text-left truncate font-medium border w-full
                            flex items-center gap-1.5 shadow-sm transition-transform active:scale-95
                            ${themeClasses[event.theme] || themeClasses.blue}
                          `}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                              event.theme === "red"
                                ? "bg-red-400"
                                : event.theme === "yellow"
                                ? "bg-yellow-400"
                                : event.theme === "purple"
                                ? "bg-purple-400"
                                : "bg-blue-400"
                            }`}
                          />
                          <span className="truncate">{event.title}</span>
                        </button>
                      ))}

                      {dayEvents.length > 3 && (
                        <span className="text-[10px] text-neutral-500 pl-1 font-medium hover:text-neutral-300 cursor-pointer">
                          +{dayEvents.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* --- UNIFIED MODAL (Add / Edit / Delete) --- */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden bg-neutral-950 border border-neutral-800 text-white shadow-2xl">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              {selectedEvent ? "Edit Event" : "Create New Event"}
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={handleSubmit}
            className="px-6 py-4 flex flex-col gap-5"
          >
            {/* Title Input */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">
                Event Title
              </Label>
              <Input
                type="text"
                placeholder="e.g. Team Meeting"
                className="bg-neutral-900 border-neutral-800 focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 text-white placeholder:text-neutral-600"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            {/* Time Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">
                  Starts
                </Label>
                <div className="relative">
                  <Input
                    type="datetime-local"
                    className="bg-neutral-900 border-neutral-800 text-white text-xs px-2"
                    required
                    value={formData.start_time}
                    onChange={(e) =>
                      setFormData({ ...formData, start_time: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Theme Selector */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">
                Color Tag
              </Label>
              <div className="flex gap-3 mt-1">
                {["blue", "red", "yellow", "purple"].map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, theme: color })}
                    className={`
                      w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center
                      ${
                        formData.theme === color
                          ? "border-white scale-110"
                          : "border-transparent opacity-60 hover:opacity-100 hover:scale-105"
                      }
                      ${
                        color === "blue"
                          ? "bg-blue-600"
                          : color === "red"
                          ? "bg-red-600"
                          : color === "yellow"
                          ? "bg-yellow-500"
                          : "bg-purple-600"
                      }
                    `}
                  >
                    {formData.theme === color && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer Actions */}
            <DialogFooter className="mt-4 pt-4 border-t border-neutral-900 flex flex-row justify-between items-center w-full">
              {/* DELETE BUTTON (Only in Edit Mode) */}
              <div>
                {selectedEvent && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleDelete}
                    disabled={isSubmitting}
                    className="text-red-500 hover:text-red-400 hover:bg-red-950/30 px-3"
                  >
                    <Trash2 size={18} />
                  </Button>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsModalOpen(false)}
                  className="text-neutral-400 hover:text-white hover:bg-neutral-900"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white min-w-[100px]"
                >
                  {isSubmitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : selectedEvent ? (
                    "Update"
                  ) : (
                    "Save"
                  )}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Calendar;
