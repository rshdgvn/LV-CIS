import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { APP_URL } from "@/lib/config";
import { useAuth } from "@/contexts/AuthContext";
import { CalendarPlus } from "lucide-react";
import { DatePicker } from "../DatePicker";

export default function CreateEventModal({ onSuccess }) {
  const { token, user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    club_id: "",
    title: "",
    purpose: "",
    description: "",
    cover_image: "",
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${APP_URL}/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Failed to create event");
      const data = await res.json();

      if (onSuccess) onSuccess(data.event);
      setOpen(false);
      setForm({
        club_id: "",
        title: "",
        purpose: "",
        description: "",
        cover_image: "",
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
    } catch (err) {
      console.error("Error creating event:", err);
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

      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
          <DialogDescription>
            Fill out the details to create a new club event.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Club ID</Label>
              <Input
                name="club_id"
                value={form.club_id}
                onChange={handleChange}
                placeholder="Enter club ID"
                required
              />
            </div>
            <div>
              <Label>Status</Label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-md p-2"
              >
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <Label>Title</Label>
            <Input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Event title"
              required
            />
          </div>

          <div>
            <Label>Purpose</Label>
            <Textarea
              name="purpose"
              value={form.purpose}
              onChange={handleChange}
              placeholder="Purpose of the event"
              required
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Brief event description"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <DatePicker
              label="Event Date"
              value={form.event_date}
              onChange={(date) =>
                setForm((prev) => ({
                  ...prev,
                  event_date: date?.toISOString().split("T")[0],
                }))
              }
            />
            <div>
              <Label>Event Time</Label>
              <Input
                type="time"
                name="event_time"
                value={form.event_time}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div>
            <Label>Venue</Label>
            <Input
              name="venue"
              value={form.venue}
              onChange={handleChange}
              placeholder="Event venue"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Organizer</Label>
              <Input
                name="organizer"
                value={form.organizer}
                onChange={handleChange}
                placeholder="Organizer name"
                required
              />
            </div>
            <div>
              <Label>Contact Person</Label>
              <Input
                name="contact_person"
                value={form.contact_person}
                onChange={handleChange}
                placeholder="Contact person"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Contact Email</Label>
              <Input
                type="email"
                name="contact_email"
                value={form.contact_email}
                onChange={handleChange}
                placeholder="Contact email"
                required
              />
            </div>
            <div>
              <Label>Event Mode</Label>
              <select
                name="event_mode"
                value={form.event_mode}
                onChange={handleChange}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-md p-2"
              >
                <option value="online">Online</option>
                <option value="face_to_face">Face to Face</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <div>
            <Label>Duration</Label>
            <Input
              name="duration"
              value={form.duration}
              onChange={handleChange}
              placeholder="e.g. 3 hours, 1 day"
              required
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
