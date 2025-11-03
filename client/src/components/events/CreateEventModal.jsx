import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CalendarPlus, X } from "lucide-react";
import { DatePicker } from "../DatePicker";
import { TimePicker } from "../TimePicker";
import { APP_URL } from "@/lib/config";
import { useAuth } from "@/contexts/AuthContext";

export default function CreateEventModal({ onSuccess }) {
  const { token } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    club_id: "",
    title: "",
    purpose: "",
    description: "",
    cover_image: null,
    photos: [],
    videos: [],
    status: "upcoming",
    event_date: "",
    event_time: "",
    venue: "",
    organizer: "",
    contact_person: "",
    contact_email: "",
    event_mode: "face_to_face",
    duration: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "photos" || name === "videos" ? Array.from(files) : files[0],
    }));
  };

  const removeCoverImage = () => {
    setForm((prev) => ({ ...prev, cover_image: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === "photos" || key === "videos") {
          value.forEach((file) => formData.append(`${key}[]`, file));
        } else if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });

      const res = await fetch(`${APP_URL}/events`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to create event");
      const data = await res.json();
      onSuccess?.(data.event);
      setOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to create event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 bg-blue-950 text-gray-100 hover:bg-blue-900">
          <CalendarPlus className="w-4 h-4" />
          Create Event
        </Button>
      </DialogTrigger>

      <DialogContent className="!max-w-3xl max-h-[90vh] overflow-y-auto bg-neutral-950 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Add Events</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4"
        >
          {/* LEFT SECTION */}
          <div className="space-y-4">
            {/* Club ID */}
            <div>
              <Label>Club ID</Label>
              <Input
                name="club_id"
                value={form.club_id}
                onChange={handleChange}
                placeholder="Enter club ID"
                className="bg-neutral-900 border-neutral-800"
              />
            </div>

            {/* Title */}
            <div>
              <Label>Event Title</Label>
              <Input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Lorem ipsum dolor sit amet..."
                className="bg-neutral-900 border-neutral-800"
              />
            </div>

            {/* Purpose */}
            <div>
              <Label>Event Purpose</Label>
              <Textarea
                name="purpose"
                value={form.purpose}
                onChange={handleChange}
                placeholder="Lorem ipsum dolor sit amet..."
                className="bg-neutral-900 border-neutral-800 min-h-[100px]"
              />
            </div>

            {/* Details */}
            <div>
              <Label>Event Details</Label>
              <Textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Lorem ipsum dolor sit amet..."
                className="bg-neutral-900 border-neutral-800 min-h-[100px]"
              />
            </div>

            {/* Cover Page */}
            <div>
              <Label>Cover Page</Label>
              <label className="relative flex flex-col items-center justify-center h-40 border-2 border-neutral-700 rounded-xl cursor-pointer hover:bg-neutral-800 transition mt-2 overflow-hidden">
                {form.cover_image ? (
                  <>
                    <img
                      src={URL.createObjectURL(form.cover_image)}
                      alt="Cover Preview"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeCoverImage();
                      }}
                      className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 rounded-full p-1"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-3xl">+</span>
                    <span className="text-xs mt-1">Add attachment</span>
                  </>
                )}
                <input
                  type="file"
                  name="cover_image"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>

            {/* Attachments (Photo or Video) */}
            <div>
              <Label>Attachments</Label>
              <div className="grid grid-cols-3 gap-3 mt-2">
                {[...(form.attachments || []), null].map((file, index) => {
                  const isVideo = file && file.type?.startsWith("video/");
                  const isImage = file && file.type?.startsWith("image/");

                  return (
                    <label
                      key={index}
                      className="relative flex flex-col items-center justify-center h-24 border-2 border-neutral-700 rounded-xl cursor-pointer hover:bg-neutral-800 transition overflow-hidden"
                    >
                      {file ? (
                        <>
                          {isImage && (
                            <img
                              src={URL.createObjectURL(file)}
                              alt="Attachment Preview"
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                          )}
                          {isVideo && (
                            <video
                              src={URL.createObjectURL(file)}
                              className="absolute inset-0 w-full h-full object-cover"
                              muted
                            />
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setForm((prev) => ({
                                ...prev,
                                attachments: prev.attachments.filter(
                                  (_, i) => i !== index
                                ),
                              }));
                            }}
                            className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 rounded-full p-1"
                          >
                            <X className="w-4 h-4 text-white" />
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="text-3xl">+</span>
                          <span className="text-xs mt-1">Add Attachment</span>
                        </>
                      )}

                      <input
                        type="file"
                        accept="image/*,video/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          setForm((prev) => ({
                            ...prev,
                            attachments: [...(prev.attachments || []), file],
                          }));
                        }}
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT SECTION */}
          <div className="space-y-4">
            <div>
              <Label>Date</Label>
              <DatePicker
                value={form.event_date}
                onChange={(date) =>
                  setForm((prev) => ({
                    ...prev,
                    event_date: date?.toISOString().split("T")[0],
                  }))
                }
              />
            </div>

            <div>
              <Label>Time</Label>
              <TimePicker
                value={form.event_time}
                onChange={(time) =>
                  setForm((prev) => ({ ...prev, event_time: time }))
                }
              />
            </div>

            <div>
              <Label>Venue</Label>
              <Input
                name="venue"
                value={form.venue}
                onChange={handleChange}
                className="bg-neutral-900 border-neutral-800"
              />
            </div>

            <div>
              <Label>Organizer</Label>
              <Input
                name="organizer"
                value={form.organizer}
                onChange={handleChange}
                className="bg-neutral-900 border-neutral-800"
              />
            </div>

            <div>
              <Label>Contact Person</Label>
              <Input
                name="contact_person"
                value={form.contact_person}
                onChange={handleChange}
                className="bg-neutral-900 border-neutral-800"
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input
                name="contact_email"
                type="email"
                value={form.contact_email}
                onChange={handleChange}
                className="bg-neutral-900 border-neutral-800"
              />
            </div>

            {/* Event Mode */}
            <div>
              <Label>Event Mode</Label>
              <select
                name="event_mode"
                value={form.event_mode}
                onChange={handleChange}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-md p-2"
              >
                <option value="online">Online</option>
                <option value="face_to_face">Face to Face</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <Label>Status</Label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-md p-2"
              >
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <Label>Event Duration</Label>
              <Input
                name="duration"
                value={form.duration}
                onChange={handleChange}
                placeholder="e.g. 3 hours"
                className="bg-neutral-900 border-neutral-800"
              />
            </div>
          </div>
        </form>

        <DialogFooter className="mt-6">
          <div className="flex justify-end gap-3 w-full">
            <Button
              variant="outline"
              className="text-green-600 hover:text-green-400 cursor-pointer"
            >
              Add Task
            </Button>
            <Button variant="outline" type="submit" disabled={loading} onClick={handleSubmit} className="text-blue-700 hover:text-blue-500 cursor-pointer">
              {loading ? "Creating..." : "Create"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
