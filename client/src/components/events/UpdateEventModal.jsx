import { useState, useEffect } from "react";
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
import { Pencil, X } from "lucide-react";
import { DatePicker } from "../DatePicker";
import { TimePicker } from "../TimePicker";
import { APP_URL } from "@/lib/config";
import { useAuth } from "@/contexts/AuthContext";

export default function UpdateEventModal({ event, onSuccess }) {
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

  useEffect(() => {
    if (event) {
      setForm({
        club_id: event.club_id || "",
        title: event.title || "",
        purpose: event.purpose || "",
        description: event.description || "",
        cover_image: event.cover_image || null,
        photos: event.photos || [],
        videos: event.videos || [],
        status: event.status || "upcoming",
        event_date: event.detail?.event_date || "",
        event_time: event.detail?.event_time || "",
        venue: event.detail?.venue || "",
        organizer: event.detail?.organizer || "",
        contact_person: event.detail?.contact_person || "",
        contact_email: event.detail?.contact_email || "",
        event_mode: event.detail?.event_mode || "face_to_face",
        duration: event.detail?.duration || "",
      });
    }
  }, [event]);

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
      formData.append("_method", "PATCH");

      Object.entries(form).forEach(([key, value]) => {
        if (key === "photos" || key === "videos") {
          if (Array.isArray(value)) {
            value.forEach((file) => {
              if (file instanceof File) {
                formData.append(`${key}[]`, file);
              }
            });
          }
        } else if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });

      const res = await fetch(`${APP_URL}/events/${event.id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Update failed:", data);
        alert(
          data.message ||
            "Failed to update event. Please check all fields and try again."
        );
        return;
      }

      console.log("Updated event:", data);
      onSuccess?.(data.event);
      setOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to update event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 bg-yellow-600 text-white hover:bg-yellow-500">
          <Pencil className="w-4 h-4" />
          Edit Event
        </Button>
      </DialogTrigger>

      <DialogContent className="!max-w-3xl max-h-[90vh] overflow-y-auto bg-neutral-950 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Edit Event</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4"
        >
          {/* LEFT SECTION */}
          <div className="space-y-4">
            <div>
              <Label>Club ID</Label>
              <Input
                name="club_id"
                value={form.club_id}
                onChange={handleChange}
                className="bg-neutral-900 border-neutral-800"
              />
            </div>

            <div>
              <Label>Event Title</Label>
              <Input
                name="title"
                value={form.title}
                onChange={handleChange}
                className="bg-neutral-900 border-neutral-800"
              />
            </div>

            <div>
              <Label>Purpose</Label>
              <Textarea
                name="purpose"
                value={form.purpose}
                onChange={handleChange}
                className="bg-neutral-900 border-neutral-800"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="bg-neutral-900 border-neutral-800"
              />
            </div>

            <div>
              <Label>Cover Image</Label>
              <label className="relative flex flex-col items-center justify-center h-40 border-2 border-neutral-700 rounded-xl cursor-pointer hover:bg-neutral-800 transition mt-2 overflow-hidden">
                {form.cover_image && typeof form.cover_image === "string" ? (
                  <>
                    <img
                      src={form.cover_image}
                      alt="Current Cover"
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
                ) : form.cover_image instanceof File ? (
                  <img
                    src={URL.createObjectURL(form.cover_image)}
                    alt="Preview"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <span className="text-3xl">+</span>
                    <span className="text-xs mt-1">Change Cover</span>
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
              <Label>Duration</Label>
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
          <Button
            type="submit"
            disabled={loading}
            onClick={handleSubmit}
            className="bg-yellow-600 hover:bg-yellow-500 text-white"
          >
            {loading ? "Updating..." : "Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
